import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedIcon } from "@/components/ui/themed-icon";
import { ScreenLayout } from "@/components/ui/screen-layout";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useAppAlert } from "@/context/alert-context";
import { api } from "@/services/api";
import * as ImagePicker from 'expo-image-picker';
import { Spacing, BorderRadius } from "@/constants/theme";

export default function EditProfileScreen() {
  const { user, token, refreshUser } = useAuth();
  const { theme } = useTheme();
  const { showAlert } = useAppAlert();
  const router = useRouter();

  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePictureUrl || ""
  );
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [universityId, setUniversityId] = useState(user?.universityId || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [graduationYear, setGraduationYear] = useState(
    user?.graduationYear?.toString() || ""
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePictureUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      let finalImageUrl = profilePictureUrl;
      
      // Upload if it's a local file
      if (profilePictureUrl && profilePictureUrl.startsWith("file://")) {
        // Simulate upload but keep local file URI for mock UI rendering
        await api.uploadImage(profilePictureUrl, token);
        finalImageUrl = profilePictureUrl;
      }

      const yearNum = parseInt(graduationYear, 10);

      await api.updateProfile(
        {
          fullName,
          email,
          universityId,
          department,
          graduationYear: isNaN(yearNum) ? undefined : yearNum,
          profilePictureUrl: finalImageUrl,
        },
        token,
      );

      if (refreshUser) {
        await refreshUser();
      }

      showAlert({
        title: "Success",
        subtitle: "Profile updated successfully!",
        severity: "success",
        primaryButtonTitle: "Go Back",
        onPrimaryPress: () => router.back()
      });
    } catch (error) {
      console.error("Update profile error:", error);
      showAlert({ title: "Error", subtitle: "Failed to update profile.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout 
      padding="none" 
      withSafeArea={false}
      keyboardAvoiding
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Edit Profile" />

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: Spacing.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="bodyLarge" colorName="textSecondary" style={styles.subtitle}>
          Update your account information and personal details.
        </ThemedText>

      {/* Profile Picture */}
      <View style={styles.section}>
        <View style={styles.avatarContainer}>
          <Pressable
            style={[
              styles.avatarFrame,
              {
                borderColor: theme.primary,
                backgroundColor: theme.surfaceVariant,
              },
            ]}
            onPress={pickImage}
          >
            {profilePictureUrl ? (
              <Image
                source={{ uri: profilePictureUrl }}
                style={styles.avatar}
              />
            ) : (
              <ThemedIcon
                name="account-circle"
                size={100}
                colorName="textMuted"
              />
            )}
            <View
              style={[
                styles.editIconBadge,
                { backgroundColor: theme.primary },
              ]}
            >
              <ThemedIcon name="camera" size={16} lightColor="#fff" darkColor="#fff" />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Account Info */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <ThemedText variant="labelLarge" style={styles.label}>
          Account Information
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="Full Name"
          placeholderTextColor={theme.textMuted}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant, marginTop: Spacing.md },
          ]}
          placeholder="Email Address"
          placeholderTextColor={theme.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant, marginTop: Spacing.md },
          ]}
          placeholder="University ID"
          placeholderTextColor={theme.textMuted}
          value={universityId}
          onChangeText={setUniversityId}
        />
      </View>

      {/* University Info */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <ThemedText variant="labelLarge" style={styles.label}>
          University Info
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="Major / Department"
          placeholderTextColor={theme.textMuted}
          value={department}
          onChangeText={setDepartment}
        />
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant, marginTop: Spacing.md },
          ]}
          placeholder="Graduation Year"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={graduationYear}
          onChangeText={setGraduationYear}
        />
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
        onPress={handleSave}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText variant="titleMedium" lightColor="#fff" darkColor="#fff" style={{ fontWeight: 'bold' }}>
            Save Changes
          </ThemedText>
        )}
      </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: 'bold',
  },
  input: {
    height: 55,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    borderWidth: 1,
  },
  saveButton: {
    height: 60,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  avatarFrame: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editIconBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
});
