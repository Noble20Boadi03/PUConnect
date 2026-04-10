import React, { useState } from 'react';
import { StyleSheet, View, Pressable, TextInput, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedInput } from '@/components/ui/animated-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
    const { user, token, signIn, signOut, isLoading } = useAuth();
    const { theme, setMode, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isProfileIncomplete = !user?.bio || !user?.skillTags || user.skillTags.length === 0;

    const handleLogin = async () => {
        // BYPASS AUTH CHECKS FOR TESTING
        /*
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        */

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
                            <AnimatedInput
                                label="University Email"
                                iconName="mail-outline"
                                placeholder="name@university.edu"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                delay={200}
                            />

                            <AnimatedInput
                                label="Password"
                                iconName="lock-closed-outline"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                isPassword={true}
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword(!showPassword)}
                                delay={300}
                                marginTop={20}
                            />

                            <PrimaryButton
                                title="Sign In"
                                onPress={handleLogin}
                                isLoading={isLoggingIn}
                                delay={500}
                                marginTop={20}
                            />

                            <Animated.View entering={FadeInDown.delay(600).duration(800)}>
                                <ThemedText style={styles.forgotPass}>Forgot password?</ThemedText>
                            </Animated.View>
                        </View>
                    </View>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60, paddingTop: insets.top }}>
                {/* Profile Header Card */}
                <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.headerInfo}>
                        <Link href="/(tabs)/onboarding" asChild>
                            <Pressable style={[styles.avatarContainer, { borderColor: theme.primary, backgroundColor: theme.background }]}>
                                {user?.profilePictureUrl ? (
                                    <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                                ) : (
                                    <ThemedText style={[styles.avatarPlaceholder, { color: theme.textMuted }]}>
                                        {user?.fullName?.charAt(0)}
                                    </ThemedText>
                                )}
                                {user?.verifiedStudent && (
                                    <View style={[styles.verifiedBadge, { backgroundColor: theme.secondary, borderColor: theme.surface }]}>
                                        <Ionicons name="checkmark" size={12} color="#fff" />
                                    </View>
                                )}
                                <View style={[styles.editBadge, { backgroundColor: theme.primary, borderColor: theme.surface }]}>
                                    <Ionicons name="camera" size={10} color="#fff" />
                                </View>
                            </Pressable>
                        </Link>

                        <View style={styles.userNameContainer}>
                            <ThemedText style={styles.userName}>{user?.fullName || 'Campus Pro'}</ThemedText>
                            <ThemedText style={[styles.userMajor, { color: theme.textSecondary }]}>
                                {user?.department || 'Student'} • Class of {user?.graduationYear || '2027'}
                            </ThemedText>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color={theme.accent} />
                                <ThemedText style={[styles.ratingText, { color: theme.text }]}>{user?.reputationScore || '0.0'} Reputation</ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.statsOverview, { borderColor: theme.border }]}>
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
                                    <ThemedText style={[styles.skillTagText, { color: theme.text }]}>{tag}</ThemedText>
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

                    <Pressable 
                        style={[styles.menuItem, { backgroundColor: theme.surface }]}
                        onPress={() => setMode(isDark ? 'light' : 'dark')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: isDark ? '#334155' : '#fef3c7' }]}>
                            <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? "#94a3b8" : "#f59e0b"} />
                        </View>
                        <ThemedText style={styles.menuText}>{isDark ? 'Dark Mode' : 'Light Mode'}</ThemedText>
                        <Ionicons name={isDark ? "toggle" : "toggle-outline"} size={28} color={isDark ? theme.primary : "#cbd5e1"} />
                    </Pressable>

                    <Pressable style={[styles.menuItem, { backgroundColor: theme.surface }]}>
                        <View style={[styles.menuIcon, { backgroundColor: isDark ? '#1e293b' : '#fef3c7' }]}>
                            <Ionicons name="settings-outline" size={20} color={theme.accent} />
                        </View>
                        <ThemedText style={styles.menuText}>Account Settings</ThemedText>
                        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    </Pressable>

                    <Pressable style={[styles.menuItem, { backgroundColor: theme.surface }]} onPress={signOut}>
                        <View style={[styles.menuIcon, { backgroundColor: isDark ? '#1e293b' : '#fee2e2' }]}>
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
        marginTop: Spacing.md,
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
    },
    avatarImage: {
        width: 76,
        height: 76,
        borderRadius: 38,
    },
    avatarPlaceholder: {
        fontSize: 32,
        fontWeight: '700',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    editBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
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
