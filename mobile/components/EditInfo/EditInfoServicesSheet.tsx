import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '../../constants';
import { EDIT_INFO_SERVICES_BY_CATEGORY } from '../../constants/editInfoServices';
import { useThemeColor } from '../../hooks';

export interface EditInfoServicesSheetProps {
  visible: boolean;
  selectedIds: string[];
  onToggleService: (serviceId: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const EditInfoServicesSheet: React.FC<EditInfoServicesSheetProps> = ({
  visible,
  selectedIds,
  onToggleService,
  onClose,
  title = 'Services you offer',
  subtitle = 'Select all campus services that match what you provide.',
}) => {
  const Colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const selectedSet = new Set(selectedIds);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: cardBg,
              maxHeight: '82%',
              paddingBottom: Math.max(insets.bottom, Spacing.md),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: subtleBg }]} />
          <Text style={[styles.sheetTitle, { color: Colors.text }]}>{title}</Text>
          <Text style={[styles.sheetSubtitle, { color: Colors.icon }]}>{subtitle}</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {EDIT_INFO_SERVICES_BY_CATEGORY.map((group) => (
              <View key={group.categoryId} style={styles.group}>
                <Text style={[styles.groupLabel, { color: Colors.icon }]}>{group.categoryLabel}</Text>
                {group.services.map((service) => {
                  const selected = selectedSet.has(service.id);
                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.optionRow,
                        {
                          backgroundColor: selected ? Colors.primary + '12' : subtleBg,
                          borderColor: selected ? Colors.primary + '55' : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        
                        onToggleService(service.id);
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.optionText}>
                        <Text style={[styles.optionTitle, { color: Colors.text }]}>
                          {service.title}
                        </Text>
                      </View>
                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={selected ? Colors.primary : Colors.icon}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: Colors.primary }]}
            onPress={() => {
              
              onClose();
            }}
            activeOpacity={0.9}
          >
            <Text style={[styles.doneLabel, { color: Colors.onPrimary }]}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: Typography.size.md,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
    paddingHorizontal: Spacing.sm,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  group: {
    gap: Spacing.sm,
  },
  groupLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  doneButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneLabel: {
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

export default EditInfoServicesSheet;
