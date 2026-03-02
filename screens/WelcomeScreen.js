import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ onNext, theme = 'dark' }) {
  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    topDecoration: '#1f2937',
    cardBg: '#F0EDE5',
    brand: '#000000',
    title: '#e6eef8',
    primary: '#065f46',
    primaryText: '#04222b',
    muted: '#9aa6b2',
    border: 'rgba(125,211,252,0.06)',
  } : {
    background: '#ffffff',
    topDecoration: '#f3f4f6',
    cardBg: '#f9fafb',
    brand: '#0891b2',
    title: '#1f2937',
    primary: '#065f46',
    primaryText: '#ffffff',
    muted: '#6b7280',
    border: 'rgba(6,182,212,0.1)',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require('../assets/logosm.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Welcome Content */}
        <View style={styles.content}>
          {/* Welcome Title */}
          <Text style={[styles.title, { color: colors.title }]}>
            Welcome to SmartBizz
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.muted }]}>
            Your intelligent business companion for managing deals, contacts, and relationships. Streamline your workflow and grow your business.
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={[styles.featureCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
                <Text style={[styles.iconText, { color: colors.primaryText }]}>📊</Text>
              </View>
              <Text style={[styles.featureText, { color: colors.title }]}>
                Manage Deals & Contacts
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
                <Text style={[styles.iconText, { color: colors.primaryText }]}>💬</Text>
              </View>
              <Text style={[styles.featureText, { color: colors.title }]}>
                Track Communication
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
                <Text style={[styles.iconText, { color: colors.primaryText }]}>📈</Text>
              </View>
              <Text style={[styles.featureText, { color: colors.title }]}>
                Real-time Analytics
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={onNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextButtonText, { color: colors.primaryText }]}>
              Get Started
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.muted }]}>
            You'll need to agree to our Terms & Privacy to continue
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  logo: {
    width: '80%',
    height: height * 0.12,
    marginTop: 60,
    marginBottom: 30,
    alignSelf: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  featuresContainer: {
    gap: 16,
    marginTop: 16,
    marginBottom: 40,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 20,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 20,
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
});

