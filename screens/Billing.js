import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { BlurView } from 'expo-blur';

export default function Billing({ theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToAnalytics, onNavigateToEvents, onNavigateToProfile }) {
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

  const [autoRenew, setAutoRenew] = useState(true);
  const [promo, setPromo] = useState('');

  const invoices = [
    { id: 'i1', date: 'Feb 01, 2026', amount: '$29.00' },
    { id: 'i2', date: 'Jan 01, 2026', amount: '$29.00' },
    { id: 'i3', date: 'Dec 01, 2025', amount: '$29.00' },
  ];

  const usage = [
    { label: 'Seats', value: '3 / 10' },
    { label: 'Storage', value: '12GB / 50GB' },
    { label: 'Automations', value: '18 / 50' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigateToProfile?.()}>
          <Text style={[styles.backText, { color: colors.accent || colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Billing</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Current Plan</Text>
          <Text style={[styles.bigText, { color: colors.textPrimary }]}>Pro</Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>Next billing: Mar 01, 2026</Text>
          <View style={styles.rowButtons}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
              <Text style={[styles.primaryBtnText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Upgrade</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.inputBorder }]}>
              <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Downgrade</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Method</Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>Visa •••• 4242</Text>
          <TouchableOpacity style={[styles.outlineBtn, styles.fullBtn, { borderColor: colors.inputBorder }]}>
            <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Edit payment method</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Billing Address</Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>20 Avenue Mohammed V, Rabat, Morocco</Text>
          <TouchableOpacity style={[styles.outlineBtn, styles.fullBtn, { borderColor: colors.inputBorder }]}>
            <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Edit address</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Usage Summary</Text>
          {usage.map((u) => (
            <View key={u.label} style={styles.rowBetween}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{u.label}</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>{u.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Promo Code</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="Enter promo code"
            placeholderTextColor={colors.textMuted}
            value={promo}
            onChangeText={setPromo}
          />
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]}> 
            <Text style={[styles.primaryBtnText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Apply</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Invoice History</Text>
          {invoices.map((inv) => (
            <View key={inv.id} style={styles.rowBetween}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{inv.date}</Text>
              <View style={styles.rowButtonsSmall}>
                <Text style={[styles.value, { color: colors.textPrimary }]}>{inv.amount}</Text>
                <TouchableOpacity style={[styles.outlineBtn, styles.smallBtn, { borderColor: colors.inputBorder }]}> 
                  <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Auto-Renew</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Renew subscription automatically</Text>
            <Switch value={autoRenew} onValueChange={setAutoRenew} />
          </View>
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
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.activeNav, { backgroundColor: colors.primary }]} onPress={() => onNavigateToProfile?.()}>
            <Text style={[styles.navText, styles.activeNavText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Profile</Text>
          </TouchableOpacity>
        </View>
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
  bigText: { fontSize: 18, fontWeight: '700' },
  subText: { fontSize: 12, marginTop: 6 },
  rowButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  rowButtonsSmall: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { fontSize: 12, fontWeight: '700' },
  outlineBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  outlineBtnText: { fontSize: 11, fontWeight: '700' },
  fullBtn: { marginTop: 10 },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 12, fontWeight: '600' },
  value: { fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
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
  bottomNav: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, backgroundColor: 'rgba(15, 23, 36, 0.35)' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  activeNav: { borderRadius: 12, paddingHorizontal: 8 },
  navText: { fontSize: 12, fontWeight: '500' },
  activeNavText: { fontWeight: '700' },
});

