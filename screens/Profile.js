import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { listProfiles, createProfile, updateProfile } from '../services/api';

export default function Profile({ theme = 'dark', onNavigateToDashboard, onNavigateToWallet, onNavigateToAnalytics, onNavigateToEvents, onNavigateToAccountDetails, onNavigateToSecurity, onNavigateToNotificationsSettings, onNavigateToBilling, onNavigateToHelpSupport, token, authUser }) {
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

  const [profileId, setProfileId] = useState(null);
  const [profileName, setProfileName] = useState(authUser?.name || '');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [tempName, setTempName] = useState(profileName);
  const [tempPhoto, setTempPhoto] = useState(profilePhoto);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const data = await listProfiles(token);
        const first = data?.[0];
        if (first) {
          setProfileId(first.id);
          setProfileName(first.name || authUser?.name || '');
          setProfilePhoto(first.photo_url || '');
        } else {
          setProfileName(authUser?.name || '');
        }
      } catch (e) {
        Alert.alert('Profile', e.message);
      }
    };
    load();
  }, [token, authUser]);

  const stats = [
    { label: 'Deals', value: '48' },
    { label: 'Contacts', value: '126' },
    { label: 'Revenue', value: '$120k' },
  ];

  const settings = [
    { label: 'Account Details', action: () => onNavigateToAccountDetails?.() },
    { label: 'Security', action: () => onNavigateToSecurity?.() },
    { label: 'Notifications', action: () => onNavigateToNotificationsSettings?.() },
    { label: 'Billing', action: () => onNavigateToBilling?.() },
    { label: 'Help & Support', action: () => onNavigateToHelpSupport?.() },
  ];

  const initials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  const openEdit = () => {
    setTempName(profileName);
    setTempPhoto(profilePhoto);
    setEditVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to choose a profile image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setTempPhoto(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!tempName.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    try {
      if (!token) {
        setProfileName(tempName.trim());
        setProfilePhoto(tempPhoto);
        setEditVisible(false);
        return;
      }
      if (profileId) {
        const updated = await updateProfile(token, profileId, {
          name: tempName.trim(),
          photo_url: tempPhoto,
        });
        setProfileName(updated.name || tempName.trim());
        setProfilePhoto(updated.photo_url || tempPhoto);
      } else {
        const created = await createProfile(token, {
          name: tempName.trim(),
          photo_url: tempPhoto,
        });
        setProfileId(created.id);
        setProfileName(created.name || tempName.trim());
        setProfilePhoto(created.photo_url || tempPhoto);
      }
      setEditVisible(false);
    } catch (e) {
      Alert.alert('Profile', e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.cardBg }]} onPress={() => onNavigateToDashboard?.()}>
          <Text style={[styles.backText, { color: colors.accent }]}>Go Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.cardBg }]} onPress={openEdit}>
          <Text style={[styles.editText, { color: colors.accent }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.cardBg }]}> 
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>{initials || 'SB'}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{profileName || 'Your Name'}</Text>
            <Text style={[styles.role, { color: colors.textMuted }]}>Business Owner</Text>
            <Text style={[styles.company, { color: colors.textMuted }]}>SmartBizz LLC</Text>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.cardBg }]}> 
          {stats.map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Preferences</Text>
          {settings.map((item) => (
            <TouchableOpacity key={item.label} style={styles.settingRow} onPress={item.action}>
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>{item.label}</Text>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>


      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            style={{ width: '100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <View style={[styles.modalCard, { backgroundColor: colors.cardBg }]}> 
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Profile</Text>

              <TouchableOpacity style={[styles.photoPicker, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]} onPress={pickImage}>
                {tempPhoto ? (
                  <Image source={{ uri: tempPhoto }} style={styles.photoPreview} />
                ) : (
                  <Text style={[styles.photoText, { color: colors.textMuted }]}>Choose photo</Text>
                )}
              </TouchableOpacity>

              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                placeholder="Full name"
                placeholderTextColor={colors.textMuted}
                value={tempName}
                onChangeText={setTempName}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.inputBg }]} onPress={() => setEditVisible(false)}>
                  <Text style={[styles.modalButtonText, { color: colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={saveProfile}>
                  <Text style={[styles.modalButtonText, { color: colors.textPrimary === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Save</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editBtn: {
    minWidth: 74,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  role: {
    fontSize: 12,
    marginTop: 4,
  },
  company: {
    fontSize: 12,
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 16,
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
    marginBottom: 12,
    fontSize: 14,
  },
  photoPicker: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
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



