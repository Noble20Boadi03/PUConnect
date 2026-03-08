import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/context/auth-context";
import { api } from "@/services/api";
import { ExperienceLevel } from "@/types";
import { Ionicons } from "@expo/vector-icons";

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

const DEPARTMENTS = [
  "Computer Science",
  "Business",
  "Engineering",
  "Arts",
  "Sciences",
  "Medicine",
  "Law",
  "Other",
];

export default function OnboardingScreen() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [bio, setBio] = useState(user?.bio || "");
  const [skillTags, setSkillTags] = useState<string[]>(user?.skillTags || []);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    user?.experienceLevel || "beginner",
  );
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(
    user?.portfolioLinks || [],
  );
  const [newLink, setNewLink] = useState("");
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePictureUrl || "",
  );
  const [department, setDepartment] = useState(user?.department || "");
  const [graduationYear, setGraduationYear] = useState(
    user?.graduationYear?.toString() || "2027",
  );

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

  const handleSave = async () => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await api.updateProfile(
        {
          bio,
          skillTags,
          experienceLevel,
          portfolioLinks,
          isAvailable,
          profilePictureUrl,
          department,
          graduationYear: parseInt(graduationYear),
          verifiedStudent: true, // Mocking verification for demo
        },
        token,
      );

      if (refreshUser) {
        await refreshUser();
      }

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "View Profile",
          onPress: () => router.replace("/(tabs)/profile"),
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ThemedView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Professional Setup
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Showcase your talent to the campus
            </Text>
          </View>

          {/* Profile Picture */}
          <View style={styles.section}>
            <View style={styles.avatarContainer}>
              <Pressable
                style={[
                  styles.avatarFrame,
                  {
                    borderColor: theme.primary,
                    backgroundColor: theme.surface,
                  },
                ]}
                onPress={() =>
                  Alert.alert(
                    "Pick Image",
                    "Image picker integration coming soon.",
                  )
                }
              >
                {profilePictureUrl ? (
                  <Image
                    source={{ uri: profilePictureUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <Ionicons
                    name="person-circle"
                    size={100}
                    color={theme.textMuted}
                  />
                )}
                <View
                  style={[
                    styles.editIconBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </Pressable>
            </View>
          </View>

          {/* University Info */}
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              University Info
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="Major / Department"
              placeholderTextColor={theme.textMuted}
              value={department}
              onChangeText={setDepartment}
            />
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
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
            <Text style={[styles.label, { color: theme.text }]}>
              Professional Bio
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { color: theme.text, borderColor: theme.border },
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
            <Text style={[styles.label, { color: theme.text }]}>
              Skills & Expertise
            </Text>
            <View style={styles.tagGrid}>
              {POPULAR_SKILLS.map((skill) => (
                <Pressable
                  key={skill}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: skillTags.includes(skill)
                        ? theme.primary
                        : theme.background,
                      borderColor: skillTags.includes(skill)
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text
                    style={{
                      color: skillTags.includes(skill)
                        ? "#fff"
                        : theme.textSecondary,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {skill}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Portfolio Links */}
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Portfolio & Links
            </Text>
            <View style={styles.linkInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    color: theme.text,
                    borderColor: theme.border,
                    marginBottom: 0,
                  },
                ]}
                placeholder="Link (e.g. GitHub, LinkedIn)"
                placeholderTextColor={theme.textMuted}
                value={newLink}
                onChangeText={setNewLink}
              />
              <Pressable
                style={[styles.addBtn, { backgroundColor: theme.primary }]}
                onPress={addPortfolioLink}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.linkList}>
              {portfolioLinks.map((link) => (
                <View
                  key={link}
                  style={[
                    styles.linkItem,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.linkText, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {link}
                  </Text>
                  <Pressable onPress={() => removePortfolioLink(link)}>
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.error}
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
              <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>
                Available for Hire
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 13 }}>
                Show up in campus talent searches
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: "#cbd5e1", true: theme.primary }}
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
              <Text style={styles.saveButtonText}>
                Complete Professional Profile
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    fontSize: 28,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  section: {
    marginBottom: 25,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007BFF",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingTop: 15,
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
    borderRadius: 20,
  },
  saveButton: {
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 10,
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
    marginBottom: 10,
  },
  linkList: {
    gap: 10,
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  linkText: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
  },
});
