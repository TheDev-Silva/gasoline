import { Tabs } from 'expo-router'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { FuelPricesProvider } from '@/app/context/fuelPriceAPI'

export default function TabsLayout() {

  return (
    <FuelPricesProvider>
      <Tabs
        screenOptions={
          {
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: "#f04242",
            tabBarInactiveTintColor: "#ffffff",
            tabBarStyle: {
              backgroundColor: '#1A1A1A',
              paddingTop: 10,
              height: 60,
            },

          }}

      >
        <Tabs.Screen
          name='welcome'
          options={{
            tabBarIcon: ({ color, size }) => (

              <Ionicons name='home' color={color} size={size} />
            )
          }}

        /><Tabs.Screen
          name='profile'
          options={{
            tabBarIcon: ({ color, size }) => (

              <FontAwesome5 name='route' color={color} size={size} />
            )
          }}

        />
        <Tabs.Screen
          name='calculateFuelPrice'
          options={{
            tabBarIcon: ({ color, size }) => (
              
              <Ionicons name="calculator-outline" size={size} color={color} />
              )
            }}

        />
        <Tabs.Screen
          name='ultimateRegister'
          options={{
            tabBarIcon: ({ color, size }) => (

              <FontAwesome5 name="gas-pump" size={size} color={color} />
            )
          }}

        />

      </Tabs>
    </FuelPricesProvider>
  )
}