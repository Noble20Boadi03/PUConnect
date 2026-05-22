import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing } from '../../constants';

export interface ProfileCreateFabProps {
  primaryColor: string;
  onPress: () => void;
}

export const ProfileCreateFab: React.FC<ProfileCreateFabProps> = ({ primaryColor, onPress }) => (
  <View style={styles.wrap} pointerEvents="box-none">
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: primaryColor }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Create post"
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ProfileCreateFab;
