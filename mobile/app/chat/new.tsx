import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';
import { useExploreStore } from '../../store/exploreStore';
import { useAuthStore } from '../../store';
import { ExploreProvider } from '../../types/explore';

export default function NewChatScreen() {
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { providers, isLoading, fetchExploreData } = useExploreStore();
  const currentUser = useAuthStore((s) => s.user);

  const screenBg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const mutedColor = isDark ? '#A1A1AA' : '#71717A';

  const filteredProviders = useMemo(() => {
    const filtered = providers.filter(p => p.username !== currentUser?.username);
    if (!query.trim()) return filtered;
    const lowerQuery = query.toLowerCase();
    return filtered.filter(p => 
      p.displayName.toLowerCase().includes(lowerQuery) || 
      p.username.toLowerCase().includes(lowerQuery)
    );
  }, [providers, query, currentUser?.username]);

  useEffect(() => {
    fetchExploreData();
  }, [fetchExploreData]);

  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  const handleSelectUser = useCallback((provider: ExploreProvider) => {
    
    router.push(`/chat/${provider.username}` as any);
  }, [router]);

  const handleBack = useCallback(() => {
    
    router.back();
  }, [router]);

  const renderUserItem = useCallback(({ item }: { item: ExploreProvider }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleSelectUser(item)}
      activeOpacity={0.7}
    >
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '20' }]}>
          <Ionicons name="person" size={24} color={Colors.primary} />
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: textColor }]}>
          {item.displayName || item.username}
        </Text>
        <Text style={[styles.userHandle, { color: mutedColor }]}>
          @{item.username}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={mutedColor} />
    </TouchableOpacity>
  ), [textColor, mutedColor, Colors.primary, handleSelectUser]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>New Message</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>New Message</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: cardBg }]}>
          <Ionicons name="search-outline" size={20} color={mutedColor} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search providers..."
            placeholderTextColor={mutedColor}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={mutedColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredProviders.length > 0 ? (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item.username}
          renderItem={renderUserItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : query.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={mutedColor} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No providers found</Text>
          <Text style={[styles.emptyText, { color: mutedColor }]}>Try a different search term</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="create-outline" size={48} color={mutedColor} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>Start a new conversation</Text>
          <Text style={[styles.emptyText, { color: mutedColor }]}>Search for a provider to message</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: '500',
    paddingVertical: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  userHandle: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
});
