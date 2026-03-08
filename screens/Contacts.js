import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Modal, Pressable, Linking, TextInput, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { listContacts, createContact, updateContact, deleteContact as deleteContactAPI } from '../services/api';

let contactsCache = { token: null, data: [] };

export default function Contacts({ token, onBack, theme = 'light', initialQuery = '', initialOpenId = null, onClearInitial, onMessageContact }) {
  const hasCached = contactsCache.token === token && Array.isArray(contactsCache.data);
  const [loading, setLoading] = useState(!hasCached);
  const [places, setPlaces] = useState(hasCached ? contactsCache.data : []);
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function loadContacts() {
      if (!token) return;
      if (!(contactsCache.token === token && Array.isArray(contactsCache.data))) {
        setLoading(true);
      }
      try {
        const data = await listContacts(token);
        const next = data || [];
        contactsCache = { token, data: next };
        setPlaces(next);
      } catch (err) {
        console.warn('Failed to load contacts', err);
      }
      setLoading(false);
    }
    loadContacts();
  }, [token]);
  const [showCreate, setShowCreate] = useState(false);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const openedRef = useRef(null);

  // create form state
  const [fName, setFName] = useState('');
  const [fAddress, setFAddress] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fHours, setFHours] = useState('');
  const [fWebsite, setFWebsite] = useState('');
  const [fNotes, setFNotes] = useState('');

  const colors = theme === 'dark' ? {
    background: '#071025',
    card: '#F0EDE5',
    muted: '#9AA6B2',
    text: '#E6EEF8',
    accent: '#065f46'
  } : {
    background: '#F6FBFF',
    card: '#F0EDE5',
    muted: '#6B7280',
    text: '#111827',
    accent: '#065f46'
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter(p => `${p.name} ${p.address} ${p.notes}`.toLowerCase().includes(q));
  }, [places, query]);

  const openPlace = (p) => { setSelected(p); setShow(true); };
  const closeModal = () => { setShow(false); };

  useEffect(() => {
    if (show) {
      setModalVisible(true);
      modalAnim.setValue(0);
      Animated.spring(modalAnim, {
        toValue: 1,
        speed: 14,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [show, modalAnim]);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!initialOpenId || openedRef.current === initialOpenId) return;
    const found = places.find(p => p.id === initialOpenId);
    if (found) {
      openPlace(found);
      openedRef.current = initialOpenId;
      onClearInitial && onClearInitial();
    }
  }, [initialOpenId, places, onClearInitial]);

  const addPlace = async () => {
    if (!token) return;
    try {
      const newPlace = {
        name: fName || 'Untitled',
        address: fAddress || '',
        phone: fPhone || '',
        email: fEmail || '',
        hours: fHours || '',
        website: fWebsite || '',
        notes: fNotes || '',
      };
      const created = await createContact(token, newPlace);
      setPlaces(prev => {
        const next = [created, ...prev];
        contactsCache = { token, data: next };
        return next;
      });
      setFName(''); setFAddress(''); setFPhone(''); setFEmail(''); setFHours(''); setFWebsite(''); setFNotes('');
      setShowCreate(false);
      Alert.alert('Success', 'Contact created');
    } catch (err) {
      Alert.alert('Error', 'Failed to create contact');
      console.warn(err);
    }
  };

  const deletePlace = async (id) => {
    if (!token) return;
    try {
      await deleteContactAPI(token, id);
      setPlaces(prev => {
        const next = prev.filter(p => p.id !== id);
        contactsCache = { token, data: next };
        return next;
      });
      setShow(false);
      Alert.alert('Success', 'Contact deleted');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete contact');
      console.warn(err);
    }
  };

  const tryCall = (phone) => { Linking.openURL(`tel:${phone}`).catch(() => {}); };
  const tryEmail = (email) => { Linking.openURL(`mailto:${email}`).catch(() => {}); };
  const tryOpen = (url) => { Linking.openURL(url).catch(() => {}); };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#E6EEF8' }]}> 
        <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 20, color: colors.muted }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Contacts</Text>
        <TouchableOpacity style={styles.addBtnWrap} onPress={() => setShowCreate(true)} activeOpacity={0.9}>
          <BlurView
            intensity={45}
            tint={theme === 'dark' ? 'dark' : 'light'}
            style={styles.addBtnGlass}
          >
            <View pointerEvents="none" style={styles.addBtnOverlay} />
            <Text style={[styles.addBtnText, { color: theme === 'dark' ? '#000000' : '#065f46' }]}>＋ Add</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search places, addresses..."
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, { backgroundColor: colors.card, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#E6EEF8' }]}
            onPress={() => openPlace(item)}
          >
            <View style={styles.cardRow}>
              <View style={[styles.avatar, { backgroundColor: theme === 'dark' ? '#06151b' : '#EEF2FF' }]}>
                <Text style={[styles.avatarText, { color: theme === 'dark' ? colors.accent : '#065f46' }]}>{item.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                {item.company ? <Text style={[styles.company, { color: colors.muted }]} numberOfLines={1}>{item.company}</Text> : null}
                {item.address ? <Text style={[styles.address, { color: colors.muted }]} numberOfLines={1}>{item.address}</Text> : null}
                {item.notes ? <Text style={[styles.notes, { color: colors.muted }]} numberOfLines={1}>{item.notes}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.phone, { color: colors.accent }]}>{item.phone}</Text>
                <Text style={[styles.chev, { color: colors.muted }]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="none">
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                backgroundColor: 'transparent',
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
                opacity: modalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          > 
            <BlurView
              intensity={45}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <View pointerEvents="none" style={styles.glassOverlay} />
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selected.name}</Text>
                  {selected.company ? <Text style={[styles.modalSubtitle, { color: colors.muted }]}>{selected.company}</Text> : null}
                  <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
                    <Text style={[styles.modalCloseText, { color: colors.muted }]}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  {selected.email ? <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>Email</Text><Text style={[styles.metaValue, { color: colors.text }]}>{selected.email}</Text></View> : null}
                  {selected.phone ? <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>Phone</Text><Text style={[styles.metaValue, { color: colors.text }]}>{selected.phone}</Text></View> : null}
                  {selected.address ? <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>Address</Text><Text style={[styles.metaValue, { color: colors.text }]}>{selected.address}</Text></View> : null}
                  {selected.city ? <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>City</Text><Text style={[styles.metaValue, { color: colors.text }]}>{selected.city}</Text></View> : null}
                  {selected.role ? <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>Role</Text><Text style={[styles.metaValue, { color: colors.text }]}>{selected.role}</Text></View> : null}
                  <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>Hours</Text><Text style={[styles.metaValue, { color: colors.text }]}>{selected.hours}</Text></View>
                  <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>Website</Text><Text style={[styles.link, { color: colors.accent }]} onPress={() => tryOpen(selected.website)}>{selected.website}</Text></View>
                  <View style={styles.metaRow}><Text style={[styles.metaLabel, { color: colors.muted }]}>Notes</Text><Text style={[styles.metaValue, { color: colors.text }]}>{selected.notes}</Text></View>

                  <View style={{ flexDirection: 'row', marginTop: 18, flexWrap: 'wrap' }}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={() => tryCall(selected.phone)}>
                      <Text style={styles.actionTextPrimary}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0EA5E9', marginLeft: 12 }]} onPress={() => { setShow(false); onMessageContact && onMessageContact(selected); }}>
                      <Text style={styles.actionTextPrimary}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444', marginLeft: 12 }]} onPress={() => deletePlace(selected.id)}>
                      <Text style={styles.actionTextPrimary}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Create modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowCreate(false)}>
            <View style={[styles.modalCard, { backgroundColor: 'transparent' }]}> 
              <BlurView
                intensity={45}
                tint={theme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <View pointerEvents="none" style={styles.glassOverlay} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add place</Text>
              <View style={{ marginTop: 12 }}>
                <TextInput placeholder="Name" placeholderTextColor={colors.muted} value={fName} onChangeText={setFName} style={[styles.formInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]} />
                <TextInput placeholder="Address" placeholderTextColor={colors.muted} value={fAddress} onChangeText={setFAddress} style={[styles.formInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]} />
                <TextInput placeholder="Phone" placeholderTextColor={colors.muted} value={fPhone} onChangeText={setFPhone} style={[styles.formInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]} />
                <TextInput placeholder="Email" placeholderTextColor={colors.muted} value={fEmail} onChangeText={setFEmail} style={[styles.formInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]} />
                <TextInput placeholder="Hours" placeholderTextColor={colors.muted} value={fHours} onChangeText={setFHours} style={[styles.formInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]} />
                <TextInput placeholder="Website" placeholderTextColor={colors.muted} value={fWebsite} onChangeText={setFWebsite} style={[styles.formInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]} />
                <TextInput placeholder="Notes" placeholderTextColor={colors.muted} value={fNotes} onChangeText={setFNotes} style={[styles.formInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]} />

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                  <TouchableOpacity onPress={() => setShowCreate(false)} style={[styles.actionBtnOutline, { marginRight: 8 }]}>
                    <Text style={[styles.actionTextSecondary, { color: colors.muted }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={addPlace} style={[styles.actionBtn, { backgroundColor: colors.accent }]}>
                    <Text style={styles.actionTextPrimary}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  backBtn: { padding: 6 },
  title: { fontSize: 20, fontWeight: '800', marginLeft: 12, flex: 1 },
  addBtnWrap: { borderRadius: 10, overflow: 'hidden' },
  addBtnGlass: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.16)' },
  addBtnText: { fontWeight: '700', fontSize: 13 },
  searchWrap: { paddingHorizontal: 20, paddingTop: 12 },
  searchInput: { padding: 12, borderRadius: 12, fontSize: 14 },
  card: { padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '700' },
  address: { fontSize: 13, marginTop: 2 },
  notes: { fontSize: 12, marginTop: 4 },
  phone: { fontSize: 13, fontWeight: '700' },
  chev: { fontSize: 26, marginTop: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' },
  modalCard: { padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden' },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalHeader: { marginBottom: 12 },
  modalClose: {
    position: 'absolute',
    right: 0,
    top: -2,
    padding: 6,
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSubtitle: { fontSize: 13, marginTop: 6 },
  modalBody: { marginTop: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  metaLabel: { fontSize: 13, fontWeight: '600' },
  metaValue: { fontSize: 13 },
  link: { fontSize: 13, textDecorationLine: 'underline' },
  actionBtn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  actionBtnOutline: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  actionTextPrimary: { color: '#fff', fontWeight: '700' },
  actionTextSecondary: { fontWeight: '700' },
  formInput: { padding: 12, borderRadius: 12, marginBottom: 12, fontSize: 14 },
});

