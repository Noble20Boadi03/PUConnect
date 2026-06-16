import React, { useMemo } from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { useThemeColor, useChangeProfilePhoto } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { Button } from '../../components';
import { ProfileChangePhotoSheet } from '../../components/Profile';
import { useAuthStore } from '../../store';

export default function PhotoSetupScreen() {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';

  const user = useAuthStore((s) => s.user);
  const setFirstLoginSession = useAuthStore((s) => s.setFirstLoginSession);
  const setHasCompletedOnboarding = useAuthStore((s) => s.setHasCompletedOnboarding);

  const { avatarUri, sheetVisible, openSheet, closeSheet, handleSheetSelect } =
    useChangeProfilePhoto(user?.avatarUrl);

  const initials = useMemo(() => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const hasSelectedPhoto = !!avatarUri && avatarUri !== user?.avatarUrl;

  const handleContinueOrSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Completing this setup clears the flag, which will trigger the layout to route to market.
    setFirstLoginSession(false);
    setHasCompletedOnboarding(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.primary }]}>Add a Profile Picture</Text>
          <Text style={[styles.subtitle, { color: Colors.text }]}>
            Personalize your account by adding a photo. This helps others on campus recognize you!
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: Colors.primary + '18' }]}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={0}
                />
              ) : (
                <Text style={[styles.avatarInitials, { color: Colors.primary }]}>{initials}</Text>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            {!hasSelectedPhoto ? (
              <Button
                title="Upload Image"
                variant="outline"
                size="md"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  openSheet();
                }}
                style={styles.actionButton}
              />
            ) : (
              <Button
                title="Continue"
                variant="primary"
                size="md"
                onPress={handleContinueOrSkip}
                style={styles.actionButton}
              />
            )}
            
            {!hasSelectedPhoto && (
              <Button
                title="Skip for now"
                variant="ghost"
                size="sm"
                onPress={handleContinueOrSkip}
                style={styles.actionButton}
              />
            )}
          </View>
        </View>
      </View>

      <ProfileChangePhotoSheet
        visible={sheetVisible}
        onClose={closeSheet}
        onSelect={handleSheetSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 140,
    height: 140,
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: '800',
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});
