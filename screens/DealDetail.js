import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';

const DealDetail = ({ deal, onBack, onOpenChat }) => {
  if (!deal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deal Details</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No deal data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deal Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.dealImagePlaceholder}>
            <Text style={styles.dealImageText}>💼</Text>
          </View>
          <Text style={styles.dealTitle}>{deal.name}</Text>
          <Text style={[styles.dealStatus, getStatusStyle(deal.status)]}>{deal.status}</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Amount</Text>
            <Text style={styles.metricValue}>{deal.amount}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Progress</Text>
            <Text style={styles.metricValue}>{deal.progress}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Status</Text>
            <Text style={styles.metricValue}>{deal.status}</Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{deal.client}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{deal.email}</Text>
            </View>
          </View>
        </View>

        {/* Deal Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deal Timeline</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Due Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(deal.dueDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{capitalizeFirst(deal.category || '')}</Text>
            </View>
          </View>
        </View>

        {/* Progress Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Tracker</Text>
          <View style={styles.infoCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressPercent}>{deal.progress}%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${deal.progress}%`,
                    backgroundColor: getProgressColor(deal.progress)
                  }
                ]}
              />
            </View>
            <View style={styles.progressStages}>
              <View style={[styles.stage, deal.progress >= 25 && styles.stageDone]}>
                <Text style={styles.stageNumber}>1</Text>
                <Text style={styles.stageName}>Initiated</Text>
              </View>
              <View style={[styles.stage, deal.progress >= 50 && styles.stageDone]}>
                <Text style={styles.stageNumber}>2</Text>
                <Text style={styles.stageName}>In Process</Text>
              </View>
              <View style={[styles.stage, deal.progress >= 75 && styles.stageDone]}>
                <Text style={styles.stageNumber}>3</Text>
                <Text style={styles.stageName}>Near Done</Text>
              </View>
              <View style={[styles.stage, deal.progress >= 100 && styles.stageDone]}>
                <Text style={styles.stageNumber}>4</Text>
                <Text style={styles.stageName}>Closed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Deal Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deal Description</Text>
          <View style={styles.infoCard}>
            <Text style={styles.descriptionText}>{deal.details}</Text>
          </View>
        </View>

        {/* Status Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Summary</Text>
          <View style={[styles.infoCard, getStatusSummaryStyle(deal.status)]}>
            <Text style={styles.summaryText}>{getStatusMessage(deal.status, deal.progress)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit Deal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.neutralButton]} onPress={() => onOpenChat && onOpenChat()}>
            <Text style={[styles.actionButtonText, styles.neutralButtonText]}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Add Update</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper Functions
const capitalizeFirst = (str = '') => {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getProgressColor = (progress) => {
  if (progress >= 80) return '#10B981';
  if (progress >= 60) return '#000000';
  if (progress >= 40) return '#F59E0B';
  return '#EF4444';
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Closed':
      return { backgroundColor: '#ECFDF5', color: '#059669' };
    case 'Closing':
      return { backgroundColor: '#FEF3C7', color: '#D97706' };
    case 'In Progress':
      return { backgroundColor: '#EFF6FF', color: '#065f46' };
    case 'Upcoming':
      return { backgroundColor: '#F3E8FF', color: '#7C3AED' };
    default:
      return { backgroundColor: '#F9FAFB', color: '#6B7280' };
  }
};

const getStatusSummaryStyle = (status) => {
  switch (status) {
    case 'Closed':
      return { backgroundColor: '#ECFDF5', borderLeftColor: '#059669', borderLeftWidth: 4 };
    case 'Closing':
      return { backgroundColor: '#FEF3C7', borderLeftColor: '#D97706', borderLeftWidth: 4 };
    case 'In Progress':
      return { backgroundColor: '#EFF6FF', borderLeftColor: '#065f46', borderLeftWidth: 4 };
    case 'Upcoming':
      return { backgroundColor: '#F3E8FF', borderLeftColor: '#7C3AED', borderLeftWidth: 4 };
    default:
      return { backgroundColor: '#F9FAFB', borderLeftColor: '#6B7280', borderLeftWidth: 4 };
  }
};

const getStatusMessage = (status, progress) => {
  switch (status) {
    case 'Closed':
      return '✓ This deal has been successfully closed. All agreed terms have been completed.';
    case 'Closing':
      return `📋 This deal is in the final stages. ${progress}% complete and approaching closure.`;
    case 'In Progress':
      return `🔄 This deal is currently in progress. ${progress}% completed. Keep monitoring the updates.`;
    case 'Upcoming':
      return '⏰ This deal is scheduled to start. Prepare necessary documents and resources.';
    default:
      return 'Status information is being updated.';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F0EDE5',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  heroSection: {
    backgroundColor: '#F0EDE5',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dealImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dealImageText: {
    fontSize: 40,
  },
  dealTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  dealStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F0EDE5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F0EDE5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRow: {
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '800',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressStages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stageNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  stageName: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  stageDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  stageDone: {},
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#F0EDE5',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F0EDE5',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '700',
  },
  neutralButton: {
    backgroundColor: '#F0EDE5',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  neutralButtonText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default DealDetail;

