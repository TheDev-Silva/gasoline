import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { FuelPricesProvider } from "@/app/context/fuelPriceAPI";
import { Stack } from "expo-router";
import Toast, { BaseToast } from "react-native-toast-message";

export default function Layout() {
    return (
        <FuelPricesProvider>

            <Stack screenOptions={{ headerShown: false }} />
            <Toast config={{
                success: (props) => (
                    <BaseToast
                        {...props}
                        style={{
                            borderLeftColor: '#4CAF5099',
                            marginTop: -30,
                            width: '95%',
                        }}
                        text1Style={{
                            textTransform: 'uppercase',
                            fontSize: 16,
                            fontWeight: 'bold',
                        }}
                        text2Style={{
                            fontSize: 14,
                            color: '#1a1a'
                        }}
                    />
                ),
                error: (props) => (
                    <BaseToast
                        {...props}
                        style={{
                            borderLeftColor: '#f0424299',
                            marginTop: -30,
                            width: '95%',
                        }}
                        text1Style={{
                            textTransform: 'uppercase',
                            fontSize: 16,
                            fontWeight: 'bold',
                        }}
                        text2Style={{
                            fontSize: 14,
                            color: '#f04242'
                        }}
                    />
                ),
                info: (props) => (
                    <BaseToast
                        {...props}
                        style={{
                            borderLeftColor: '#00BCD4',
                            marginTop: -30,
                            width: '95%',
                        }}
                        text1Style={{
                            textTransform: 'uppercase',
                            fontSize: 16,
                            fontWeight: 'bold',
                        }}
                        text2Style={{
                            fontSize: 14,
                            color: '#00BCD4'
                        }}
                    />
                ),
            }} />

        </FuelPricesProvider>
    );
}

