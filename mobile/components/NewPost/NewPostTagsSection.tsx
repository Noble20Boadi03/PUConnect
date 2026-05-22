import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { formatExploreTagLabel } from '../../lib/formatExploreTagLabel';
import { getTagGroupsForServices } from '../../lib/editInfoForm';
import type { NewPostType } from '../../types/newPost';

export interface NewPostTagsSectionProps {
  postType: NewPostType;
  isProvider: boolean;
  /** Provider's offered service IDs from profile setup. */
  providerServiceIds: string[];
  /** Selected help category service ids (requests). */
  helpCategoryIds: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  subtleBg: string;
  borderColor: string;
}

export const NewPostTagsSection: React.FC<NewPostTagsSectionProps> = ({
  postType,
  isProvider,
  providerServiceIds,
  helpCategoryIds,
  selectedTags,
  onChange,
  textColor,
  mutedColor,
  primaryColor,
  subtleBg,
  borderColor,
}) => {
  const isDark = useColorScheme() === 'dark';
  const selectedSet = new Set(selectedTags);

  const tagGroups = useMemo(() => {
    if (isProvider && postType === 'Service') {
      return getTagGroupsForServices(providerServiceIds);
    }
    return getTagGroupsForServices(helpCategoryIds);
  }, [isProvider, postType, providerServiceIds, helpCategoryIds]);

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedSet.has(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  if (isProvider && postType === 'Service' && providerServiceIds.length === 0) {
    return (
      <View style={[styles.emptyBox, { backgroundColor: subtleBg, borderColor }]}>
        <Text style={[styles.emptyText, { color: mutedColor }]}>
          Add services in Edit Info → Provider Profile to tag your service posts.
        </Text>
      </View>
    );
  }

  if (postType === 'Request' && helpCategoryIds.length === 0) {
    return (
      <View style={[styles.emptyBox, { backgroundColor: subtleBg, borderColor }]}>
        <Text style={[styles.emptyText, { color: mutedColor }]}>
          Choose a help category above to see related tags.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: mutedColor }]}>Tags (optional)</Text>
      <Text style={[styles.hint, { color: mutedColor }]}>
        {isProvider && postType === 'Service'
          ? 'Select tags based on the services you offer.'
          : 'Tags are grouped by the help categories you selected.'}
      </Text>
      {tagGroups.map((group) => (
        <View key={group.serviceId} style={styles.group}>
          <Text style={[styles.groupTitle, { color: textColor }]}>{group.serviceTitle}</Text>
          <View style={styles.pills}>
            {group.tags.map((tag) => {
              const active = selectedSet.has(tag);
              return (
                <TouchableOpacity
                  key={`${group.serviceId}-${tag}`}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: active ? primaryColor : 'transparent',
                      borderColor: active ? primaryColor : borderColor,
                    },
                  ]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: active ? (isDark ? '#09090B' : '#FFFFFF') : textColor,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {formatExploreTagLabel(tag)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  label: { fontSize: Typography.size.xs, fontWeight: '600', marginBottom: 4, marginLeft: 2 },
  hint: { fontSize: Typography.size.xs, fontWeight: '500', marginBottom: Spacing.sm, marginLeft: 2, lineHeight: 16 },
  group: { marginBottom: Spacing.md },
  groupTitle: { fontSize: Typography.size.xs, fontWeight: '700', marginBottom: Spacing.sm, marginLeft: 2 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: Typography.size.xs },
  emptyBox: { borderRadius: 12, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  emptyText: { fontSize: Typography.size.xs, fontWeight: '500', lineHeight: 18, textAlign: 'center' },
});

export default NewPostTagsSection;
