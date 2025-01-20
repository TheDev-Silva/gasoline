// src/context/fuelPriceAPI.ts
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'
import { useRouter } from 'expo-router';
import { FuelPrice } from '@/types/fuelPrice';
import * as Location from 'expo-location';

interface FuelPricesContextProps {
   fuelPrices: FuelPrice[];
   fetchFuelPrices: (filters?: { fuelType?: string }) => void;
   address: string;
   setAddress: React.Dispatch<React.SetStateAction<string>>;
   setLongitude: React.Dispatch<React.SetStateAction<number | null>>
   setLatitude: React.Dispatch<React.SetStateAction<number | null>>
   handleFetchLocation: () => Promise<void>;
   isLoadingLocation: boolean;
   setIsLoadingLocation: React.Dispatch<React.SetStateAction<boolean>>;
   latitude: number | null; // Defina como número ou null
   longitude: number | null; // Defina como número ou null
   refreshKey: number; // Adicionado aqui
   refresh: () => void; // Adicionado aqui

}


const FuelPricesContext = createContext<FuelPricesContextProps | undefined>(undefined);

interface FuelPricesProviderProps {
   children: ReactNode;
}

export const FuelPricesProvider: React.FC<FuelPricesProviderProps> = ({ children }) => {
   const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
   const [address, setAddress] = useState<string>('');
   const [latitude, setLatitude] = useState<number | null>(null);
   const [longitude, setLongitude] = useState<number | null>(null);
   const [isLoadingLocation, setIsLoadingLocation] = useState(false);
   const router = useRouter();

   const [refreshKey, setRefreshKey] = useState(0);


   const refresh = useCallback(() => {
      setRefreshKey((prevKey) => prevKey + 1);
   }, []);

   const validateAuthToken = async () => {
      const token = await AsyncStorage.getItem('tokenAuthentication');
      if (!token) {
         Toast.show({
            type: 'error',
            text2: 'Token de Autenticação Não Encontrado.',
         });
         router.replace('/login');
         return null;
      }
      return token;
   };

   const fetchFuelPrices = async (filters: { fuelType?: string } = {}) => {
      try {
         const token = await validateAuthToken();
         if (!token) return;

         const queryParams = new URLSearchParams(filters as any).toString();
         const response = await fetch(
            `https://gas-price-api.vercel.app/fuel-prices?${queryParams}`,
            {
               method: 'GET',
               headers: { Authorization: `Bearer ${token}` },
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido ao buscar preços');
         }

         const data = await response.json();
         setFuelPrices(data);
      } catch (error: any) {
         //console.log('Erro ao buscar preços:', error);
         
      }
   };



   const handleFetchLocation = async () => {
      setIsLoadingLocation(true);
      try {
         const { status } = await Location.requestForegroundPermissionsAsync();
         if (status !== 'granted') {
            Toast.show({
               type: 'info',
               text2: 'Permissão de localização necessária para carregar o endereço.',
            });
            return;
         }

         const location = await Location.getCurrentPositionAsync({});
         const [reverseGeocodedLocation] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
         });

         // Atualiza latitude, longitude e endereço
         setLatitude(location.coords.latitude);
         setLongitude(location.coords.longitude);
         setAddress(
            `${reverseGeocodedLocation.street || ''} - ${reverseGeocodedLocation.district || ''}`
         );
      } catch (error) {
         console.error('Erro ao obter localização:', error);
         Toast.show({
            type: 'error',

            text2: 'Falha ao capturar a localização.',
         });

      } finally {
         setIsLoadingLocation(false);
      }
   };



   useEffect(() => {
      fetchFuelPrices(); // Carrega os preços quando o contexto for montado
   }, [fetchFuelPrices]);

   return (
      <FuelPricesContext.Provider value={{
         fuelPrices,
         fetchFuelPrices,
         address,
         latitude,
         longitude,
         setAddress,
         setLatitude,
         setLongitude,
         handleFetchLocation,
         isLoadingLocation,
         setIsLoadingLocation,
         refreshKey,
         refresh
      }}>
         {children}
      </FuelPricesContext.Provider>
   );
};

export default function useFuelPrices() {
   const context = useContext(FuelPricesContext);
   if (!context) {
      throw new Error('useFuelPrices must be used within a FuelPricesProvider');
   }
   return context;
};
