import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function PrivacyScreen({ onAccept, onDecline, theme = 'dark' }) {
  const [accepted, setAccepted] = useState(false);

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
    checkboxBg: '#071027',
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
    checkboxBg: '#f3f4f6',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.title }]}>
          Privacy Policy
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          Your privacy is important to us
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentPadding}>
          <Section title="1. Information Collection" colors={colors}>
            We collect information you provide directly to us, such as when you create an account, add contacts, or communicate with other users. This includes name, email, phone number, and other business-related information.
          </Section>

          <Section title="2. Use of Information" colors={colors}>
            We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your inquiries.
          </Section>

          <Section title="3. Data Protection" colors={colors}>
            We implement appropriate technical and organizational measures designed to protect personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </Section>

          <Section title="4. Sharing of Information" colors={colors}>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or to service providers who assist us in operating our website and conducting our business.
          </Section>

          <Section title="5. Your Rights" colors={colors}>
            You have the right to access, update, or delete your personal information. You may also opt-out of receiving promotional communications from us by following the unsubscribe instructions in those messages.
          </Section>

          <Section title="6. Data Retention" colors={colors}>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.
          </Section>

          <Section title="7. Contact Us" colors={colors}>
            If you have questions about this Privacy Policy or our privacy practices, please contact us at privacy@smartbizz.com.
          </Section>

          <Section title="8. Changes to Policy" colors={colors}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Modified" date of this Privacy Policy and your continued use of the application following the posting of revised Privacy Policy means that you accept and agree to the changes.
          </Section>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View 
        style={[
          styles.footer,
          { 
            borderTopColor: colors.border,
            backgroundColor: colors.topDecoration,
          },
        ]}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: accepted ? colors.primary : colors.checkboxBg,
                borderColor: accepted ? colors.primary : colors.border,
              },
            ]}
          >
            {accepted && (
              <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: 'bold' }}>
                ✓
              </Text>
            )}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.title }]}>
            I agree to the Privacy Policy
          </Text>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.declineButton, { borderColor: colors.muted }]}
            onPress={onDecline}
          >
            <Text style={[styles.declineButtonText, { color: colors.muted }]}>
              Decline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              {
                backgroundColor: accepted ? colors.primary : colors.muted,
                opacity: accepted ? 1 : 0.5,
              },
            ]}
            onPress={onAccept}
            disabled={!accepted}
          >
            <Text style={[styles.acceptButtonText, { color: colors.primaryText }]}>
              Accept & Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Section({ title, children, colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.brand }]}>
        {title}
      </Text>
      <Text style={[styles.sectionContent, { color: colors.muted }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentPadding: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

