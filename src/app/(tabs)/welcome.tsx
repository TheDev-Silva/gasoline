import { Ionicons, Zocial } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image, ActivityIndicator, RefreshControl, FlatList, ScrollView, BackHandler, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import useFuelPrices from '../context/fuelPriceAPI';
import { FuelPrice } from '@/types/FuelPrice'
import SearchBarModal from '../searchBarModal';
import React from 'react';



interface UserProps {
   id: string;
   name: string;
   email: string;
}
export const fuelTypes = [
   { id: 1, name: 'Gasolina Aditivada' },
   { id: 2, name: 'Gasolina Premium' },
   { id: 3, name: 'Gasolina Formulada' },
   { id: 4, name: 'Etanol' },
   { id: 5, name: 'Etanol Aditivado' },
   { id: 6, name: 'GNV (Gás Natural Veicular)' },
   { id: 7, name: 'Diesel' },
   { id: 8, name: 'Diesel S-10' },
]

export default function Welcome() {
   const router = useRouter();
   const [user, setUser] = useState<UserProps | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [modalVisible, setModalVisible] = useState(false)
   const [isRefreshing, setIsRefreshing] = useState(false);
   const [exitApp, setExitApp] = useState(false);
   const { fuelPrices, fetchFuelPrices, address, handleFetchLocation, refreshKey, refresh } = useFuelPrices();
   const lastFuelPriceUser: FuelPrice | null =
      fuelPrices.length > 0
         ? [...fuelPrices].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
         )[0]
         : null;

   const getCheapestFuelPrice = (): FuelPrice | null => {
      if (fuelPrices.length === 0) return null;



      return fuelPrices.reduce((cheapest, current) => {
         return current.price < cheapest.price ? current : cheapest;
      }, fuelPrices[0]);
   };

   useEffect(() => {
      fetchFuelPrices();
   }, [refreshKey]); // Atualiza os preços ao mudar o refreshKey

   const cheapestFuelPrice = getCheapestFuelPrice()

   useEffect(() => {
      if (cheapestFuelPrice) {
         console.log("Preço mais em conta:", cheapestFuelPrice);
      }
   }, []);

   const handleRefresh = async () => {
      setIsRefreshing(true);
      refresh(); // Incrementa o refreshKey no contexto
      await fetchFuelPrices(); // Recarrega os dados
      setIsRefreshing(false); // Finaliza o loading
   };

   //console.log(lastFuelPriceUser)

   //console.log('dados de:', fuelPrices);
   const fetchUserData = async () => {
      try {
         const token = await AsyncStorage.getItem('authToken');
         console.log(token)
         if (!token) {
            Toast.show({
               type: 'error',
               text1: 'Erro de autenticação',
               text2: 'Token de autenticação não encontrado.',
            });
            setIsLoading(false);
            return;
         }

         const response = await fetch(`http://192.168.0.13:3000/register-userId`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
         });

         if (response.ok) {
            const data = await response.json();
            setUser(data);
         } else {
            const errorData = await response.json();
            Toast.show({
               type: 'error',
               text1: 'Erro de autenticação',
               text2: errorData.error || 'Token inválido ou expirado.',
            });
            router.replace('/login')
         }
      } catch (error) {
         Toast.show({
            type: 'error',
            text1: 'Erro de conexão',
            text2: 'Não foi possível conectar ao servidor.',
         });
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchUserData();
      fetchFuelPrices(); // Carrega os preços de combustível
      refresh()
   }, []);



   const handleFuelPrice = () => {
      setIsLoading(true)
      setTimeout(() => {
         router.push('/addPrice')
         setIsLoading(false)
      }, 2000);
   };



   // Pegando o último preço de combustível (ordenando pela data de criação)
   const getFuelTypeName = (id: number | undefined): string => {
      const fuelType = fuelTypes.find((type) => type.id === id);
      return fuelType ? fuelType.name : 'Tipo não encontrado';
   };

   const createdAt = lastFuelPriceUser?.createdAt
      ? new Intl.DateTimeFormat('pt-BR', {
         dateStyle: 'short',
         timeStyle: 'short',
      }).format(new Date(lastFuelPriceUser.createdAt))
      : 'Data não disponível';

   const createdAtFuel = cheapestFuelPrice?.createdAt ? new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
   }).format(new Date(cheapestFuelPrice.createdAt)) : 'Data Indisponível'

   useEffect(() => {
      handleFetchLocation()

   }, [])

   useFocusEffect(
      React.useCallback(() => {
         const backAction = () => {
            if (exitApp) {
               BackHandler.exitApp(); // Fecha o app se já clicou antes
            } else {
               setExitApp(true); // Define o estado para true
               ToastAndroid.show("Pressione novamente para sair", ToastAndroid.SHORT); // Exibe o Toast

               // Reseta o estado para false após 2 segundos
               setTimeout(() => setExitApp(false), 2000);
            }
            return true; // Impede o comportamento padrão do botão voltar
         };

         const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
         );

         return () => backHandler.remove(); // Remove o listener ao sair da tela
      }, [exitApp])
   );

   return (

      <View style={styles.container} >
         <View style={styles.header}>

            {user ? (
               <View style={styles.userInfo}>
                  {/* <Ionicons name="person" size={20} color="#1a1a1a" style={styles.userIcon} /> */}
                  <TouchableOpacity onPress={() => setModalVisible(true)} style={{ padding: 5, borderWidth: 2, borderColor: '#fff', borderRadius: 100 }}>
                     <Ionicons name="person" size={20} color="#fff" />
                  </TouchableOpacity>
                  <View style={{ justifyContent: 'center', gap: 5 }}>
                     <Text style={styles.userName}>Olá, {user.name}</Text>
                     <View style={{ flexDirection: 'row', gap: 5 }}>
                        <Ionicons name='location-outline' size={18} color={'#fff'} />
                        <Text style={{ fontSize: 12, color: '#fff' }}>{address}</Text>
                     </View>
                  </View>
               </View>
            ) : null}

         </View>

         <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
         }>


            <View style={{ flex: 1, width: '100%', padding: 10 }}>

               <View style={styles.main}>
                  <Text style={{ fontSize: 18 }}>Bem-vinda ao <Text style={{ fontWeight: 'bold', fontSize: 40 }}>Gasoline</Text></Text>
                  <Text style={{ fontSize: 16 }}>Uma comunidade feita pra quem gosta de economizar!</Text>
               </View>
               <View style={{ flex: 1, justifyContent: 'center', marginBottom: -10, borderRadius: 20 }}>
                  <TouchableOpacity
                     onPress={() => {
                        if (cheapestFuelPrice?.gasStationId) {
                           router.push(`/profile?fuelStation=${cheapestFuelPrice.gasStationId}`)
                        }
                     }
                     }

                     style={{ top: 30, right: 20, position: 'absolute', zIndex: 2 }}
                  >
                     <Ionicons name='arrow-forward' size={30} />
                  </TouchableOpacity>
                  <Image
                     source={require('../../../assets/images/banner3.png')}
                     style={{ objectFit: 'contain', width: '100%' }}
                  />


                  <View style={{ position: 'absolute', top: 60, left: 25, zIndex: 1 }}>
                     {cheapestFuelPrice ? (
                        <View style={{ flex: 1, position: 'relative', width: 325, justifyContent: 'space-between' }}>

                           <Text style={{ width: '100%', fontSize: 16, color: '#1a1a1a', justifyContent: 'space-between' }}>
                              Posto: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }} >
                                 {cheapestFuelPrice.GasStation?.name || 'Posto não encontrado'}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#1a1a1a' }} numberOfLines={1}>
                              Localização: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                 {cheapestFuelPrice.GasStation?.address || 'Posto não encontrado'}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#1a1a1a' }}>
                              Tipo: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                 {getFuelTypeName(parseInt(cheapestFuelPrice.fuelType))} {/* Exemplo de mapeamento */}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#1a1a1a' }}>
                              Preço na Bomba: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                 R$ {parseFloat(cheapestFuelPrice.price.toFixed(2))}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#1a1a1a' }}>
                              Data de postagem: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                 {createdAtFuel}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#1a1a1a' }}>
                              Inserido por: <Text style={{ fontWeight: 'bold', fontStyle: 'italic', textDecorationLine: 'underline', color: '#1a1a1a', }}>
                                 {lastFuelPriceUser?.User?.name || 'Indefinido'}
                              </Text>
                           </Text>
                        </View>
                     ) : (
                        <Text style={{ fontSize: 16, position: 'absolute', top: 40, left: 60, color: '#1a1a1a' }}>
                           Nenhum preço encontrado.
                        </Text>
                     )}
                  </View>

               </View>
               <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Image
                     source={require('../../../assets/images/BANNER1.png')}
                     style={{ objectFit: 'contain', width: 'auto', position: 'relative' }}
                  />
                  <View style={{ position: 'absolute', top: 60, left: 25 }}>
                     {lastFuelPriceUser ? (
                        <View style={{ flex: 1, position: 'relative', width: 325, justifyContent: 'space-between' }}>

                           <Text style={{ width: '100%', fontSize: 16, color: '#fff', justifyContent: 'space-between' }}>
                              Posto: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }} >
                                 {lastFuelPriceUser.GasStation?.name || 'Posto não encontrado'}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#fff' }} numberOfLines={1}>
                              Localização: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                 {lastFuelPriceUser.GasStation?.address || 'Posto não encontrado'}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#fff' }}>
                              Tipo: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                 {getFuelTypeName(parseInt(lastFuelPriceUser.fuelType))} {/* Exemplo de mapeamento */}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#fff' }}>
                              Preço na Bomba: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                 R$ {parseFloat(lastFuelPriceUser.price.toFixed(2))}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#fff' }}>
                              Data de postagem: <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                 {createdAt}
                              </Text>
                           </Text>
                           <Text style={{ fontSize: 16, color: '#fff' }}>
                              Inserido por: <Text style={{ fontWeight: 'bold', fontStyle: 'italic', textDecorationLine: 'underline', color: '#1a1a1a', }}>
                                 {lastFuelPriceUser?.User?.name || 'Indefinido'}
                              </Text>
                           </Text>
                        </View>
                     ) : (
                        <Text style={{ fontSize: 16, position: 'absolute', top: 40, left: 60, color: '#fff' }}>
                           Nenhum posto cadastrado ainda.
                        </Text>
                     )}
                  </View>
               </View>
            </View>
         </ScrollView>
         <View style={{ flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'center' }}>
            <TouchableOpacity style={styles.button} onPress={handleFuelPrice}>
               {isLoading && <ActivityIndicator size={15} color={'#fff'} />}
               <Text style={styles.buttonText}>{isLoading ? 'Aguarde...' : 'Cadastrar Preço'}</Text>
            </TouchableOpacity>
         </View>
         <SearchBarModal visible={modalVisible} onClosed={() => setModalVisible(false)} />

      </View>

   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      /*alignItems: 'center', */
      backgroundColor: '#fff',
   },
   header: {
      backgroundColor: '#1a1a1a',
      width: '100%',
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1
   },
   userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
   },
   userIcon: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 50,
   },
   userName: {
      fontWeight: '500',
      color: '#fff',
      fontSize: 18,
   },
   userEmail: {
      fontSize: 14,
      color: '#fff',
   },
   main: {
      flexDirection: 'column',
      marginTop: 50,
      marginBottom: 50,
      justifyContent: 'center',
   },
   title: {
      fontSize: 30,
      fontWeight: '500',
   },
   button: {
      flex: 1,
      gap: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      padding: 20,
      margin: 10,
      borderRadius: 8,
      marginBottom: 20,
   },
   buttonText: {
      color: '#fff',
      textAlign: 'center',
      textTransform: 'uppercase',
   },
});
