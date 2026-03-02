import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  SectionList,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { initialPlaces } from './Contacts';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name: 'John Smith',
    type: 'contact',
    lastMessage: 'Thanks for the update on the deal',
    timestamp: '2:30 PM',
    unread: 2,
    status: 'online',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    type: 'lead',
    lastMessage: 'Can we schedule a meeting next week?',
    timestamp: '1:15 PM',
    unread: 0,
    status: 'offline',
  },
  {
    id: '3',
    name: 'Tech Corp Inc.',
    type: 'deal',
    lastMessage: 'We received your proposal',
    timestamp: 'yesterday',
    unread: 5,
    status: 'online',
  },
  {
    id: '4',
    name: 'Michael Brown',
    type: 'contact',
    lastMessage: 'Product demo scheduled for Friday',
    timestamp: 'yesterday',
    unread: 0,
    status: 'online',
  },
  {
    id: '5',
    name: 'Emma Wilson',
    type: 'lead',
    lastMessage: 'Interested in our Q1 package',
    timestamp: 'Mon',
    unread: 1,
    status: 'offline',
  },
  {
    id: '6',
    name: 'David Lee',
    type: 'contact',
    lastMessage: 'Contract signed and sent',
    timestamp: 'Mon',
    unread: 0,
    status: 'offline',
  },
];

export default function ChatListScreen({ onSelectChat, onBack, theme = 'dark' }) {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, contact, lead, deal
  const [showNewChat, setShowNewChat] = useState(false);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name, mode) => {
    const palettes = mode === 'dark'
      ? ['#065f46', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#38bdf8']
      : ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9'];
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palettes.length;
    return palettes[index];
  };

  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    border: '#1f2937',
    textPrimary: '#e6eef8',
    textSecondary: '#9aa6b2',
    textMuted: '#6b7280',
    primary: '#065f46',
    inputBg: '#071027',
    inputBorder: 'rgba(125,211,252,0.06)',
    messageRead: '#4b5563',
    online: '#10b981',
    offline: '#6b7280',
    unreadBg: '#065f46',
  } : {
    background: '#ffffff',
    cardBg: '#f9fafb',
    border: '#e5e7eb',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    primary: '#2563eb',
    inputBg: '#f3f4f6',
    inputBorder: 'rgba(34, 45, 67, 0.06)',
    messageRead: '#d1d5db',
    online: '#10b981',
    offline: '#d1d5db',
    unreadBg: '#2563eb',
  };

  const filteredConversations = useMemo(() => {
    let filtered = MOCK_CONVERSATIONS;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(conv => conv.type === selectedFilter);
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        conv =>
          conv.name.toLowerCase().includes(search) ||
          conv.lastMessage.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [searchText, selectedFilter]);

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}
      onPress={() => onSelectChat?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name, theme) }]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: item.status === 'online' ? colors.online : colors.offline },
          ]}
        />
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, { color: colors.textPrimary }]}>
            {item.name}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            {item.timestamp}
          </Text>
        </View>
        <Text
          style={[
            styles.lastMessage,
            {
              color: item.unread > 0 ? colors.textPrimary : colors.textSecondary,
              fontWeight: item.unread > 0 ? '600' : '400',
            },
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>

      {item.unread > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: colors.unreadBg }]}>
          <Text style={styles.unreadCount}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.textMuted }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Messages</Text>
          <TouchableOpacity style={styles.addBtnWrap} onPress={() => setShowNewChat(true)} activeOpacity={0.9}>
            <BlurView
              intensity={45}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={styles.addBtnGlass}
            >
              <View pointerEvents="none" style={styles.addBtnOverlay} />
              <Text style={[styles.addBtnText, { color: theme === 'dark' ? '#000000' : '#065f46' }]}>New Chat</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {[
            { label: 'All', value: 'all' },
            { label: 'Contacts', value: 'contact' },
            { label: 'Leads', value: 'lead' },
            { label: 'Deals', value: 'deal' },
          ].map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    selectedFilter === filter.value ? colors.primary : colors.cardBg,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color:
                      selectedFilter === filter.value
                        ? theme === 'dark'
                          ? '#04222b'
                          : '#ffffff'
                        : colors.textSecondary,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal visible={showNewChat} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowNewChat(false)}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Chat</Text>
            <FlatList
              data={initialPlaces}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setShowNewChat(false);
                    onSelectChat?.({
                      id: `contact-${item.id}`,
                      name: item.name,
                      type: 'contact',
                      lastMessage: '',
                      timestamp: 'now',
                      unread: 0,
                      status: 'online',
                    });
                  }}
                >
                  <Text style={[styles.modalItemText, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.modalItemSub, { color: colors.textMuted }]}>{item.phone}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Conversations List */}
      {filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={item => item.id}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateIcon]}>💬</Text>
          <Text style={[styles.emptyStateText, { color: colors.textPrimary }]}>
            No conversations found
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textMuted }]}>
            {searchText ? 'Try a different search' : 'Start a new conversation'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 6,
  },
  backText: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    marginLeft: 12,
  },
  addBtnWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addBtnGlass: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalItemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
    borderWidth: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 13,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
});

