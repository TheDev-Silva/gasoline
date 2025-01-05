import { useRouter, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { View, Text, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import useFuelPrices from '../context/fuelPriceAPI';
import { fuelTypes } from './welcome';

export default function UltimateRegister() {
   const router = useRouter()
   const { fuelPrices, fetchFuelPrices } = useFuelPrices();
   const [searchType, setSearchType] = useState('fuelType'); // Tipo de busca
   const [searchValue, setSearchValue] = useState(''); // Valor da busca
   const [filteredData, setFilteredData] = useState(fuelPrices || []);
   const { showModal } = useGlobalSearchParams()
   const [isModalVisible, setModalVisible] = useState(false)

   //console.log('dados de FuelPrices: ', fuelPrices);

   useEffect(() => {
      if (showModal === 'true') {
         setModalVisible(true);
      }
   }, [showModal]);

   const closeModal = () => {
      setModalVisible(false);
      router.push('/ultimateRegister'); // Remove o parâmetro da URL
   };

   useEffect(() => {
      if (fuelPrices) {
         filterData();
      }
   }, [searchValue, searchType, fuelPrices]);

   useEffect(() => {
      fetchFuelPrices()
   }, [])



   const handleSearchTypeChange = (type: string) => {
      setSearchType(type);
      setSearchValue(''); // Limpa o valor ao trocar o tipo de busca
   };

   const handleSearchValueChange = (value: string) => {
      setSearchValue(value);
   };

   const filterData = () => {
      if (!fuelPrices) return;

      const lowerValue = searchValue.toLowerCase();

      const data = fuelPrices.filter((item) => {
         if (searchType === 'fuelType') {
            const fuelTypeName = getFuelTypeName(parseInt(item.fuelType));
            return fuelTypeName.toLowerCase().includes(lowerValue);
         }
         if (searchType === 'price') {
            const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            const filterPrice = (searchValue);
            return price <= parseFloat(filterPrice);
         }

         if (searchType === 'address') {
            return item.GasStation?.address.toLowerCase().trim().includes(lowerValue);
         }
         return true;
      });

      setFilteredData(data);
   };

   const getFuelTypeName = (id: number | undefined): string => {
      const fuelType = fuelTypes.find((type) => type.id === id);
      return fuelType ? fuelType.name : 'Tipo não encontrado';
   };

   return (
      <View style={styles.container}>
         {/* Header com opções de busca */}
         <View style={styles.header}>
            <TextInput
               placeholder={`Buscar por ${searchType === 'fuelType'
                  ? 'Tipo de Combustível'
                  : searchType === 'price'
                     ? 'Preço'
                     : 'Endereço'}`}
               onChangeText={handleSearchValueChange}
               value={searchValue}
               keyboardType={searchType === 'price' ? 'numeric' : 'default'}
               style={styles.input}
            />
         </View>

         <View style={styles.filterButtons}>
            <Text
               style={[
                  styles.filterButton,
                  searchType === 'address' && styles.activeFilterButton,
               ]}
               onPress={() => handleSearchTypeChange('address')}
            >
               Endereço
            </Text>
            <Text
               style={[
                  styles.filterButton,
                  searchType === 'price' && styles.activeFilterButton,
               ]}
               onPress={() => handleSearchTypeChange('price')}
            >
               Preço
            </Text>
            <Text
               style={[
                  styles.filterButton,
                  searchType === 'fuelType' && styles.activeFilterButton,
               ]}
               onPress={() => handleSearchTypeChange('fuelType')}
            >
               Combustível
            </Text>
         </View>

         {/* Lista filtrada */}
         <View style={{ flex: 1, justifyContent: 'center'}}>
            {filteredData && filteredData.length > 0 ? (
               <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                     <ScrollView style={styles.itemContainer}>
                        <View style={styles.contentFuel}>
                           <Text>Tipo de combustível:</Text>
                           <Text style={styles.textFuel}>
                              {getFuelTypeName(parseInt(item.fuelType))}
                           </Text>
                        </View>
                        <View style={styles.contentFuel}>
                           <Text>Endereço:</Text>
                           <Text style={styles.textFuel} numberOfLines={1} ellipsizeMode="head">
                              {item.GasStation?.address}
                           </Text>

                        </View>
                        <View style={styles.contentFuel}>
                           <Text>Preço: </Text>
                           <Text style={styles.textFuel}>R$ {item.price}</Text>
                        </View>
                        <View style={styles.contentFuel}>
                           <Text>Posto: </Text>
                           <Text style={styles.textFuel}>{item.GasStation?.name || 'Desconhecido'}</Text>
                        </View>
                        <View style={styles.contentFuel}>
                           <Text>Postado por: </Text>
                           <Text style={styles.textFuel}>{item.User.name || 'Anônimo'}</Text>
                        </View>
                     </ScrollView>
                  )}
               />
            ) : (
               <Text style={{ textAlign: 'center' }}>{searchType === 'price' ? 'Digite o valor que procura para mostrar resultados...' : 'Sem resultados para exibir...'}</Text>
            )}
         </View>
         {isModalVisible === true }
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 10,
      backgroundColor: '#e9e9e9',
   },
   header: {
      marginBottom: 10,
   },
   input: {
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      marginBottom: 10,
   },
   filterButtons: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      gap: 10
   },
   filterButton: {
      width: 340 / 3,
      padding: 12,
      borderRadius: 5,
      backgroundColor: '#ddd',
      textAlign: 'center',
   },
   activeFilterButton: {
      backgroundColor: '#1A1A1A',
      color: '#fff',
   },
   itemContainer: {
      padding: 10,
      marginBottom: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff'
   },
   contentFuel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
   },
   textFuel: {
      fontWeight: 'bold',
   },
   scrollableTextContainer: {
      flex: 1,

   },
});
