import React, { useEffect } from 'react';
import { View, useColorScheme, Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LoginScreen from './screens/LoginScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import Dashboard from './screens/Dashboard';
import BalanceHistory from './screens/BalanceHistory';
import Lead from './screens/Lead';
import Contacts from './screens/Contacts';
import Products from './screens/Products';
import Deals from './screens/Deals';
import DealDetail from './screens/DealDetail';
import Chat from './screens/Chat';
import ChatListScreen from './screens/ChatListScreen';
import Wallet from './screens/Wallet';
import Analytics from './screens/Analytics';
import Notifications from './screens/Notifications';
import Events from './screens/Events';
import Profile from './screens/Profile';
import AccountDetails from './screens/AccountDetails';
import Security from './screens/Security';
import NotificationsSettings from './screens/NotificationsSettings';
import Billing from './screens/Billing';
import HelpSupport from './screens/HelpSupport';
import Onboarding from './screens/Onboarding';
import { login, register, getMe } from './services/api';

const Stack = createNativeStackNavigator();

export default function App() {
  const [authToken, setAuthToken] = React.useState(null);
  const [authUser, setAuthUser] = React.useState(null);
  const [signupData, setSignupData] = React.useState(null);
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);
  const [booting, setBooting] = React.useState(true);
  const [initialRoute, setInitialRoute] = React.useState('welcome');

  const colorScheme = useColorScheme() || 'light';
  const systemTheme = colorScheme === 'dark' ? 'dark' : 'light';
  const [overrideTheme, setOverrideTheme] = React.useState(null);
  const theme = overrideTheme ?? systemTheme;

  const onToggleTheme = () => {
    setOverrideTheme((prev) => {
      if (prev) return prev === 'dark' ? 'light' : 'dark';
      return systemTheme === 'dark' ? 'light' : 'dark';
    });
  };

  useEffect(() => {
    try {
      if (typeof global.__MANUAL_API_HOST__ === 'string' && global.__MANUAL_API_HOST__) {
        global.__API_BASE_URL__ = global.__MANUAL_API_HOST__;
        console.log('Using manual API host:', global.__API_BASE_URL__);
        return;
      }

      const dbg =
        Constants?.expoConfig?.hostUri ||
        Constants?.manifest?.debuggerHost ||
        Constants?.manifest?.packagerOpts?.host ||
        Constants?.manifest2?.debuggerHost ||
        Constants?.debuggerHost ||
        null;

      const candidates = [];
      if (dbg && typeof dbg === 'string') {
        candidates.push(`http://${dbg.split(':')[0]}:3001`);
      }
      candidates.push('http://192.168.10.167:3001');
      candidates.push('http://192.168.1.14:3001');
      if (Platform.OS === 'android') candidates.push('http://10.0.2.2:3001');
      candidates.push('http://localhost:3001');

      const uniqueCandidates = [...new Set(candidates)];

      const testHost = async (url, timeout = 2000) => {
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          const res = await fetch(url + '/health', { method: 'GET', signal: controller.signal });
          clearTimeout(id);
          return res.ok;
        } catch {
          return false;
        }
      };

      const findWorkingHost = async () => {
        for (const candidate of uniqueCandidates) {
          const ok = await testHost(candidate);
          if (ok) {
            global.__API_BASE_URL__ = candidate;
            console.log('Auto-detected API host:', candidate);
            return;
          }
        }
        if (uniqueCandidates.length > 0) {
          global.__API_BASE_URL__ = uniqueCandidates[0];
          console.warn('Could not probe API hosts; defaulting to', uniqueCandidates[0]);
        }
      };

      findWorkingHost();
    } catch (e) {
      console.warn('API host auto-detect failed, using defaults:', e.message);
    }
  }, []);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const tok = await AsyncStorage.getItem('authToken');
        const usr = await AsyncStorage.getItem('authUser');
        if (tok) {
          setAuthToken(tok);
          setInitialRoute('dashboard');
        }
        if (usr) setAuthUser(JSON.parse(usr));
      } finally {
        setBooting(false);
      }
    };
    loadSaved();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!authToken) return;
      try {
        const me = await getMe(authToken);
        setAuthUser(me);
      } catch {
        // ignore
      }
    };
    load();
  }, [authToken]);

  if (booting) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'default',
        }}
      >
        <Stack.Screen name="welcome">
          {({ navigation }) => (
            <WelcomeScreen onNext={() => navigation.navigate('terms')} theme={theme} />
          )}
        </Stack.Screen>

        <Stack.Screen name="terms" options={{ presentation: 'modal' }}>
          {({ navigation }) => (
            <TermsScreen
              onAccept={() => navigation.navigate('privacy')}
              onDecline={() => navigation.navigate('welcome')}
              theme={theme}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="privacy" options={{ presentation: 'modal' }}>
          {({ navigation }) => (
            <PrivacyScreen
              onAccept={() => navigation.reset({ index: 0, routes: [{ name: 'login' }] })}
              onDecline={() => navigation.navigate('welcome')}
              theme={theme}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="login">
          {({ navigation }) => (
            <LoginScreen
              onLogin={async (email, password) => {
                try {
                  const res = await login(email, password);
                  if (!res?.token) throw new Error('No token returned');
                  setAuthToken(res.token);
                  setAuthUser(res.user || null);
                  try {
                    await AsyncStorage.setItem('authToken', res.token);
                    await AsyncStorage.setItem('authUser', JSON.stringify(res.user || null));
                  } catch {}
                  navigation.reset({ index: 0, routes: [{ name: 'dashboard' }] });
                } catch (err) {
                  console.log('Login failed:', err?.message || err);
                }
              }}
              onSignup={async (signupInfo) => {
                try {
                  const res = await register(
                    signupInfo?.name || 'User',
                    signupInfo?.email || '',
                    signupInfo?.password || ''
                  );
                  if (res?.token) {
                    setAuthToken(res.token);
                    setAuthUser(res.user || null);
                    setOnboardingComplete(false);
                    navigation.reset({ index: 0, routes: [{ name: 'onboarding' }] });
                    return;
                  }
                  navigation.navigate('login');
                } catch (err) {
                  console.log('Signup failed:', err?.message || err);
                  navigation.navigate('login');
                }
              }}
              theme={theme}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="otpVerification">
          {({ navigation }) => (
            <OTPVerificationScreen
              userEmail={signupData?.email || ''}
              userPhone={signupData?.phone || ''}
              onVerify={async (verificationData) => {
                console.log('OTP Verified:', { ...signupData, verification: verificationData });
                if (signupData?.email && signupData?.password) {
                  const res = await register(signupData.name || 'User', signupData.email, signupData.password);
                  setAuthToken(res.token);
                  setAuthUser(res.user);
                }
                setSignupData(null);
                navigation.reset({ index: 0, routes: [{ name: 'dashboard' }] });
              }}
              onBack={() => {
                setSignupData(null);
                navigation.goBack();
              }}
              theme={theme}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="onboarding">
          {({ navigation }) => (
            <Onboarding
              theme={theme}
              onComplete={() => {
                setOnboardingComplete(true);
                navigation.reset({ index: 0, routes: [{ name: 'dashboard' }] });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="dashboard" options={{ gestureEnabled: false }}>
          {({ navigation }) => (
            <Dashboard
              token={authToken}
              onLogout={async () => {
                setAuthToken(null);
                setAuthUser(null);
                try {
                  await AsyncStorage.removeItem('authToken');
                  await AsyncStorage.removeItem('authUser');
                } catch {}
                navigation.reset({ index: 0, routes: [{ name: 'login' }] });
              }}
              theme={theme}
              showChecklist={!onboardingComplete}
              onCompleteChecklist={() => setOnboardingComplete(true)}
              onToggleTheme={onToggleTheme}
              onNavigateToBalance={() => navigation.navigate('balanceHistory')}
              onNavigateToLead={() => navigation.navigate('lead')}
              onNavigateToContact={() => navigation.navigate('contacts')}
              onNavigateToProduct={() => navigation.navigate('products')}
              onNavigateToDeal={() => navigation.navigate('deals')}
              onNavigateToMessages={() => navigation.navigate('chatList')}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToNotifications={() => navigation.navigate('notifications')}
              onNavigateToEvents={() => navigation.navigate('events')}
              onNavigateToProfile={() => navigation.navigate('profile')}
              onNavigateToBilling={() => navigation.navigate('billing')}
              onOpenDeal={(deal) => navigation.navigate('dealDetail', { deal })}
              onOpenContact={(contact) =>
                navigation.navigate('contacts', {
                  initialQuery: contact?.name || '',
                  initialOpenId: contact?.id || null,
                })
              }
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="chatList">
          {({ navigation }) => (
            <ChatListScreen
              onSelectChat={(conversation) => navigation.navigate('chat', { conversation })}
              onBack={() => navigation.goBack()}
              theme={theme}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="chat">
          {({ navigation, route }) => (
            <Chat
              token={authToken}
              deal={route.params?.deal}
              conversation={route.params?.conversation}
              onBack={() => navigation.goBack()}
              theme={theme}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="balanceHistory">
          {({ navigation }) => (
            <BalanceHistory token={authToken} onBack={() => navigation.goBack()} theme={theme} />
          )}
        </Stack.Screen>

        <Stack.Screen name="lead">
          {({ navigation }) => <Lead token={authToken} onBack={() => navigation.goBack()} theme={theme} />}
        </Stack.Screen>

        <Stack.Screen name="contacts">
          {({ navigation, route }) => (
            <Contacts
              token={authToken}
              onBack={() => navigation.goBack()}
              theme={theme}
              initialQuery={route.params?.initialQuery || ''}
              initialOpenId={route.params?.initialOpenId || null}
              onClearInitial={() => {}}
              onMessageContact={(contact) =>
                navigation.navigate('chat', {
                  conversation: {
                    id: `contact-${contact?.id}`,
                    name: contact?.name,
                    type: 'Contact',
                  },
                })
              }
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="products">
          {({ navigation }) => <Products onBack={() => navigation.goBack()} theme={theme} />}
        </Stack.Screen>

        <Stack.Screen name="deals">
          {({ navigation }) => (
            <Deals
              token={authToken}
              onBack={() => navigation.goBack()}
              onSelectDeal={(deal) => navigation.navigate('dealDetail', { deal })}
              theme={theme}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="dealDetail">
          {({ navigation, route }) => (
            <DealDetail
              deal={route.params?.deal}
              onBack={() => navigation.goBack()}
              onOpenChat={() => navigation.navigate('chat', { deal: route.params?.deal })}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="wallet" options={{ gestureEnabled: false }}>
          {({ navigation }) => (
            <Wallet
              token={authToken}
              onBack={() => navigation.goBack()}
              theme={theme}
              onNavigateToDashboard={() => navigation.navigate('dashboard')}
              onNavigateToBalance={() => navigation.navigate('balanceHistory')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToProfile={() => navigation.navigate('profile')}
              onNavigateToEvents={() => navigation.navigate('events')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="analytics" options={{ gestureEnabled: false }}>
          {({ navigation }) => (
            <Analytics
              token={authToken}
              onBack={() => navigation.goBack()}
              theme={theme}
              onNavigateToDashboard={() => navigation.navigate('dashboard')}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToProfile={() => navigation.navigate('profile')}
              onNavigateToEvents={() => navigation.navigate('events')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="notifications">
          {({ navigation }) => <Notifications onBack={() => navigation.goBack()} theme={theme} />}
        </Stack.Screen>

        <Stack.Screen name="events" options={{ gestureEnabled: false }}>
          {({ navigation }) => (
            <Events
              onBack={() => navigation.goBack()}
              theme={theme}
              token={authToken}
              onNavigateToDashboard={() => navigation.navigate('dashboard')}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToEvents={() => navigation.navigate('events')}
              onNavigateToProfile={() => navigation.navigate('profile')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="profile">
          {({ navigation }) => (
            <Profile
              theme={theme}
              token={authToken}
              authUser={authUser}
              onNavigateToDashboard={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('dashboard'))}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToEvents={() => navigation.navigate('events')}
              onNavigateToAccountDetails={() => navigation.navigate('accountDetails')}
              onNavigateToSecurity={() => navigation.navigate('security')}
              onNavigateToNotificationsSettings={() => navigation.navigate('notificationsSettings')}
              onNavigateToBilling={() => navigation.navigate('billing')}
              onNavigateToHelpSupport={() => navigation.navigate('helpSupport')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="accountDetails">
          {({ navigation }) => (
            <AccountDetails
              theme={theme}
              onBack={() => navigation.goBack()}
              onNavigateToDashboard={() => navigation.navigate('dashboard')}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToEvents={() => navigation.navigate('events')}
              onNavigateToProfile={() => navigation.navigate('profile')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="security">
          {({ navigation }) => (
            <Security
              theme={theme}
              onNavigateToDashboard={() => navigation.navigate('dashboard')}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToEvents={() => navigation.navigate('events')}
              onNavigateToProfile={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('profile'))}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="notificationsSettings">
          {({ navigation }) => (
            <NotificationsSettings
              theme={theme}
              onNavigateToDashboard={() => navigation.navigate('dashboard')}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToEvents={() => navigation.navigate('events')}
              onNavigateToProfile={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('profile'))}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="billing">
          {({ navigation }) => (
            <Billing
              theme={theme}
              onNavigateToDashboard={() => navigation.navigate('dashboard')}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToEvents={() => navigation.navigate('events')}
              onNavigateToProfile={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('profile'))}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="helpSupport">
          {({ navigation }) => (
            <HelpSupport
              theme={theme}
              onNavigateToDashboard={() => navigation.navigate('dashboard')}
              onNavigateToWallet={() => navigation.navigate('wallet')}
              onNavigateToAnalytics={() => navigation.navigate('analytics')}
              onNavigateToEvents={() => navigation.navigate('events')}
              onNavigateToProfile={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('profile'))}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
