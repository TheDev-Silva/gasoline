import React, { useState, useEffect, useRef } from 'react';
import {
   View,
   Text,
   TextInput,
   Alert,
   ScrollView,
   Pressable,
   StyleSheet,
   TouchableOpacity,
   ActivityIndicator,
   Image,
   FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SelectIFuelType from './selectIFuelType';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'
import useFuelPrices from './context/fuelPriceAPI';
import Animated, {
   useSharedValue,
   useAnimatedStyle,
   withTiming,
   Easing,
} from "react-native-reanimated";
import { BASE_URL_API } from '@/env';
import SelectFuelPosto from './selectFuelPosto';
import { GasStations } from '@/types/fuelPrice';
import { Picker } from '@react-native-picker/picker';


const AddFuelPrice = () => {
   const router = useRouter();
   const [fuelTypes] = useState([
      { id: 1, name: 'Gasolina Aditivada' },
      { id: 2, name: 'Gasolina Premium' },
      { id: 3, name: 'Gasolina Formulada' },
      { id: 4, name: 'Etanol' },
      { id: 5, name: 'Etanol Aditivado' },
      { id: 6, name: 'GNV (Gás Natural Veicular)' },
      { id: 7, name: 'Diesel' },
      { id: 8, name: 'Diesel S-10' },
   ]);

   const { address, setAddress, isLoadingLocation, setIsLoadingLocation, handleFetchLocation } = useFuelPrices()
   const [selectedFuelType, setSelectedFuelType] = useState<string | null>(null);
   const [price, setPrice] = useState('');
   const [stationName, setStationName] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   //selectFuelPosto
   const [fuelStations, setFuelStations] = useState<GasStations[]>([]);
   const [selectedFuelStation, setSelectedFuelStation] = useState<string | number>('');
   console.log('fuelStations: ', fuelStations)
   const [loading, setLoading] = useState(true);
   const translateY = useSharedValue(500); // Inicia fora da tela (500px para baixo)

   const animatedStyle = useAnimatedStyle(() => {
      return {
         transform: [{ translateY: translateY.value }],
      };
   });

   useEffect(() => {
      translateY.value = withTiming(500, { duration: 300 }); // Primeiro desce
      setTimeout(() => {
         translateY.value = withTiming(0, {
            duration: 2000, // Suavidade ao subir
            easing: Easing.out(Easing.exp),
         });
      }, 400); // Pequeno atraso antes de subir novamente
   }, []);


   useEffect(() => {
      const fetchFuelStations = async () => {
         try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`http://192.168.0.13:3000/gas-stations`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
            if (response.ok) {

               const data = await response.json();
               //console.log('dados de gas-stations', data);
               setFuelStations(data); // Assuma que a API retorna um array de postos
            } else {
               console.error('Erro ao buscar os postos:', response.status);
            }
         } catch (error) {
            console.error('Erro ao buscar postos:', error);
         }
      };

      fetchFuelStations();
   }, []);

   const handleFuelStationChange = (value: string) => {
      if (value === "new") {
         setSelectedFuelStation('');
         setStationName('');
         setAddress('');
      } else {
         const selectedStation = fuelStations.find(
            (station) => station.id === parseInt(value)
         );
         if (selectedStation) {
            setSelectedFuelStation(selectedStation.id);
            setStationName(selectedStation.name);
            setAddress(selectedStation.address);
         }
      }
   };




   const handleAddFuelPrice = async () => {
      if (!selectedFuelType || !price || !stationName || !address) {
         Toast.show({
            type: 'error',
            text1: 'existe campos ausentes.',
            text2: `Obrigatório preencher todos os campos.`
         })
         //Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
         return;
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
         Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Token de autenticação não encontrado.'
         })
         //Alert.alert('Erro', '');
         return router.replace('/login');
      }

      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
         Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Preço inválido.'
         })
         //Alert.alert('Erro', 'Preço inválido.');
         return;
      }

      try {
         setIsSubmitting(true);
         const response = await fetch(`http://192.168.0.13:3000/fuel-price`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               fuelType: selectedFuelType,
               price: parsedPrice,
               gasStationName: stationName,
               address,
            }),
         });

         if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || 'Erro ao adicionar preço');
         }
         Toast.show({
            type: 'success',
            text1: 'Sucesso',
            text2: 'Preço de combustivel adicionada com sucesso!'
         })

         //Alert.alert('Sucesso', 'Preço de combustível adicionado com sucesso!');
         setSelectedFuelType(null);
         setPrice('');
         setStationName('');
         setAddress('');
         router.push('/ultimateRegister')
      } catch (error) {
         console.error('Erro ao adicionar preço:', error);
         Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
         setIsSubmitting(false);
      }
   };


   return (
      <ScrollView contentContainerStyle={styles.container}>
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* <Image source={require('./../../assets/images/banner2.png')} style={{width: 380, height: 380, objectFit: 'contain', position: 'absolute', }}/> */}
            <Text style={[styles.title]}>Cadastrar Um Posto</Text>
            <Text style={{ textAlign: 'center' }}>cadastre um tipo de combustivel e seu preço.</Text>
         </View>

         <Animated.View
            style={[styles.contentAnimated,
               animatedStyle
            ]}

         >
            <View>
               <SelectFuelPosto
                  placeholder="Ver Postos Cadastrados"
                  options={fuelStations}
                  selectedValue={selectedFuelStation || ''} // Alinha com o tipo string | number
                  value={selectedFuelStation || ''} // Alinha com o tipo string | number
                  onValueChange={(value) => handleFuelStationChange(value)} // Aceita string | number
                  onChange={(value) => setSelectedFuelStation(value)} // Aceita string | number
                  name={stationName}
                  address={address}
               />


               <TextInput
                  placeholder="Nome do Posto"
                  value={stationName}
                  onChangeText={setStationName}
                  style={[styles.input, { backgroundColor: selectedFuelStation ? '#c9c9c9' : '#1a1a1a', color: selectedFuelStation ? '#1a1a1a' : '#c9c9c9' }]}

               />
               <View style={styles.locationContainer}>
                  <TextInput
                     placeholder="Endereço do Posto"
                     value={address}
                     onChangeText={setAddress}
                     style={styles.inputAddres}
                  />
                  <TouchableOpacity onPress={handleFetchLocation} style={styles.locationButton}>
                     {isLoadingLocation ? (
                        <ActivityIndicator color="#fff" />
                     ) : (
                        <Text style={styles.locationButtonText}>Local Exato</Text>
                     )}
                  </TouchableOpacity>
               </View>
               <SelectIFuelType
                  options={fuelTypes}
                  label={selectedFuelType || ''}
                  value={selectedFuelType || ''}
                  placeholder="Selecione o Tipo de Combustível"
                  onChange={(value) => setSelectedFuelType(value)}
               />
               <TextInput
                  placeholder="Preço do Combustível (ex: 5.99)"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(text) => {
                     // Remove caracteres não numéricos
                     const numericValue = text.replace(/[^0-9]/g, '');

                     // Insere ponto para formatar o número como decimal com duas casas
                     const formattedValue = numericValue.replace(/^(\d+)(\d{2})$/, '$1.$2');

                     // Atualiza o estado com o valor formatado
                     setPrice(formattedValue);
                  }}
                  style={styles.input}
               />


            </View>

            <TouchableOpacity onPress={handleAddFuelPrice} disabled={isSubmitting} style={styles.button}>
               <Text style={styles.buttonText}>{isSubmitting ? 'Enviando...' : 'Adicionar Preço'}</Text>
            </TouchableOpacity>
         </Animated.View>
      </ScrollView>
   );
};

const styles = StyleSheet.create({
   container: {
      flexGrow: 1,
      backgroundColor: '#fff',
      justifyContent: 'center',
   },
   title: {
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase',
      color: '#1A1A1A'
   },
   contentAnimated: {
      flex: 1,
      width: '100%',
      justifyContent: 'space-between',
      backgroundColor: '#1a1a1a',
      padding: 15,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15
   },
   input: {
      borderWidth: 1,
      borderColor: '#1a1a1a',
      borderRadius: 8,
      padding: 17,
      marginTop: 5,
      marginBottom: 5,
      backgroundColor: '#fff',
      fontSize: 16
   },
   locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 5
   },
   inputAddres: {
      flex: 1,
      height: 52,
      width: '100%',
      padding: 17,
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#1a1a1a',
      fontSize: 16,
   },
   locationButton: {
      backgroundColor: '#c9c9c9',
      borderWidth: 1,
      borderColor: '#1a1a1a',
      padding: 17,
      borderRadius: 8,
      marginLeft: 10,
      justifyContent: 'center',
   },
   locationButtonText: {
      color: '#1a1a1a',
      fontSize: 16,
      textAlign: 'center',
   },
   button: {
      backgroundColor: '#fff',
      padding: 18,
      borderRadius: 8,
   },
   buttonText: {
      color: '#1a1a1a',
      textAlign: 'center',
      fontSize: 18,
   },
   signupText: {
      fontSize: 16,
      color: '#1A1A1A',
      textAlign: 'center',
   },
});

export default AddFuelPrice;
