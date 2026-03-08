import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../services/api';

const categoryColors = ['#065f46', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
let eventsCache = { token: null, data: [] };

export default function Events({ onBack, theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToAnalytics, onNavigateToProfile, onNavigateToEvents, token }) {
  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    textPrimary: '#e6eef8',
    textMuted: '#9aa6b2',
    primary: '#065f46',
    accent: '#000000',
    inputBg: '#071027',
    inputBorder: 'rgba(125,211,252,0.08)',
  } : {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    textPrimary: '#1F2937',
    textMuted: '#6B7280',
    primary: '#065f46',
    accent: '#000000',
    inputBg: '#F3F4F6',
    inputBorder: 'rgba(37,99,235,0.12)',
  };

  const hasCached = eventsCache.token === token && Array.isArray(eventsCache.data);
  const [events, setEvents] = useState(hasCached ? eventsCache.data : []);
  const [viewMode, setViewMode] = useState('agenda'); // agenda | month
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-02-01T00:00:00'));
  const [selectedDay, setSelectedDay] = useState(null);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit
  const [activeEventId, setActiveEventId] = useState(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Meeting');
  const [owner, setOwner] = useState('You');
  const [status, setStatus] = useState('Scheduled');
  const [category, setCategory] = useState('Sales');
  const [reminder, setReminder] = useState('1h');

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const data = await listEvents(token);
        const next = data || [];
        eventsCache = { token, data: next };
        setEvents(next);
      } catch (e) {
        Alert.alert('Events', e.message);
      }
    };
    load();
  }, [token]);

  const monthLabel = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startWeekday = startOfMonth.getDay();

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const dt = new Date(e.datetime);
      const inMonth = dt.getFullYear() === currentMonth.getFullYear() && dt.getMonth() === currentMonth.getMonth();
      if (!inMonth) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!(
          (e.title || '').toLowerCase().includes(q) ||
          (e.location || '').toLowerCase().includes(q) ||
          (e.type || '').toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q)
        )) return false;
      }
      if (selectedDay) {
        const sameDay = dt.getFullYear() === selectedDay.getFullYear() && dt.getMonth() === selectedDay.getMonth() && dt.getDate() === selectedDay.getDate();
        if (!sameDay) return false;
      }
      return true;
    });
  }, [events, currentMonth, search, selectedDay]);

  const monthEvents = useMemo(() => {
    return events.filter(e => {
      const dt = new Date(e.datetime);
      return dt.getFullYear() === currentMonth.getFullYear() && dt.getMonth() === currentMonth.getMonth();
    });
  }, [events, currentMonth]);

  const onPrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
    setSelectedDay(null);
  };

  const onNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
    setSelectedDay(null);
  };

  const openAddModal = () => {
    setModalMode('add');
    setActiveEventId(null);
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setType('Meeting');
    setOwner('You');
    setStatus('Scheduled');
    setCategory('Sales');
    setReminder('1h');
    setModalVisible(true);
  };

  const openEditModal = (event) => {
    setModalMode('edit');
    setActiveEventId(event.id);
    setTitle(event.title || '');
    const dt = new Date(event.datetime);
    const d = dt.toISOString().slice(0, 10);
    const t = dt.toTimeString().slice(0, 5);
    setDate(d);
    setTime(t);
    setLocation(event.location || '');
    setType(event.type || 'Meeting');
    setOwner(event.owner || 'You');
    setStatus(event.status || 'Scheduled');
    setCategory(event.category || 'Sales');
    setReminder(event.reminder || '1h');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Missing info', 'Title, date, and time are required.');
      return;
    }
    const dt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(dt.getTime())) {
      Alert.alert('Invalid date/time', 'Please enter a valid date and time.');
      return;
    }
    try {
      if (modalMode === 'add') {
        const newEvent = await createEvent(token, {
          title: title.trim(),
          datetime: dt.toISOString(),
          location: location.trim() || 'TBD',
          type,
          owner,
          status,
          category,
          reminder,
        });
        setEvents(prev => {
          const next = [newEvent, ...prev];
          eventsCache = { token, data: next };
          return next;
        });
      } else if (modalMode === 'edit' && activeEventId) {
        const updated = await updateEvent(token, activeEventId, {
          title: title.trim(),
          datetime: dt.toISOString(),
          location: location.trim() || 'TBD',
          type,
          owner,
          status,
          category,
          reminder,
        });
        setEvents(prev => {
          const next = prev.map(e => e.id === activeEventId ? updated : e);
          eventsCache = { token, data: next };
          return next;
        });
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Events', e.message);
    }
  };

  const handleDelete = async () => {
    if (!activeEventId) return;
    try {
      await deleteEvent(token, activeEventId);
      setEvents(prev => {
        const next = prev.filter(e => e.id !== activeEventId);
        eventsCache = { token, data: next };
        return next;
      });
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Events', e.message);
    }
  };

  const getDayEvents = (day) => {
    return monthEvents.filter(e => {
      const dt = new Date(e.datetime);
      return dt.getDate() === day;
    });
  };

  const renderCalendarGrid = () => {
    const cells = [];
    for (let i = 0; i < startWeekday; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

    return (
      <View style={styles.calendarGrid}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((w) => (
          <Text key={w} style={[styles.weekday, { color: colors.textMuted }]}>{w}</Text>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <View key={`empty-${idx}`} style={styles.dayCell} />;
          const dayEvents = getDayEvents(day);
          const isSelected = selectedDay && selectedDay.getDate() === day && selectedDay.getMonth() === currentMonth.getMonth();
          return (
            <TouchableOpacity
              key={`day-${day}-${idx}`}
              style={[styles.dayCell, isSelected && { backgroundColor: colors.primary }]}
              onPress={() => setSelectedDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
            >
              <Text style={[styles.dayText, { color: isSelected ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textPrimary }]}>
                {day}
              </Text>
              <View style={styles.dotRow}>
                {dayEvents.slice(0, 3).map((e) => (
                  <View key={e.id} style={[styles.dot, { backgroundColor: e.color || categoryColors[0] }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { borderBottomColor: colors.cardBg }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Events</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => Alert.alert('Sync', 'Sync with calendar providers soon.')}> 
            <Text style={[styles.headerActionText, { color: colors.textMuted }]}>Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Export', 'Exporting events soon.')}> 
            <Text style={[styles.headerActionText, { color: colors.textMuted }]}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.heroCard, { backgroundColor: colors.cardBg }]}> 
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={onPrevMonth} style={styles.monthBtn}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{monthLabel}</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>{monthEvents.length} events scheduled</Text>
          </View>
          <TouchableOpacity onPress={onNextMonth} style={styles.monthBtn}>
            <Ionicons name="chevron-forward" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewChip, viewMode === 'agenda' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('agenda')}
          >
            <Text style={[styles.viewChipText, { color: viewMode === 'agenda' ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textMuted }]}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewChip, viewMode === 'month' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.viewChipText, { color: viewMode === 'month' ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textMuted }]}>Month</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={[styles.searchBox, { backgroundColor: colors.cardBg }]}> 
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search events"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>

        {viewMode === 'month' && renderCalendarGrid()}

        {filteredEvents.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.cardBg }]}> 
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No events found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Try a different filter or add a new event.</Text>
          </View>
        ) : (
          filteredEvents.map((e) => {
            const dt = new Date(e.datetime);
            return (
              <TouchableOpacity key={e.id} style={[styles.eventCard, { backgroundColor: colors.cardBg }]} onPress={() => openEditModal(e)}>
                <View style={styles.eventRow}>
                  <View style={[styles.dot, { backgroundColor: e.color || categoryColors[0] }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{e.title}</Text>
                    <Text style={[styles.eventMeta, { color: colors.textMuted }]}> 
                      {dt.toLocaleString('en-US', { month: 'short', day: 'numeric' })} {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {e.location}
                    </Text>
                  </View>
                </View>
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: e.color || categoryColors[0] }]}> 
                    <Text style={styles.tagText}>{e.category}</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: colors.inputBg }]}> 
                    <Text style={[styles.tagText, { color: colors.textMuted }]}>{e.type}</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: colors.inputBg }]}> 
                    <Text style={[styles.tagText, { color: colors.textMuted }]}>Reminder {e.reminder}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openAddModal}>
        <Text style={[styles.fabText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>+</Text>
      </TouchableOpacity>

      <View style={styles.bottomNavContainer}>
        <BlurView intensity={45} tint={theme === 'dark' ? 'dark' : 'light'} style={styles.bottomNavBlur} pointerEvents="none" />
        <View style={styles.bottomNavHighlight} />
        <View style={[styles.bottomNav, { backgroundColor: 'transparent' }]}> 
          <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToDashboard?.()}>
            <Text style={[styles.navText, { color: colors.textMuted }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToWallet?.()}>
            <Text style={[styles.navText, { color: colors.textMuted }]}>Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.activeNav, { backgroundColor: colors.primary }]} onPress={() => onNavigateToEvents?.()}>
            <Text style={[styles.navText, styles.activeNavText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToAnalytics?.()}>
            <Text style={[styles.navText, { color: colors.textMuted }]}>Analytics</Text>
          </TouchableOpacity></View>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            style={{ width: '100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <View style={[styles.modalCard, { backgroundColor: colors.cardBg }]}> 
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{modalMode === 'add' ? 'Add Event' : 'Edit Event'}</Text>

              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                placeholder="Title"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              <View style={styles.modalRow}>
                <TextInput
                  style={[styles.modalInput, styles.modalHalf, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={date}
                  onChangeText={setDate}
                />
                <TextInput
                  style={[styles.modalInput, styles.modalHalf, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={time}
                  onChangeText={setTime}
                />
              </View>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                placeholder="Location"
                placeholderTextColor={colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />

              <View style={styles.modalRow}>
                {['Meeting', 'Demo', 'Review'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.modalChip, { borderColor: colors.inputBorder, backgroundColor: type === t ? colors.primary : 'transparent' }]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.modalChipText, { color: type === t ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textMuted }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalRow}>
                {['You', 'Team'].map((o) => (
                  <TouchableOpacity
                    key={o}
                    style={[styles.modalChip, { borderColor: colors.inputBorder, backgroundColor: owner === o ? colors.primary : 'transparent' }]}
                    onPress={() => setOwner(o)}
                  >
                    <Text style={[styles.modalChipText, { color: owner === o ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textMuted }]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalRow}>
                {['Scheduled', 'Done'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.modalChip, { borderColor: colors.inputBorder, backgroundColor: status === s ? colors.primary : 'transparent' }]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[styles.modalChipText, { color: status === s ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textMuted }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                placeholder="Category"
                placeholderTextColor={colors.textMuted}
                value={category}
                onChangeText={setCategory}
              />

              <View style={styles.modalRow}>
                {['15m', '1h', '1d'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.modalChip, { borderColor: colors.inputBorder, backgroundColor: reminder === r ? colors.primary : 'transparent' }]}
                    onPress={() => setReminder(r)}
                  >
                    <Text style={[styles.modalChipText, { color: reminder === r ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textMuted }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                {modalMode === 'edit' && (
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={handleDelete}>
                    <Text style={[styles.modalButtonText, { color: '#F0EDE5' }]}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.inputBg }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.modalButtonText, { color: colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
                  <Text style={[styles.modalButtonText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>{modalMode === 'add' ? 'Add' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F0EDE5',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomWidth: 1,
    marginBottom: 30,
  },
  title:
  {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  headerActions: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 12,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  monthBtnText: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  viewChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  viewChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 12,
  },
  searchBox: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  calendarGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  weekday: {
    width: '13.6%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  dayCell: {
    width: '13.6%',
    minHeight: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventCard: {
    padding: 16,
    borderRadius: 16,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  eventMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F0EDE5',
  },
  emptyState: {
    borderRadius: 16,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 6,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 110,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  fabText: {
    fontSize: 26,
    fontWeight: '700',
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
    backgroundColor: 'transparent',
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
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 14,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modalHalf: {
    flex: 1,
  },
  modalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  modalChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});













