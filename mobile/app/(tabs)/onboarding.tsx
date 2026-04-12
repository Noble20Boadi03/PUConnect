import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedIcon } from "@/components/ui/themed-icon";
import { ScreenLayout } from "@/components/ui/screen-layout";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { api } from "@/services/api";
import * as ImagePicker from 'expo-image-picker';
import { Spacing, BorderRadius } from "@/constants/theme";

const POPULAR_SKILLS = [
  "Tutoring",
  "Graphic Design",
  "Coding",
  "Delivery",
  "Music",
  "Photography",
  "Writing",
  "Marketing",
  "Event Planning",
  "Handyman",
  "Translation",
  "Fitness",
];

export default function OnboardingScreen() {
  const { user, token, refreshUser } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePictureUrl || ""
  );
  const [department, setDepartment] = useState(user?.department || "");
  const [graduationYear, setGraduationYear] = useState(
    user?.graduationYear?.toString() || ""
  );
  const [bio, setBio] = useState(user?.bio || "");
  const [skillTags, setSkillTags] = useState<string[]>(user?.skillTags || []);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(
    user?.portfolioLinks || []
  );
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [newLink, setNewLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    if (skillTags.includes(skill)) {
      setSkillTags(skillTags.filter((s) => s !== skill));
    } else {
      setSkillTags([...skillTags, skill]);
    }
  };

  const addPortfolioLink = () => {
    if (newLink && !portfolioLinks.includes(newLink)) {
      setPortfolioLinks([...portfolioLinks, newLink]);
      setNewLink("");
    }
  };

  const removePortfolioLink = (link: string) => {
    setPortfolioLinks(portfolioLinks.filter((l) => l !== link));
  };

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
        const uploadResult = await api.uploadImage(profilePictureUrl, token);
        const baseUrl = api.getApiUrl().replace('/api/v1', '');
        finalImageUrl = `${baseUrl}${uploadResult.url}`;
      }

      const yearNum = parseInt(graduationYear, 10);
      const canOfferServices =
        skillTags.length > 0 &&
        department.trim().length > 0 &&
        !Number.isNaN(yearNum) &&
        bio.trim().length > 0;

      await api.updateProfile(
        {
          bio,
          skillTags,
          portfolioLinks,
          isAvailable,
          profilePictureUrl: finalImageUrl,
          department,
          graduationYear: yearNum,
          verifiedStudent: true,
          canOfferServices,
        },
        token,
      );

      if (refreshUser) {
        await refreshUser();
      }

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "View Profile",
          onPress: () => router.replace({ pathname: "/(tabs)/profile" }),
        },
      ]);
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout 
      scrollable 
      keyboardAvoiding 
      padding="large"
    >
      <View style={styles.header}>
        <ThemedText variant="headlineLarge" style={styles.title}>
          Professional Setup
        </ThemedText>
        <ThemedText variant="bodyLarge" colorName="textSecondary" style={styles.subtitle}>
          Complete your profile with skills and campus details to become a provider and post service offers. Everyone can post requests for help without this step.
        </ThemedText>
      </View>

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

      {/* Short Bio */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <ThemedText variant="labelLarge" style={styles.label}>
          Professional Bio
        </ThemedText>
        <TextInput
          style={[
            styles.textArea,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="Tell potential collaborators about your skills and experience..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={4}
          value={bio}
          onChangeText={setBio}
          maxLength={300}
        />
      </View>

      {/* Skill Tags */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <ThemedText variant="labelLarge" style={styles.label}>
          Skills & Expertise
        </ThemedText>
        <View style={styles.tagGrid}>
          {POPULAR_SKILLS.map((skill) => (
            <Pressable
              key={skill}
              style={[
                styles.tag,
                {
                  backgroundColor: skillTags.includes(skill)
                    ? theme.primary
                    : theme.surfaceVariant,
                  borderColor: skillTags.includes(skill)
                    ? theme.primary
                    : theme.outlineVariant,
                  borderWidth: 1,
                },
              ]}
              onPress={() => toggleSkill(skill)}
            >
              <ThemedText
                style={{
                  color: skillTags.includes(skill)
                    ? "#fff"
                    : theme.textSecondary,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {skill}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Portfolio Links */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <ThemedText variant="labelLarge" style={styles.label}>
          Portfolio & Links
        </ThemedText>
        <View style={styles.linkInputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                color: theme.text,
                borderColor: theme.outlineVariant,
              },
            ]}
            placeholder="Link (e.g. GitHub, LinkedIn)"
            placeholderTextColor={theme.textMuted}
            value={newLink}
            onChangeText={setNewLink}
            onSubmitEditing={addPortfolioLink}
            returnKeyType="done"
          />
          <Pressable
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={addPortfolioLink}
          >
            <ThemedIcon name="plus" size={24} lightColor="#fff" darkColor="#fff" />
          </Pressable>
        </View>
        <View style={styles.linkList}>
          {portfolioLinks.map((link) => (
            <View
              key={link}
              style={[
                styles.linkItem,
                {
                  backgroundColor: theme.surfaceVariant,
                  borderColor: theme.outlineVariant,
                  borderWidth: 1,
                },
              ]}
            >
              <ThemedText
                variant="bodySmall"
                numberOfLines={1}
                style={{ flex: 1, marginRight: 10 }}
              >
                {link}
              </ThemedText>
              <Pressable onPress={() => removePortfolioLink(link)}>
                <ThemedIcon
                  name="close-circle"
                  size={20}
                  colorName="error"
                />
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Availability */}
      <View
        style={[
          styles.card,
          styles.row,
          { backgroundColor: theme.surface },
        ]}
      >
        <View style={{ flex: 1 }}>
          <ThemedText variant="labelLarge">
            Available for Hire
          </ThemedText>
          <ThemedText variant="bodySmall" colorName="textMuted">
            Show up in campus talent searches
          </ThemedText>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={setIsAvailable}
          trackColor={{ false: theme.outlineVariant, true: theme.primary }}
          thumbColor="#fff"
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
            Complete Professional Profile
          </ThemedText>
        )}
      </Pressable>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  addBtn: {
    width: 55,
    height: 55,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
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
  textArea: {
    height: 120,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  saveButton: {
    height: 60,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
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
  linkInputContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: Spacing.md,
  },
  linkList: {
    gap: 10,
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
