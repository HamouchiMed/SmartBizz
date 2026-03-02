import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onLogin, onSignup, theme = 'dark' }) {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [referral, setReferral] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const industries = [
    'Retail',
    'SaaS',
    'Real Estate',
    'Finance',
    'Healthcare',
    'Logistics',
  ];

  async function handleLogin() {
    console.log('Login', { email, password });
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password to sign in.');
      return;
    }
    if (onLogin) {
      setLoading(true);
      try {
        await onLogin(email, password);
      } catch (err) {
        console.log('Login error in UI:', err?.message || err);
        Alert.alert('Sign in failed', err?.message || 'Unable to sign in');
      } finally {
        setLoading(false);
      }
    }
  }

  function handleSignup() {
    console.log('Signup initiated', { name, email, phone, password });
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please provide an email and password to sign up.');
      return;
    }
    if (onSignup && email) {
      try {
        onSignup({ name, email, phone, password });
      } catch (err) {
        console.log('Signup error in UI:', err?.message || err);
        Alert.alert('Sign up failed', err?.message || 'Unable to sign up');
      }
    }
  }

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const passwordLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very strong'][Math.max(0, passwordScore - 1)] || 'Weak';
  const passwordMatch = !confirmPassword || password === confirmPassword;

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
    chipBg: '#0c1a2d',
    chipText: '#e6eef8',
    chipBorder: 'rgba(125,211,252,0.12)',
    chipActiveBg: '#065f46',
    chipActiveText: '#04222b',
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
    chipBg: '#EFF6FF',
    chipText: '#1F2937',
    chipBorder: 'rgba(37,99,235,0.2)',
    chipActiveBg: '#065f46',
    chipActiveText: '#F0EDE5',
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      > 
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

        <View style={[styles.topDecoration, { backgroundColor: colors.topDecoration }]} />

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}> 
          <Text style={[styles.brand, { color: colors.brand }]}>SmartBizz CRM</Text>

          <Text style={[styles.title, { color: colors.title }]}>{isSignup ? 'Create account' : 'Welcome back'}</Text>

          {isSignup && (
            <View style={styles.progressWrap}>
              <Text style={[styles.progressText, { color: colors.muted }]}>Step {signupStep} of 3</Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.inputBorder }]}> 
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(signupStep / 3) * 100}%` }]} />
              </View>
            </View>
          )}

          {isSignup && signupStep === 1 && (
            <>
              <TextInput
                placeholder="Full name"
                placeholderTextColor="#999"
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }]}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <TextInput
                placeholder="Company name (optional)"
                placeholderTextColor="#999"
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }]}
                value={company}
                onChangeText={setCompany}
              />
              <Text style={[styles.label, { color: colors.muted }]}>Industry (optional)</Text>
              <View style={styles.chipRow}>
                {industries.map((item) => {
                  const active = selectedIndustry === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.chipActiveBg : colors.chipBg,
                          borderColor: active ? colors.chipActiveBg : colors.chipBorder,
                        },
                      ]}
                      onPress={() => {
                        setSelectedIndustry(active ? '' : item);
                        setIndustry(active ? '' : item);
                      }}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: active ? colors.chipActiveText : colors.chipText },
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {isSignup && signupStep === 2 && (
            <>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }]}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                placeholder="Phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }]}
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                placeholder="Referral code (optional)"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }]}
                value={referral}
                onChangeText={setReferral}
              />
            </>
          )}

          {isSignup && signupStep === 3 && (
            <>
              <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}> 
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  style={[styles.inputInline, { color: colors.inputText }]}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={[styles.toggleText, { color: colors.link }]}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}> 
                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.inputInline, { color: colors.inputText }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={[styles.toggleText, { color: colors.link }]}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              {!passwordMatch && (
                <Text style={[styles.errorText, { color: '#ef4444' }]}>Passwords do not match</Text>
              )}

              <View style={styles.strengthWrap}>
                <Text style={[styles.strengthLabel, { color: colors.muted }]}>Password strength: {passwordLabel}</Text>
                <View style={[styles.strengthTrack, { backgroundColor: colors.inputBorder }]}> 
                  <View style={[styles.strengthFill, { backgroundColor: colors.primary, width: `${Math.min(100, (passwordScore / 5) * 100)}%` }]} />
                </View>
                <Text style={[styles.ruleText, { color: colors.muted }]}>• 8+ characters</Text>
                <Text style={[styles.ruleText, { color: colors.muted }]}>• Upper & lower case</Text>
                <Text style={[styles.ruleText, { color: colors.muted }]}>• Number and symbol</Text>
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  {
                    backgroundColor: acceptedTerms ? colors.primary : colors.inputBg,
                    borderColor: acceptedTerms ? colors.primary : colors.inputBorder,
                  },
                ]}>
                  {acceptedTerms && <Text style={{ color: colors.primaryText, fontWeight: '700' }}>?</Text>}
                </View>
                <Text style={[styles.checkboxText, { color: colors.title }]}>I agree to the Terms & Privacy</Text>
              </TouchableOpacity>
            </>
          )}

          {!isSignup && (
            <>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.inputBorder }]}
                value={email}
                onChangeText={setEmail}
              />

              <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}> 
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  style={[styles.inputInline, { color: colors.inputText }]}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={[styles.toggleText, { color: colors.link }]}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.inlineLink}>
                <Text style={[styles.inlineLinkText, { color: colors.link }]}>Forgot password?</Text>
              </TouchableOpacity>
            </>
          )}

          {isSignup ? (
            <View style={styles.signupActions}>
              {signupStep > 1 && (
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: colors.inputBorder }]}
                  onPress={() => setSignupStep(signupStep - 1)}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.muted }]}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, flex: 1 }]}
                activeOpacity={0.9}
                onPress={() => {
                  if (signupStep < 3) {
                    setSignupStep(signupStep + 1);
                    return;
                  }
                  if (!acceptedTerms || !passwordMatch) return;
                  handleSignup();
                }}
              >
                <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}> 
                  {signupStep < 3 ? 'Next' : 'Sign up'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
              ]}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={loading}
            >
              <View style={styles.buttonRow}>
                {loading && (
                  <ActivityIndicator size="small" color={colors.primaryText} style={styles.buttonSpinner} />
                )}
                <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              setIsSignup(!isSignup);
              setSignupStep(1);
            }}
          >
            <Text style={[styles.muted, { color: colors.muted }]}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <Text style={[styles.link, { color: colors.link }]}>
              {isSignup ? 'Sign in' : 'Sign up'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={[styles.footerText, { color: colors.footerText }]}>By continuing you agree to SmartBizz terms & privacy</Text>
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
    paddingBottom: 80,
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
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    marginBottom: 18,
  },
  progressWrap: {
    marginBottom: 14,
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
  },
  input: {
    backgroundColor: '#071027',
    color: '#e6eef8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.06)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputInline: {
    flex: 1,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#065f46',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonSpinner: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#04222b',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  signupActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  inlineLink: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  inlineLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  muted: {
    color: '#9aa6b2',
  },
  link: {
    color: '#000000',
    fontWeight: '700',
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  uploadCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  uploadSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  strengthWrap: {
    gap: 6,
    marginBottom: 12,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  strengthFill: {
    height: 6,
    borderRadius: 999,
  },
  ruleText: {
    fontSize: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
  },
});

