import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';

export type ProfileHeroVariant = 'owner' | 'public';

export interface ProfileHeroSectionProps {
  displayName: string;
  handle?: string;
  /** When set, shows a photo instead of initials. */
  avatarUrl?: string;
  initials: string;
  cardBg: string;
  subtleBg: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  isDark: boolean;
  variant: ProfileHeroVariant;
  onChangePhoto?: () => void;
  onEditInfo?: () => void;
  onMessage?: () => void;
}

export const ProfileHeroSection: React.FC<ProfileHeroSectionProps> = ({
  displayName,
  handle,
  avatarUrl,
  initials,
  cardBg,
  subtleBg,
  primaryColor,
  textColor,
  mutedColor,
  isDark,
  variant,
  onChangePhoto,
  onEditInfo,
  onMessage,
}) => {
  const isOwner = variant === 'owner';
  const ctaOnDark = isDark ? '#09090B' : '#FFFFFF';

  const fireHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View style={[styles.profileSection, { backgroundColor: cardBg }]}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarCircle, { backgroundColor: primaryColor + '18' }]}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={0}
            />
          ) : (
            <Text style={[styles.avatarInitials, { color: primaryColor }]}>{initials}</Text>
          )}
        </View>
        {isOwner ? (
          <TouchableOpacity
            style={[styles.cameraButton, { backgroundColor: primaryColor }]}
            onPress={() => {
              fireHaptic();
              onChangePhoto?.();
            }}
          >
            <Ionicons name="camera" size={14} color={ctaOnDark} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={[styles.profileName, { color: textColor }]}>{displayName}</Text>
      {handle ? (
        <Text style={[styles.profileHandle, { color: mutedColor }]}>{handle}</Text>
      ) : null}

      {isOwner ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={() => {
              fireHaptic();
              onChangePhoto?.();
            }}
          >
            <Ionicons name="image-outline" size={16} color={ctaOnDark} />
            <Text style={[styles.actionButtonText, { color: ctaOnDark }]}>Change Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: subtleBg, borderColor: mutedColor + '40', borderWidth: 1 },
            ]}
            onPress={() => {
              fireHaptic();
              onEditInfo?.();
            }}
          >
            <Ionicons name="create-outline" size={16} color={textColor} />
            <Text style={[styles.actionButtonText, { color: textColor }]}>Edit Info</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.messageButton, { backgroundColor: primaryColor }]}
          onPress={() => {
            fireHaptic();
            onMessage?.();
          }}
          activeOpacity={0.9}
        >
          <Ionicons name="chatbubble-outline" size={18} color={ctaOnDark} />
          <Text style={[styles.messageButtonText, { color: ctaOnDark }]}>Send Message</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 96,
    height: 96,
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
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 14,
    alignSelf: 'stretch',
  },
  messageButtonText: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

export default ProfileHeroSection;
