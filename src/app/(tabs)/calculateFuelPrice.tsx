
import { AntDesign, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, FlatList, Pressable, Keyboard, ScrollView, RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import useFuelPrices from '../context/fuelPriceAPI';
import { fuelTypes } from './welcome';

export default function CalculateFuelPrice() {
   const { fuelPrices, refresh, refreshKey, fetchFuelPrices } = useFuelPrices();
   const [selectedStation, setSelectedStation] = useState<string | null>(null);
   const [selectedFuel, setSelectedFuel] = useState<string | null>(null);
   const [liters, setLiters] = useState<string>('0');
   const [totalPrice, setTotalPrice] = useState<number | null>(null);
   const [isStationModalVisible, setStationModalVisible] = useState(false);
   const [isFuelModalVisible, setFuelModalVisible] = useState(false);
   const [isRefreshing, setIsRefreshing] = useState(false);

   const [calculationType, setCalculationType] = useState<'liters' | 'value'>('liters');
   const [inputValue, setInputValue] = useState<string>('');

   const handleRefresh = async () => {
      setIsRefreshing(true);
      refresh(); // Incrementa o refreshKey no contexto
      setSelectedFuel('')
      setInputValue('')
      setSelectedStation('')
      setLiters('')
      setIsRefreshing(false); // Finaliza o loading
   };
   // Filtrar os postos únicos
   const uniqueStations = useMemo(() => {
      console.time("uniqueStationsCalculation");
      const seen = new Set<number>();
      const stations = fuelPrices.filter((fuel) => {
         if (seen.has(fuel.gasStationId)) return false;
         seen.add(fuel.gasStationId);
         return true;
      });
      console.timeEnd("uniqueStationsCalculation");
      return stations;
   }, [fuelPrices]);

   // Obter combustíveis relacionados ao posto selecionado
   const relatedFuels = useMemo(() => {
      if (!selectedStation) return [];
      return fuelPrices.filter((fuel) => fuel.gasStationId.toString() === selectedStation);
   }, [fuelPrices, selectedStation]);

   // Calcular preço total
   const handleCalculate = (calculationType: 'liters' | 'value', inputValue: string) => {
      Keyboard.dismiss(); // Fecha o teclado

      if (!selectedFuel || !inputValue) return;
      const fuel = relatedFuels.find((f) => f.fuelType === selectedFuel);

      if (fuel) {
         if (calculationType === 'liters') {
            // Cálculo com base nos litros fornecidos
            const liters = parseFloat(inputValue);
            const price = liters * fuel.price;
            setLiters(inputValue); // Armazena litros sem arredondar
            setTotalPrice(price); // Armazena preço sem arredondar
         } else if (calculationType === 'value') {
            // Cálculo com base no valor em reais fornecido
            const totalValue = parseFloat(inputValue);
            const liters = totalValue / fuel.price;
            setLiters(liters.toString()); // Armazena litros sem arredondar
            setTotalPrice(totalValue); // Armazena o valor total
         }
      }
   };



   const getFuelTypeName = (id: number | undefined): string => {
      const fuelType = fuelTypes.find((type) => type.id === id);
      return fuelType ? fuelType.name : 'Tipo não encontrado';
   };

   const handleStationChange = (stationId: string) => {
      setSelectedStation(stationId);
      setSelectedFuel(null);
      setLiters('0');
      setTotalPrice(null);
   };

   useEffect(() => {
      if (!selectedFuel || !liters || liters === '0') {
         setTotalPrice(null);
         return;
      }
      const fuel = relatedFuels.find((f) => f.fuelType === selectedFuel);
      if (fuel) {
         const price = parseFloat(liters) * fuel.price;
         setTotalPrice(price);
      }
   }, [selectedFuel, liters]);


   const rotation = useSharedValue(0)

   /* const handleToggle = () => {
      setCalculationType((prev) => {
         const newType = prev === 'liters' ? 'value' : 'liters';
         // Redefinir valores ao mudar de tipo de cálculo
         setInputValue('');
         setLiters('0');
         setTotalPrice(null);
         return newType;
      });

      // Animação da rotação
      rotation.value = withTiming(rotation.value === 0 ? 360 : 0, { duration: 500 });
   };

   const animatedStyle = useAnimatedStyle(() => {

      return {
         transform: [
            { perspective: 1000 },
            { rotateY: `${rotation.value}deg` }, // Aplica rotação em Y
            //{ rotateX: `180deg` }, // Aplica rotação em Y

         ],
      };
   }); */




   return (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <ScrollView contentContainerStyle={{ flex: 1 }}
            refreshControl={
               <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
         >
            <View style={styles.container}>
               <Text style={styles.title}>Calculadora de litros/preço</Text>

               {/* Seleção de Posto */}
               <Text style={styles.label}>Selecione o Posto</Text>
               <TouchableOpacity style={styles.selector} onPress={() => setStationModalVisible(true)}>
                  <Text style={styles.selectorText}>
                     {selectedStation
                        ? uniqueStations.find((station) => station.gasStationId.toString() === selectedStation)?.GasStation.name
                        : 'Selecione um posto'}
                  </Text>
               </TouchableOpacity>

               <Modal visible={isStationModalVisible} animationType="slide" transparent>
                  <Pressable style={styles.overlay} onPress={() => {

                     setStationModalVisible(false);
                  }}>
                     <View style={styles.modalContainer}>
                        <FlatList
                           data={uniqueStations}
                           keyExtractor={(item) => item.gasStationId.toString()}
                           renderItem={({ item }) => (
                              <TouchableOpacity
                                 style={styles.modalItem}
                                 onPress={() => {
                                    handleStationChange(item.gasStationId.toString());
                                    setStationModalVisible(false);
                                 }}
                              >
                                 <Text style={styles.modalItemText} numberOfLines={1}>{item.GasStation.name}</Text>
                                 <Text style={styles.modalItemSubText} numberOfLines={1}>{item.GasStation.address}</Text>
                              </TouchableOpacity>
                           )}
                           initialNumToRender={10}
                           removeClippedSubviews={true}
                        />
                     </View>
                  </Pressable>
               </Modal>

               {/* Seleção de Combustível */}
               <Text style={styles.label}>Selecione o Combustível</Text>
               <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setFuelModalVisible(true)}
                  disabled={!selectedStation}
               >
                  <Text style={styles.selectorText}>
                     {selectedFuel
                        ? <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                           <Text>{`${getFuelTypeName(parseInt(selectedFuel))}`}</Text>
                           <Text> R$ {relatedFuels.find((f) => f.fuelType === selectedFuel)?.price.toFixed(2)}</Text>
                        </View>
                        : 'Selecione um combustível'}
                  </Text>
               </TouchableOpacity>

               <Modal visible={isFuelModalVisible} animationType="slide" transparent>
                  <Pressable style={styles.overlay} onPress={() => setFuelModalVisible(false)}>
                     <View style={styles.modalContainer}>
                        <FlatList
                           data={relatedFuels}
                           keyExtractor={(item) => item.id.toString()}
                           renderItem={({ item }) => (
                              <TouchableOpacity
                                 style={styles.modalItem}
                                 onPress={() => {
                                    setSelectedFuel(item.fuelType);
                                    setFuelModalVisible(false);
                                 }}
                              >
                                 <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.modalItemText}>
                                       {getFuelTypeName(parseInt(item.fuelType))}
                                    </Text>
                                    <Text style={styles.modalItemText}>
                                       R${item.price.toFixed(2)}
                                    </Text>
                                 </View>

                              </TouchableOpacity>
                           )}
                        />

                     </View>
                  </Pressable>
               </Modal>

               {/* Campo de Entrada de Litros */}
               <Text style={styles.label}>Defina um metodo de entrada</Text>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <TouchableOpacity onPress={() => setCalculationType('liters')} style={[styles.option, { backgroundColor: calculationType === 'liters' ? '#1a1a1a' : '#fff', borderWidth: calculationType === 'liters' ? 1 : 1, borderColor: calculationType === 'liters' ? '' : '#ccc' }]}>
                     <Text style={[styles.textTouch, { fontWeight: 'bold', color: calculationType === 'liters' ? '#fff' : '#1a1a1a99', }]}>Por Litros</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCalculationType('value')} style={[styles.option, { backgroundColor: calculationType === 'value' ? '#1a1a1a' : '#fff', borderWidth: calculationType === 'value' ? 1 : 1, borderColor: calculationType === 'value' ? '' : '#ccc' }]}>
                     <Text style={{ fontWeight: 'bold', color: calculationType === 'value' ? '#fff' : '#1a1a1a99', }}>Por Valor</Text>
                  </TouchableOpacity>
               </View>
               <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={inputValue}
                  onChangeText={(text) => setInputValue(text.replace(/[^0-9.,]/g, '').replace(',', '.'))}
                  placeholder={calculationType === 'liters' ? 'Digite a quantidade em litros' : 'Digite o valor em reais'}
               />

               {/* Botão para Calcular */}

               <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleCalculate(calculationType, inputValue)}
                  disabled={!selectedFuel}
               >
                  <Text style={styles.buttonText}>Calcular</Text>
               </TouchableOpacity>

               {/* Exibir Preço Total */}
               <View
                  style={[styles.totalPrice]}
               >
                  <View style={{ width: '98%', borderRadius: 5, margin: 0, alignItems: 'center', justifyContent: 'center' }}>
                     <Text style={{ textAlign: 'center', padding: 10, color: '#1a1a1a' }}>
                        {selectedFuel
                           ? <Text style={styles.result}>Modelo de entrada definido: "{calculationType === 'liters' ? 'Litros' : 'Valor'}"</Text>
                           : `modo de busca`}
                     </Text>
                  </View>
                  {totalPrice !== null ?
                     <View style={{ flex: 1, width: '99%', flexDirection: 'column', justifyContent: 'center', margin: 2, alignItems: 'center', paddingTop: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20, width: '60%' }}>
                           <FontAwesome5 name="gas-pump" size={50} color={'#f04242'} />
                           <AntDesign name={calculationType === 'liters' ? "arrowright" : "arrowleft"} size={24} color="#1a1a1a" />
                           <FontAwesome6 name="sack-dollar" size={50} color="green" />
                        </View>

                        <View style={{ flex: 1, width: '99%', alignItems: 'center', flexDirection: 'column', marginTop: 10 }}>
                           {calculationType === 'liters' && (
                              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                 <Text style={styles.result}>{parseFloat(liters).toFixed(2)} litros: </Text>
                                 <Text style={[styles.result, { marginBottom: 10 }]}>R$ {relatedFuels.find((f) => f.fuelType === selectedFuel)?.price.toFixed(2)}</Text>
                              </View>
                           )}

                           {calculationType === 'value' && (
                              <View style={{ flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                 {/*  */}
                                 <Text style={styles.result}>R$ {parseFloat(inputValue).toFixed(2)} de Combustível</Text>
                                 <Text style={styles.result}>Será {parseFloat(liters).toFixed(2)} Litros</Text>

                              </View>
                           )}
                        </View>
                        <View style={{ backgroundColor: '#f04242', width: '100%', borderRadius: 5, alignItems: 'center', justifyContent: 'center', padding: 15 }}>

                           <Text style={[styles.result, {color: '#fff'}]}>Preço total: R$ {totalPrice?.toFixed(2)}</Text>
                        </View>

                     </View>
                     : (
                        <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                           <Text style={{ textAlign: 'center' }}>Modelo de Busca aguardando...</Text>
                        </View>

                     )}
               </View>


            </View>
         </ScrollView>
      </GestureHandlerRootView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
   },
   title: {
      fontSize: 25,
      textTransform: 'uppercase',
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
   },
   label: {
      fontSize: 16,
      marginBottom: 8,
   },
   textTouch: {
      color: '#fff'
   },
   selector: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 15,
      marginBottom: 10,
   },
   selectorText: {
      fontSize: 16,
      color: '#333',

   },
   input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
   },
   button: {
      backgroundColor: '#1a1a1a',
      padding: 20,
      borderRadius: 5,
      alignItems: 'center',

   },
   buttonText: {
      color: '#fff',
      fontSize: 18,
      textTransform: 'uppercase'
   },
   result: {
      fontSize: 18,
      fontWeight: 'bold',

   },
   overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center'
   },
   modalContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 300,
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 8,
      width: '80%'
   },
   modalItem: {
      width: 270,
      backgroundColor: '#1a1a1a',
      padding: 15,
      borderRadius: 5,
      marginBottom: 10,
   },
   modalItemText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff'
   },
   modalItemSubText: {
      fontSize: 14,
      color: '#fff',
   },
   modalCloseButton: {
      backgroundColor: '#ff4d4d',
      padding: 15,
      borderRadius: 5,
      marginTop: 10,
      alignItems: 'center',
   },
   modalCloseText: {
      color: '#fff',
      fontSize: 16,
   },
   totalPrice: {
      //justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      backgroundColor: '#e9e9e9',
      borderRadius: 5,
      marginTop: 30,

      boxShadow: '1px 2px 7px #000'
   },
   option: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: 330 / 2,
      padding: 15,
      borderRadius: 5,
      backgroundColor: '#e9e9e9',

   },

});
