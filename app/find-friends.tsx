import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';

import { Avatar } from '@/components/strack/avatar';
import { Button } from '@/components/strack/button';
import { Row, Screen, Txt } from '@/components/strack/themed';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { friendsApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/client';
import { useFriendRequests, useRespondToRequest, useSendFriendRequest, useSuggestions } from '@/hooks/api';
import { type FriendRequestRead, type FriendSuggestion } from '@/lib/api/types';

export default function FindFriends() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const { data: requests, isLoading: loadingReq } = useFriendRequests();
  const { data: suggestions, isLoading: loadingSug } = useSuggestions();
  const sendRequest = useSendFriendRequest();
  const respond = useRespondToRequest();

  const pending = (requests ?? []).filter((r) => r.status === 'pending');

  function submitSearch() {
    const q = search.trim();
    if (!q) return;
    sendRequest.mutate(q, {
      onSuccess: () => {
        setSearch('');
        Alert.alert('Request sent', `Friend request sent to ${q}.`);
      },
      onError: (e) => Alert.alert('Could not send', e instanceof ApiError ? e.message : 'Try again.'),
    });
  }

  function addSuggestion(s: FriendSuggestion) {
    sendRequest.mutate(s.display_name, {
      onError: (e) => Alert.alert('Could not add', e instanceof ApiError ? e.message : 'Try again.'),
    });
  }

  async function shareInvite() {
    try {
      const { invite_url } = await friendsApi.invite();
      await Share.share({ message: `Join me on Strack! ${invite_url}` });
    } catch (e) {
      Alert.alert('Invite', e instanceof ApiError ? e.message : 'Could not create invite link.');
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Row style={styles.header}>
        <Ionicons name="arrow-back" size={24} color={colors.text} onPress={() => router.back()} />
        <Txt variant="heading" style={styles.headerTitle}>
          Find Friends
        </Txt>
        <View style={{ width: 24 }} />
      </Row>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* Search */}
        <Row style={[styles.search, { borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={submitSearch}
            returnKeyType="send"
            placeholder="Search by username or email"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            style={[styles.searchInput, { color: colors.text }]}
          />
          {sendRequest.isPending && <ActivityIndicator size="small" color={Brand.green} />}
        </Row>

        {/* Pending requests */}
        <Txt variant="label" muted style={styles.section}>
          Pending Requests
        </Txt>
        {loadingReq ? (
          <ActivityIndicator color={Brand.green} style={{ marginVertical: Spacing.lg }} />
        ) : pending.length === 0 ? (
          <Txt variant="caption" muted style={styles.sectionEmpty}>
            No pending requests.
          </Txt>
        ) : (
          pending.map((req) => (
            <RequestRow key={req.id} req={req} onRespond={(action) => respond.mutate({ id: req.id, action })} />
          ))
        )}

        {/* Suggested */}
        <Txt variant="label" muted style={styles.section}>
          Suggested Friends
        </Txt>
        {loadingSug ? (
          <ActivityIndicator color={Brand.green} style={{ marginVertical: Spacing.lg }} />
        ) : (
          (suggestions ?? []).map((s) => (
            <Row key={s.user_id} style={styles.friendRow}>
              <Avatar name={s.display_name} size={40} image={s.avatar_url ? { uri: s.avatar_url } : undefined} />
              <Txt variant="body" style={styles.flex}>
                {s.display_name}
              </Txt>
              <Pressable onPress={() => addSuggestion(s)} style={[styles.addPill, { backgroundColor: Brand.greenTint }]}>
                <Txt variant="label" color={Brand.green}>
                  Add
                </Txt>
              </Pressable>
            </Row>
          ))
        )}

        {/* Invite */}
        <Image source={require('@/assets/images/find-friends.png')} style={styles.illustration} contentFit="contain" />
        <Txt variant="body" muted style={styles.invitePrompt}>
          Can’t find your walking buddy?{'\n'}Invite them to Strack!
        </Txt>
        <Button label="Share Invite Link" style={styles.inviteBtn} onPress={shareInvite} />
      </ScrollView>
    </Screen>
  );
}

function RequestRow({ req, onRespond }: { req: FriendRequestRead; onRespond: (a: 'accept' | 'decline') => void }) {
  const { colors } = useTheme();
  const name = req.display_name ?? 'Friend request';
  return (
    <Row style={styles.friendRow}>
      <Avatar name={name} size={40} image={req.avatar_url ? { uri: req.avatar_url } : undefined} />
      <Txt variant="body" style={styles.flex}>
        {name}
      </Txt>
      <Pressable onPress={() => onRespond('decline')} style={[styles.iconBtn, { backgroundColor: colors.dangerSurface }]}>
        <Ionicons name="close" size={18} color={colors.danger} />
      </Pressable>
      <Pressable onPress={() => onRespond('accept')} style={[styles.iconBtn, { backgroundColor: Brand.greenTint }]}>
        <Ionicons name="checkmark" size={18} color={Brand.green} />
      </Pressable>
    </Row>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'space-between' },
  headerTitle: { flex: 1, textAlign: 'center' },
  search: { marginHorizontal: Spacing.lg, marginTop: Spacing.sm, height: 48, borderRadius: Radius.pill, borderWidth: 1.5, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  sectionEmpty: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  friendRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.md },
  iconBtn: { width: 40, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  addPill: { paddingHorizontal: Spacing.lg, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  illustration: { width: '70%', height: 160, alignSelf: 'center', marginTop: Spacing.xl },
  invitePrompt: { textAlign: 'center', marginTop: Spacing.lg, lineHeight: 22 },
  inviteBtn: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg },
});
