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

export default function TermsScreen({ onAccept, onDecline, theme = 'dark' }) {
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
    error: '#ef4444',
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
    error: '#dc2626',
    checkboxBg: '#f3f4f6',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.title }]}>
          Terms & Conditions
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentPadding}>
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.infoText, { color: colors.muted }]}>
              📋 Please review and accept our terms to continue using SmartBizz
            </Text>
          </View>

          <Section title="1. Acceptance of Terms" colors={colors}>
            By using SmartBizz, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
          </Section>

          <Section title="2. Use License" colors={colors}>
            Permission is granted to temporarily download one copy of the materials (information or software) on SmartBizz for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </Section>

          <Section title="3. Disclaimer" colors={colors}>
            The materials on SmartBizz are provided on an "as is" basis. SmartBizz makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Section>

          <Section title="4. Limitations" colors={colors}>
            In no event shall SmartBizz or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SmartBizz.
          </Section>

          <Section title="5. Accuracy of Materials" colors={colors}>
            The materials appearing on SmartBizz could include technical, typographical, or photographic errors. SmartBizz does not warrant that any of the materials on its website are accurate, complete, or current.
          </Section>

          <Section title="6. Modifications" colors={colors}>
            SmartBizz may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
          </Section>

          <Section title="7. Governing Law" colors={colors}>
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where SmartBizz operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </Section>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View 
        style={[
          styles.footer,
          { 
            borderTopColor: colors.border,
            backgroundColor: colors.background,
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
            I agree to the Terms & Conditions
          </Text>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.declineButton, { borderColor: colors.border }]}
            onPress={onDecline}
            activeOpacity={0.7}
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
            activeOpacity={0.8}
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
    fontWeight: '700',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentPadding: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  infoBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 28,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125,211,252,0.08)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '400',
    opacity: 0.9,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

