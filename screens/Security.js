import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { BlurView } from 'expo-blur';

export default function Security({ theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToAnalytics, onNavigateToEvents, onNavigateToProfile }) {
  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    textPrimary: '#e6eef8',
    textMuted: '#9aa6b2',
    primary: '#065f46',
    inputBg: '#071027',
    inputBorder: 'rgba(125,211,252,0.08)',
  } : {
    background: '#1F6A64',
    cardBg: '#F0EDE5',
    textPrimary: '#1F2937',
    textMuted: '#6B7280',
    primary: '#065f46',
    inputBg: '#F3F4F6',
    inputBorder: 'rgba(37,99,235,0.12)',
  };

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [appLock, setAppLock] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [backupCodesEnabled, setBackupCodesEnabled] = useState(false);

  const sessions = [
    { id: 's1', device: 'iPhone SE (2020)', location: 'Rabat, MA', last: 'Active now' },
    { id: 's2', device: 'MacBook Pro', location: 'Casablanca, MA', last: '2 days ago' },
    { id: 's3', device: 'iPad Air', location: 'Rabat, MA', last: '1 week ago' },
  ];

  const handleChangePassword = () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert('Missing info', 'Please fill all password fields.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Mismatch', 'New password and confirm password do not match.');
      return;
    }
    Alert.alert('Success', 'Password updated.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigateToProfile?.()}>
          <Text style={[styles.backText, { color: colors.accent || colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Change Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="Current password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={currentPass}
            onChangeText={setCurrentPass}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="New password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            placeholder="Confirm new password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={confirmPass}
            onChangeText={setConfirmPass}
          />
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleChangePassword}>
            <Text style={[styles.primaryBtnText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Update Password</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Two-Factor Authentication</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Enable 2FA (SMS / Authenticator)</Text>
            <Switch value={twoFAEnabled} onValueChange={setTwoFAEnabled} />
          </View>
          <Text style={[styles.subText, { color: colors.textMuted }]}>Add an extra layer of security to your account.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Devices & Sessions</Text>
          {sessions.map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionDevice, { color: colors.textPrimary }]}>{s.device}</Text>
                <Text style={[styles.sessionMeta, { color: colors.textMuted }]}>{s.location} • {s.last}</Text>
              </View>
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.inputBorder }]}>
                <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Sign out</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.outlineBtn, styles.fullBtn, { borderColor: colors.inputBorder }]}>
            <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Sign out of all devices</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>App Lock</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Face ID / Touch ID / PIN</Text>
            <Switch value={appLock} onValueChange={setAppLock} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Login Alerts</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Email & push alerts</Text>
            <Switch value={loginAlerts} onValueChange={setLoginAlerts} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recovery Options</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Backup codes</Text>
            <Switch value={backupCodesEnabled} onValueChange={setBackupCodesEnabled} />
          </View>
          <TouchableOpacity style={[styles.outlineBtn, styles.fullBtn, { borderColor: colors.inputBorder }]}>
            <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Generate backup codes</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Security Questions</Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>Add answers to help recover your account.</Text>
          <TouchableOpacity style={[styles.outlineBtn, styles.fullBtn, { borderColor: colors.inputBorder }]}>
            <Text style={[styles.outlineBtnText, { color: colors.textMuted }]}>Set security questions</Text>
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
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
  primaryBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { fontSize: 13, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: '600' },
  subText: { fontSize: 12, marginTop: 6 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  sessionDevice: { fontSize: 13, fontWeight: '700' },
  sessionMeta: { fontSize: 11, marginTop: 2 },
  outlineBtn: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
  outlineBtnText: { fontSize: 11, fontWeight: '700' },
  fullBtn: { marginTop: 10 },
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



