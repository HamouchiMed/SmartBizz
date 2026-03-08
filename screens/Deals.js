import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  TextInput,
  Animated,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { listDeals, createDeal, updateDeal, deleteDeal as deleteDealAPI } from '../services/api';

let dealsCache = { token: null, data: [] };

const Deals = ({ token, navigation, onBack, onSelectDeal }) => {
  const hasCached = dealsCache.token === token && Array.isArray(dealsCache.data);
  const [loading, setLoading] = useState(!hasCached);
  const [activeTab, setActiveTab] = useState('all'); // all, recent, upcoming, inProgress
  const [searchQuery, setSearchQuery] = useState('');
  const [deals, setDeals] = useState(hasCached ? dealsCache.data : []);

  useEffect(() => {
    async function loadDeals() {
      if (!token) return;
      if (!(dealsCache.token === token && Array.isArray(dealsCache.data))) {
        setLoading(true);
      }
      try {
        const data = await listDeals(token);
        const next = data || [];
        dealsCache = { token, data: next };
        setDeals(next);
      } catch (err) {
        console.warn('Failed to load deals', err);
      }
      setLoading(false);
    }
    loadDeals();
  }, [token]);
  const [showCreate, setShowCreate] = useState(false);
  const [fName, setFName] = useState('');
  const [fClient, setFClient] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fAmount, setFAmount] = useState('');
  const [fStatus, setFStatus] = useState('In Progress');
  const [fDueDate, setFDueDate] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Filter deals by category and search query
  const getFilteredDeals = () => {
    return deals.filter(deal => {
      const matchesSearch = searchQuery === '' || 
        (deal.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deal.client?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deal.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      let matchesStatus = activeTab === 'all';
      if (!matchesStatus) {
        const status = deal.status?.toLowerCase() || '';
        if (activeTab === 'recent') matchesStatus = status.includes('closing');
        if (activeTab === 'upcoming') matchesStatus = status.includes('upcoming');
        if (activeTab === 'inProgress') matchesStatus = status.includes('in progress');
      }
      return matchesSearch && matchesStatus;
    });
  };

  const renderDealItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.dealItem}
      onPress={() => onSelectDeal && onSelectDeal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.dealHeader}>
        <Text style={styles.dealName}>{item.name}</Text>
        <Text style={[styles.dealStatus, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>
      
      <View style={{ marginBottom: 2 }}>
        <Text style={styles.dealClient}>Client: {item.client || 'N/A'}</Text>
      </View>
      
      <Text style={styles.dealEmail}>Email: {item.email || 'N/A'}</Text>
      
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.dealAmount}>Amount: {item.amount || '$0'}</Text>
      </View>
      
      <Text style={styles.dealDate}>Due Date: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</Text>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>PROGRESS</Text>
          <Text style={styles.progressPercent}>{item.progress || 0}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill,
              { 
                width: `${Math.min(item.progress || 0, 100)}%`,
                backgroundColor: getProgressColor(item.progress || 0)
              }
            ]}
          />
        </View>
      </View>

      <Text style={styles.dealDetails}>{item.details}</Text>
    </TouchableOpacity>
  );

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10B981'; // Green
    if (progress >= 60) return '#000000'; // Blue
    if (progress >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Closed':
        return styles.statusClosed;
      case 'Closing':
        return styles.statusClosing;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Upcoming':
        return styles.statusUpcoming;
      default:
        return styles.statusDefault;
    }
  };

  const addDeal = async () => {
    if (!token) return;
    try {
      const newDeal = {
        name: fName || 'Untitled',
        client: fClient || '',
        email: fEmail || '',
        amount: fAmount || '$0',
        status: fStatus,
        details: 'New deal',
        dueDate: fDueDate || new Date().toISOString().split('T')[0],
        progress: 25,
        category: 'recent',
      };
      const created = await createDeal(token, newDeal);
      setDeals(prev => {
        const next = [created, ...prev];
        dealsCache = { token, data: next };
        return next;
      });
      setFName(''); setFClient(''); setFEmail(''); setFAmount(''); setFStatus('In Progress'); setFDueDate('');
      setShowCreate(false);
      Alert.alert('Success', 'Deal created');
    } catch (err) {
      Alert.alert('Error', 'Failed to create deal');
      console.warn(err);
    }
  };

  const deleteDeal = async (id) => {
    if (!token) return;
    try {
      await deleteDealAPI(token, id);
      setDeals(prev => {
        const next = prev.filter(d => d.id !== id);
        dealsCache = { token, data: next };
        return next;
      });
      Alert.alert('Success', 'Deal deleted');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete deal');
      console.warn(err);
    }
  };

  const filteredDeals = getFilteredDeals();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deals</Text>
        <TouchableOpacity 
          style={styles.addBtnWrap}
          onPress={() => {
            setShowCreate(true);
          }}
        >
          <BlurView
            intensity={45}
            tint="light"
            style={styles.addBtnGlass}
          >
            <View pointerEvents="none" style={styles.addBtnOverlay} />
            <Text style={styles.addButtonText}>+ Add</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.searchTabsWrap,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 140],
                  outputRange: [0, -120],
                  extrapolate: 'clamp',
                }),
              },
            ],
            opacity: scrollY.interpolate({
              inputRange: [0, 120],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search deals, clients..."
            placeholderTextColor="#D1D5DB"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
            onPress={() => setActiveTab('recent')}
          >
            <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'inProgress' && styles.activeTab]}
            onPress={() => setActiveTab('inProgress')}
          >
            <Text style={[styles.tabText, activeTab === 'inProgress' && styles.activeTabText]}>In Progress</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {filteredDeals.length > 0 ? (
        <Animated.FlatList
          data={filteredDeals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          scrollIndicatorInsets={{ right: 1 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No deals in this category</Text>
        </View>
      )}

      <Modal visible={showCreate} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowCreate(false)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Deal</Text>
              <TextInput
                placeholder="Deal name"
                placeholderTextColor="#94A3B8"
                value={fName}
                onChangeText={setFName}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="Client name"
                placeholderTextColor="#94A3B8"
                value={fClient}
                onChangeText={setFClient}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="Client email"
                placeholderTextColor="#94A3B8"
                value={fEmail}
                onChangeText={setFEmail}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="Amount (e.g. $25,000)"
                placeholderTextColor="#94A3B8"
                value={fAmount}
                onChangeText={setFAmount}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="Status (Closing, In Progress, Closed, Upcoming)"
                placeholderTextColor="#94A3B8"
                value={fStatus}
                onChangeText={setFStatus}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="Due date (YYYY-MM-DD)"
                placeholderTextColor="#94A3B8"
                value={fDueDate}
                onChangeText={setFDueDate}
                style={styles.modalInput}
              />


              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCreate(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSave}
                  onPress={addDeal}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EEFF',
  },
  backButton: {
    padding: 6,
  },
  backButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  addBtnWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addBtnGlass: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDE5',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E7FF',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#8CA0C2',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 18,
    color: '#B8C1D1',
    paddingLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0EDE5',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EEFF',
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  searchTabsWrap: {
    zIndex: 2,
    position: 'absolute',
    top: 96,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    backgroundColor: '#F0EDE5',
  },
  activeTab: {
    borderBottomColor: '#065f46',
    backgroundColor: '#F0EDE5',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8FA1C6',
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: '#1E3A8A',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    paddingTop: 140,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#B8C1D1',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#F0EDE5',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E1E7FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  modalCancelText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  modalSave: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#065f46',
    marginLeft: 8,
  },
  modalSaveText: {
    color: '#F0EDE5',
    fontWeight: '700',
  },
  dealItem: {
    backgroundColor: '#F0EDE5',
    padding: 18,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EEFF',
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    letterSpacing: -0.3,
  },
  dealStatus: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    marginLeft: 8,
  },
  statusClosed: {
    backgroundColor: '#EEF2FF',
    color: '#1E3A8A',
  },
  statusClosing: {
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  statusInProgress: {
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
  },
  statusUpcoming: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
  },
  statusDefault: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  dealClient: {
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 6,
    fontWeight: '600',
  },
  dealEmail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  dealAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  dealDate: {
    fontSize: 12,
    color: '#8CA0C2',
    fontWeight: '500',
    marginBottom: 14,
  },
  progressContainer: {
    marginBottom: 14,
    backgroundColor: '#EEF3FF',
    padding: 12,
    borderRadius: 10,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  progressPercent: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#DCE6FF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  dealDetails: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default Deals;

