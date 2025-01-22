import { View, Text, Modal, StyleSheet, Pressable, GestureResponderEvent, Alert, TouchableOpacity, Image, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard'
import { URL_API } from '../../constants/base';
import useFuelPrices from './context/fuelPriceAPI';


interface SearchBarModalProps {
   visible: boolean;
   onClosed: (closed: boolean) => void;
}


const SearchBarModal: React.FC<SearchBarModalProps> = ({ visible, onClosed }) => {
   const [isLoading, setIsLoading] = useState(false);
   const router = useRouter();
   const textToCopy = 'c652e227-dcbc-419b-a224-c4f109f95fd9';

   const handleLogout = async () => {
      setIsLoading(true);
      setTimeout(() => {
         router.replace('/login');
         Toast.show({
            type: 'success',
            text2: 'Você foi desconectado com sucesso.',
         });
         setIsLoading(false);
      }, 2000);
   };

   const deleteUser = async () => {
      setIsLoading(true);
      Alert.alert(
         'Confirmação',
         'Tem certeza que deseja excluir sua conta e seu histórico?',
         [
            { text: 'Cancelar', style: 'cancel' },
            {
               text: 'Apagar',
               onPress: async () => {
                  try {
                     const token = await AsyncStorage.getItem('tokenAuthentication');
                     if (!token) {
                        Toast.show({
                           type: 'error',
                           text1: 'Erro',
                           text2: 'Token de autenticação não encontrado!',
                        });
                        return;
                     }

                     const response = await fetch(`${URL_API}/delete-userId`, {
                        method: 'DELETE',
                        headers: {
                           'Content-Type': 'application/json',
                           Authorization: `Bearer ${token}`,
                        },
                     });

                     if (response.ok) {
                        Toast.show({
                           type: 'success',
                           text2: 'Sua conta foi excluída com sucesso!',
                        });
                        await AsyncStorage.removeItem('tokenAuthentication');
                        router.replace('/login');
                     } else {
                        const error = await response.json();
                        Toast.show({
                           type: 'error',
                           text2: error.message || 'Não foi possível excluir sua conta.',
                        });
                     }
                  } catch (error) {
                     Toast.show({
                        type: 'error',
                        text2: 'Erro ao excluir a conta.',
                     });
                  } finally {
                     setIsLoading(false);
                  }
               },
            },
         ]
      );
   };

   const copyToClipboard = async () => {
      try {
         await Clipboard.setStringAsync(textToCopy);
         Toast.show({
            type: 'success',

            text2: 'Texto copiado para a área de transferência',
         });
      } catch (error) {
         Toast.show({
            type: 'error',

            text2: 'Não foi possível copiar para a área de transferência',
         });
      }
   };



   return (
      <Modal
         key={visible ? 'visible' : 'hidden'}
         animationType="fade"
         transparent={true}
         visible={visible}
         onRequestClose={() => onClosed(true)}
      >
         <View style={styles.container}>
            <View style={{ flex: 1, width: '100%' }}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 20 }}>Menu</Text>
                  <TouchableOpacity onPress={() => onClosed(true)}>
                     <Ionicons name="close" size={24} />
                  </TouchableOpacity>
               </View>
               <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' }}>
                     Deseja ajudar o desenvolvedor?
                  </Text>
                  <Text>faça uma doação.</Text>

                  <TouchableOpacity
                     onPress={copyToClipboard}
                     style={{ padding: 5, backgroundColor: '#f04242' }}
                  >
                     <Image
                        source={require('./../../assets/images/ajudeoautor.jpg')}
                        style={{ width: 230, height: 230 }}
                     />
                     <Text style={{ color: '#fff', paddingVertical: 5 }}>
                        escaneie ou clique no QR-Code
                     </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     onPress={copyToClipboard}
                     style={{
                        marginTop: 10,
                        padding: 10,
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#c5c5c5',
                        borderRadius: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                     }}
                  >
                     <Text>Copiar Texto</Text>
                  </TouchableOpacity>
                  <Text style={{ marginTop: 10 }}>"{textToCopy}"</Text>
               </View>
            </View>

            <View style={{ flexDirection: 'column', width: '100%', gap: 10 }}>
               <Pressable
                  onPress={handleLogout}
                  disabled={isLoading}
                  style={[styles.buttonLog, isLoading && { opacity: 0.6 }]}
               >
                  <Text style={styles.buttonText}>
                     {isLoading ? 'Deslogando...' : 'Deslogar'}
                  </Text>
                  <Ionicons name="log-out-outline" size={30} color="#fff" />
               </Pressable>

               <Pressable
                  onPress={deleteUser}
                  disabled={isLoading}
                  style={[
                     styles.buttonLog,
                     { backgroundColor: '#f04242' },
                     isLoading && { opacity: 0.6 },
                  ]}
               >
                  <Text style={styles.buttonText}>Excluir Conta</Text>
                  <AntDesign name="delete" size={30} color="#fff" />
               </Pressable>
            </View>
         </View>
      </Modal>
   );
};


const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      width: '100%',
      padding: 15
   },
   buttonLog: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      backgroundColor: '#1A1A1A',
      padding: 12,
      borderRadius: 8
   },
   buttonText: {
      textAlign: 'center',
      color: '#fff',
      fontSize: 18
   }
})

export default SearchBarModal