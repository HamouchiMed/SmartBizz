import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';

const Deals = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all'); // all, recent, upcoming, inProgress
  const [searchQuery, setSearchQuery] = useState('');

  const dealsData = [
    // ...existing data...
    {
      id: '1',
      name: 'Tech Startup Investment',
      client: 'John Doe',
      email: 'john.doe@example.com',
      amount: '$500,000',
      status: 'Closing',
      details: 'Investment in AI startup for product development.',
      dueDate: '2026-01-20',
      category: 'recent',
      progress: 85,
    },
    {
      id: '2',
      name: 'Real Estate Deal',
      client: 'Jane Smith',
      email: 'jane.smith@example.com',
      amount: '$750,000',
      status: 'In Progress',
      details: 'Commercial property acquisition in downtown area.',
      dueDate: '2026-01-18',
      category: 'inProgress',
      progress: 60,
    },
    {
      id: '3',
      name: 'Software License Agreement',
      client: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      amount: '$200,000',
      status: 'Closed',
      details: 'Enterprise software licensing for 500 users.',
      dueDate: '2025-12-15',
      category: 'recent',
      progress: 100,
    },
    {
      id: '4',
      name: 'Consulting Services',
      client: 'Alice Brown',
      email: 'alice.brown@example.com',
      amount: '$150,000',
      status: 'Closing',
      details: 'IT consulting for digital transformation project.',
      dueDate: '2026-02-10',
      category: 'upcoming',
      progress: 45,
    },
    {
      id: '5',
      name: 'Partnership Agreement',
      client: 'Charlie Wilson',
      email: 'charlie.wilson@example.com',
      amount: '$1,000,000',
      status: 'In Progress',
      details: 'Strategic partnership for market expansion.',
      dueDate: '2026-01-17',
      category: 'inProgress',
      progress: 70,
    },
    {
      id: '6',
      name: 'Marketing Campaign',
      client: 'David Lee',
      email: 'david.lee@example.com',
      amount: '$80,000',
      status: 'Upcoming',
      details: 'Digital marketing campaign launch.',
      dueDate: '2026-03-01',
      category: 'upcoming',
      progress: 20,
    },
  ];

  // Filter deals by category and search query
  const getFilteredDeals = () => {
    return dealsData.filter(deal => {
      const matchesCategory = activeTab === 'all' || deal.category === activeTab;
      const matchesSearch = searchQuery === '' || 
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const renderDealItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.dealItem}
      onPress={() => navigation.navigate('DealDetail', { deal: item })}
    >
      <View style={styles.dealHeader}>
        <Text style={styles.dealName}>{item.name}</Text>
        <Text style={[styles.dealStatus, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>
      <Text style={styles.dealClient}>Client: {item.client}</Text>
      <Text style={styles.dealEmail}>Email: {item.email}</Text>
      <Text style={styles.dealAmount}>Amount: {item.amount}</Text>
      <Text style={styles.dealDate}>Due Date: {new Date(item.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercent}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill,
              { 
                width: `${item.progress}%`,
                backgroundColor: getProgressColor(item.progress)
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
    if (progress >= 60) return '#3B82F6'; // Blue
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

  const filteredDeals = getFilteredDeals();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deals</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            alert('Add new deal feature coming soon!');
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search deals, clients..."
          placeholderTextColor="#9CA3AF"
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

      {filteredDeals.length > 0 ? (
        <FlatList
          data={filteredDeals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No deals in this category</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ...existing styles...
  container: {
    flex: 1,
    backgroundColor: '#DEEBF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#6B7280',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  clearIcon: {
    fontSize: 18,
    color: '#9CA3AF',
    paddingLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    borderBottomColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dealItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  dealStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusClosed: {
    backgroundColor: '#D1FAE5',
    color: '#10B981',
  },
  statusClosing: {
    backgroundColor: '#FED7AA',
    color: '#EF4444',
  },
  statusInProgress: {
    backgroundColor: '#DBEAFE',
    color: '#2563EB',
  },
  statusUpcoming: {
    backgroundColor: '#E9D5FF',
    color: '#A855F7',
  },
  statusDefault: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  dealClient: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dealEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dealAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  dealDate: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dealDetails: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default Deals;
