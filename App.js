import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TradeScreen from './src/screens/TradeScreen';
import Orders from './src/screens/Orders';
import Settings from './src/screens/Settings';
import Dashboard from './src/screens/Dashboard';
import { StatusBar } from 'expo-status-bar';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator initialRouteName="Dashboard" screenOptions={{headerShown:false}}>
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Trade" component={TradeScreen} />
        <Tab.Screen name="Orders" component={Orders} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
