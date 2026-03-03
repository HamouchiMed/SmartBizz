import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import { listTransactions, getBalance } from '../services/api';

const { width } = Dimensions.get('window');

export default function BalanceHistory({ token, onBack, theme = 'dark' }) {
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

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showMoreTimeline, setShowMoreTimeline] = useState(false);
  const [showMoreTransactions, setShowMoreTransactions] = useState(false);

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
  };

  // placeholder until real data loads
  const [balanceData, setBalanceData] = useState([]);
  const [initialBalance, setInitialBalance] = useState(0);
  const [allTransactions, setAllTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const getSignedAmount = (tx) => {
    const raw = parseFloat((tx?.amount || '0').toString().replace(/[^0-9.-]/g, '')) || 0;
    const t = String(tx?.type || '').toLowerCase();
    if (t === 'income' || t === 'credit') return Math.abs(raw);
    if (t === 'expense' || t === 'debit') return -Math.abs(raw);
    if (String(tx?.amount || '').trim().startsWith('-')) return -Math.abs(raw);
    return raw;
  };

  // helper to convert transaction list into balance timeline
  const makeBalanceTimeline = (txs, base) => {
    // sort ascending by date
    const sorted = [...txs].sort((a,b)=>new Date(a.date) - new Date(b.date));
    let bal = base;
    let prevBal = base;
    return sorted.map(tx=>{
      const before = bal;
      const amt = getSignedAmount(tx);
      bal += amt;
      const diff = bal - before;
      prevBal = bal;
      const denominator = before === 0 ? 1 : Math.abs(before);
      const pct = (diff / denominator) * 100;
      const sign = diff >= 0 ? '+' : '';
      const ts = new Date(tx.date).getTime();
      return {
        date: new Date(tx.date).toLocaleDateString(),
        balance: bal,
        change: `${sign}${pct.toFixed(1)}%`,
        ts: Number.isFinite(ts) ? ts : Date.now(),
      };
    });
  };

  React.useEffect(() => {
    async function loadData() {
      try {
        const t = await listTransactions(token);
        const sortedAsc = [...(Array.isArray(t) ? t : [])].sort((a, b) => new Date(a.date) - new Date(b.date));
        const bres = await getBalance(token);
        const base = bres?.amount != null ? parseFloat(bres.amount) : 0;
        setInitialBalance(base);
        setAllTransactions(sortedAsc);
        const totalDelta = sortedAsc.reduce((s, tx) => s + getSignedAmount(tx), 0);
        const timeline = makeBalanceTimeline(sortedAsc, base - totalDelta);
        setRecentTransactions(
          [...sortedAsc]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((tx) => {
              const signed = getSignedAmount(tx);
              return {
                id: String(tx.id || tx.date || Math.random()),
                title: tx.title || (signed >= 0 ? 'Credit' : 'Debit'),
                amount: `${signed >= 0 ? '+' : '-'}$${Math.abs(signed).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                date: new Date(tx.date).toLocaleString(),
                type: signed >= 0 ? 'credit' : 'debit',
              };
            })
        );
        setBalanceData(timeline);
      } catch (e) {
        console.warn('could not load balance history', e);
      }
    }
    if (token) loadData();
  }, [token]);

  const weeklyData = React.useMemo(() => {
    if (!balanceData.length) return [{ date: 'Today', balance: initialBalance, change: '0.0%' }];
    return balanceData
      .slice(-7)
      .map((p) => ({
        ...p,
        date: new Date(p.ts).toLocaleDateString(undefined, { weekday: 'short' }),
      }));
  }, [balanceData, initialBalance]);

  const yearlyData = React.useMemo(() => {
    if (!balanceData.length) return [{ date: String(new Date().getFullYear()), balance: initialBalance, change: '0.0%' }];
    const byYear = new Map();
    balanceData.forEach((p) => {
      const y = new Date(p.ts).getFullYear();
      byYear.set(y, p);
    });
    return [...byYear.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(-7)
      .map(([year, p]) => ({ ...p, date: String(year) }));
  }, [balanceData, initialBalance]);

  const summary = React.useMemo(() => {
    const inflow = allTransactions.reduce((s, tx) => {
      const amt = getSignedAmount(tx);
      return amt > 0 ? s + amt : s;
    }, 0);
    const outflow = allTransactions.reduce((s, tx) => {
      const amt = getSignedAmount(tx);
      return amt < 0 ? s + Math.abs(amt) : s;
    }, 0);
    const net = inflow - outflow;
    const activeDays = new Set(
      allTransactions.map((tx) => new Date(tx.date).toDateString())
    ).size || 1;
    return {
      inflow,
      outflow,
      net,
      avgDaily: net / activeDays,
    };
  }, [allTransactions]);


  const renderBalanceChart = () => {
    // pick data depending on filter; monthly shows dynamic balanceData
    let dataToUse;
    if (selectedPeriod === 'weekly') {
      dataToUse = weeklyData;
    } else if (selectedPeriod === 'yearly') {
      dataToUse = yearlyData;
    } else {
      dataToUse = balanceData.length ? balanceData : [{ date: 'N/A', balance: initialBalance }];
    }

    const chartDataPoints = dataToUse.map((d) => {
      const v = Number(d?.balance);
      return Number.isFinite(v) ? v / 100000 : 0;
    });
    const chartWidth = width - 56;
    const chartHeight = 240;
    const padding = 40;
    const innerWidth = chartWidth - 2 * padding;
    const innerHeight = chartHeight - 2 * padding;
    const maxValue = Math.max(...chartDataPoints, 0);
    const minValue = Math.min(...chartDataPoints, 0);
    const range = maxValue - minValue === 0 ? 1 : maxValue - minValue;
    const steps = Math.max(1, chartDataPoints.length - 1);

    const points = chartDataPoints.map((value, index) => {
      const x = padding + (index / steps) * innerWidth;
      const y = padding + ((maxValue - value) / range) * innerHeight;
      return { x, y, value };
    });

    const pathData = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

    // Keep axis readable: short labels and limited ticks.
    const shortLabels = dataToUse.map((item) => {
      if (selectedPeriod === 'weekly' || selectedPeriod === 'yearly') return String(item.date);
      const d = new Date(item.date);
      if (Number.isNaN(d.getTime())) return String(item.date).slice(0, 5);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });

    const maxTicks = 6;
    const step = Math.max(1, Math.ceil(points.length / maxTicks));
    const showLabelAt = (idx) => idx === 0 || idx === points.length - 1 || idx % step === 0;

    return (
      <Svg width={chartWidth} height={chartHeight}>
        <Line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke={colors.textMuted} strokeWidth={1} />
        <Line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke={colors.textMuted} strokeWidth={1} />

        <Path d={pathData} stroke={colors.chartLine} strokeWidth={3} fill="none" />

        {points.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r={5} fill={colors.accent} />
        ))}

        {points.map((point, index) => (
          showLabelAt(index) ? (
            <SvgText key={`lbl-${index}`} x={point.x} y={chartHeight - 10} fontSize={11} fill={colors.textMuted} textAnchor="middle">
              {shortLabels[index]}
            </SvgText>
          ) : null
        ))}
      </Svg>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, { borderBottomColor: colors.cardBg, height: headerHeight, opacity: headerOpacity }]}>
        <TouchableOpacity
          style={[styles.backBtnWrap, { borderColor: colors.inputBorder || '#D8D2C5', backgroundColor: '#FFFFFF' }]}
          onPress={() => onBack?.()}
          activeOpacity={0.85}
        >
          <Text style={[styles.backButton, { color: colors.accent }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Balance History</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Current Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.cardBg }]}>
          <View>
            <Text style={[styles.label, { color: '#4B5563' }]}>Current Balance</Text>
            <Text style={[styles.amount, { color: colors.textPrimary }]}>{`$${initialBalance.toFixed(2)}`}</Text>
            <View style={styles.changeRow}>
              {/* change percentage could be computed, for now static */}
              <Text style={[styles.positive, { color: colors.positive }]}>↑ +1.7%</Text>
              <Text style={[styles.dateText, { color: '#4B5563' }]}>This month</Text>
            </View>
          </View>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.positive }]}>{`$${(balanceData.length?Math.max(...balanceData.map(d=>d.balance)):initialBalance).toFixed(2)}`}</Text>
              <Text style={[styles.statLabel, { color: '#4B5563' }]}>Peak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.negative }]}>{`$${(balanceData.length?Math.min(...balanceData.map(d=>d.balance)):initialBalance).toFixed(2)}`}</Text>
              <Text style={[styles.statLabel, { color: '#4B5563' }]}>Low</Text>
            </View>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.filterContainer}>
          {['weekly', 'monthly', 'yearly'].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedPeriod === period ? colors.primary : colors.cardBg,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedPeriod === period ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textPrimary,
                  },
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Balance Trend Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Balance Trend</Text>
          <View style={styles.chart}>{renderBalanceChart()}</View>
        </View>

        {/* Balance Details Table */}
        <View style={[styles.detailsCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Balance Timeline</Text>
          {balanceData.slice(0, showMoreTimeline ? balanceData.length : 4).map((item, index) => (
            <View key={index} style={[styles.timelineItem, { borderBottomColor: colors.background }]}>
              <View>
                <Text style={[styles.dateLabel, { color: colors.textPrimary }]}>{item.date}</Text>
              </View>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceText, { color: colors.textPrimary }]}>${(item.balance / 1000).toFixed(0)}k</Text>
                <Text style={[styles.changeText, { color: String(item.change || '').includes('+') ? colors.positive : colors.negative }]}>
                  {item.change || '0.0%'}
                </Text>
              </View>
            </View>
          ))}
          {!showMoreTimeline && balanceData.length > 4 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMoreTimeline(true)}
            >
              <Text style={[styles.showMoreText, { color: '#F0EDE5' }]}>Show More</Text>
            </TouchableOpacity>
          )}
          {showMoreTimeline && balanceData.length > 4 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMoreTimeline(false)}
            >
              <Text style={[styles.showMoreText, { color: '#F0EDE5' }]}>Show Less</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={[styles.transactionsCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
          {recentTransactions.slice(0, showMoreTransactions ? recentTransactions.length : 3).map((txn) => (
            <View key={txn.id} style={[styles.txnItem, { borderBottomColor: colors.background }]}>
              <View>
                <Text style={[styles.txnTitle, { color: colors.textPrimary }]}>{txn.title}</Text>
                <Text style={[styles.txnDate, { color: '#4B5563' }]}>{txn.date}</Text>
              </View>
              <Text
                style={[
                  styles.txnAmount,
                  { color: txn.type === 'credit' ? colors.positive : colors.negative },
                ]}
              >
                {txn.amount}
              </Text>
            </View>
          ))}
          {!showMoreTransactions && recentTransactions.length > 3 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMoreTransactions(true)}
            >
              <Text style={[styles.showMoreText, { color: '#F0EDE5' }]}>Show More</Text>
            </TouchableOpacity>
          )}
          {showMoreTransactions && recentTransactions.length > 3 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMoreTransactions(false)}
            >
              <Text style={[styles.showMoreText, { color: '#F0EDE5' }]}>Show Less</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Summary Stats */}
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: '#4B5563' }]}>Total Inflow</Text>
              <Text style={[styles.summaryValue, { color: colors.positive }]}>
                ${summary.inflow.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: '#4B5563' }]}>Total Outflow</Text>
              <Text style={[styles.summaryValue, { color: colors.negative }]}>
                ${summary.outflow.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: '#4B5563' }]}>Net Change</Text>
              <Text style={[styles.summaryValue, { color: summary.net >= 0 ? colors.positive : colors.negative }]}>
                {summary.net >= 0 ? '+' : '-'}${Math.abs(summary.net).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: '#4B5563' }]}>Avg Daily</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {summary.avgDaily >= 0 ? '+' : '-'}${Math.abs(summary.avgDaily).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
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
  backBtnWrap: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 1,
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  positive: {
    fontWeight: '600',
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(125, 211, 252, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  detailsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  transactionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  txnTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  txnDate: {
    fontSize: 12,
  },
  txnAmount: {
    fontWeight: '700',
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  showMoreButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
});


