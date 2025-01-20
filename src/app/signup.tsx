import React, { useState } from 'react';
import {
   View,
   Text,
   TextInput,
   Alert,
   Pressable,
   StyleSheet,
   ActivityIndicator,
   TouchableOpacity,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { URL_API } from '../../constants/base';

export default function SignUp() {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [passVisible, setPassVisible] = useState(false)
   const [isLoading, setIsLoading] = useState(false);

   const router = useRouter()

   const handleRegister = async () => {
      if (name && email && password) {
         setIsLoading(true)
         try {
            const response = await fetch(`https://gas-price-api.vercel.app/register`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();

            if (response.ok && data.token) {
               // Salvar o token e navegar para a página segura
               await AsyncStorage.setItem('tokenAuthentication', data.token);
               console.log(data);
               router.push('/welcome');
               if (response.statusText === '401') {
                  Alert.alert('Sessão Expirada', 'Por favor, faça login novamente.');
                  
                  await AsyncStorage.removeItem('tokenAuthentication');
                  router.push('/login'); // Redireciona para a tela de login
               }
            } else {
               Alert.alert('Error', data.error || 'Falha ao registrar');
            }
         } catch (error) {
            Alert.alert('Error', 'Erro ao registrar usuário');
            setIsLoading(false)
         }finally {
            setIsLoading(false)
         }
      } else {
         Alert.alert('Atenção', 'Existe campos vazios');
      }
      
   };

   const visible = () => {

      setPassVisible(!passVisible)
   }


   return (
      <View style={styles.container}>
         <View style={{ padding: 20, flexDirection: 'column', gap: 5, alignItems: 'center' }}>
            <MaterialCommunityIcons name="gas-station-outline" size={50} color="#f04242" />
            <Text style={styles.title}>Criar Conta</Text>
         </View>

         <View style={styles.viewContainer}>
            <View style={{ gap: 15 }}>
               <View style={{ flexDirection: 'row', gap: 10, position: 'relative', alignItems: 'center', boxShadow: '0px 3px 6px #0009', borderRadius: 8 }}>
                  <TextInput
                     placeholder="Nome"
                     style={[styles.input]}
                     value={name}
                     onChangeText={setName}
                  />

               </View>
               <View style={{ flexDirection: 'row', gap: 10, position: 'relative', alignItems: 'center', boxShadow: '0px 3px 6px #0009', borderRadius: 8 }}>

                  <TextInput
                     placeholder="E-mail"
                     style={styles.input}
                     value={email}
                     onChangeText={setEmail}
                     keyboardType="email-address"
                  />
               </View>
               <View style={{ flexDirection: 'row', gap: 10, position: 'relative', alignItems: 'center', boxShadow: '0px 3px 6px #0009' }}>
                  <TextInput
                     placeholder="Senha"
                     style={styles.input}
                     value={password}
                     onChangeText={setPassword}
                     secureTextEntry={!passVisible}
                  />
                  <Pressable onPress={() => visible()} style={{ position: 'absolute', right: 10 }}>
                     <MaterialCommunityIcons name={passVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color={'#0009'} />
                  </Pressable>
               </View>
            </View>

            <TouchableOpacity
               onPress={handleRegister}
               disabled={isLoading}
               style={[
                  styles.button,
                  isLoading && { backgroundColor: Colors.green_dark.dark },
               ]}
            >
               {isLoading ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                     <Text>Registrando...</Text>
                     <ActivityIndicator color={Colors.green_dark.white} />
                  </View>
               ) : (
                  <Text style={styles.buttonText}>Registrar</Text>
               )}
            </TouchableOpacity>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',

      backgroundColor: Colors.green_dark.white,
   },
   viewContainer: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      flex: 1,
      backgroundColor: "#f04242",
      justifyContent: 'space-between'
   },
   title: {
      fontSize: 30,
      fontWeight: 'bold',
   },
   input: {
      width: '100%',
      height: 50,

      padding: 15,
      borderRadius: 8,
      backgroundColor: Colors.green_dark.white,
      fontSize: 17
   },
   button: {
      width: '100%',
      backgroundColor: "#1A1A1A",
      padding: 18,
      borderRadius: 8,
      zIndex: 1
   },
   buttonText: {
      color: Colors.green_dark.white,
      textAlign: 'center',
      fontSize: 18,
   },
});
