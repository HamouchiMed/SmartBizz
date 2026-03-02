import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  TextInput,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Rect } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Dashboard({ onLogout, theme = 'dark', onToggleTheme, onNavigateToBalance, onNavigateToLead, onNavigateToContact, onNavigateToProduct, onNavigateToDeal, onNavigateToMessages, onNavigateToWallet, onNavigateToAnalytics, onNavigateToEvents, onNavigateToProfile, onNavigateToBilling, onNavigateToNotifications }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mainAnim = useRef(new Animated.Value(0)).current;
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Client Meeting - Tech Corp',
      date: 'Jan 15, 2026 - 2:00 PM',
      location: 'Conference Room A',
    },
    {
      id: '2',
      title: 'Product Demo - StartupXYZ',
      date: 'Jan 18, 2026 - 10:00 AM',
      location: 'Virtual Meeting',
    },
    {
      id: '3',
      title: 'Team Review Session',
      date: 'Jan 20, 2026 - 3:00 PM',
      location: 'Main Office',
    },
  ]);

  useEffect(() => {
    if (drawerOpen) {
      setDrawerVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(mainAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(mainAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDrawerVisible(false);
      });
    }
  }, [drawerOpen]);

  const performSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search in events
    events.forEach(event => {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.date.toLowerCase().includes(lowerQuery) ||
        event.location.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: event.id,
          type: 'event',
          title: event.title,
          subtitle: event.date,
          data: event,
        });
      }
    });

    // Search in metrics
    const metricsData = [
      { title: 'Closing Deals', value: '25', category: 'metric' },
      { title: 'Total Amount', value: '$1,250,000', category: 'metric' },
      { title: 'Holding Deals', value: '8', category: 'metric' },
      { title: 'In Progress', value: '12', category: 'metric' },
    ];

    metricsData.forEach(metric => {
      if (metric.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: metric.title,
          type: 'metric',
          title: metric.title,
          subtitle: metric.value,
          data: metric,
        });
      }
    });

    // Search in navigation items
    const navItems = [
      { title: 'Lead', category: 'navigation' },
      { title: 'Contact', category: 'navigation' },
      { title: 'Product', category: 'navigation' },
      { title: 'Deals', category: 'navigation' },
      { title: 'Messages', category: 'navigation' },
    ];

    navItems.forEach(item => {
      if (item.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: item.title,
          type: 'navigation',
          title: item.title,
          subtitle: 'Go to ' + item.title,
          data: item,
        });
      }
    });

    setSearchResults(results);
  };

  const navigateFromSearch = (result) => {
    // Close search immediately
    setSearchVisible(false);
    setSearchQuery('');
    setSearchResults([]);

    if (result.type === 'navigation') {
      switch (result.title) {
        case 'Lead':
          onNavigateToLead?.();
          break;
        case 'Contact':
          onNavigateToContact?.();
          break;
        case 'Product':
          onNavigateToProduct?.();
          break;
        case 'Deals':
          onNavigateToDeal?.();
          break;
        case 'Messages':
          onNavigateToMessages?.();
          break;
        default:
          break;
      }
    } else if (result.type === 'event') {
      // Navigate to events section (dashboard has events)
      // Just close search and scroll to events
    } else if (result.type === 'metric') {
      // Navigate to deals screen for metrics
      onNavigateToDeal?.();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a refresh by waiting 1 second
    setTimeout(() => {
      setRefreshing(false);
      // Here you could fetch new data from an API
    }, 1000);
  };

  const handleAddEvent = () => {
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventLocation('');
    setEventModalVisible(true);
  };

  const handleSaveEvent = () => {
    if (!newEventTitle.trim()) {
      Alert.alert('Missing title', 'Please enter an event title.');
      return;
    }
    const newEvent = {
      id: `e${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate.trim() || 'Date TBD',
      location: newEventLocation.trim() || 'Location TBD',
    };
    setEvents(prev => [newEvent, ...prev]);
    setEventModalVisible(false);
  };

  const lineData = [20, 45, 28, 80, 99, 43, 50];
  const labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const barData = [20, 45, 28, 80, 99, 43];
  const barLabels = ['2017', '2018', '2019', '2020', '2021', '2022'];

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

        {labels.map((label, index) => (
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

  const getStyles = () => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      paddingBottom: 100,
      backgroundColor: colors.background,
    },
  });

  const dynamicStyles = getStyles();

  const mainTranslateX = mainAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });
  const mainScale = mainAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });
  const mainRotateY = mainAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-6deg'],
  });

  const drawerItems = [
    { label: 'Dashboard', action: () => setDrawerOpen(false) },
    { label: 'Leads', action: () => { setDrawerOpen(false); onNavigateToLead?.(); } },
    { label: 'Contacts', action: () => { setDrawerOpen(false); onNavigateToContact?.(); } },
    { label: 'Deals', action: () => { setDrawerOpen(false); onNavigateToDeal?.(); } },
    { label: 'Products', action: () => { setDrawerOpen(false); onNavigateToProduct?.(); } },
    { label: 'Messages', action: () => { setDrawerOpen(false); onNavigateToMessages?.(); } },
    { label: 'Wallet', action: () => { setDrawerOpen(false); onNavigateToWallet?.(); } },
    { label: 'Analytics', action: () => { setDrawerOpen(false); onNavigateToAnalytics?.(); } },
    { label: 'Calendar', action: () => { setDrawerOpen(false); Alert.alert('Calendar', 'Calendar screen coming soon.'); } },
    { label: `Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`, action: () => onToggleTheme && onToggleTheme() },
    { label: 'Settings', action: () => Alert.alert('Settings', 'Settings screen coming soon.') },
    { label: 'Logout', action: () => onLogout && onLogout(), danger: true },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {searchVisible && (
        <Animated.View style={[styles.searchOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <TouchableOpacity style={styles.searchBackdrop} onPress={() => setSearchVisible(false)} activeOpacity={1} />
          <View style={[styles.searchContainer, { backgroundColor: colors.cardBg }]}>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary, borderColor: colors.primary }]}
                placeholder="Search anything..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={performSearch}
                autoFocus
              />
              <TouchableOpacity onPress={() => setSearchVisible(false)}>
                <Text style={styles.closeButton}>x</Text>
              </TouchableOpacity>
            </View>

            {searchResults.length > 0 ? (
              <ScrollView style={styles.searchResultsList} showsVerticalScrollIndicator={false} scrollEnabled={true}>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={[styles.searchResultItem, { borderBottomColor: colors.cardBg }]}
                    onPress={() => navigateFromSearch(result)}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text style={[styles.searchResultTitle, { color: colors.textPrimary }]}>{result.title}</Text>
                      <Text style={[styles.searchResultSubtitle, { color: colors.textMuted }]}>{result.subtitle}</Text>
                    </View>
                    <Text style={[styles.searchResultType, { color: colors.accent }]}>{result.type}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : searchQuery.length > 0 ? (
              <View style={styles.noResults}>
                <Text style={[styles.noResultsText, { color: colors.textMuted }]}>No results found</Text>
              </View>
            ) : (
              <View style={styles.searchHints}>
                <Text style={[styles.searchHintTitle, { color: colors.textMuted }]}>Search for:</Text>
                <Text style={[styles.searchHint, { color: colors.textMuted }]}>- Navigation (Lead, Contact, Product, Deals, Messages)</Text>
                <Text style={[styles.searchHint, { color: colors.textMuted }]}>- Events (title, date, location)</Text>
                <Text style={[styles.searchHint, { color: colors.textMuted }]}>- Metrics (Closing Deals, Total Amount, etc.)</Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}
      {drawerVisible && (
        <Animated.View style={[styles.drawerOverlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }], backgroundColor: colors.cardBg }]}>
            <View style={styles.drawerHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>SB</Text>
              </View>
              <View>
                <Text style={[styles.drawerTitle, { color: colors.textPrimary }]}>SmartBizz</Text>
                <Text style={[styles.drawerName, { color: colors.textPrimary }]}>Mohamed Hamouchi</Text>
                <Text style={[styles.drawerRole, { color: colors.textMuted }]}>Business Owner</Text>
              </View>
            </View>

            <ScrollView
              style={styles.drawerSection}
              contentContainerStyle={styles.drawerSectionContent}
              showsVerticalScrollIndicator={false}
            >
              {drawerItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.drawerItem, item.danger && { backgroundColor: colors.negative }]}
                  onPress={item.action}
                >
                  <Text style={[styles.drawerItemText, { color: item.danger ? '#F0EDE5' : colors.textPrimary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
          <Animated.View style={[styles.drawerBackdrop, { opacity: fadeAnim }]} onTouchEnd={() => setDrawerOpen(false)} />
        </Animated.View>
      )}

      <Animated.View
        pointerEvents={drawerOpen ? 'none' : 'auto'}
        style={[
          styles.mainLayer,
          {
            transform: [
              { perspective: 1000 },
              { translateX: mainTranslateX },
              { scale: mainScale },
              { rotateY: mainRotateY },
            ],
          },
        ]}
      >
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: colors.background }]} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setDrawerOpen(!drawerOpen)}>
            <Ionicons name="menu" size={30} color="#000000" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Welcome Back</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.searchButton} activeOpacity={0.8} onPress={() => setSearchVisible(true)}>
              <Ionicons name="search" size={23} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifyButton} activeOpacity={0.8} onPress={() => onNavigateToNotifications?.()}>
              <Ionicons name="notifications" size={22} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.balanceCard, { backgroundColor: colors.cardBg }]} activeOpacity={0.9} onPress={() => onNavigateToBalance?.()}>
          <View style={styles.balanceContent}>
            <Text style={styles.balanceTitle}>Total Balance</Text>
            <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>$782,123.56</Text>
            <View style={styles.balanceSubtitle}>
              <Text style={styles.greenArrow}>^</Text>
              <Text style={styles.greenText}>+1.7% This month</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.monthButton, { backgroundColor: colors.primary }]} onPress={() => console.log('Month')}> 
            <Text style={[styles.monthButtonText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Month</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBg }]} onPress={() => onNavigateToLead && onNavigateToLead()}>
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Lead</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBg }]} onPress={() => onNavigateToContact && onNavigateToContact()}>
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Contact</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBg }]} onPress={() => onNavigateToProduct && onNavigateToProduct()}>
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBg }]} onPress={() => onNavigateToDeal && onNavigateToDeal()}>
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Deals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBg }]} onPress={() => onNavigateToMessages && onNavigateToMessages()}>
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Messages</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBg }]} onPress={() => onNavigateToBilling && onNavigateToBilling()}>
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Billing</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBg }]} activeOpacity={0.9} onPress={() => onNavigateToDeal && onNavigateToDeal()}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Key Metrics</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>25</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Closing Deals</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>$1,250,000</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total Amount</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>8</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Holding Deals</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>12</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>In Progress</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <View style={styles.eventsHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Upcoming Events</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsContainer}
            pagingEnabled
            snapToInterval={width * 0.8 + 16}
            decelerationRate="fast"
          >
            {events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventItem, { backgroundColor: colors.background === '#1F6A64' ? '#F3F4F6' : '#071027' }]}
                onPress={() => {
                  Alert.alert('Event Options', 'What would you like to do?', [
                    { text: 'Edit', onPress: () => console.log('Edit', event) },
                    { text: 'Delete', onPress: () => setEvents(prev => prev.filter(e => e.id !== event.id)), style: 'destructive' },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
              >
                <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                <Text style={[styles.eventDate, { color: colors.textMuted }]}>{event.date}</Text>
                <Text style={[styles.eventLocation, { color: colors.textMuted }]}>{event.location}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }] }>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Active sales</Text>
              <Text style={[styles.cardValue, { color: colors.textPrimary }]}>$12.7k</Text>
              <Text style={styles.cardSubtitleGreen}>+3.5% vs last year</Text>
            </View>
            <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.cardBg }]} onPress={() => console.log('Monthly')}>
              <Text style={[styles.dropdownText, { color: colors.textMuted }]}>Monthly v</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chart}>{renderLineChart()}</View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Statistics</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Sales statistic</Text>
            </View>
            <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.cardBg }]} onPress={() => console.log('Annual')}>
              <Text style={[styles.dropdownText, { color: colors.textMuted }]}>Annual v</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chart}>{renderBarChart()}</View>
        </View>
        </ScrollView>
      </Animated.View>

      <Modal
        visible={eventModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEventModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            style={{ width: '100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <View style={[styles.modalCard, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Event</Text>

            <TextInput
              style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.primary }]}
              placeholder="Event title"
              placeholderTextColor={colors.textMuted}
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />
            <TextInput
              style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.primary }]}
              placeholder="Date & time (e.g. Feb 20, 3:30 PM)"
              placeholderTextColor={colors.textMuted}
              value={newEventDate}
              onChangeText={setNewEventDate}
            />
            <TextInput
              style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.primary }]}
              placeholder="Location"
              placeholderTextColor={colors.textMuted}
              value={newEventLocation}
              onChangeText={setNewEventLocation}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background }]}
                onPress={() => setEventModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEvent}
              >
                <Text style={[styles.modalButtonText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Save</Text>
              </TouchableOpacity>
            </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <View style={styles.bottomNavContainer}>
        <BlurView
          intensity={45}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={styles.bottomNavBlur}
          pointerEvents="none"
        />
        <View style={styles.bottomNavHighlight} />
        <View style={[styles.bottomNav, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity style={[styles.navItem, styles.activeNav, { backgroundColor: colors.primary }]}>
            <Text style={[styles.navText, styles.activeNavText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToWallet?.()}>
            <Text style={[styles.navText, { color: colors.textMuted }]}>Wallet</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F6A64',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100,
    backgroundColor: '#1F6A64',
  },
  mainLayer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 1,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0EDE5',
    borderWidth: 1.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0EDE5',
    borderWidth: 1.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0EDE5',
    borderWidth: 1.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 72,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e6eef8',
    flex: 1,
    textAlign: 'center',
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0EDE5',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceContent: {
    flex: 1,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#9aa6b2',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#e6eef8',
    marginBottom: 8,
  },
  balanceSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenArrow: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 4,
  },
  greenText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  monthButton: {
    backgroundColor: '#065f46',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  monthButtonText: {
    color: '#04222b',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EDE5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 24,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  buttonText: {
    fontSize: 12,
    color: '#e6eef8',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#F0EDE5',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e6eef8',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e6eef8',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9aa6b2',
  },
  cardSubtitleGreen: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  dropdown: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#071027',
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 12,
    color: '#9aa6b2',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
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
  activeNav: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeNavText: {
    fontWeight: '700',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e6eef8',
  },
  metricLabel: {
    fontSize: 12,
    color: '#9aa6b2',
    marginTop: 4,
    textAlign: 'center',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#065f46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#04222b',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventsContainer: {
    paddingVertical: 16,
  },
  eventItem: {
    width: width * 0.75,
    backgroundColor: '#071027',
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e6eef8',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#9aa6b2',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#9aa6b2',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawer: {
    width: '75%',
    backgroundColor: '#F0EDE5',
    height: '100%',
    paddingTop: 0,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#04222b',
    fontWeight: '800',
    letterSpacing: 1,
  },
  drawerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  drawerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  drawerRole: {
    fontSize: 12,
    marginTop: 2,
  },
  drawerSection: {
    paddingVertical: 6,
    flex: 1,
  },
  drawerSectionContent: {
    paddingBottom: 120,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e6eef8',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'flex-start',
    paddingTop: 60,
    flexDirection: 'column',
  },
  searchBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '80%',
    zIndex: 1000,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  closeButton: {
    fontSize: 20,
    color: '#9aa6b2',
    marginLeft: 12,
    padding: 8,
  },
  searchResultsList: {
    maxHeight: 400,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultSubtitle: {
    fontSize: 12,
  },
  searchResultType: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  noResults: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 14,
  },
  searchHints: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  searchHintTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchHint: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
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
});

