import React, { useState } from 'react';
import { StyleSheet, View, Pressable, TextInput, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { user, token, signIn, signOut, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const isProfileIncomplete = !user?.bio || !user?.skillTags || user.skillTags.length === 0;

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setIsLoggingIn(true);
        try {
            await signIn(email, password);
        } catch (error) {
            Alert.alert('Login Failed', 'Invalid credentials or server error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!token) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loginContainer}>
                    <View style={[styles.loginCard, { backgroundColor: theme.surface }]}>
                        <ThemedText style={styles.loginHeader}>PuConnect</ThemedText>
                        <ThemedText style={styles.loginSub}>The Campus Talent Marketplace</ThemedText>

                        <View style={styles.form}>
                            <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Ionicons name="mail-outline" size={20} color={theme.textMuted} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="University Email"
                                    placeholderTextColor={theme.textMuted}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Password"
                                    placeholderTextColor={theme.textMuted}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            <Pressable
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={handleLogin}
                                disabled={isLoggingIn}
                            >
                                <ThemedText style={styles.buttonText}>{isLoggingIn ? 'Verifying...' : 'Sign In'}</ThemedText>
                            </Pressable>

                            <ThemedText style={styles.forgotPass}>Forgot password?</ThemedText>
                        </View>
                    </View>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Profile Header Card */}
                <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.headerInfo}>
                        <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
                            {user?.profilePictureUrl ? (
                                <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                            ) : (
                                <ThemedText style={styles.avatarPlaceholder}>
                                    {user?.fullName?.charAt(0)}
                                </ThemedText>
                            )}
                            {user?.verifiedStudent && (
                                <View style={[styles.verifiedBadge, { backgroundColor: theme.secondary }]}>
                                    <Ionicons name="checkmark" size={12} color="#fff" />
                                </View>
                            )}
                        </View>

                        <View style={styles.userNameContainer}>
                            <ThemedText style={styles.userName}>{user?.fullName || 'Campus Pro'}</ThemedText>
                            <ThemedText style={[styles.userMajor, { color: theme.textSecondary }]}>
                                {user?.department || 'Student'} • Class of {user?.graduationYear || '2027'}
                            </ThemedText>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color={theme.accent} />
                                <ThemedText style={styles.ratingText}>{user?.reputationScore || '0.0'} Reputation</ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsOverview}>
                        <View style={styles.statBox}>
                            <ThemedText style={[styles.statNum, { color: theme.primary }]}>{user?.completedProjects || 0}</ThemedText>
                            <ThemedText style={[styles.statLab, { color: theme.textMuted }]}>Projects</ThemedText>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.statBox}>
                            <ThemedText style={[styles.statNum, { color: theme.secondary }]}>0</ThemedText>
                            <ThemedText style={[styles.statLab, { color: theme.textMuted }]}>Reviews</ThemedText>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.statBox}>
                            <View style={[styles.statusDot, { backgroundColor: user?.isAvailable ? theme.secondary : theme.textMuted }]} />
                            <ThemedText style={[styles.statLab, { color: theme.textMuted }]}>{user?.isAvailable ? 'Available' : 'Busy'}</ThemedText>
                        </View>
                    </View>

                    <Link href="/(tabs)/onboarding" asChild>
                        <Pressable style={[styles.editBtn, { borderColor: theme.border }]}>
                            <ThemedText style={[styles.editBtnText, { color: theme.textSecondary }]}>Edit Portfolio Profile</ThemedText>
                        </Pressable>
                    </Link>
                </View>

                {isProfileIncomplete && (
                    <Link href="/(tabs)/onboarding" asChild>
                        <Pressable style={[styles.alertBanner, { backgroundColor: theme.primary + '11', borderColor: theme.primary }]}>
                            <Ionicons name="flash" size={20} color={theme.primary} />
                            <ThemedText style={[styles.alertText, { color: theme.primary }]}>Complete your profile to unlock more opportunities</ThemedText>
                            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                        </Pressable>
                    </Link>
                )}

                {/* About Section */}
                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>About</ThemedText>
                </View>
                <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
                    <ThemedText style={[styles.bioText, { color: theme.textSecondary }]}>
                        {user?.bio || 'Professional university student looking to collaborate and offer skills to the campus community.'}
                    </ThemedText>
                </View>

                {/* Skills Section */}
                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>Top Skills</ThemedText>
                </View>
                <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.skillsList}>
                        {user?.skillTags && user.skillTags.length > 0 ? (
                            user.skillTags.map(tag => (
                                <View key={tag} style={[styles.skillTag, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                    <ThemedText style={styles.skillTagText}>{tag}</ThemedText>
                                </View>
                            ))
                        ) : (
                            <ThemedText style={{ color: theme.textMuted }}>No skills added yet.</ThemedText>
                        )}
                    </View>
                </View>

                {/* Menu Options */}
                <View style={styles.menuContainer}>
                    <Pressable style={[styles.menuItem, { backgroundColor: theme.surface }]}>
                        <View style={[styles.menuIcon, { backgroundColor: '#e0e7ff' }]}>
                            <Ionicons name="briefcase-outline" size={20} color={theme.primary} />
                        </View>
                        <ThemedText style={styles.menuText}>My Active Services</ThemedText>
                        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    </Pressable>

                    <Pressable style={[styles.menuItem, { backgroundColor: theme.surface }]}>
                        <View style={[styles.menuIcon, { backgroundColor: '#dcfce7' }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={theme.secondary} />
                        </View>
                        <ThemedText style={styles.menuText}>Trust & Verification</ThemedText>
                        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    </Pressable>

                    <Pressable style={[styles.menuItem, { backgroundColor: theme.surface }]}>
                        <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                            <Ionicons name="settings-outline" size={20} color={theme.accent} />
                        </View>
                        <ThemedText style={styles.menuText}>Account Settings</ThemedText>
                        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    </Pressable>

                    <Pressable style={[styles.menuItem, { backgroundColor: theme.surface }]} onPress={signOut}>
                        <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}>
                            <Ionicons name="log-out-outline" size={20} color={theme.error} />
                        </View>
                        <ThemedText style={[styles.menuText, { color: theme.error }]}>Log Out</ThemedText>
                        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    </Pressable>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    loginCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        ...Shadows.medium,
    },
    loginHeader: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 4,
    },
    loginSub: {
        textAlign: 'center',
        opacity: 0.6,
        marginBottom: 32,
        fontSize: 14,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    button: {
        height: 56,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    forgotPass: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 12,
        opacity: 0.6,
    },
    profileCard: {
        marginTop: 60,
        marginHorizontal: Spacing.md,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        ...Shadows.medium,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#f1f5f9',
    },
    avatarImage: {
        width: 76,
        height: 76,
        borderRadius: 38,
    },
    avatarPlaceholder: {
        fontSize: 32,
        fontWeight: '700',
        color: '#94a3b8',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userNameContainer: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 2,
    },
    userMajor: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4,
    },
    statsOverview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: Spacing.md,
    },
    statBox: {
        alignItems: 'center',
    },
    statNum: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLab: {
        fontSize: 12,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 24,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 4,
    },
    editBtn: {
        height: 44,
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    alertText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        marginHorizontal: 10,
    },
    sectionHeader: {
        marginTop: Spacing.lg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    contentCard: {
        marginHorizontal: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...Shadows.small,
    },
    bioText: {
        fontSize: 14,
        lineHeight: 20,
    },
    skillsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    skillTagText: {
        fontSize: 13,
        fontWeight: '500',
    },
    menuContainer: {
        marginTop: Spacing.xl,
        marginHorizontal: Spacing.md,
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: BorderRadius.lg,
        ...Shadows.small,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
});
