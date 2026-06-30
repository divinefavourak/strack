import { Tabs } from 'expo-router';

import { TabBar } from '@/components/strack/tab-bar';
import { usePrefsSync } from '@/hooks/use-prefs-sync';

export default function TabsLayout() {
  usePrefsSync();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Smooth cross-fade when switching tabs.
        animation: 'shift',
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
