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
import { ProfileHeroSection, ProfileInfoRow } from '../../components/Profile';
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
        <ProfileHeroSection
          variant="owner"
          displayName={user?.name || 'User'}
          handle={user?.username ? `@${user.username}` : undefined}
          initials={initials}
          cardBg={cardBg}
          subtleBg={subtleBg}
          primaryColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          isDark={isDark}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Information</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <ProfileInfoRow
            icon="at"
            iconColor={Colors.primary}
            iconBg={Colors.primary + '15'}
            label="Username"
            value={user?.username ? `@${user.username}` : 'Not set'}
            textColor={Colors.text}
            mutedColor={Colors.icon}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <ProfileInfoRow
            icon="mail-outline"
            iconColor={Colors.secondary}
            iconBg={Colors.secondary + '15'}
            label="Email Address"
            value={user?.email || 'Not set'}
            textColor={Colors.text}
            mutedColor={Colors.icon}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border + '60' }]} />
          <ProfileInfoRow
            icon="shield-checkmark-outline"
            iconColor="#F59E0B"
            iconBg="#F59E0B15"
            label="Account Type"
            value={user?.role === 'admin' ? 'Administrator' : 'Student'}
            textColor={Colors.text}
            mutedColor={Colors.icon}
          />
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
  divider: {
    height: 1,
    marginLeft: 54,
  },
});
