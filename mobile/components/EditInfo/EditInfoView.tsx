import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { KeyboardLayout } from '../KeyboardLayout';
import { Button } from '../Button';
import { Alert } from '../Alert';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useAuthStore, useProfileStore } from '../../store';
import {
  hasProviderSectionData,
  pruneTagsForServices,
  splitDisplayName,
  validateProviderProfile,
} from '../../lib/editInfoForm';
import { EditInfoField } from './EditInfoField';
import { BecomeProviderSection } from './BecomeProviderSection';

type FocusField = 'firstName' | 'lastName' | 'username' | 'email' | 'bio' | null;

export interface EditInfoViewProps {
  onSaved?: () => void;
}

export const EditInfoView: React.FC<EditInfoViewProps> = ({ onSaved }) => {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';

  const user = useAuthStore((s) => s.user);
  const isProvider = useProfileStore((s) => s.isProvider);
  const savedBio = useProfileStore((s) => s.providerBio);
  const savedServiceIds = useProfileStore((s) => s.providerServiceIds);
  const savedTags = useProfileStore((s) => s.providerTags);
  const saveProviderProfile = useProfileStore((s) => s.saveProviderProfile);
  const clearProviderProfile = useProfileStore((s) => s.clearProviderProfile);

  const { firstName: initialFirst, lastName: initialLast } = splitDisplayName(user?.name);

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(savedBio);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(savedServiceIds);
  const [selectedTags, setSelectedTags] = useState<string[]>(savedTags);

  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [providerExpanded, setProviderExpanded] = useState(
    () => isProvider || hasProviderSectionData(savedBio, savedServiceIds, savedTags)
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const draftHasProviderData = hasProviderSectionData(bio, selectedServiceIds, selectedTags);
  const providerLocked = isProvider || draftHasProviderData;

  useEffect(() => {
    if (providerLocked) setProviderExpanded(true);
  }, [providerLocked]);

  useEffect(() => {
    const { firstName: f, lastName: l } = splitDisplayName(user?.name);
    setFirstName(f);
    setLastName(l);
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
    setBio(savedBio);
    setSelectedServiceIds(savedServiceIds);
    setSelectedTags(savedTags);
    if (isProvider || hasProviderSectionData(savedBio, savedServiceIds, savedTags)) {
      setProviderExpanded(true);
    }
  }, [user, savedBio, savedServiceIds, savedTags, isProvider]);

  const handleServicesChange = useCallback(
    (ids: string[]) => {
      setSelectedServiceIds(ids);
      setSelectedTags((prev) => pruneTagsForServices(prev, ids));
      setServicesError(null);
    },
    []
  );

  const handleBioChange = useCallback((value: string) => {
    setBio(value);
    setBioError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
      setSaveMessage('Please complete all account fields before saving.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setBioError(null);
    setServicesError(null);

    if (draftHasProviderData) {
      const validation = validateProviderProfile(bio, selectedServiceIds);
      if (!validation.valid) {
        setProviderExpanded(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (!bio.trim()) setBioError('Bio is required to become a provider.');
        if (selectedServiceIds.length === 0) {
          setServicesError('Select at least one service.');
        }
        setSaveMessage(validation.message);
        return;
      }
    }

    setIsSaving(true);
    setSaveMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (draftHasProviderData) {
        await saveProviderProfile({
          bio: bio.trim(),
          serviceIds: selectedServiceIds,
          tags: selectedTags,
        });
      } else if (isProvider) {
        await clearProviderProfile();
      }

      setIsSaving(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const becameProvider = draftHasProviderData;
      setSaveMessage(
        becameProvider
          ? 'You are now a campus provider. Service posts are unlocked on your profile.'
          : 'Your account details were saved.'
      );
      onSaved?.();
    } catch {
      setIsSaving(false);
      setSaveMessage('Something went wrong while saving. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [
    firstName,
    lastName,
    username,
    email,
    bio,
    selectedServiceIds,
    selectedTags,
    draftHasProviderData,
    isProvider,
    saveProviderProfile,
    clearProviderProfile,
    onSaved,
  ]);

  return (
    <KeyboardLayout contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.screenSubtitle, { color: Colors.icon }]}>
        Edit your account details.
      </Text>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: Colors.text }]}>Account</Text>

        <EditInfoField
          label="First Name"
          screenBg={screenBg}
          borderColor={Colors.border}
          focusBorderColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          focused={focusedField === 'firstName'}
          onFocusChange={(f) => setFocusedField(f ? 'firstName' : null)}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <EditInfoField
          label="Last Name"
          screenBg={screenBg}
          borderColor={Colors.border}
          focusBorderColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          focused={focusedField === 'lastName'}
          onFocusChange={(f) => setFocusedField(f ? 'lastName' : null)}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <EditInfoField
          label="Username"
          screenBg={screenBg}
          borderColor={Colors.border}
          focusBorderColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          focused={focusedField === 'username'}
          onFocusChange={(f) => setFocusedField(f ? 'username' : null)}
          value={username}
          onChangeText={setUsername}
          placeholder="username"
          autoCapitalize="none"
          returnKeyType="next"
        />
        <EditInfoField
          label="Email Address"
          screenBg={screenBg}
          borderColor={Colors.border}
          focusBorderColor={Colors.primary}
          textColor={Colors.text}
          mutedColor={Colors.icon}
          focused={focusedField === 'email'}
          onFocusChange={(f) => setFocusedField(f ? 'email' : null)}
          value={email}
          onChangeText={setEmail}
          placeholder="you@university.edu"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
        />
      </View>

      <BecomeProviderSection
        expanded={providerExpanded}
        lockedExpanded={providerLocked}
        isProvider={isProvider}
        onToggleExpanded={() => setProviderExpanded((v) => !v)}
        bio={bio}
        onBioChange={handleBioChange}
        selectedServiceIds={selectedServiceIds}
        onServicesChange={handleServicesChange}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        screenBg={screenBg}
        cardBg={cardBg}
        subtleBg={isDark ? '#1E1E21' : '#F0F0F2'}
        borderColor={Colors.border}
        textColor={Colors.text}
        mutedColor={Colors.icon}
        primaryColor={Colors.primary}
        bioFocused={focusedField === 'bio'}
        onBioFocusChange={(f) => setFocusedField(f ? 'bio' : null)}
        bioError={bioError}
        servicesError={servicesError}
      />

      {saveMessage ? (
        <Alert
          type={saveMessage.includes('complete') || saveMessage.includes('required') || saveMessage.includes('Select') ? 'error' : 'success'}
          message={saveMessage}
          dismissible
          onDismiss={() => setSaveMessage(null)}
        />
      ) : null}

      <Button
        title="Save Changes"
        variant="primary"
        size="md"
        onPress={handleSave}
        isLoading={isSaving}
        disabled={isSaving}
        style={styles.saveButton}
      />
    </KeyboardLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl + 8,
  },
  screenSubtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: Typography.size.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  saveButton: {
    marginTop: Spacing.xl,
    width: '100%',
    borderRadius: 12,
  },
});

export default EditInfoView;
