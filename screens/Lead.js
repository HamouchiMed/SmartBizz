import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Modal,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { listLeads, createLead, updateLead, deleteLead as deleteLeadAPI } from '../services/api';

const Lead = ({ token, onBack, theme = 'light' }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editLead, setEditLead] = useState(null);

  useEffect(() => {
    async function loadLeads() {
      if (!token) return;
      setLoading(true);
      try {
        const data = await listLeads(token);
        setLeads(data);
      } catch (err) {
        console.warn('Failed to load leads', err);
      }
      setLoading(false);
    }
    loadLeads();
  }, [token]);

  const colors = theme === 'dark' ? {
    background: '#F0EDE5',
    headerBg: '#F0EDE5',
    cardBg: '#101826',
    border: 'rgba(255,255,255,0.06)',
    textPrimary: '#E6EEF8',
    textMuted: '#9AA6B2',
    accent: '#000000',
    positive: '#10B981',
    negative: '#EF4444',
    inputBg: '#0e1726',
    chipBg: '#0e1726',
  } : {
    background: '#F4F7FF',
    headerBg: '#F0EDE5',
    cardBg: '#F0EDE5',
    border: '#E6EEFF',
    textPrimary: '#0F172A',
    textMuted: '#64748B',
    accent: '#065f46',
    positive: '#10B981',
    negative: '#EF4444',
    inputBg: '#F8FAFF',
    chipBg: '#F0EDE5',
  };

  const statuses = ['All', 'New', 'Contacted', 'Qualified', 'Proposal'];

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchesQuery = [l.name, l.company, l.email, l.phone].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'All' ? true : l.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [leads, query, filter]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const openLead = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const addLead = async (lead) => {
    if (!token) return;
    try {
      const created = await createLead(token, lead);
      setLeads(prev => [created, ...prev]);
      setShowCreate(false);
      Alert.alert('Success', 'Lead created');
    } catch (err) {
      Alert.alert('Error', 'Failed to create lead');
      console.warn(err);
    }
  };

  const deleteLead = async (id) => {
    if (!token) return;
    try {
      await deleteLeadAPI(token, id);
      setLeads(prev => prev.filter(l => l.id !== id));
      setShowModal(false);
      setSelectedLead(null);
      Alert.alert('Success', 'Lead deleted');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete lead');
      console.warn(err);
    }
  };

  const handleEditLead = async (updatedLead) => {
    if (!token || !selectedLead) return;
    try {
      const updated = await updateLead(token, selectedLead.id, updatedLead);
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? updated : l));
      setSelectedLead(updated);
      setShowEdit(false);
      Alert.alert('Success', 'Lead updated');
    } catch (err) {
      Alert.alert('Error', 'Failed to update lead');
      console.warn(err);
    }
  };

  const renderLeadItem = ({ item }) => {
    const initials = item.name.split(' ').map(n => n[0]).slice(0,2).join('');
    const statusColor = {
      New: { bg: theme === 'dark' ? '#06202b' : '#EEF2FF', color: theme === 'dark' ? '#000000' : '#065f46' },
      Contacted: { bg: theme === 'dark' ? '#2a2107' : '#FEF3C7', color: '#F59E0B' },
      Qualified: { bg: theme === 'dark' ? '#052e17' : '#D1FAE5', color: '#10B981' },
      Proposal: { bg: theme === 'dark' ? '#0f0b20' : '#E0E7FF', color: '#7C3AED' },
    }[item.status] || { bg: colors.cardBg, color: colors.textMuted };

    return (
      <TouchableOpacity activeOpacity={0.9} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={() => openLead(item)}>
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: theme === 'dark' ? '#071428' : '#EEF2FF' }]}>
            <Text style={[styles.avatarText, { color: statusColor.color }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.company, { color: colors.textMuted }]}>{item.company}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.value, { color: colors.positive }]}>{item.value}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.color }]}>{item.status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backBtn}>
          <Text style={{ color: colors.textMuted, fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Leads</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{filtered.length} results</Text>
        </View>
        <TouchableOpacity style={styles.addBtnWrap} onPress={() => setShowCreate(true)} activeOpacity={0.9}>
          <BlurView
            intensity={45}
            tint={theme === 'dark' ? 'dark' : 'light'}
            style={styles.addBtnGlass}
          >
            <View pointerEvents="none" style={styles.addBtnOverlay} />
            <Text style={[styles.addBtnText, { color: theme === 'dark' ? '#000000' : '#065f46' }]}>+ Add</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search leads, company, email..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.border }]}
        />
        <View style={styles.chips}>
          {statuses.map(s => (
            <TouchableOpacity key={s} onPress={() => setFilter(s)} style={[styles.chip, { backgroundColor: filter === s ? colors.accent : colors.chipBg, borderColor: colors.border }]}> 
              <Text style={{ color: filter === s ? '#fff' : colors.textMuted, fontWeight: filter === s ? '700' : '600' }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList data={filtered} renderItem={renderLeadItem} keyExtractor={i => i.id} contentContainerStyle={{ padding: 20 }} />

      <Modal visible={showModal} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowModal(false)}>
          <Animated.View style={[styles.modalCard, { backgroundColor: 'transparent' }]}> 
            <BlurView
              intensity={45}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <View pointerEvents="none" style={styles.glassOverlayModal} />
            {selectedLead && (
              <>
                <Text style={[styles.modalName, { color: colors.textPrimary }]}>{selectedLead.name}</Text>
                <Text style={[styles.modalCompany, { color: colors.textMuted }]}>{selectedLead.company}</Text>
                <Text style={[styles.modalInfo, { color: colors.textMuted }]}>Email: {selectedLead.email}</Text>
                <Text style={[styles.modalInfo, { color: colors.textMuted }]}>Phone: {selectedLead.phone}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 18 }}>
                      <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.accent }]} onPress={() => { console.log('Call', selectedLead.phone); }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.positive, marginLeft: 12 }]} onPress={() => { console.log('Email', selectedLead.email); }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Email</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#FFB86B', marginLeft: 12 }]} onPress={() => { setEditLead(selectedLead); setShowModal(false); setShowEdit(true); }}>
                        <Text style={{ color: '#111827', fontWeight: '700' }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.negative || '#ef4444', marginLeft: 12 }]} onPress={() => { deleteLead(selectedLead.id); }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
              </>
            )}
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal visible={showCreate} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowCreate(false)}>
            <View style={[styles.createCard, { backgroundColor: 'transparent' }]}> 
              <BlurView
                intensity={45}
                tint={theme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <View pointerEvents="none" style={styles.glassOverlayModal} />
              <Text style={[styles.modalName, { color: colors.textPrimary }]}>Create Lead</Text>
              <CreateForm onCancel={() => setShowCreate(false)} onSave={addLead} theme={theme} />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showEdit} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowEdit(false)}>
            <View style={[styles.createCard, { backgroundColor: 'transparent' }]}> 
              <BlurView
                intensity={45}
                tint={theme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <View pointerEvents="none" style={styles.glassOverlayModal} />
              <Text style={[styles.modalName, { color: colors.textPrimary }]}>Edit Lead</Text>
              <EditForm
                initial={editLead}
                onCancel={() => { setShowEdit(false); setEditLead(null); }}
                onSave={handleEditLead}
                theme={theme}
              />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const CreateForm = ({ onCancel, onSave, theme }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('New');
  const inputStyle = {
    backgroundColor: theme === 'dark' ? '#0e1726' : '#F8FAFF',
    color: theme === 'dark' ? '#E6EEF8' : '#0F172A',
    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#E6EEFF',
  };
  const statusOptions = ['New', 'Contacted', 'Qualified', 'Proposal'];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View>
        <TextInput placeholder="Full name" value={name} onChangeText={setName} style={[formStyles.input, inputStyle]} placeholderTextColor="#94A3B8" />
        <TextInput placeholder="Company" value={company} onChangeText={setCompany} style={[formStyles.input, inputStyle]} placeholderTextColor="#94A3B8" />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={[formStyles.input, inputStyle]} placeholderTextColor="#94A3B8" />
        <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={[formStyles.input, inputStyle]} placeholderTextColor="#94A3B8" />
        <Text style={[formStyles.label, { color: theme === 'dark' ? '#E6EEF8' : '#0F172A' }]}>Status</Text>
        <View style={formStyles.statusRow}>
          {statusOptions.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={[formStyles.statusBtn, { backgroundColor: status === s ? '#065f46' : (theme === 'dark' ? '#1f2937' : '#E5E7EB') }]}
            >
              <Text style={{ color: status === s ? '#fff' : (theme === 'dark' ? '#E6EEF8' : '#0F172A'), fontWeight: status === s ? '700' : '600', fontSize: 12 }}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <TouchableOpacity onPress={onCancel} style={[formStyles.btn, { backgroundColor: theme === 'dark' ? '#1f2937' : '#E5E7EB' }]}>
            <Text style={{ color: theme === 'dark' ? '#E6EEF8' : '#0F172A' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSave({ name, company, email, phone, status, value: '$0' })} style={[formStyles.btn, { backgroundColor: '#065f46', marginLeft: 8 }]}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const EditForm = ({ initial = {}, onCancel, onSave, theme }) => {
  const [name, setName] = useState(initial?.name || '');
  const [company, setCompany] = useState(initial?.company || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [status, setStatus] = useState(initial?.status || 'New');
  const inputStyle = {
    backgroundColor: theme === 'dark' ? '#0e1726' : '#F8FAFF',
    color: theme === 'dark' ? '#E6EEF8' : '#0F172A',
    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#E6EEFF',
  };
  const statusOptions = ['New', 'Contacted', 'Qualified', 'Proposal'];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View>
        <TextInput placeholder="Full name" value={name} onChangeText={setName} style={[formStyles.input, inputStyle]} placeholderTextColor="#94A3B8" />
        <TextInput placeholder="Company" value={company} onChangeText={setCompany} style={[formStyles.input, inputStyle]} placeholderTextColor="#94A3B8" />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={[formStyles.input, inputStyle]} placeholderTextColor="#94A3B8" />
        <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={[formStyles.input, inputStyle]} placeholderTextColor="#94A3B8" />
        <Text style={[formStyles.label, { color: theme === 'dark' ? '#E6EEF8' : '#0F172A' }]}>Status</Text>
        <View style={formStyles.statusRow}>
          {statusOptions.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={[formStyles.statusBtn, { backgroundColor: status === s ? '#065f46' : (theme === 'dark' ? '#1f2937' : '#E5E7EB') }]}
            >
              <Text style={{ color: status === s ? '#fff' : (theme === 'dark' ? '#E6EEF8' : '#0F172A'), fontWeight: status === s ? '700' : '600', fontSize: 12 }}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <TouchableOpacity onPress={onCancel} style={[formStyles.btn, { backgroundColor: theme === 'dark' ? '#1f2937' : '#E5E7EB' }]}>
            <Text style={{ color: theme === 'dark' ? '#E6EEF8' : '#0F172A' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSave({ id: initial.id, name, company, email, phone, status, value: initial.value || '$0' })} style={[formStyles.btn, { backgroundColor: '#065f46', marginLeft: 8 }]}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  backBtn: { padding: 6 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.2 },
  subtitle: { fontSize: 12, marginTop: 2 },
  addBtnWrap: { borderRadius: 10, overflow: 'hidden' },
  addBtnGlass: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.16)' },
  addBtnText: { fontWeight: '700', fontSize: 13 },
  searchRow: { paddingHorizontal: 20, paddingTop: 12 },
  searchInput: { padding: 12, borderRadius: 14, borderWidth: 1 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, marginRight: 8 },
  card: { padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '700' },
  company: { fontSize: 13, marginTop: 4 },
  value: { fontSize: 14, fontWeight: '800' },
  statusPill: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' },
  modalCard: { padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden' },
  glassOverlayModal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.08)' },
  modalName: { fontSize: 18, fontWeight: '800' },
  modalCompany: { fontSize: 14, marginTop: 6 },
  modalInfo: { fontSize: 13, marginTop: 8 },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  createCard: { padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden' },
});

const formStyles = StyleSheet.create({
  input: { padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  label: { marginTop: 16, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  statusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statusBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
});

export default Lead;

