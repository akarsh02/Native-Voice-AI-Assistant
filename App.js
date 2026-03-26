import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Sparkles, Zap, Briefcase, MapPin, CheckCircle } from 'lucide-react-native';
import AssistantScreen from './screens/AssistantScreen';
import OptionsScreen from './screens/OptionsScreen';
import InsiderScreen from './screens/InsiderScreen';
import ParkingScreen from './screens/ParkingScreen';
import HabitScreen from './screens/HabitScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#050505',
            borderTopWidth: 1,
            borderTopColor: '#222',
            paddingBottom: 10,
            paddingTop: 10,
            height: 70,
          },
          tabBarActiveTintColor: '#00FF41',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            textTransform: 'uppercase',
          },
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Assistant') return <Sparkles size={size} color={color} />;
            if (route.name === 'Options') return <Zap size={size} color={color} />;
            if (route.name === 'Insiders') return <Briefcase size={size} color={color} />;
            if (route.name === 'Parking') return <MapPin size={size} color={color} />;
            if (route.name === 'Habits') return <CheckCircle size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Assistant" component={AssistantScreen} />
        <Tab.Screen name="Options" component={OptionsScreen} />
        <Tab.Screen name="Insiders" component={InsiderScreen} />
        <Tab.Screen name="Parking" component={ParkingScreen} />
        <Tab.Screen name="Habits" component={HabitScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
