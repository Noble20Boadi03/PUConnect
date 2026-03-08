import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ListingType } from '@/types';

import { LISTING_CATEGORIES } from '@/constants/categories';

export default function CreateScreen() {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [budget, setBudget] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(LISTING_CATEGORIES[0].value);
    const [type, setType] = useState<ListingType>('service_offer');
    const [skills, setSkills] = useState('');

    const { token } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleCreate = async () => {
        if (!token) {
            Alert.alert('Error', 'You must be logged in to post.');
            return;
        }

        if (!title || !description) {
            Alert.alert('Error', 'Please fill in the title and description.');
            return;
        }

        try {
            await api.createListing({
                title,
                price: price ? parseFloat(price) : undefined,
                budget: budget ? parseFloat(budget) : undefined,
                description,
                category,
                type,
                requiredSkills: skills.split(',').map(s => s.trim()).filter(s => s !== ''),
            }, token);

            Alert.alert('Success', 'Posted successfully!', [
                { text: 'Great', onPress: () => router.push('/(tabs)/home') }
            ]);
        } catch (error) {
            console.error('Failed to create listing:', error);
            Alert.alert('Error', 'Failed to post. Please check your connection.');
        }
    };

    const renderTypeSelector = () => (
        <View style={styles.typeRow}>
            {(['service_offer', 'service_request', 'project_team'] as ListingType[]).map((t) => (
                <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    style={[
                        styles.typeChip,
                        { backgroundColor: type === t ? theme.primary : theme.surface, borderColor: theme.border },
                        type === t && { borderColor: theme.primary }
                    ]}
                >
                    <Ionicons
                        name={t === 'service_offer' ? 'briefcase' : t === 'service_request' ? 'help-circle' : 'people'}
                        size={20}
                        color={type === t ? '#fff' : theme.textSecondary}
                    />
                    <Text style={[styles.typeText, { color: type === t ? '#fff' : theme.textSecondary }]}>
                        {t === 'service_offer' ? 'Offer' : t === 'service_request' ? 'Request' : 'Team'}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>New Listing</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Build your campus reputation</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>What kind of post?</Text>
                        {renderTypeSelector()}
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="e.g. Advanced React Tutoring"
                            placeholderTextColor={theme.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                        <View style={styles.categoryGrid}>
                            {LISTING_CATEGORIES.map(cat => (
                                <Pressable
                                    key={cat.value}
                                    onPress={() => setCategory(cat.value)}
                                    style={[
                                        styles.catChip,
                                        { backgroundColor: category === cat.value ? theme.primary + '11' : 'transparent', borderColor: category === cat.value ? theme.primary : theme.border }
                                    ]}
                                >
                                    <Text style={[styles.catText, { color: category === cat.value ? theme.primary : theme.textSecondary }]}>{cat.emoji} {cat.label}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Detail what you're offering or looking for..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Required Skills (Comma separated)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Python, UI/UX, Teaching..."
                            placeholderTextColor={theme.textMuted}
                            value={skills}
                            onChangeText={setSkills}
                        />

                        <View style={styles.pricingRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text }]}>
                                    {type === 'service_request' ? 'Budget ($)' : 'Price ($)'}
                                </Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                    placeholder="Optional"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="decimal-pad"
                                    value={type === 'service_request' ? budget : price}
                                    onChangeText={type === 'service_request' ? setBudget : setPrice}
                                />
                            </View>
                        </View>
                    </View>

                    <Pressable
                        style={[styles.submitButton, { backgroundColor: theme.primary }]}
                        onPress={handleCreate}
                    >
                        <Text style={styles.submitButtonText}>Publish to Campus</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    section: {
        marginBottom: Spacing.lg,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: Spacing.sm,
    },
    typeChip: {
        flex: 1,
        height: 60,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        ...Shadows.small,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    card: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...Shadows.medium,
        marginBottom: Spacing.xl,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    input: {
        height: 50,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        marginBottom: Spacing.md,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: Spacing.md,
    },
    catChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    catText: {
        fontSize: 12,
        fontWeight: '600',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    pricingRow: {
        flexDirection: 'row',
        gap: 16,
    },
    submitButton: {
        height: 60,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.medium,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
