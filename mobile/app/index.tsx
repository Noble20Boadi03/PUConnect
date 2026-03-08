import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/auth-context";

const { width, height } = Dimensions.get("window");

const TESTIMONIALS = [
  {
    name: "Alex M.",
    role: "Developer",
    text: "Earned 200+ for a React tutoring session in one week!",
  },
  {
    name: "Sarah L.",
    role: "Designer",
    text: "Found a great project team for my senior capstone.",
  },
  {
    name: "Jason K.",
    role: "Tutor",
    text: "Highest-rated tutor on campus thanks to PuConnect!",
  },
];

export default function LandingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // Animation values for floating effect
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);

  useEffect(() => {
    float1.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 3000 }),
        withTiming(0, { duration: 3000 }),
      ),
      -1,
      true,
    );
    float2.value = withRepeat(
      withDelay(
        500,
        withSequence(
          withTiming(-20, { duration: 4000 }),
          withTiming(0, { duration: 4000 }),
        ),
      ),
      -1,
      true,
    );
  }, []);

  const float1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }, { translateX: float1.value / 2 }],
  }));

  const float2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: float2.value },
      {
        scale: interpolate(float2.value, [-20, 0], [1.1, 1], Extrapolate.CLAMP),
      },
    ],
  }));

  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.replace("/(tabs)/home");
    } else {
      router.push("/login");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Background Gradient */}
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glowing Decorative Orbs */}
      <Animated.View
        style={[
          styles.orb,
          {
            top: height * 0.1,
            left: -50,
            backgroundColor: theme.primary + "33",
          },
          float1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          {
            bottom: height * 0.2,
            right: -100,
            width: 400,
            height: 400,
            backgroundColor: theme.accent + "22",
          },
          float2Style,
        ]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo & Header */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          style={styles.header}
        >
          <View style={styles.logoBadge}>
            <Ionicons name="flash-sharp" size={28} color={theme.accent} />
          </View>
          <Text style={styles.brandName}>PuConnect</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BETA</Text>
          </View>
        </Animated.View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Animated.Text
            entering={FadeInDown.duration(1000).delay(400)}
            style={styles.heroTitle}
          >
            Where <Text style={{ color: theme.accent }}>Talent</Text>
            {"\n"}
            Meets <Text style={{ color: theme.primary }}>Campus</Text>
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(1000).delay(600)}
            style={styles.heroSubtitle}
          >
            The exclusive digital marketplace for verified university students
            to collaborate, earn, and build their professional legacy.
          </Animated.Text>
        </View>

        {/* Stats Section */}
        <Animated.View
          entering={FadeIn.duration(1000).delay(800)}
          style={styles.statsContainer}
        >
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1.2K+</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>450+</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </Animated.View>

        {/* Social Proof / Testimonials */}
        <View style={styles.testimonialsSection}>
          <Animated.Text
            entering={FadeIn.delay(1000)}
            style={styles.sectionTitle}
          >
            Success Stories
          </Animated.Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialScroll}
            snapToInterval={width * 0.8 + 15}
            decelerationRate="fast"
          >
            {TESTIMONIALS.map((t, i) => (
              <Animated.View
                key={i}
                entering={FadeInRight.delay(1200 + i * 200)}
                style={[
                  styles.testimonialCard,
                  {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={24}
                  color={theme.accent}
                  style={{ marginBottom: 10 }}
                />
                <Text style={styles.testimonialText}>{t.text}</Text>
                <View style={styles.testimonialFooter}>
                  <View style={styles.miniAvatar}>
                    <Text style={{ color: "#fff", fontSize: 10 }}>
                      {t.name[0]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.testimonialName}>{t.name}</Text>
                    <Text style={styles.testimonialRole}>{t.role}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Key Pillars */}
        <View style={styles.pillarsGrid}>
          {[
            { icon: "shield-checkmark", title: "Verified", color: "#10b981" },
            { icon: "lock-closed", title: "Secure", color: "#3b82f6" },
            { icon: "rocket", title: "Campus-Fast", color: "#f59e0b" },
          ].map((p, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.duration(600).delay(1800 + i * 100)}
              style={styles.pillarItem}
            >
              <View
                style={[styles.pillarIcon, { backgroundColor: p.color + "22" }]}
              >
                <Ionicons name={p.icon as any} size={24} color={p.color} />
              </View>
              <Text style={styles.pillarTitle}>{p.title}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Action Footer */}
        <View style={styles.footer}>
          <Animated.View entering={FadeInUp.duration(1000).delay(2200)}>
            <Pressable
              style={({ pressed }) => [
                styles.ctaButton,
                {
                  backgroundColor: theme.accent,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={handleGetStarted}
            >
              <Text style={styles.ctaText}>Join the Marketplace</Text>
              <Ionicons name="arrow-forward" size={24} color="#0f172a" />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(1000).delay(2400)}
            style={styles.footerLinksSection}
          >
            <Text style={styles.footerNote}>Already have an account? </Text>
            <Pressable
              onPress={() => router.push("/login")}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.footerLinkTextSection, { color: theme.accent }]}>
                Log In
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

// Custom animation helper has been replaced by built-in FadeInRight

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 60,
  },
  orb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 40,
    gap: 12,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  brandName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  badgeText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "900",
  },
  hero: {
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 54,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 60,
    letterSpacing: -2,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.6)",
    marginTop: 20,
    lineHeight: 28,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    marginBottom: 50,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  testimonialsSection: {
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginLeft: 30,
    marginBottom: 20,
  },
  testimonialScroll: {
    paddingHorizontal: 30,
    gap: 15,
  },
  testimonialCard: {
    width: width * 0.8,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  testimonialText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 20,
  },
  testimonialFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  testimonialName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  testimonialRole: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
  pillarsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    marginBottom: 60,
  },
  pillarItem: {
    alignItems: "center",
    gap: 10,
  },
  pillarIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pillarTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  ctaButton: {
    width: width - 60,
    height: 74,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    ...Shadows.medium,
  },
  ctaText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  footerNote: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: "700",
  },
  footerDivider: {
    color: "rgba(255,255,255,0.4)",
  },
  footerLinksSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerLinkTextSection: {
    fontSize: 15,
    fontWeight: "700",
  },
  footerDividerSection: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#fff",
  },
});
