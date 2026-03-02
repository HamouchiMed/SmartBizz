import React, { useEffect, useRef } from 'react';
import { View, useColorScheme, Animated, Modal, Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export default function App() {
  if (typeof global.__API_BASE_URL__ !== 'string' || !global.__API_BASE_URL__) {
    global.__API_BASE_URL__ = 'http://192.168.10.167:3001';
  }

  const routeState = React.useState('welcome');
  const [route, setRoute] = routeState;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [selectedDeal, setSelectedDeal] = React.useState(null);
  const [contactSearch, setContactSearch] = React.useState('');
  const [contactOpenId, setContactOpenId] = React.useState(null);
  const [signupData, setSignupData] = React.useState(null);
  const [selectedConversation, setSelectedConversation] = React.useState(null);
  const [authToken, setAuthToken] = React.useState(null);
  const [authUser, setAuthUser] = React.useState(null);

  // auto-detect API host so physical devices / emulators don't need manual config
  useEffect(() => {
    try {
      if (typeof global.__API_BASE_URL__ === 'string' && global.__API_BASE_URL__) {
        console.log('? API host override already set:', global.__API_BASE_URL__);
        return;
      }

      // allow manual override: set global.__MANUAL_API_HOST__ = 'http://192.168.x.y:3001' before app loads
      if (typeof global.__MANUAL_API_HOST__ === 'string' && global.__MANUAL_API_HOST__) {
        global.__API_BASE_URL__ = global.__MANUAL_API_HOST__;
        console.log('? Using manual API host:', global.__API_BASE_URL__);
        return;
      }

      // log Constants to debug
      console.log('?? Constants.manifest:', {
        debuggerHost: Constants?.manifest?.debuggerHost,
        packagerOpts: Constants?.manifest?.packagerOpts,
      });

      // try multiple sources for debugger host (expo dev server IP)
      let dbg = 
        Constants?.manifest?.debuggerHost || 
        Constants?.manifest?.packagerOpts?.host || 
        Constants?.manifest2?.debuggerHost ||
        Constants?.debuggerHost ||
        null;

      const candidates = [];
      if (dbg && typeof dbg === 'string') {
        const ip = dbg.split(':')[0];
        console.log('?? Extracted debugger IP:', ip);
        candidates.push(`http://${ip}:3001`);
      } else {
        console.log('?? No debugger host found in Constants');
      }

      // explicit LAN fallback for physical devices on same Wi-Fi
      candidates.push('http://192.168.10.167:3001');

      // emulator defaults
      if (Platform.OS === 'android') candidates.push('http://10.0.2.2:3001');
      // localhost for simulator / desktop
      candidates.push('http://localhost:3001');

      console.log('?? Candidate hosts:', candidates);

      // helper to test reachability with timeout
      const testHost = async (url, timeout = 2000) => {
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          const res = await fetch(url + '/health', { method: 'GET', signal: controller.signal });
          clearTimeout(id);
          console.log(`  +- ${url} responded with ${res.status}`);
          return res.ok;
        } catch (e) {
          console.log(`  +- ${url} failed:`, e.message);
          return false;
        }
      };

      const findWorkingHost = async () => {
        for (const c of candidates) {
          console.log(`?? Testing ${c}...`);
          const ok = await testHost(c);
          if (ok) {
            global.__API_BASE_URL__ = c;
            console.log('? Auto-detected API host:', c);
            return;
          }
        }
        // fallback: set first candidate (best-effort)
        if (candidates.length > 0) {
          global.__API_BASE_URL__ = candidates[0];
          console.warn('?? Could not probe API hosts; defaulting to', candidates[0]);
        }
      };

      findWorkingHost();
    } catch (e) {
      console.warn('? API host auto-detect failed, using defaults:', e.message);
    }
  }, []);

  // persist token & user so reloads don't log out
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const tok = await AsyncStorage.getItem('authToken');
        const usr = await AsyncStorage.getItem('authUser');
        if (tok) setAuthToken(tok);
        if (usr) setAuthUser(JSON.parse(usr));
      } catch {}
    };
    loadSaved();
  }, []);
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);

  const colorScheme = useColorScheme() || 'light';
  const systemTheme = colorScheme === 'dark' ? 'dark' : 'light';

  // allow a manual override (null = follow system)
  const [overrideTheme, setOverrideTheme] = React.useState(null);
  const theme = overrideTheme ?? systemTheme;

  const onToggleTheme = () => {
    setOverrideTheme(prev => {
      if (prev) return prev === 'dark' ? 'light' : 'dark';
      return systemTheme === 'dark' ? 'light' : 'dark';
    });
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await login(email, password);
      if (!res?.token) {
        throw new Error('No token returned');
      }
      setAuthToken(res.token);
      setAuthUser(res.user || null);
      // persist credentials
      try {
        await AsyncStorage.setItem('authToken', res.token);
        await AsyncStorage.setItem('authUser', JSON.stringify(res.user || null));
      } catch {}
      setRoute('dashboard');
    } catch (err) {
      console.log('Login failed:', err?.message || err);
      // Keep user on login; you can surface a UI error later if needed
    }
  };

  const handleSignupWithOTP = async (signupInfo) => {
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
        setRoute('onboarding');
        return;
      }
      setRoute('login');
    } catch (err) {
      console.log('Signup failed:', err?.message || err);
      setRoute('login');
    }
  };

  const handleOTPVerify = async (verificationData) => {
    // TODO: Send signup data + verification data to backend
    console.log('OTP Verified:', { ...signupData, verification: verificationData });
    if (signupData?.email && signupData?.password) {
      const res = await register(signupData.name || 'User', signupData.email, signupData.password);
      setAuthToken(res.token);
      setAuthUser(res.user);
    }
    setSignupData(null);
    setRoute('dashboard');
  };

  const handleNavigateToMessages = () => {
    setRoute('chatList');
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setRoute('chat');
  };

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [route, fadeAnim]);

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

  const handleOpenDealFromSearch = (deal) => {
    setSelectedDeal(deal);
    setRoute('dealDetail');
  };

  const handleOpenContactFromSearch = (contact) => {
    setContactSearch(contact?.name || '');
    setContactOpenId(contact?.id || null);
    setRoute('contacts');
  };

  const handleMessageContact = (contact) => {
    if (!contact) return;
    setSelectedConversation({
      id: `contact-${contact.id}`,
      name: contact.name,
      type: 'Contact',
    });
    setRoute('chat');
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {route === 'welcome' || route === 'terms' || route === 'privacy' ? (
        <>
          <WelcomeScreen onNext={() => setRoute('terms')} theme={theme} />
          <Modal
            visible={route === 'terms' || route === 'privacy'}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
            onRequestClose={() => setRoute('welcome')}
          >
            <TermsScreen 
              onAccept={() => setRoute('privacy')} 
              onDecline={() => setRoute('welcome')} 
              theme={theme} 
            />
            <Modal
              visible={route === 'privacy'}
              animationType="slide"
              presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
              onRequestClose={() => setRoute('terms')}
            >
              <PrivacyScreen 
                onAccept={() => setRoute('login')} 
                onDecline={() => setRoute('welcome')} 
                theme={theme} 
              />
            </Modal>
          </Modal>
        </>
      ) : route === 'login' ? (
        <LoginScreen 
          onLogin={handleLogin}
          onSignup={handleSignupWithOTP}
          theme={theme} 
        />
      ) : route === 'otpVerification' ? (
        <OTPVerificationScreen 
          userEmail={signupData?.email || ''}
          userPhone={signupData?.phone || ''}
          onVerify={handleOTPVerify}
          onBack={() => {
            setSignupData(null);
            setRoute('login');
          }}
          theme={theme}
        />
      ) : route === 'onboarding' ? (
        <Onboarding
          theme={theme}
          onComplete={() => {
            setOnboardingComplete(true);
            setRoute('dashboard');
          }}
        />
      ) : route === 'chatList' ? (
        <ChatListScreen 
          onSelectChat={handleSelectConversation}
          onBack={() => setRoute('dashboard')}
          theme={theme}
        />
      ) : route === 'chat' ? (
        <Chat 
          token={authToken}
          deal={selectedDeal} 
          conversation={selectedConversation}
          onBack={() => setRoute('chatList')} 
          theme={theme}
        />
      ) : route === 'balanceHistory' ? (
        <BalanceHistory token={authToken} onBack={() => setRoute('dashboard')} theme={theme} />
      ) : route === 'lead' ? (
        <Lead token={authToken} onBack={() => setRoute('dashboard')} theme={theme} />
      ) : route === 'contacts' ? (
        <Contacts
          token={authToken}
          onBack={() => setRoute('dashboard')}
          theme={theme}
          initialQuery={contactSearch}
          initialOpenId={contactOpenId}
          onClearInitial={() => { setContactSearch(''); setContactOpenId(null); }}
          onMessageContact={handleMessageContact}
        />
      ) : route === 'products' ? (
        <Products onBack={() => setRoute('dashboard')} theme={theme} />
      ) : route === 'deals' ? (
        <Deals token={authToken} onBack={() => setRoute('dashboard')} onSelectDeal={(deal) => { setSelectedDeal(deal); setRoute('dealDetail'); }} theme={theme} />
      ) : route === 'dealDetail' ? (
        <DealDetail deal={selectedDeal} onBack={() => setRoute('deals')} onOpenChat={() => setRoute('chat')} />
      ) : route === 'wallet' ? (
        <Wallet
          token={authToken}
          onBack={() => setRoute('dashboard')}
          theme={theme}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToBalance={() => setRoute('balanceHistory')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onNavigateToProfile={() => setRoute('profile')}
          onNavigateToEvents={() => setRoute('events')}
        />
      ) : route === 'analytics' ? (
        <Analytics
          onBack={() => setRoute('dashboard')}
          theme={theme}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToProfile={() => setRoute('profile')}
          onNavigateToEvents={() => setRoute('events')}
        />
      ) : route === 'notifications' ? (
        <Notifications onBack={() => setRoute('dashboard')} theme={theme} />
      ) : route === 'events' ? (
        <Events
          onBack={() => setRoute('dashboard')}
          theme={theme}
          token={authToken}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onNavigateToEvents={() => setRoute('events')}
          onNavigateToProfile={() => setRoute('profile')}
        />
      ) : route === 'profile' ? (
        <Profile
          theme={theme}
          token={authToken}
          authUser={authUser}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onNavigateToEvents={() => setRoute('events')}
          onNavigateToAccountDetails={() => setRoute('accountDetails')}
          onNavigateToSecurity={() => setRoute('security')}
          onNavigateToNotificationsSettings={() => setRoute('notificationsSettings')}
          onNavigateToBilling={() => setRoute('billing')}
          onNavigateToHelpSupport={() => setRoute('helpSupport')}
        />
      ) : route === 'accountDetails' ? (
        <AccountDetails
          theme={theme}
          onBack={() => setRoute('profile')}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onNavigateToEvents={() => setRoute('events')}
          onNavigateToProfile={() => setRoute('profile')}
        />
      ) : route === 'security' ? (
        <Security
          theme={theme}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onNavigateToEvents={() => setRoute('events')}
          onNavigateToProfile={() => setRoute('profile')}
        />
      ) : route === 'notificationsSettings' ? (
        <NotificationsSettings
          theme={theme}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onNavigateToEvents={() => setRoute('events')}
          onNavigateToProfile={() => setRoute('profile')}
        />
      ) : route === 'billing' ? (
        <Billing
          theme={theme}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onNavigateToEvents={() => setRoute('events')}
          onNavigateToProfile={() => setRoute('profile')}
        />
      ) : route === 'helpSupport' ? (
        <HelpSupport
          theme={theme}
          onNavigateToDashboard={() => setRoute('dashboard')}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onNavigateToEvents={() => setRoute('events')}
          onNavigateToProfile={() => setRoute('profile')}
        />
      ) : (
        <Dashboard 
          onLogout={async () => { setAuthToken(null); setAuthUser(null); setRoute('login'); try { await AsyncStorage.removeItem('authToken'); await AsyncStorage.removeItem('authUser'); } catch {} }} 
          theme={theme} 
          showChecklist={!onboardingComplete}
          onCompleteChecklist={() => setOnboardingComplete(true)}
          onNavigateToBalance={() => setRoute('balanceHistory')}
          onNavigateToLead={() => setRoute('lead')}
          onNavigateToContact={() => setRoute('contacts')}
          onNavigateToProduct={() => setRoute('products')}
          onNavigateToDeal={() => setRoute('deals')}
          onNavigateToMessages={handleNavigateToMessages}
          onNavigateToWallet={() => setRoute('wallet')}
          onNavigateToAnalytics={() => setRoute('analytics')}
          onToggleTheme={onToggleTheme}
          onOpenDeal={handleOpenDealFromSearch}
          onOpenContact={handleOpenContactFromSearch}
          onNavigateToNotifications={() => setRoute('notifications')}
          onNavigateToEvents={() => setRoute('events')}
          onNavigateToProfile={() => setRoute('profile')}
          onNavigateToBilling={() => setRoute('billing')}
        />
      )}
    </Animated.View>
  );
}

