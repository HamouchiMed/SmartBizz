import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { listTransactions, createTransaction, deleteTransaction, getBalance, updateBalance } from '../services/api';
// removed chart dependency - svg not needed now

const { width } = Dimensions.get('window');

export default function Wallet({ token, onBack, theme = 'dark', onNavigateToDashboard, onNavigateToBalance, onNavigateToAnalytics, onNavigateToProfile, onNavigateToEvents }) {
  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    primary: '#065f46',
    textPrimary: '#e6eef8',
    textMuted: '#9aa6b2',
    positive: '#10B981',
    negative: '#EF4444',
    border: 'rgba(125,211,252,0.08)',
  } : {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    primary: '#065f46',
    textPrimary: '#1F2937',
    textMuted: '#6B7280',
    positive: '#10B981',
    negative: '#EF4444',
    border: '#E5E7EB',
  };

  // balanceHistory removed since chart is not displayed

  const cards = [
    { id: '1', type: 'Visa', lastFour: '4532', expiry: '12/28', color: '#1a1f71' },
    { id: '2', type: 'Mastercard', lastFour: '8910', expiry: '08/27', color: '#eb001b' },
    { id: '3', type: 'American Express', lastFour: '5678', expiry: '03/29', color: '#006fcf' },
  ];

  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txModalVisible, setTxModalVisible] = useState(false);  const scrollRef = React.useRef(null);
  const listRef = React.useRef(null);
  const [addFundsVisible, setAddFundsVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [payBillsVisible, setPayBillsVisible] = useState(false);
  const [investVisible, setInvestVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [investType, setInvestType] = useState('');

  React.useEffect(() => {
    // load is intentionally simple — use fetchTransactions for manual refresh
    async function fetchTransactions() {
      if (!token) return;
      try {
        const data = await listTransactions(token);
        setTransactions(data);
        try {
          const balRes = await getBalance(token);
          if (balRes && typeof balRes.amount !== 'undefined' && balRes.amount !== null) {
            setBalance(parseFloat(balRes.amount));
          } else {
            const bal = data.reduce((sum, tx) => {
              const amt = parseFloat((tx.amount || '0').toString().replace(/[^0-9.-]/g, '')) || 0;
              return sum + (tx.type === 'income' ? amt : -amt);
            }, 0);
            setBalance(bal);
          }
        } catch (e) {
          const bal = data.reduce((sum, tx) => {
            const amt = parseFloat((tx.amount || '0').toString().replace(/[^0-9.-]/g, '')) || 0;
            return sum + (tx.type === 'income' ? amt : -amt);
          }, 0);
          setBalance(bal);
        }
      } catch (err) {
        console.warn('Failed to load transactions', err);
      }
    }
    fetchTransactions();
  }, [token]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (token) {
        const data = await listTransactions(token);
        setTransactions(data);
        try {
          const balRes = await getBalance(token);
          if (balRes && typeof balRes.amount !== 'undefined' && balRes.amount !== null) {
            setBalance(parseFloat(balRes.amount));
          } else {
            const bal = data.reduce((sum, tx) => {
              const amt = parseFloat((tx.amount || '0').toString().replace(/[^0-9.-]/g, '')) || 0;
              return sum + (tx.type === 'income' ? amt : -amt);
            }, 0);
            setBalance(bal);
          }
        } catch (e) {
          const bal = data.reduce((sum, tx) => {
            const amt = parseFloat((tx.amount || '0').toString().replace(/[^0-9.-]/g, '')) || 0;
            return sum + (tx.type === 'income' ? amt : -amt);
          }, 0);
          setBalance(bal);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh transactions', err);
    }
    setRefreshing(false);
  };

  // compute totals for stats
  const incomeTotal = transactions.reduce((sum, tx) => {
    if (tx.type === 'income') return sum + Math.abs(parseFloat((tx.amount || '0').toString().replace(/[^0-9.-]/g, '')) || 0);
    return sum;
  }, 0);
  const expenseTotal = transactions.reduce((sum, tx) => {
    if (tx.type === 'expense') return sum + Math.abs(parseFloat((tx.amount || '0').toString().replace(/[^0-9.-]/g, '')) || 0);
    return sum;
  }, 0);

  const handleAction = (action) => {
    switch(action) {
      case 'Add Funds':
        setAddFundsVisible(true);
        break;
      case 'Transfer':
        setTransferVisible(true);
        break;
      case 'Pay Bills':
        setPayBillsVisible(true);
        break;
      case 'Invest':
        setInvestVisible(true);
        break;
      default:
        break;
    }
  };

  const handleAddFunds = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      Alert.alert('Error', 'Enter a valid positive number');
      return;
    }
    const newBalance = balance + numAmt;
    setBalance(newBalance);
    const tx = {
      title: 'Funds added',
      amount: `+$${numAmt}`,
      type: 'income',
      date: new Date().toISOString(),
    };
    if (token) {
      try {
        const created = await createTransaction(token, tx);
        setTransactions((prev) => [created, ...prev]);
        try { await updateBalance(token, newBalance); } catch (e) { console.warn('Failed to update balance', e); }
      } catch (err) {
        console.warn('Failed to save transaction', err);
        setTransactions((prev) => [tx, ...prev]);
        try { await updateBalance(token, newBalance); } catch (e) { console.warn('Failed to update balance', e); }
      }
    } else {
      setTransactions((prev) => [tx, ...prev]);
    }
    Alert.alert('Success', `$${numAmt} has been added to your wallet`);
    setAmount('');
    setAddFundsVisible(false);
  };

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      Alert.alert('Error', 'Enter a valid positive number');
      return;
    }
    const newBalance = balance - numAmt;
    setBalance(newBalance);
    const tx = {
      title: `Transfer to ${recipient}`,
      amount: `-$${numAmt}`,
      type: 'expense',
      date: new Date().toISOString(),
    };
    if (token) {
      try {
        const created = await createTransaction(token, tx);
        setTransactions((prev) => [created, ...prev]);
        try { await updateBalance(token, newBalance); } catch (e) { console.warn('Failed to update balance', e); }
      } catch (err) {
        console.warn('Failed to save transaction', err);
        setTransactions((prev) => [tx, ...prev]);
        try { await updateBalance(token, newBalance); } catch (e) { console.warn('Failed to update balance', e); }
      }
    } else {
      setTransactions((prev) => [tx, ...prev]);
    }
    Alert.alert('Success', `$${numAmt} transferred to ${recipient}`);
    setRecipient('');
    setAmount('');
    setTransferVisible(false);
  };

  const handlePayBills = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      Alert.alert('Error', 'Enter a valid positive number');
      return;
    }
    const newBalance = balance - numAmt;
    setBalance(newBalance);
    const tx = {
      title: 'Bill payment',
      amount: `-$${numAmt}`,
      type: 'expense',
      date: new Date().toISOString(),
    };
    if (token) {
      try {
        const created = await createTransaction(token, tx);
        setTransactions((prev) => [created, ...prev]);
        try { await updateBalance(token, newBalance); } catch (e) { console.warn('Failed to update balance', e); }
      } catch (err) {
        console.warn('Failed to save transaction', err);
        setTransactions((prev) => [tx, ...prev]);
        try { await updateBalance(token, newBalance); } catch (e) { console.warn('Failed to update balance', e); }
      }
    } else {
      setTransactions((prev) => [tx, ...prev]);
    }
    Alert.alert('Success', `$${numAmt} bill payment submitted`);
    setAmount('');
    setPayBillsVisible(false);
  };

  const handleInvest = () => {
    if (!investType || !amount) {
      Alert.alert('Error', 'Please select investment type and amount');
      return;
    }
    Alert.alert('Success', `$${amount} invested in ${investType}`);
    setInvestType('');
    setAmount('');
    setInvestVisible(false);
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Wallet</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => {
          onNavigateToBalance?.();
        }}>
          <Ionicons name="stats-chart" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      }>
        <View style={[styles.balanceCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Available Balance</Text>
          <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>${balance.toFixed(2)}</Text>
          <TouchableOpacity onPress={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollToEnd({ animated: true });
            }
          }}>
            <Text style={[styles.balanceGrowth, { color: colors.positive }]}>+4.2% from last month</Text>
          </TouchableOpacity>
          
        </View>

        <View style={[styles.cardsSection, { backgroundColor: colors.cardBg }]}>
          <View style={styles.cardsHeader}>
            <Text style={[styles.cardsTitle, { color: colors.textPrimary }]}>My Cards</Text>
            <TouchableOpacity>
              <Text style={[styles.addCardText, { color: colors.primary }]}>+ Add Card</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.cardItem, { backgroundColor: card.color }]}
                onPress={() => Alert.alert('Card Selected', `Selected ${card.type} ending in ${card.lastFour}`)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardType}>{card.type}</Text>
                  <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFour}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardExpiry}>{card.expiry}</Text>
                    <Text style={styles.cardLogo}>{card.type === 'Visa' ? 'V' : card.type === 'Mastercard' ? 'MC' : 'AE'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.cardBg }]}
            onPress={() => handleAction('Add Funds')}
          >
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Add Funds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.cardBg }]}
            onPress={() => handleAction('Transfer')}
          >
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.cardBg }]}
            onPress={() => handleAction('Pay Bills')}
          >
            <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>Pay Bills</Text>
          </TouchableOpacity>
          
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.cardBg }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.positive }]}>+${incomeTotal.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Income</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.negative }]}>-${expenseTotal.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Expenses</Text>
            </View>
          </View>
        </View>

        <View ref={listRef} style={[styles.listCard, { backgroundColor: colors.cardBg }]}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
          </View>
          {transactions.map((tx) => (
            <TouchableOpacity key={tx.id || tx.date} onPress={() => { setSelectedTx(tx); setTxModalVisible(true); }} style={[styles.txRow, { borderBottomColor: colors.border }]}>
              <View style={styles.txLeft}>
                <View style={[
                  styles.txIcon,
                  { backgroundColor: tx.type === 'income' ? colors.positive + '20' : colors.negative + '20' }
                ]}>
                  <Text style={styles.txIconText}>
                    {tx.type === 'income' ? '↑' : '↓'}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.txTitle, { color: colors.textPrimary }]}>{tx.title}</Text>
                  <Text style={[styles.txDate, { color: colors.textMuted }]}>{tx.date}</Text>
                </View>
              </View>
              <Text style={[
                styles.txAmount,
                { color: tx.type === 'income' ? colors.positive : colors.negative }
              ]}>
                {tx.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Modal visible={txModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.txModal, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.txModalTitle, { color: colors.textPrimary }]}>{selectedTx?.title}</Text>
              <Text style={[styles.txModalAmount, { color: selectedTx?.type === 'income' ? colors.positive : colors.negative }]}>{selectedTx?.amount}</Text>
              <Text style={[styles.txModalDate, { color: colors.textMuted }]}>{selectedTx?.date}</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.negative }]} onPress={async () => {
                  const id = selectedTx?.id;
                  try {
                    const newList = transactions.filter((t) => t.id !== id && t.date !== selectedTx?.date);
                    if (id && token) await deleteTransaction(token, id);
                    setTransactions(newList);
                    // recompute balance from remaining transactions
                    const bal = newList.reduce((sum, tx) => {
                      const amt = parseFloat((tx.amount || '0').toString().replace(/[^0-9.-]/g, '')) || 0;
                      return sum + (tx.type === 'income' ? amt : -amt);
                    }, 0);
                    setBalance(bal);
                    if (token) {
                      try { await updateBalance(token, bal); } catch (e) { console.warn('Failed to persist balance', e); }
                    }
                  } catch (err) {
                    console.warn('Failed to delete transaction', err);
                  }
                  setTxModalVisible(false);
                  setSelectedTx(null);
                }}>
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={() => { setTxModalVisible(false); setSelectedTx(null); }}>
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
        <TouchableOpacity style={[styles.navItem, styles.activeNav, { backgroundColor: colors.primary }]}>
          <Text style={[styles.navText, styles.activeNavText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToEvents?.()}>
          <Text style={[styles.navText, { color: colors.textMuted }]}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToAnalytics?.()}>
          <Text style={[styles.navText, { color: colors.textMuted }]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToProfile?.()}>
          <Text style={[styles.navText, { color: colors.textMuted }]}>Profile</Text>
        </TouchableOpacity>
        </View>
      </View>

      {/* Add Funds Modal */}
      <Modal visible={addFundsVisible} transparent animationType="fade" onRequestClose={() => setAddFundsVisible(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Funds</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.primary }]}
                placeholder="Enter amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.background }]} onPress={() => setAddFundsVisible(false)}>
                  <Text style={[styles.modalButtonText, { color: colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleAddFunds}>
                  <Text style={[styles.modalButtonText, { color: '#F0EDE5' }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Transfer Modal */}
      <Modal visible={transferVisible} transparent animationType="fade" onRequestClose={() => setTransferVisible(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Transfer Money</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.primary }]}
                placeholder="Recipient name/account"
                placeholderTextColor={colors.textMuted}
                value={recipient}
                onChangeText={setRecipient}
              />
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.primary }]}
                placeholder="Amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.background }]} onPress={() => setTransferVisible(false)}>
                  <Text style={[styles.modalButtonText, { color: colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleTransfer}>
                  <Text style={[styles.modalButtonText, { color: '#F0EDE5' }]}>Transfer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Pay Bills Modal */}
      <Modal visible={payBillsVisible} transparent animationType="fade" onRequestClose={() => setPayBillsVisible(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Pay Bills</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.primary }]}
                placeholder="Enter amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.background }]} onPress={() => setPayBillsVisible(false)}>
                  <Text style={[styles.modalButtonText, { color: colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handlePayBills}>
                  <Text style={[styles.modalButtonText, { color: '#F0EDE5' }]}>Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Invest Modal */}
      <Modal visible={investVisible} transparent animationType="fade" onRequestClose={() => setInvestVisible(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Invest Money</Text>
              <View style={styles.investOptions}>
                {['Stocks', 'Mutual Funds', 'Bonds'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.investOption, { backgroundColor: investType === option ? colors.primary : colors.background, borderColor: colors.primary }]}
                    onPress={() => setInvestType(option)}
                  >
                    <Text style={[styles.investOptionText, { color: investType === option ? '#F0EDE5' : colors.textPrimary }]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.primary }]}
                placeholder="Amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.background }]} onPress={() => setInvestVisible(false)}>
                  <Text style={[styles.modalButtonText, { color: colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleInvest}>
                  <Text style={[styles.modalButtonText, { color: '#F0EDE5' }]}>Invest</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  settingsButton: {
    padding: 8,
  },
  settingsText: {
    fontSize: 18,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },
  balanceGrowth: {
    fontSize: 13,
    fontWeight: '600',
  },
  /* chartContainer removed - chart not displayed */
  cardsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardsContainer: {
    paddingVertical: 8,
  },
  cardItem: {
    width: 280,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardExpiry: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  cardLogo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    height:50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  listCard: {
    borderRadius: 16,
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  txDate: {
    fontSize: 12,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  investOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  investOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  investOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

