import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Modal,
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
import { Spacing, BorderRadius } from "@/constants/theme";
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CAMPUS_CATEGORIES } from '@/constants/categories';
import { SUBCATEGORY_FILTERS } from '@/constants/filters';

export default function EditProfileScreen() {
  const { user, token, refreshUser } = useAuth();
  const { theme } = useTheme();
  const { showAlert } = useAppAlert();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.fullName?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.fullName?.split(" ").slice(1).join(" ") || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear ? String(user.graduationYear) : "");

  // Provider fields
  const [isProviderExpanded, setIsProviderExpanded] = useState(user?.canOfferServices || false);
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState<string[]>(user?.skillTags || []);
  const [subcategory, setSubcategory] = useState(user?.subcategory || "");
  const [category, setCategory] = useState(user?.category || "");
  
  const [isSubcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allSubcategories = useMemo(() => {
    const options: { label: string; categoryId: string; categoryTitle: string }[] = [];
    CAMPUS_CATEGORIES.forEach(cat => {
      cat.groups.forEach(group => {
        group.items.forEach(item => {
          options.push({
            label: item.title,
            categoryId: cat.id,
            categoryTitle: cat.title
          });
        });
      });
    });
    return options;
  }, []);

  const selectedSubcategories = useMemo(() => {
    return skills.filter(s => allSubcategories.some(opt => opt.label === s));
  }, [skills, allSubcategories]);

  const groupedTags = useMemo(() => {
    const groups: { subcategory: string, tags: string[] }[] = [];
    selectedSubcategories.forEach(sub => {
      const options = new Set<string>();
      if (SUBCATEGORY_FILTERS[sub]) {
        SUBCATEGORY_FILTERS[sub].forEach(filter => {
          if (Array.isArray(filter.filter_options)) {
            filter.filter_options.forEach((opt: string) => options.add(opt));
          }
        });
      }
      if (options.size > 0) {
        groups.push({ subcategory: sub, tags: Array.from(options) });
      }
    });
    return groups;
  }, [selectedSubcategories]);

  const handleAddSubcategoryFromModal = (label: string, categoryId: string) => {
    if (!skills.includes(label)) {
      const newSkills = [...skills, label];
      setSkills(newSkills);
      if (selectedSubcategories.length === 0) {
        setSubcategory(label);
        setCategory(categoryId);
      }
    }
    setSubcategoryModalVisible(false);
  };

  const handleRemoveSubcategory = (skillToRemove: string) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    setSkills(newSkills);
    
    const remainingSubs = newSkills.filter(s => allSubcategories.some(opt => opt.label === s));

    if (skillToRemove === subcategory) {
      if (remainingSubs.length > 0) {
        const firstSkill = remainingSubs[0];
        const opt = allSubcategories.find(o => o.label === firstSkill);
        if (opt) {
          setSubcategory(opt.label);
          setCategory(opt.categoryId);
        }
      } else {
        setSubcategory("");
        setCategory("");
      }
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };


  const handleSave = async () => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      await api.updateProfile(
        {
          fullName,
          email,
          username,
          department,
          graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
          bio: isProviderExpanded ? bio : undefined,
          skillTags: isProviderExpanded ? skills : undefined,
          category: isProviderExpanded ? category : undefined,
          subcategory: isProviderExpanded ? subcategory : undefined,
          canOfferServices: isProviderExpanded,
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
      <ScreenHeader title="Edit Info" />

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: Spacing.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="bodyLarge" colorName="textSecondary" style={styles.subtitle}>
          Edit your account details.
        </ThemedText>

      {/* Account Info */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <ThemedText variant="labelLarge" style={styles.label}>
          Account Information
        </ThemedText>
        
        <ThemedText variant="bodySmall" colorName="textSecondary" style={styles.fieldLabel}>First Name</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="Enter your first name"
          placeholderTextColor={theme.textMuted}
          value={firstName}
          onChangeText={setFirstName}
        />
        
        <ThemedText variant="bodySmall" colorName="textSecondary" style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Last Name</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="Enter your last name"
          placeholderTextColor={theme.textMuted}
          value={lastName}
          onChangeText={setLastName}
        />

        <ThemedText variant="bodySmall" colorName="textSecondary" style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Username</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="Choose a username"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <ThemedText variant="bodySmall" colorName="textSecondary" style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Email Address</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="Enter your email"
          placeholderTextColor={theme.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <ThemedText variant="bodySmall" colorName="textSecondary" style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Department</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="e.g. Computer Engineering"
          placeholderTextColor={theme.textMuted}
          value={department}
          onChangeText={setDepartment}
        />

        <ThemedText variant="bodySmall" colorName="textSecondary" style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Graduation Year</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.outlineVariant },
          ]}
          placeholder="e.g. 2025"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={graduationYear}
          onChangeText={setGraduationYear}
        />
      </View>

      {/* Provider Section Header */}
      <Pressable 
        style={[styles.providerHeader, { backgroundColor: theme.surface }]} 
        onPress={() => setIsProviderExpanded(!isProviderExpanded)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <ThemedIcon name="briefcase-account-outline" size={24} colorName={isProviderExpanded ? 'primary' : 'text'} />
          <ThemedText variant="titleMedium" style={{ fontWeight: 'bold' }}>
            {user?.canOfferServices ? "Provider Information" : "Upgrade to a Provider"}
          </ThemedText>
        </View>
        <ThemedIcon name={isProviderExpanded ? 'chevron-up' : 'chevron-down'} size={24} colorName="textSecondary" />
      </Pressable>

      {/* Provider Section Content */}
      {isProviderExpanded && (
        <Animated.View entering={FadeInDown.duration(300)} style={[styles.card, { backgroundColor: theme.surface, marginTop: Spacing.sm }]}>
          <ThemedText variant="bodySmall" colorName="textSecondary" style={styles.fieldLabel}>Bio</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: theme.text, borderColor: theme.outlineVariant },
            ]}
            placeholder="Tell us about yourself and what you offer..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
          />

          <ThemedText variant="bodySmall" colorName="textSecondary" style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Your Subcategories</ThemedText>
          <View style={styles.skillInputContainer}>
            <Pressable
              style={[styles.input, { flex: 1, justifyContent: 'center', borderColor: theme.outlineVariant }]}
              onPress={() => setSubcategoryModalVisible(true)}
            >
              <ThemedText colorName="textMuted">
                Tap the + to add a service category...
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.addSkillButton, { backgroundColor: theme.primary }]}
              onPress={() => setSubcategoryModalVisible(true)}
            >
              <ThemedIcon name="plus" size={24} lightColor="#fff" darkColor="#fff" />
            </Pressable>
          </View>
          {selectedSubcategories.length > 0 && (
            <View style={styles.skillsList}>
              {selectedSubcategories.map((skill, index) => (
                <View key={index} style={[styles.skillChip, { backgroundColor: theme.primaryContainer }]}>
                  <ThemedText variant="labelMedium" colorName="onPrimaryContainer">{skill}</ThemedText>
                  <Pressable onPress={() => handleRemoveSubcategory(skill)} style={styles.removeSkillBtn}>
                    <ThemedIcon name="close" size={16} colorName="onPrimaryContainer" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {groupedTags.length > 0 && (
            <View style={{ marginTop: Spacing.md }}>
              <ThemedText variant="bodySmall" colorName="textSecondary" style={styles.fieldLabel}>Select Tags (Skills)</ThemedText>
              
              {groupedTags.map((group, groupIndex) => (
                <View key={groupIndex} style={{ marginTop: Spacing.sm }}>
                  <ThemedText variant="labelMedium" colorName="textSecondary" style={{ marginBottom: Spacing.xs }}>
                    {group.subcategory}
                  </ThemedText>
                  <View style={styles.skillsList}>
                    {group.tags.map((tag, tagIndex) => {
                      const isSelected = skills.includes(tag);
                      return (
                        <Pressable 
                          key={tagIndex} 
                          style={[
                            styles.skillChip, 
                            { 
                              backgroundColor: isSelected ? theme.primary : theme.surfaceVariant,
                              borderColor: isSelected ? theme.primary : theme.outlineVariant,
                              borderWidth: 1,
                            }
                          ]}
                          onPress={() => toggleSkill(tag)}
                        >
                          <ThemedText 
                            variant="labelMedium" 
                            colorName={isSelected ? "onPrimary" : "text"}
                          >
                            {tag}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}

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

      {/* Custom Subcategory Modal */}
      <Modal
        visible={isSubcategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSubcategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSubcategoryModalVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <ThemedText variant="titleLarge" style={{ fontWeight: 'bold' }}>Select a Subcategory</ThemedText>
              <Pressable onPress={() => setSubcategoryModalVisible(false)}>
                <ThemedIcon name="close" size={24} colorName="textSecondary" />
              </Pressable>
            </View>
            <ThemedText variant="bodyMedium" colorName="textMuted" style={{ marginBottom: Spacing.md }}>
              We will automatically place you in the correct main category.
            </ThemedText>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {allSubcategories.map((option, index) => (
                <Pressable 
                  key={index} 
                  style={[styles.modalOption, { borderBottomColor: theme.outlineVariant }]}
                  onPress={() => handleAddSubcategoryFromModal(option.label, option.categoryId)}
                >
                  <View>
                    <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>{option.label}</ThemedText>
                    <ThemedText variant="bodySmall" colorName="textSecondary">{option.categoryTitle}</ThemedText>
                  </View>
                  {skills.includes(option.label) && (
                    <ThemedIcon name="check" size={20} colorName="primary" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  fieldLabel: {
    marginBottom: 4,
    fontWeight: '600',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addSkillButton: {
    width: 55,
    height: 55,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  removeSkillBtn: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
