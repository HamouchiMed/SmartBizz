import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { BlurView } from 'expo-blur';

export default function NotificationsSettings({ theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToAnalytics, onNavigateToEvents, onNavigateToProfile }) {
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

  const [cats, setCats] = useState({
    deals: true,
    leads: true,
    tasks: true,
    messages: true,
    system: true,
  });
  const [channels, setChannels] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [quietHours, setQuietHours] = useState(false);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [digest, setDigest] = useState('Daily');
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [perContact, setPerContact] = useState(false);
  const [perDeal, setPerDeal] = useState(false);

  const digestOptions = ['Instant', 'Daily', 'Weekly'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigateToProfile?.()}>
          <Text style={[styles.backText, { color: colors.accent || colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Categories</Text>
          {Object.entries(cats).map(([key, value]) => (
            <View key={key} style={styles.rowBetween}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{key[0].toUpperCase() + key.slice(1)}</Text>
              <Switch value={value} onValueChange={(v) => setCats(prev => ({ ...prev, [key]: v }))} />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Delivery Channels</Text>
          {Object.entries(channels).map(([key, value]) => (
            <View key={key} style={styles.rowBetween}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{key.toUpperCase()}</Text>
              <Switch value={value} onValueChange={(v) => setChannels(prev => ({ ...prev, [key]: v }))} />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quiet Hours</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Do Not Disturb (10 PM - 7 AM)</Text>
            <Switch value={quietHours} onValueChange={setQuietHours} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Priority Alerts</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Urgent only</Text>
            <Switch value={priorityOnly} onValueChange={setPriorityOnly} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Digest Frequency</Text>
          <View style={styles.chipRow}>
            {digestOptions.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, { borderColor: colors.inputBorder, backgroundColor: digest === d ? colors.primary : 'transparent' }]}
                onPress={() => setDigest(d)}
              >
                <Text style={[styles.chipText, { color: digest === d ? (colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b') : colors.textMuted }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sound & Vibration</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Sound</Text>
            <Switch value={sound} onValueChange={setSound} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Vibration</Text>
            <Switch value={vibration} onValueChange={setVibration} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Per-Contact / Per-Deal Alerts</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Enable per-contact alerts</Text>
            <Switch value={perContact} onValueChange={setPerContact} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Enable per-deal alerts</Text>
            <Switch value={perDeal} onValueChange={setPerDeal} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Test</Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.primaryBtnText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
          <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToEvents?.()}>
            <Text style={[styles.navText, { color: colors.textMuted }]}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => onNavigateToAnalytics?.()}>
            <Text style={[styles.navText, { color: colors.textMuted }]}>Analytics</Text>
          </TouchableOpacity></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 14, gap: 8 },
  backBtn: { padding: 6, marginRight: 2 },
  backText: { fontSize: 24, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 140, gap: 14 },
  card: { padding: 16, borderRadius: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 12, fontWeight: '600' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  primaryBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { fontSize: 13, fontWeight: '700' },
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
  bottomNavBlur: { ...StyleSheet.absoluteFillObject },
  bottomNavHighlight: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  bottomNav: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, backgroundColor: 'transparent' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  activeNav: { borderRadius: 12, paddingHorizontal: 8 },
  navText: { fontSize: 12, fontWeight: '500' },
  activeNavText: { fontWeight: '700' },
});



