import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor, useThemeToggle } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { useAuthStore } from '../../store';

export default function ProfileScreen() {
  const router = useRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';

  const { user } = useAuthStore();
  const { iconName, handleToggle } = useThemeToggle();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: subtleBg }]}
            onPress={handleToggle}
          >
            <Ionicons name={iconName} size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: subtleBg }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: subtleBg }]}
            onPress={handleOpenSettings}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture & Name Section */}
        <View style={[styles.profileSection, { backgroundColor: cardBg }]}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: Colors.primary + '18' }]}>
              <Text style={[styles.avatarInitials, { color: Colors.primary }]}>{initials}</Text>
            </View>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: Colors.primary }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="camera" size={14} color={isDark ? '#09090B' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>

          {/* Name & Username */}
          <Text style={[styles.profileName, { color: Colors.text }]}>
            {user?.name || 'User'}
          </Text>
          {user?.username && (
            <Text style={[styles.profileHandle, { color: Colors.icon }]}>
              @{user.username}
            </Text>
          )}

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="image-outline" size={16} color={isDark ? '#09090B' : '#FFFFFF'} />
              <Text style={[styles.actionButtonText, { color: isDark ? '#09090B' : '#FFFFFF' }]}>
                Change Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: subtleBg, borderColor: Colors.border, borderWidth: 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="create-outline" size={16} color={Colors.text} />
              <Text style={[styles.actionButtonText, { color: Colors.text }]}>Edit Info</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Information Card */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Information</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          {/* Username Row */}
          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="at" size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: Colors.icon }]}>Username</Text>
              <Text style={[styles.infoValue, { color: Colors.text }]}>
                {user?.username ? `@${user.username}` : 'Not set'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />

          {/* Email Row */}
          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: Colors.secondary + '15' }]}>
              <Ionicons name="mail-outline" size={18} color={Colors.secondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: Colors.icon }]}>Email Address</Text>
              <Text style={[styles.infoValue, { color: Colors.text }]}>
                {user?.email || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />

          {/* Role Row */}
          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: '#F59E0B15' }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#F59E0B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: Colors.icon }]}>Account Type</Text>
              <Text style={[styles.infoValue, { color: Colors.text }]}>
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // --- Profile Section ---
  profileSection: {
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 34,
    fontWeight: '800',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: Typography.size.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileHandle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },

  // --- Information Section ---
  sectionHeader: {
    marginTop: Spacing.lg + 4,
    marginBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md - 2,
    paddingVertical: Spacing.sm + 2,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 54,
  },
});
