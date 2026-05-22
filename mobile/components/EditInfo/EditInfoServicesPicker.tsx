import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { getServiceOptionsByIds } from '../../lib/editInfoForm';
import { EditInfoServicesSheet } from './EditInfoServicesSheet';

export interface EditInfoServicesPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  screenBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  subtleBg: string;
  hint?: string;
}

export const EditInfoServicesPicker: React.FC<EditInfoServicesPickerProps> = ({
  selectedIds,
  onChange,
  screenBg,
  borderColor,
  textColor,
  mutedColor,
  primaryColor,
  subtleBg,
  hint,
}) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const selected = getServiceOptionsByIds(selectedIds);

  const handleToggle = (serviceId: string) => {
    if (selectedIds.includes(serviceId)) {
      onChange(selectedIds.filter((id) => id !== serviceId));
    } else {
      onChange([...selectedIds, serviceId]);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: mutedColor }]}>Services you offer</Text>
      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: screenBg, borderColor }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSheetVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.triggerText,
            { color: selected.length > 0 ? textColor : mutedColor + '99' },
          ]}
          numberOfLines={1}
        >
          {selected.length > 0
            ? `${selected.length} service${selected.length === 1 ? '' : 's'} selected`
            : 'Select services'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={mutedColor} />
      </TouchableOpacity>

      {hint ? (
        <Text style={[styles.hint, { color: '#EF4444', marginTop: Spacing.xs }]}>{hint}</Text>
      ) : null}

      {selected.length > 0 ? (
        <View style={styles.chips}>
          {selected.map((service) => (
            <View
              key={service.id}
              style={[styles.chip, { backgroundColor: primaryColor + '14', borderColor: primaryColor + '40' }]}
            >
              <Text style={[styles.chipText, { color: primaryColor }]} numberOfLines={1}>
                {service.title}
              </Text>
              <TouchableOpacity
                hitSlop={8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onChange(selectedIds.filter((id) => id !== service.id));
                }}
              >
                <Ionicons name="close-circle" size={16} color={primaryColor} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.hint, { color: hint ? '#EF4444' : mutedColor }]}>
          {hint ?? 'Pick from the same services listed under Explore categories.'}
        </Text>
      )}

      <EditInfoServicesSheet
        visible={sheetVisible}
        selectedIds={selectedIds}
        onToggleService={handleToggle}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  triggerText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: '500',
    marginRight: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
    paddingLeft: Spacing.sm + 2,
    paddingRight: Spacing.xs + 2,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
    flexShrink: 1,
  },
  hint: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
    lineHeight: 16,
  },
});

export default EditInfoServicesPicker;
