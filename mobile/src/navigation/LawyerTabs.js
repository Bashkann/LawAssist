import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import ListingsScreen from '../screens/listings/ListingsScreen';
import MyListingsScreen from '../screens/listings/MyListingsScreen';
import CreateListingScreen from '../screens/listings/CreateListingScreen';
import ListingApplicationsScreen from '../screens/listings/ListingApplicationsScreen';
import IncomingApplicationsScreen from '../screens/listings/IncomingApplicationsScreen';
import MyApplicationsScreen from '../screens/applications/MyApplicationsScreen';
import ProfileScreen from '../screens/lawyer/ProfileScreen';
import EditProfileScreen from '../screens/lawyer/EditProfileScreen';

const Tab = createBottomTabNavigator();
const ListingsStack = createNativeStackNavigator();
const MyListingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function ListingsStackScreen() {
  return (
    <ListingsStack.Navigator screenOptions={{ headerShown: false }}>
      <ListingsStack.Screen name="ListingsMain" component={ListingsScreen} />
    </ListingsStack.Navigator>
  );
}

function MyListingsStackScreen() {
  return (
    <MyListingsStack.Navigator screenOptions={{ headerShown: false }}>
      <MyListingsStack.Screen name="MyListingsMain" component={MyListingsScreen} />
      <MyListingsStack.Screen name="CreateListing" component={CreateListingScreen} />
      <MyListingsStack.Screen name="ListingApplications" component={ListingApplicationsScreen} />
      <MyListingsStack.Screen name="IncomingApplications" component={IncomingApplicationsScreen} />
    </MyListingsStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export default function LawyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f3f4f6',
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Listings') iconName = 'search-outline';
          else if (route.name === 'MyListings') iconName = 'document-text-outline';
          else if (route.name === 'MyApplications') iconName = 'paper-plane-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Listings" component={ListingsStackScreen} options={{ tabBarLabel: 'İlanlar' }} />
      <Tab.Screen name="MyListings" component={MyListingsStackScreen} options={{ tabBarLabel: 'İlanlarım' }} />
      <Tab.Screen name="MyApplications" component={MyApplicationsScreen} options={{ tabBarLabel: 'Başvurularım' }} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}
