import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks';

export default function PostsScreen() {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = isDark ? '#09090B' : '#F4F4F5';

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: Colors.text }]}>Posts</Text>
      <Text style={[styles.subtitle, { color: Colors.text }]}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
});
