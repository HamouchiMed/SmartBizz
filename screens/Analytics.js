import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Line, Circle, Text as SvgText, Rect } from 'react-native-svg';
import { listLeads, listDeals, getBalance } from '../services/api';

const { width } = Dimensions.get('window');

export default function Analytics({ token, onBack, theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToProfile, onNavigateToEvents }) {
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [86, 0],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    primary: '#065f46',
    accent: '#000000',
    textPrimary: '#e6eef8',
    textMuted: '#9aa6b2',
    positive: '#10B981',
    negative: '#ef4444',
    chartLine: '#065f46',
    chartBar: '#7c3aed',
  } : {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    primary: '#065f46',
    accent: '#000000',
    textPrimary: '#1F2937',
    textMuted: '#6B7280',
    positive: '#10B981',
    negative: '#EF4444',
    chartLine: '#065f46',
    chartBar: '#9333EA',
  };

  const [lineData, setLineData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [lineLabels, setLineLabels] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [barData, setBarData] = useState([0, 0, 0, 0, 0, 0]);
  const [barLabels, setBarLabels] = useState(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closing', 'Closed']);

  const [metrics, setMetrics] = useState({
    revenue: 0,
    newLeads: 0,
    churn: 0,
    avgDeal: 0,
  });

  const parseAmount = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const raw = String(value).trim().toLowerCase();
    const mult = raw.includes('m') ? 1_000_000 : raw.includes('k') ? 1_000 : 1;
    const numeric = parseFloat(raw.replace(/[^0-9.-]/g, '')) || 0;
    return numeric * mult;
  };

  useEffect(() => {
    async function loadAnalyticsMetrics() {
      if (!token) {
        setMetrics({ revenue: 0, newLeads: 0, churn: 0, avgDeal: 0 });
        setLineData([0, 0, 0, 0, 0, 0, 0]);
        setBarData([0, 0, 0, 0, 0, 0]);
        return;
      }
      try {
        const [leads, deals, balRes] = await Promise.all([
          listLeads(token),
          listDeals(token),
          getBalance(token),
        ]);

        const safeLeads = Array.isArray(leads) ? leads : [];
        const safeDeals = Array.isArray(deals) ? deals : [];
        const totalDeals = safeDeals.length || 0;
        const lostDeals = safeDeals.filter((d) => {
          const s = String(d?.status || '').toLowerCase();
          return s.includes('lost') || s.includes('cancel');
        }).length;
        const churnPct = totalDeals > 0 ? (lostDeals / totalDeals) * 100 : 0;
        const dealAmounts = safeDeals.map((d) => parseAmount(d?.amount)).filter((n) => Number.isFinite(n) && n > 0);
        const avgDeal = dealAmounts.length ? dealAmounts.reduce((a, b) => a + b, 0) / dealAmounts.length : 0;
        const balanceNum = parseFloat(balRes?.amount || 0);
        const revenue = Number.isFinite(balanceNum) ? balanceNum : 0;

        setMetrics({
          revenue,
          newLeads: safeLeads.length,
          churn: churnPct,
          avgDeal,
        });

        // Weekly Performance (live): total deal amount by day for last 7 days
        const week = [];
        const weekLabels = [];
        for (let i = 6; i >= 0; i -= 1) {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() - i);
          week.push({ key: d.toDateString(), value: 0 });
          weekLabels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
        }
        safeDeals.forEach((d) => {
          const src = d?.close_date || d?.dueDate || d?.created_at;
          const dt = src ? new Date(src) : null;
          if (!dt || Number.isNaN(dt.getTime())) return;
          const idx = week.findIndex((w) => w.key === new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).toDateString());
          if (idx >= 0) week[idx].value += parseAmount(d?.amount);
        });
        setLineData(week.map((w) => Math.round(w.value)));
        setLineLabels(weekLabels);

        // Pipeline Stages (live): count deals by stage/status buckets
        const stageBuckets = ['lead', 'qualified', 'proposal', 'negotiation', 'closing', 'closed'];
        const stageCounts = stageBuckets.map(() => 0);
        safeDeals.forEach((d) => {
          const stageText = `${d?.stage || ''} ${d?.status || ''}`.toLowerCase();
          let idx = stageBuckets.findIndex((s) => stageText.includes(s));
          if (idx < 0) idx = 0;
          stageCounts[idx] += 1;
        });
        setBarData(stageCounts);
        setBarLabels(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closing', 'Closed']);
      } catch (err) {
        console.warn('Failed to load analytics metrics', err?.message || err);
      }
    }
    loadAnalyticsMetrics();
  }, [token]);

  const summary = useMemo(() => ([
    { label: 'Revenue', value: `$${metrics.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, delta: 'Live', positive: true },
    { label: 'New Leads', value: String(metrics.newLeads), delta: 'Live', positive: true },
    { label: 'Churn', value: `${metrics.churn.toFixed(1)}%`, delta: 'Live', positive: metrics.churn <= 5 },
    { label: 'Avg Deal', value: `$${metrics.avgDeal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, delta: 'Live', positive: true },
  ]), [metrics]);

  const renderLineChart = () => {
    const chartWidth = width - 56;
    const chartHeight = 220;
    const padding = 40;
    const innerWidth = chartWidth - 2 * padding;
    const innerHeight = chartHeight - 2 * padding;
    const maxValue = Math.max(...lineData, 0);
    const minValue = Math.min(...lineData, 0);
    const range = maxValue - minValue === 0 ? 1 : maxValue - minValue;
    const steps = Math.max(1, lineData.length - 1);

    const points = lineData.map((value, index) => {
      const x = padding + (index / steps) * innerWidth;
      const y = padding + ((maxValue - value) / range) * innerHeight;
      return { x, y, value };
    });

    const pathData = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

    return (
      <Svg width={chartWidth} height={chartHeight}>
        <Line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke={colors.textMuted} strokeWidth={1} />
        <Line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke={colors.textMuted} strokeWidth={1} />
        <Path d={pathData} stroke={colors.chartLine} strokeWidth={3} fill="none" />
        {points.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r={4} fill={colors.accent} />
        ))}
        {lineLabels.map((label, index) => (
          <SvgText key={index} x={points[index].x} y={chartHeight - 10} fontSize={12} fill={colors.textMuted} textAnchor="middle">
            {label}
          </SvgText>
        ))}
      </Svg>
    );
  };

  const renderBarChart = () => {
    const chartWidth = width - 56;
    const chartHeight = 220;
    const padding = 40;
    const innerWidth = chartWidth - 2 * padding;
    const innerHeight = chartHeight - 2 * padding;
    const maxValue = Math.max(...barData, 1);
    const barWidth = (innerWidth / barData.length) * 0.8;
    const barSpacing = (innerWidth / barData.length) * 0.2;

    return (
      <Svg width={chartWidth} height={chartHeight}>
        <Line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke={colors.textMuted} strokeWidth={1} />
        <Line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke={colors.textMuted} strokeWidth={1} />
        {barData.map((value, index) => {
          const barHeight = (value / maxValue) * innerHeight;
          const x = padding + index * (barWidth + barSpacing);
          const y = chartHeight - padding - barHeight;
          return (
            <React.Fragment key={index}>
              <Rect x={x} y={y} width={barWidth} height={barHeight} fill={colors.chartBar} />
              <SvgText x={x + barWidth / 2} y={chartHeight - 10} fontSize={12} fill={colors.textMuted} textAnchor="middle">
                {barLabels[index]}
              </SvgText>
              <SvgText x={x + barWidth / 2} y={y - 5} fontSize={10} fill={colors.textPrimary} textAnchor="middle">
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, { borderBottomColor: colors.cardBg, height: headerHeight, opacity: headerOpacity }]}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Analytics</Text>
        <View style={{ width: 24 }} />
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.summaryGrid}>
          {summary.map((item, idx) => (
            <View key={idx} style={[styles.summaryCard, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{item.label}</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{item.value}</Text>
              <Text style={[styles.summaryDelta, { color: item.positive ? colors.positive : colors.negative }]}>
                {item.delta}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Weekly Performance</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Revenue trend</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: '#FFFFFF', borderColor: '#D8D2C5', borderWidth: 1 }]}>
              <Text style={[styles.pillText, { color: '#065f46' }]}>Last 7 days</Text>
            </View>
          </View>
          <View style={styles.chart}>{renderLineChart()}</View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Pipeline Stages</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Deals by quarter</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: '#FFFFFF', borderColor: '#D8D2C5', borderWidth: 1 }]}>
              <Text style={[styles.pillText, { color: '#065f46' }]}>YTD</Text>
            </View>
          </View>
          <View style={styles.chart}>{renderBarChart()}</View>
        </View>
      </Animated.ScrollView>

      <View style={styles.bottomNavContainer}>
        <BlurView
          intensity={45}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={styles.bottomNavBlur}
          pointerEvents="none"
        />
        <View style={styles.bottomNavHighlight} />
        <View style={[styles.bottomNav, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToDashboard?.()}>
          <Text style={[styles.navText, { color: colors.textMuted }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToWallet?.()}>
          <Text style={[styles.navText, { color: colors.textMuted }]}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToEvents?.()}>
          <Text style={[styles.navText, { color: colors.textMuted }]}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNav, { backgroundColor: colors.primary }]}>
          <Text style={[styles.navText, styles.activeNavText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Analytics</Text>
        </TouchableOpacity></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#F0EDE5',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  backButton: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryDelta: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  chart: {
    marginTop: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomNavBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomNavHighlight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 12,
    color: '#9aa6b2',
    fontWeight: '500',
  },
  activeNav: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  activeNavText: {
    color: '#04222b',
  },
});



