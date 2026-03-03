import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';

export default function HelpSupport({ theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToAnalytics, onNavigateToEvents, onNavigateToProfile }) {
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

  const [bug, setBug] = useState('');
  const [feature, setFeature] = useState('');

  const faqs = [
    { q: 'How do I reset my password?', a: 'Go to Profile > Security and choose Change Password.' },
    { q: 'How do I add a new deal?', a: 'Open Deals and tap the Add button to create one.' },
    { q: 'Can I export my data?', a: 'Exports are coming soon in Settings.' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigateToProfile?.()}>
          <Text style={[styles.backText, { color: colors.accent || colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>FAQ</Text>
          {faqs.map((f) => (
            <View key={f.q} style={styles.faqRow}>
              <Text style={[styles.faqQ, { color: colors.textPrimary }]}>{f.q}</Text>
              <Text style={[styles.faqA, { color: colors.textMuted }]}>{f.a}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Support</Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.primaryBtnText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Email Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.inputBorder }]}> 
            <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Start Live Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Report a Bug</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="Describe the issue"
            placeholderTextColor={colors.textMuted}
            value={bug}
            onChangeText={setBug}
            multiline
          />
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]}> 
            <Text style={[styles.primaryBtnText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Submit Bug</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Feature Request</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="Describe your idea"
            placeholderTextColor={colors.textMuted}
            value={feature}
            onChangeText={setFeature}
            multiline
          />
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]}> 
            <Text style={[styles.primaryBtnText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Submit Request</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>App Info</Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>Version 1.0.0 (Expo SDK 54)</Text>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={[styles.linkText, { color: colors.accent }]}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={[styles.linkText, { color: colors.accent }]}>Privacy Policy</Text>
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
  faqRow: { paddingVertical: 8 },
  faqQ: { fontSize: 13, fontWeight: '700' },
  faqA: { fontSize: 12, marginTop: 4 },
  primaryBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { fontSize: 13, fontWeight: '700' },
  outlineBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8, borderWidth: 1 },
  outlineBtnText: { fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginTop: 8, minHeight: 80, textAlignVertical: 'top' },
  infoText: { fontSize: 12, marginBottom: 6 },
  linkRow: { paddingVertical: 6 },
  linkText: { fontSize: 12, fontWeight: '700' },
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



