import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';

export default function Onboarding({ theme = 'dark', onComplete }) {
  const [step, setStep] = useState(1);
  const [teamSize, setTeamSize] = useState('1-5');
  const [goal, setGoal] = useState('Track deals');

  const colors = theme === 'dark' ? {
    background: '#1F6A64',
    card: '#F0EDE5',
    text: '#e6eef8',
    muted: '#9aa6b2',
    primary: '#065f46',
    input: '#071027',
    border: 'rgba(125,211,252,0.08)',
  } : {
    background: '#F6FBFF',
    card: '#F0EDE5',
    text: '#1F2937',
    muted: '#6B7280',
    primary: '#065f46',
    input: '#F3F4F6',
    border: 'rgba(37,99,235,0.12)',
  };

  const next = () => setStep(s => Math.min(2, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Let’s personalize your workspace</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Just a couple of quick steps.</Text>
      </View>

      <View style={styles.progressRow}>
        {[1,2].map((i) => (
          <View key={i} style={[styles.progressDot, { backgroundColor: i <= step ? colors.primary : colors.border }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={[styles.card, { backgroundColor: colors.card }]}> 
            <Text style={[styles.cardTitle, { color: colors.text }]}>Team size</Text>
            {['1-5', '6-20', '21-50', '50+'].map((v) => (
              <TouchableOpacity key={v} style={[styles.option, teamSize === v && { borderColor: colors.primary }]} onPress={() => setTeamSize(v)}>
                <Text style={[styles.optionText, { color: teamSize === v ? colors.text : colors.muted }]}>{v} people</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={[styles.card, { backgroundColor: colors.card }]}> 
            <Text style={[styles.cardTitle, { color: colors.text }]}>Primary goal</Text>
            {['Track deals', 'Manage contacts', 'Schedule events', 'Team performance'].map((v) => (
              <TouchableOpacity key={v} style={[styles.option, goal === v && { borderColor: colors.primary }]} onPress={() => setGoal(v)}>
                <Text style={[styles.optionText, { color: goal === v ? colors.text : colors.muted }]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.card }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>Quick start checklist</Text>
          <Text style={[styles.checkItem, { color: colors.muted }]}>• Add your first contact</Text>
          <Text style={[styles.checkItem, { color: colors.muted }]}>• Create a deal</Text>
          <Text style={[styles.checkItem, { color: colors.muted }]}>• Schedule an event</Text>
          <Text style={[styles.checkItem, { color: colors.muted }]}>• Invite a teammate</Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {step > 1 && (
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={back}>
            <Text style={[styles.secondaryText, { color: colors.muted }]}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 2 ? (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={next}>
            <Text style={[styles.primaryText, { color: colors.text === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={onComplete}>
            <Text style={[styles.primaryText, { color: colors.text === '#1F2937' ? '#F0EDE5' : '#04222b' }]}>Go to Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { marginTop: 6, fontSize: 13 },
  progressRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  content: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  card: { padding: 16, borderRadius: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
  option: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: 12, marginBottom: 8 },
  optionText: { fontSize: 13, fontWeight: '600' },
  checkItem: { fontSize: 12, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 20 },
  primaryBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryText: { fontSize: 13, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  secondaryText: { fontSize: 13, fontWeight: '700' },
});

