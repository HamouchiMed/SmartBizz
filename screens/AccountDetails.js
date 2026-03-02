import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';

export default function AccountDetails({ theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToAnalytics, onNavigateToEvents, onNavigateToProfile, onBack }) {
  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    textPrimary: '#e6eef8',
    textMuted: '#9aa6b2',
    primary: '#065f46',
    accent: '#000000',
  } : {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    textPrimary: '#1F2937',
    textMuted: '#6B7280',
    primary: '#065f46',
    accent: '#000000',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onBack?.()}>
          <Text style={[styles.backText, { color: colors.accent || colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Account Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>Mohamed Hamouchi</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Phone</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>+212 6 12 34 56 78</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Company</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>SmartBizz LLC</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Industry</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>SaaS</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Role</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>Business Owner</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Address</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>20 Avenue Mohammed V, Rabat</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>City</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>Rabat</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Country</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>Morocco</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Plan</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>Pro</Text>
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
  content: { paddingBottom: 140 },
  card: { marginHorizontal: 20, padding: 16, borderRadius: 16 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(125,211,252,0.08)' },
  rowLast: { borderBottomWidth: 0 },
  label: { fontSize: 12, fontWeight: '600' },
  value: { marginTop: 4, fontSize: 14, fontWeight: '700' },
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


