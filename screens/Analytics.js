import React, { useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Line, Circle, Text as SvgText, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function Analytics({ onBack, theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToProfile, onNavigateToEvents }) {
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

  const lineData = [32, 55, 41, 78, 92, 64, 88];
  const lineLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const barData = [12, 18, 9, 24, 30, 16];
  const barLabels = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];

  const summary = useMemo(() => ([
    { label: 'Revenue', value: '$128,450', delta: '+8.4%', positive: true },
    { label: 'New Leads', value: '1,240', delta: '+12.1%', positive: true },
    { label: 'Churn', value: '3.2%', delta: '-0.6%', positive: true },
    { label: 'Avg Deal', value: '$9,850', delta: '-1.3%', positive: false },
  ]), []);

  const renderLineChart = () => {
    const chartWidth = width - 56;
    const chartHeight = 220;
    const padding = 40;
    const innerWidth = chartWidth - 2 * padding;
    const innerHeight = chartHeight - 2 * padding;
    const maxValue = Math.max(...lineData);
    const minValue = Math.min(...lineData);

    const points = lineData.map((value, index) => {
      const x = padding + (index / (lineData.length - 1)) * innerWidth;
      const y = padding + ((maxValue - value) / (maxValue - minValue)) * innerHeight;
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
    const maxValue = Math.max(...barData);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.cardBg }]}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            <View style={[styles.pill, { backgroundColor: colors.background }]}>
              <Text style={[styles.pillText, { color: colors.textMuted }]}>Last 7 days</Text>
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
            <View style={[styles.pill, { backgroundColor: colors.background }]}>
              <Text style={[styles.pillText, { color: colors.textMuted }]}>YTD</Text>
            </View>
          </View>
          <View style={styles.chart}>{renderBarChart()}</View>
        </View>
      </ScrollView>

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
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToProfile?.()}>
          <Text style={[styles.navText, { color: colors.textMuted }]}>Profile</Text>
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    backgroundColor: 'rgba(15, 23, 36, 0.35)',
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

