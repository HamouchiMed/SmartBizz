import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Notifications({ onBack, theme = "dark" }) {
  const colors = theme === "dark" ? {
    background: "#0f1724",
    cardBg: "#0b1220",
    textPrimary: "#e6eef8",
    textMuted: "#9aa6b2",
    primary: "#06b6d4",
    accent: "#7dd3fc",
  } : {
    background: "#F6FBFF",
    cardBg: "#FFFFFF",
    textPrimary: "#1F2937",
    textMuted: "#6B7280",
    primary: "#2563EB",
    accent: "#3B82F6",
  };

  const notifications = [
    { id: '1', type: 'deal', title: 'Deal Updated', subtitle: 'Tech Corp Deal', message: 'The proposal has been accepted. Next step: Contract review.', time: '2h ago' },
    { id: '2', type: 'message', title: 'Message from Yassine', subtitle: 'Can we reschedule the meeting to 3 PM?', time: '1h ago' },
    { id: '3', type: 'event', title: 'Team Meeting', subtitle: 'In 30 minutes - Conference Room A', time: '30m ago' },
    { id: '4', type: 'deal', title: 'Deal Closed', subtitle: 'StartupXYZ - $450,000', message: 'Congratulations! Deal successfully closed.', time: '5h ago' },
    { id: '5', type: 'message', title: 'Message from Sara', subtitle: 'The client confirmed the payment terms.', time: '6h ago' },
    { id: '6', type: 'event', title: 'Client Demo', subtitle: 'Enterprise Corp in 2 hours', time: '1d ago' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.cardBg }]}>
        <TouchableOpacity onPress={() => onBack?.()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[styles.notificationItem, { backgroundColor: colors.cardBg, borderBottomColor: colors.background }]}
            activeOpacity={0.6}
          >
            <View style={[styles.badge, { backgroundColor: notification.type === 'deal' ? '#10B981' : notification.type === 'message' ? '#000000' : '#F59E0B' }]}>
              <Ionicons 
                name={notification.type === 'deal' ? 'briefcase' : notification.type === 'message' ? 'chatbubble' : 'calendar'} 
                size={20} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>{notification.title}</Text>
              <Text style={[styles.notificationSubtitle, { color: '#4B5563' }]}>{notification.subtitle}</Text>
              {notification.message && <Text style={[styles.notificationMessage, { color: '#4B5563' }]}>{notification.message}</Text>}
            </View>
            <Text style={[styles.notificationTime, { color: '#4B5563' }]}>{notification.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: "flex-start",
    gap: 12,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    justifyContent: "center",
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 11,
    marginTop: 2,
  },
});


