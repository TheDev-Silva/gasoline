import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Pressable, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface FuelType {
   id: number;
   name: string;
}

interface ItemProps {
   placeholder: string;
   value: string;
   label: string;
   onChange: (value: string) => void;
   options: FuelType[];
}

export default function SelectIFuelType({ placeholder, value, label, onChange, options }: ItemProps) {
   const [isVisible, setVisible] = useState(false);

   return (
      <View style={styles.container}>
         <Pressable
            style={styles.selector}
            onPress={() => setVisible(true)}
         >
            <Text style={{ fontSize: 16, color: '#000' }}>
               {value ? options.find(option => option.id.toString() === value)?.name : placeholder}
            </Text>
            <Feather name={isVisible ? 'arrow-up' : 'arrow-down'} size={24} color="#000" />
         </Pressable>

         <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setVisible(false)}
         >
            <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
               <View style={styles.modalContent}>
                  <FlatList
                     contentContainerStyle={{ gap: 10 }}
                     data={options}
                     keyExtractor={(item) => item.id.toString()}
                     renderItem={({ item }) => (
                        <TouchableOpacity
                           style={styles.option}
                           onPress={() => {
                              onChange(item.id.toString());
                              setVisible(false);
                           }}
                        >
                           <Text style={{ fontSize: 16, color: '#fff' }}>{item.name}</Text>
                        </TouchableOpacity>
                     )}
                  />
               </View>
            </Pressable>
         </Modal>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      width: '100%',
      marginBottom: 5,
      backgroundColor: '#fff',
      borderRadius: 10
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
      alignItems: 'center'
   },
   modalContent: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 8,
      width: '80%'
   },
   option: {
      width: 270,
      backgroundColor: '#1A1A1A',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',

   },
});
