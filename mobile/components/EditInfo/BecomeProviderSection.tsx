import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { EditInfoField } from './EditInfoField';
import { EditInfoServicesPicker } from './EditInfoServicesPicker';
import { EditInfoTagPicker } from './EditInfoTagPicker';

export interface BecomeProviderSectionProps {
  expanded: boolean;
  lockedExpanded: boolean;
  isProvider: boolean;
  onToggleExpanded: () => void;
  bio: string;
  onBioChange: (value: string) => void;
  selectedServiceIds: string[];
  onServicesChange: (ids: string[]) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  screenBg: string;
  cardBg: string;
  subtleBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  bioFocused: boolean;
  onBioFocusChange: (focused: boolean) => void;
  bioError?: string | null;
  servicesError?: string | null;
}

export const BecomeProviderSection: React.FC<BecomeProviderSectionProps> = ({
  expanded,
  lockedExpanded,
  isProvider,
  onToggleExpanded,
  bio,
  onBioChange,
  selectedServiceIds,
  onServicesChange,
  selectedTags,
  onTagsChange,
  screenBg,
  cardBg,
  subtleBg,
  borderColor,
  textColor,
  mutedColor,
  primaryColor,
  bioFocused,
  onBioFocusChange,
  bioError,
  servicesError,
}) => {
  const handleHeaderPress = () => {
    if (lockedExpanded) return;
    
    onToggleExpanded();
  };

  const title = isProvider ? 'Provider Profile' : 'Become A Provider';
  const subtitle = isProvider
    ? 'Manage your campus services and public expertise'
    : 'Optional — showcase services on campus';

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={handleHeaderPress}
        activeOpacity={lockedExpanded ? 1 : 0.85}
        disabled={lockedExpanded}
      >
        <View style={[styles.iconCircle, { backgroundColor: primaryColor + '15' }]}>
          <Ionicons name={isProvider ? 'checkmark-circle' : 'briefcase-outline'} size={20} color={primaryColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: mutedColor }]}>{subtitle}</Text>
        </View>
        {!lockedExpanded ? (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={mutedColor}
          />
        ) : (
          <View style={[styles.lockBadge, { backgroundColor: subtleBg }]}>
            <Ionicons name="lock-closed-outline" size={14} color={mutedColor} />
          </View>
        )}
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.body}>
          {lockedExpanded && !isProvider ? (
            <Text style={[styles.lockedNote, { color: mutedColor }]}>
              Provider details stay visible while any field below is filled.
            </Text>
          ) : null}

          <EditInfoField
            label="Bio"
            screenBg={screenBg}
            borderColor={bioError ? '#EF4444' : borderColor}
            focusBorderColor={primaryColor}
            textColor={textColor}
            mutedColor={mutedColor}
            focused={bioFocused}
            onFocusChange={onBioFocusChange}
            value={bio}
            onChangeText={onBioChange}
            placeholder="Tell peers what you offer and your experience..."
            multiline
            numberOfLines={4}
            hint={bioError ?? 'Required to become a provider. Shown on your public profile.'}
            hintIsError={!!bioError}
          />

          <EditInfoServicesPicker
            selectedIds={selectedServiceIds}
            onChange={onServicesChange}
            screenBg={screenBg}
            borderColor={servicesError ? '#EF4444' : borderColor}
            textColor={textColor}
            mutedColor={mutedColor}
            primaryColor={primaryColor}
            subtleBg={subtleBg}
            hint={servicesError ?? undefined}
          />

          <EditInfoTagPicker
            serviceIds={selectedServiceIds}
            selectedTags={selectedTags}
            onChange={onTagsChange}
            textColor={textColor}
            mutedColor={mutedColor}
            primaryColor={primaryColor}
            subtleBg={subtleBg}
            borderColor={borderColor}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginTop: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md - 2,
    padding: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  lockedNote: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
});

export default BecomeProviderSection;
