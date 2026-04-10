import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Pressable, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

type Message = {
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
    type: 'text' | 'card';
    cardData?: {
        company: string;
        industry: string;
        title: string;
        salary: string;
        type: string;
        location: string;
        date: string;
    };
};

export default function ChatScreen() {
    const { id, listingId } = useLocalSearchParams<{ id: string, listingId?: string }>();
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [inputText, setInputText] = useState('');
    
    // Mocking messages to match the requested image UI
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            timestamp: 'Tue, Aug 19 at 2:16 PM',
            text: '',
            senderId: 'time-separator',
            type: 'text'
        },
        {
            id: '2',
            text: 'Hi Devon,\n\nSaw your profile, and it looks like your qualifications and experience are a good match for our Brand Partnerships position.',
            senderId: 'nina',
            timestamp: '2:16 PM',
            type: 'text'
        },
        {
            id: '3',
            text: '',
            senderId: 'nina',
            timestamp: '2:16 PM',
            type: 'card',
            cardData: {
                company: 'Saral Software',
                industry: 'Technology',
                title: 'Brand Partnerships Manager',
                salary: '$95–$115K/yr',
                type: 'Full-time job',
                location: 'Raleigh, NC (Hybrid)',
                date: '4 days ago'
            }
        },
        {
            id: '4',
            text: 'Thank you Nina!\n\nCan we find time to chat? I would love to dive deeper into this role.',
            senderId: user?.id || 'me',
            timestamp: '2:45 PM',
            type: 'text'
        }
    ]);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            senderId: user?.id || 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
        };
        
        setMessages([...messages, newMessage]);
        setInputText('');
    };

    return (
        <ScreenLayout 
            scrollable={false} 
            keyboardAvoiding 
            padding="none" 
            withSafeArea={false}
        >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.outlineVariant, paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <ThemedIcon name="chevron-left" size={28} />
                </Pressable>
                
                <View style={styles.headerInfo}>
                    <ThemedText variant="titleMedium" style={styles.headerName}>Nina Patel</ThemedText>
                    <ThemedText variant="labelSmall" colorName="textMuted">Talent Recruiter @ Saral Software</ThemedText>
                </View>
                
                <Pressable>
                    <ThemedText variant="labelLarge" style={styles.muteBtn}>Mute</ThemedText>
                </Pressable>
            </View>

            {/* Chat Content */}
            <ScrollView 
                style={styles.chatList}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((item) => {
                    if (item.senderId === 'time-separator') {
                        return (
                            <ThemedText key={item.id} variant="labelSmall" colorName="textMuted" style={styles.timeSeparator}>
                                {item.timestamp}
                            </ThemedText>
                        );
                    }

                    const isMe = item.senderId === user?.id || item.senderId === 'me';
                    
                    if (item.type === 'card' && item.cardData) {
                        return (
                            <View key={item.id} style={styles.cardWrapper}>
                                <View style={[
                                    styles.jobCard, 
                                    { 
                                        backgroundColor: theme.surface, 
                                        borderLeftColor: theme.primary,
                                        borderColor: theme.outlineVariant 
                                    }
                                ]}>
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.companyLogo, { backgroundColor: '#f97316' }]}>
                                            <ThemedIcon name="apps" size={20} lightColor="#fff" darkColor="#fff" />
                                        </View>
                                        <View>
                                            <ThemedText variant="titleSmall" style={styles.companyName}>{item.cardData.company}</ThemedText>
                                            <ThemedText variant="labelSmall" colorName="textMuted">{item.cardData.industry}</ThemedText>
                                        </View>
                                    </View>
                                    <ThemedText variant="titleMedium" style={styles.jobTitle}>{item.cardData.title}</ThemedText>
                                    <ThemedText variant="bodySmall" colorName="textSecondary" style={styles.jobMeta}>
                                        {item.cardData.salary} • {item.cardData.type}
                                    </ThemedText>
                                    <ThemedText variant="labelSmall" colorName="textMuted" style={styles.jobLocation}>
                                        {item.cardData.location} • {item.cardData.date}
                                    </ThemedText>
                                </View>
                            </View>
                        );
                    }

                    return (
                        <View key={item.id} style={[styles.messageWrapper, isMe ? styles.myMessage : styles.theirMessage]}>
                            {!isMe && (
                                <View style={styles.avatar}>
                                    <Image 
                                        source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' }} 
                                        style={styles.avatarImg} 
                                    />
                                </View>
                            )}
                            <View style={[
                                styles.bubble, 
                                isMe ? 
                                    { backgroundColor: isDark ? theme.primaryContainer : theme.primaryContainer } : 
                                    { backgroundColor: theme.surfaceVariant }
                            ]}>
                                <ThemedText 
                                    variant="bodyLarge" 
                                    colorName={isMe ? "onPrimaryContainer" : "onSurfaceVariant"}
                                    style={styles.messageText}
                                >
                                    {item.text}
                                </ThemedText>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Input Area */}
            <View style={[
                styles.inputContainer, 
                { borderTopColor: theme.outlineVariant, paddingBottom: insets.bottom + 12 }
            ]}>
                <Pressable style={styles.attachBtn}>
                    <ThemedIcon name="plus" size={24} colorName="textMuted" />
                </Pressable>
                <TextInput
                    style={[
                        styles.input, 
                        { 
                            color: theme.text, 
                            backgroundColor: theme.surfaceVariant, 
                            borderColor: theme.outlineVariant, 
                            borderWidth: 1 
                        }
                    ]}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.textMuted}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <Pressable 
                    style={[styles.sendBtn, { opacity: inputText.trim() ? 1 : 0.5 }]} 
                    onPress={handleSendMessage}
                >
                    <ThemedIcon name="send" size={20} colorName="primary" />
                </Pressable>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerName: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSub: {
        fontSize: 12,
        marginTop: 2,
    },
    muteBtn: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 10,
    },
    chatList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: 20,
    },
    timeSeparator: {
        textAlign: 'center',
        fontSize: 12,
        marginVertical: 24,
        fontWeight: '500',
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '85%',
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    cardWrapper: {
        alignSelf: 'flex-start',
        width: '85%',
        marginBottom: 16,
        paddingLeft: 44, // Align with bubble text
    },
    jobCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderLeftWidth: 4,
        ...Shadows.level1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    companyLogo: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    companyName: {
        fontSize: 15,
        fontWeight: '700',
    },
    industry: {
        fontSize: 12,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 6,
    },
    jobMeta: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    jobLocation: {
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    attachBtn: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
    },
    sendBtn: {
        marginLeft: 12,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


