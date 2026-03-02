import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import { listTransactions, getBalance } from '../services/api';

const { width } = Dimensions.get('window');

export default function BalanceHistory({ token, onBack, theme = 'dark' }) {
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

  // helper to convert transaction list into balance timeline
  const makeBalanceTimeline = (txs, base) => {
    // sort ascending by date
    const sorted = [...txs].sort((a,b)=>new Date(a.date) - new Date(b.date));
    let bal = base;
    return sorted.map(tx=>{
      const amt = parseFloat((tx.amount||'0').toString().replace(/[^0-9.-]/g,''))||0;
      bal += tx.type==='income'?amt:-amt;
      return { date: new Date(tx.date).toLocaleDateString(), balance: bal };
    });
  };

  React.useEffect(() => {
    async function loadData() {
      try {
        const t = await listTransactions(token);
        const bres = await getBalance(token);
        const base = bres?.amount != null ? parseFloat(bres.amount) : 0;
        setInitialBalance(base);
        const timeline = makeBalanceTimeline(t, base - t.reduce((s,tx)=>{
          const amt = parseFloat((tx.amount||'0').toString().replace(/[^0-9.-]/g,''))||0;
          return s + (tx.type==='income'?amt:-amt);
        },0));
        setBalanceData(timeline);
      } catch (e) {
        console.warn('could not load balance history', e);
      }
    }
    if (token) loadData();
  }, [token]);

  const weeklyData = [
    { date: 'Mon', balance: 780000, change: '+0.5%' },
    { date: 'Tue', balance: 785000, change: '+0.6%' },
    { date: 'Wed', balance: 782000, change: '-0.4%' },
    { date: 'Thu', balance: 790000, change: '+1.0%' },
    { date: 'Fri', balance: 795000, change: '+0.6%' },
    { date: 'Sat', balance: 792000, change: '-0.4%' },
    { date: 'Sun', balance: 782123.56, change: '-1.3%' },
  ];

  const yearlyData = [
    { date: '2018', balance: 450000, change: '+15%' },
    { date: '2019', balance: 580000, change: '+28%' },
    { date: '2020', balance: 650000, change: '+12%' },
    { date: '2021', balance: 720000, change: '+10%' },
    { date: '2022', balance: 755000, change: '+4.8%' },
    { date: '2023', balance: 798000, change: '+5.7%' },
    { date: '2024', balance: 782123.56, change: '-1.9%' },
  ];

  const transactions = [
    { id: '1', title: 'Sales Commission', amount: '+$15,000', date: 'Feb 3, 2:30 PM', type: 'credit' },
    { id: '2', title: 'Team Expenses', amount: '-$5,200', date: 'Feb 2, 10:15 AM', type: 'debit' },
    { id: '3', title: 'Client Payment', amount: '+$28,500', date: 'Feb 1, 4:45 PM', type: 'credit' },
    { id: '4', title: 'Office Supplies', amount: '-$1,800', date: 'Jan 31, 9:00 AM', type: 'debit' },
    { id: '5', title: 'Product Sale', amount: '+$42,300', date: 'Jan 30, 1:20 PM', type: 'credit' },
  ];


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

    const chartDataPoints = dataToUse.map(d => d.balance / 100000);
    const chartWidth = width - 56;
    const chartHeight = 240;
    const padding = 40;
    const innerWidth = chartWidth - 2 * padding;
    const innerHeight = chartHeight - 2 * padding;
    const maxValue = Math.max(...chartDataPoints);
    const minValue = Math.min(...chartDataPoints);

    const points = chartDataPoints.map((value, index) => {
      const x = padding + (index / (chartDataPoints.length - 1)) * innerWidth;
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
          <Circle key={index} cx={point.x} cy={point.y} r={5} fill={colors.accent} />
        ))}

        {dataToUse.map((item, index) => (
          <SvgText key={index} x={points[index].x} y={chartHeight - 10} fontSize={11} fill={colors.textMuted} textAnchor="middle">
            {item.date.split(' ')[0]}
          </SvgText>
        ))}
      </Svg>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.cardBg }]}>
        <TouchableOpacity onPress={() => onBack?.()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Balance History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Current Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.cardBg }]}>
          <View>
            <Text style={[styles.label, { color: colors.textMuted }]}>Current Balance</Text>
            <Text style={[styles.amount, { color: colors.textPrimary }]}>{`$${initialBalance.toFixed(2)}`}</Text>
            <View style={styles.changeRow}>
              {/* change percentage could be computed, for now static */}
              <Text style={[styles.positive, { color: colors.positive }]}>↑ +1.7%</Text>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>This month</Text>
            </View>
          </View>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.positive }]}>{`$${(balanceData.length?Math.max(...balanceData.map(d=>d.balance)):initialBalance).toFixed(2)}`}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Peak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.negative }]}>{`$${(balanceData.length?Math.min(...balanceData.map(d=>d.balance)):initialBalance).toFixed(2)}`}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Low</Text>
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
                <Text style={[styles.changeText, { color: item.change.includes('+') ? colors.positive : colors.negative }]}>
                  {item.change}
                </Text>
              </View>
            </View>
          ))}
          {!showMoreTimeline && balanceData.length > 4 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMoreTimeline(true)}
            >
              <Text style={[styles.showMoreText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Show More</Text>
            </TouchableOpacity>
          )}
          {showMoreTimeline && balanceData.length > 4 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMoreTimeline(false)}
            >
              <Text style={[styles.showMoreText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Show Less</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={[styles.transactionsCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
          {transactions.slice(0, showMoreTransactions ? transactions.length : 3).map((txn) => (
            <View key={txn.id} style={[styles.txnItem, { borderBottomColor: colors.background }]}>
              <View>
                <Text style={[styles.txnTitle, { color: colors.textPrimary }]}>{txn.title}</Text>
                <Text style={[styles.txnDate, { color: colors.textMuted }]}>{txn.date}</Text>
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
          {!showMoreTransactions && transactions.length > 3 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMoreTransactions(true)}
            >
              <Text style={[styles.showMoreText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Show More</Text>
            </TouchableOpacity>
          )}
          {showMoreTransactions && transactions.length > 3 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMoreTransactions(false)}
            >
              <Text style={[styles.showMoreText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Show Less</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Summary Stats */}
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Inflow</Text>
              <Text style={[styles.summaryValue, { color: colors.positive }]}>$85,800</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Outflow</Text>
              <Text style={[styles.summaryValue, { color: colors.negative }]}>$7,000</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Net Change</Text>
              <Text style={[styles.summaryValue, { color: colors.positive }]}>+$78,800</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Avg Daily</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>+$11,257</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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

