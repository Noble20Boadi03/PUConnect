import React from 'react';
import { StyleSheet, View, Text, Image, SafeAreaView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks';
import { Spacing, Typography } from '../constants';
import { Button } from '../components';

export default function LandingPage() {
  const router = useRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: Colors.primary }]}>PU</Text>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: Colors.border + '40' }]}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={colorScheme === 'dark' ? 'sunny' : 'moon'} 
            size={22} 
            color={Colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <Image
          source={require('../assets/images/welcome-hero.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={[styles.gradientOverlay, { backgroundColor: Colors.background + '20' }]} />
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: Colors.text }]}>
          Welcome to{'\n'}
          <Text style={{ color: Colors.primary }}>PuConnect!</Text>
        </Text>
        <Text style={[styles.subtitle, { color: Colors.icon }]}>
          The campus marketplace to collaborate, earn, and build together.
        </Text>

        {/* Footer / Navigation */}
        <View style={styles.footer}>
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {[1, 2, 3, 4].map((i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { backgroundColor: i === 1 ? Colors.primary : Colors.border }
                ]} 
              />
            ))}
          </View>

          {/* Next Button */}
          <Button
            title="Next"
            variant="ghost"
            rightIcon={<Ionicons name="arrow-forward" size={18} color={Colors.primary} />}
            onPress={() => {
              // Navigation logic for next onboarding screen
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  logo: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold as any,
    letterSpacing: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    width: '100%',
    height: '45%',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.size.title,
    fontWeight: Typography.weight.bold as any,
    lineHeight: 40,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.size.md,
    lineHeight: 24,
    fontWeight: Typography.weight.regular as any,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
