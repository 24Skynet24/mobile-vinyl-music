import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/shared/ui/haptic-tab';
import { TabBarIcon } from '@/shared/ui/tab-bar-icon';
import { Colors } from '@/shared/config/theme';
import { useColorScheme } from '@/shared/lib/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon size={26} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <TabBarIcon size={26} name="album" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <TabBarIcon size={26} name="search" color={color} />,
        }}
      />
    </Tabs>
  );
}
