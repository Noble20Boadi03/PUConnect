import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function LandingScreen() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  if (showSplash) {
    return (
      <Animated.View exiting={FadeOut.duration(500)} style={styles.splashContainer}>
        <Animated.Image
          entering={FadeIn.duration(800)}
          source={require("../assets/images/puconnect_logo.png")}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/puconnect_logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Pressable style={styles.languageButton}>
          <Ionicons name="language-outline" size={16} color="#666" />
          <Text style={styles.languageText}>English</Text>
        </Pressable>
      </View>

      {/* Illustration */}
      <Animated.View 
        entering={FadeInDown.delay(200).duration(800)}
        style={styles.illustrationContainer}
      >
        <Image
          source={require("../assets/images/puconnect_illustration.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.Text 
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.title}
        >
          Welcome to PuConnect!
        </Animated.Text>
        <Animated.Text 
          entering={FadeInDown.delay(500).duration(800)}
          style={styles.subtitle}
        >
          The campus marketplace for university students to collaborate, earn, and build together.
        </Animated.Text>

        {/* Carousel indicators */}
        <View style={styles.carouselContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Animated.View entering={FadeInDown.delay(700).duration(800)}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { opacity: pressed ? 0.9 : 1 }
            ]}
            onPress={handleGetStarted}
          >
            <Text style={styles.primaryButtonText}>Access Your Account</Text>
          </Pressable>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.delay(900).duration(800)}
          style={styles.footerLinks}
        >
          <Text style={styles.footerNote}>Don't have an account? </Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text style={styles.signupText}>Signup</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogo: {
    width: width * 0.6,
    height: 100,
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    height: 60,
  },
  headerLogo: {
    width: 100,
    height: 30,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  languageText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  illustration: {
    width: width * 0.85,
    height: height * 0.35,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  carouselContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#eee",
  },
  activeDot: {
    width: 16,
    backgroundColor: "#1a1a1a",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#1a1a1a",
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerNote: {
    color: "#888",
    fontSize: 14,
  },
  signupText: {
    color: "#1a1a1a",
    fontSize: 14,
    fontWeight: "700",
  },
});
