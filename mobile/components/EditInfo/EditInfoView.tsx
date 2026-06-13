import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, useColorScheme, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardLayout } from '../KeyboardLayout';
import { Button } from '../Button';
import { Alert } from '../Alert';
import { ConfirmDialog } from '../ConfirmDialog';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useAuthStore, useProfileStore } from '../../store';
import { authService } from '../../services';
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
  const revokeProviderProfile = useProfileStore((s) => s.revokeProviderProfile);

  const { firstName: initialFirst, lastName: initialLast } = splitDisplayName(user?.name);

  const [initialValues, setInitialValues] = useState({
    firstName: initialFirst,
    lastName: initialLast,
    username: user?.username ?? '',
    email: user?.email ?? '',
    bio: savedBio,
    selectedServiceIds: savedServiceIds,
    selectedTags: savedTags,
  });

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(savedBio);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(savedServiceIds);
  const [selectedTags, setSelectedTags] = useState<string[]>(savedTags);

  // Check if any values have changed
  const hasChanges =
    firstName.trim() !== initialValues.firstName.trim() ||
    lastName.trim() !== initialValues.lastName.trim() ||
    username.trim() !== initialValues.username.trim() ||
    email.trim() !== initialValues.email.trim() ||
    bio.trim() !== initialValues.bio.trim() ||
    JSON.stringify(selectedServiceIds.sort()) !== JSON.stringify(initialValues.selectedServiceIds.sort()) ||
    JSON.stringify(selectedTags.sort()) !== JSON.stringify(initialValues.selectedTags.sort());

  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [providerExpanded, setProviderExpanded] = useState(
    () => isProvider || hasProviderSectionData(savedBio, savedServiceIds, savedTags)
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [revokeConfirmVisible, setRevokeConfirmVisible] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const draftHasProviderData = hasProviderSectionData(bio, selectedServiceIds, selectedTags);
  const providerLocked = isProvider || draftHasProviderData;

  useEffect(() => {
    if (providerLocked) setProviderExpanded(true);
  }, [providerLocked]);

  useEffect(() => {
    const { firstName: f, lastName: l } = splitDisplayName(user?.name);
    const newInitialValues = {
      firstName: f,
      lastName: l,
      username: user?.username ?? '',
      email: user?.email ?? '',
      bio: savedBio,
      selectedServiceIds: savedServiceIds,
      selectedTags: savedTags,
    };
    setFirstName(f);
    setLastName(l);
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
    setBio(savedBio);
    setSelectedServiceIds(savedServiceIds);
    setSelectedTags(savedTags);
    setInitialValues(newInitialValues);
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
      // Update the main profile (name, username, email)
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const updatedUser = await authService.updateProfile({
        name: fullName,
        username: username.trim(),
        email: email.trim(),
      });

      // Update auth store with new user data
      useAuthStore.getState().setUser(updatedUser);

      // Update provider profile if needed
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

  const handleOpenRevokeDialog = useCallback(() => {
    if (isSaving || isRevoking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevokeConfirmVisible(true);
  }, [isSaving, isRevoking]);

  const handleCloseRevokeDialog = useCallback(() => {
    if (isRevoking) return;
    setRevokeConfirmVisible(false);
  }, [isRevoking]);

  const handleConfirmRevoke = useCallback(async () => {
    setIsRevoking(true);

    try {
      await revokeProviderProfile();
      setRevokeConfirmVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaveMessage('Provider status revoked successfully.');
    } catch {
      setRevokeConfirmVisible(false);
      setSaveMessage('Something went wrong while revoking provider status. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRevoking(false);
    }
  }, [revokeProviderProfile]);

  return (
    <KeyboardLayout contentContainerStyle={styles.scrollContent}>
      <ConfirmDialog
        visible={revokeConfirmVisible}
        title="Revoke Provider Status"
        message="Are you sure you want to revoke your provider status? This will remove your provider profile and services from public view."
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isRevoking}
        onConfirm={handleConfirmRevoke}
        onCancel={handleCloseRevokeDialog}
      />
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
          type={saveMessage.includes('complete') || saveMessage.includes('required') || saveMessage.includes('Select') || saveMessage.includes('wrong') ? 'error' : 'success'}
          title={saveMessage.includes('complete') || saveMessage.includes('required') || saveMessage.includes('Select') || saveMessage.includes('wrong') ? "Oops!" : "Success!"}
          message={saveMessage}
          dismissible
          onDismiss={() => setSaveMessage(null)}
        />
      ) : null}

      {isProvider && (
        <TouchableOpacity
          style={[
            styles.revokeButton,
            { borderColor: Colors.error + '35', opacity: isSaving || isRevoking ? 0.7 : 1 },
          ]}
          onPress={handleOpenRevokeDialog}
          activeOpacity={0.7}
          disabled={isSaving || isRevoking}
        >
          {isRevoking ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          )}
          <Text style={[styles.revokeText, { color: Colors.error }]}>
            {isRevoking ? 'Revoking...' : 'Revoke Provider Status'}
          </Text>
        </TouchableOpacity>
      )}

      <Button
        title="Save Changes"
        variant="primary"
        size="md"
        onPress={handleSave}
        isLoading={isSaving}
        disabled={isSaving || isRevoking || !hasChanges}
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
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  revokeText: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
});

export default EditInfoView;
