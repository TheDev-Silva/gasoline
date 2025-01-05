import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, FlatList, ScrollView } from 'react-native';
import { GasStations } from '@/types/fuelPrice';
import { Feather } from '@expo/vector-icons';

interface GasStationsProps {
   value: number | string;
   placeholder: string;
   name: string;
   address: string;
   options: GasStations[];
   selectedValue: number | string;
   onValueChange: (value: string) => void;
   onChange: (value: string) => void;
}

const SelectFuelPosto = ({ options, selectedValue, onValueChange, placeholder, value }: GasStationsProps) => {
   const [isVisible, setIsVisible] = useState(false);

   // Filtrar opções para mostrar apenas postos únicos ou com endereços diferentes
   const filteredOptions = useMemo(() => {
      const seen = new Set<string>();
      return options.filter((option) => {
         const key = `${option.name.trim().toLowerCase()}-${option.address.trim().toLowerCase()}`;
         if (seen.has(key)) {
            return false;
         }
         seen.add(key);
         return true;
      });
   }, [options]);

   const getSelectedName = () => {
      const selectedOption = options.find((opt) => opt.id.toString() === value?.toString());
      return selectedOption ? selectedOption.name : placeholder;
   };


   return (
      <View style={styles.container}>
         <Pressable
            style={styles.selector}
            onPress={() => setIsVisible(true)}
         >
            <Text style={{ fontSize: 16, color: '#000' }}>{getSelectedName()}</Text>
            <Feather name={isVisible ? 'arrow-up' : 'arrow-down'} size={24} color="#000" />
         </Pressable>

         <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsVisible(false)}
         >

            <Pressable style={styles.overlay} onPress={() => setIsVisible(false)}>
               <View style={styles.modalContent}>
                  <FlatList
                     contentContainerStyle={{ gap: 10 }}
                     data={filteredOptions}
                     keyExtractor={(item) => item.id.toString()}
                     renderItem={({ item }) => (
                        <TouchableOpacity
                           style={styles.option}
                           onPress={() => {
                              onValueChange(item.id.toString());
                              setIsVisible(false);
                           }}
                        >
                           <Text style={{ fontSize: 16, color: '#fff' }} numberOfLines={1}>
                              {item.name}
                           </Text>
                           <Text style={{ fontSize: 12, color: '#fff' }} numberOfLines={1}>
                              {item.address}
                           </Text>
                        </TouchableOpacity>
                     )}
                  />
               </View>
            </Pressable>


         </Modal>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      width: '100%',
      marginBottom: 5,
      backgroundColor: '#fff',
      borderRadius: 10,
   },
   selector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 13,
      borderWidth: 1,
      borderColor: '#1a1a1a',
      borderRadius: 8,
   },
   overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
   },
   modalContent: {
      justifyContent: 'center',
      alignItems: 'center',
      maxHeight: 400,
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 8,
      width: '80%',
   },
   option: {
      width: 270,
      backgroundColor: '#1A1A1A',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
   },
});

export default SelectFuelPosto;
