import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function OTPVerificationScreen({ userEmail = '', userPhone = '', onVerify, onBack, theme = 'dark' }) {
  const [verificationMethod, setVerificationMethod] = useState(null); // 'email' or 'phone'
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');

  const generateOTP = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(newOTP);
    console.log('\n🔐 ==================== OTP VERIFICATION ====================');
    console.log(`📧 Email: ${userEmail}`);
    console.log(`📱 Phone: ${userPhone}`);
    console.log(`📬 Verification Method: ${verificationMethod === 'email' ? 'Email' : 'SMS'}`);
    console.log(`🔑 OTP Code: ${newOTP}`);
    console.log('========================================================== 🔐\n');
    return newOTP;
  };

  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    topDecoration: '#1f2937',
    bottomDecoration: '#111827',
    cardBg: '#F0EDE5',
    brand: '#000000',
    title: '#e6eef8',
    inputBg: '#071027',
    inputText: '#e6eef8',
    inputBorder: 'rgba(125,211,252,0.06)',
    primary: '#065f46',
    primaryText: '#04222b',
    muted: '#9aa6b2',
    link: '#000000',
    footerText: '#6b7280',
    methodCard: '#111827',
    methodCardBorder: 'rgba(125,211,252,0.1)',
    methodCardActive: 'rgba(6,182,212,0.1)',
    methodCardActiveBorder: '#065f46',
  } : {
    background: '#ffffff',
    topDecoration: '#E6F0FF',
    bottomDecoration: '#F3F7FF',
    cardBg: '#F0EDE5',
    brand: '#065f46',
    title: '#1F2937',
    inputBg: '#F3F4F6',
    inputText: '#1F2937',
    inputBorder: 'rgba(34, 45, 67, 0.06)',
    primary: '#065f46',
    primaryText: '#F0EDE5',
    muted: '#6B7280',
    link: '#065f46',
    footerText: '#4B5563',
    methodCard: '#F9FAFB',
    methodCardBorder: 'rgba(34, 45, 67, 0.1)',
    methodCardActive: 'rgba(37, 99, 235, 0.05)',
    methodCardActiveBorder: '#065f46',
  };

  const handleMethodSelect = (method) => {
    setVerificationMethod(method);
    setOtp('');
    if (method) {
      generateOTP();
    }
  };

  const handleVerify = () => {
    if (!otp.trim()) {
      alert('Please enter OTP');
      return;
    }

    if (otp !== generatedOTP) {
      alert('Incorrect OTP. Please try again.');
      setOtp('');
      return;
    }
    
    setIsLoading(true);
    // Simulate OTP verification delay
    setTimeout(() => {
      setIsLoading(false);
      console.log('✅ OTP Verified Successfully!');
      if (onVerify) {
        onVerify({ method: verificationMethod, otp });
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    setOtp('');
    generateOTP();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

        <View style={[styles.topDecoration, { backgroundColor: colors.topDecoration }]} />

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.link }]}>← Back</Text>
          </TouchableOpacity>

          <Text style={[styles.brand, { color: colors.brand }]}>SmartBizz CRM</Text>
          <Text style={[styles.title, { color: colors.title }]}>Verify your account</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Choose how you'd like to receive your verification code</Text>

          {!verificationMethod ? (
            <>
              {/* Email Verification Option */}
              <TouchableOpacity
                style={[styles.methodCard, { backgroundColor: colors.methodCard, borderColor: colors.methodCardBorder, borderWidth: 1 }]}
                onPress={() => handleMethodSelect('email')}
                activeOpacity={0.7}
              >
                <Text style={[styles.methodIcon, { color: colors.brand }]}>📧</Text>
                <View style={styles.methodContent}>
                  <Text style={[styles.methodTitle, { color: colors.title }]}>Email</Text>
                  <Text style={[styles.methodSubtitle, { color: colors.muted }]}>{userEmail}</Text>
                </View>
                <Text style={[styles.methodArrow, { color: colors.muted }]}>›</Text>
              </TouchableOpacity>

              {/* Phone Verification Option */}
              <TouchableOpacity
                style={[styles.methodCard, { backgroundColor: colors.methodCard, borderColor: colors.methodCardBorder, borderWidth: 1 }]}
                onPress={() => handleMethodSelect('phone')}
                activeOpacity={0.7}
              >
                <Text style={[styles.methodIcon, { color: colors.primary }]}>📱</Text>
                <View style={styles.methodContent}>
                  <Text style={[styles.methodTitle, { color: colors.title }]}>SMS</Text>
                  <Text style={[styles.methodSubtitle, { color: colors.muted }]}>{userPhone || 'Not provided'}</Text>
                </View>
                <Text style={[styles.methodArrow, { color: colors.muted }]}>›</Text>
              </TouchableOpacity>

              <Text style={[styles.note, { color: colors.muted }]}>We'll send a 6-digit code to verify your identity</Text>
            </>
          ) : (
            <>
              <View style={[styles.selectedMethod, { backgroundColor: colors.methodCard, borderColor: colors.methodCardActiveBorder, borderWidth: 2 }]}>
                <Text style={[styles.selectedMethodText, { color: colors.title }]}>
                  {verificationMethod === 'email' ? 'Verification via Email' : ' Verification via SMS'}
                </Text>
                <Text style={[styles.selectedMethodSubtext, { color: colors.muted }]}>
                  Code sent to {verificationMethod === 'email' ? userEmail : userPhone}
                </Text>
              </View>

              <TextInput
                placeholder="Enter 6-digit code"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
                style={[styles.otpInput, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }]}
                value={otp}
                onChangeText={setOtp}
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }]}
                activeOpacity={0.9}
                onPress={handleVerify}
                disabled={isLoading}
              >
                <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
              >
                <Text style={[styles.resendText, { color: colors.link }]}>Didn't receive code? Send again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeMethodButton}
                onPress={() => handleMethodSelect(null)}
              >
                <Text style={[styles.changeMethodText, { color: colors.muted }]}>Change verification method</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footerNote}>
          <Text style={[styles.footerText, { color: colors.footerText }]}>Your data is secure and encrypted</Text>
        </View>

        <View style={[styles.bottomDecoration, { backgroundColor: colors.bottomDecoration }]} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1F6A64',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  topDecoration: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 220,
    height: 220,
    backgroundColor: '#1f2937',
    borderRadius: 110,
    opacity: 0.6,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 260,
    height: 260,
    backgroundColor: '#111827',
    borderRadius: 130,
    opacity: 0.6,
  },
  card: {
    width: Math.min(width - 40, 480),
    backgroundColor: '#F0EDE5',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    color: '#e6eef8',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9aa6b2',
    fontSize: 14,
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 12,
  },
  methodArrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  selectedMethod: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
  },
  selectedMethodText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedMethodSubtext: {
    fontSize: 12,
  },
  otpInput: {
    backgroundColor: '#071027',
    color: '#e6eef8',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.06)',
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#065f46',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#04222b',
    fontWeight: '700',
    fontSize: 16,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 8,
  },
  resendText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  changeMethodButton: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
  },
  changeMethodText: {
    color: '#9aa6b2',
    fontSize: 12,
  },
  note: {
    color: '#9aa6b2',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  footerNote: {
    marginTop: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});

