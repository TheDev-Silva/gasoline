import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Colors } from '../../styles/colors';
import Toast from 'react-native-toast-message'
import { URL_API } from '../../constants/base';

export default function Login() {

   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [passVisible, setPassVisible] = useState(false)
   const [isLoading, setIsLoading] = useState(false);
   const router = useRouter()

   const handleLogin = async () => {

      if (password != "" && email !== "") {
         setIsLoading(true)
         try {
         const response = await fetch(`https://gas-price-api.vercel.app/login`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
               const data = await response.json();
               await AsyncStorage.setItem('tokenAuthentication', data.token); // Salva o novo token
               setTimeout(() => {
                  router.replace('/welcome'); // Redireciona para a tela inicial
                  setIsLoading(false)
               }, 3000);

            } else {
               Toast.show({
                  type: 'error',
                  text1: 'Atenção',
                  text2: 'Email e Senha não existe!',
               })
               //console.error('Erro ao fazer login:', await response.text());
            }
         } catch (error) {
            Toast.show({
               type: 'error',
               text1: 'desculpas!',
               text2: 'Estamos enfretando falha no sevidor!',
            })
            //console.error('Erro na conexão com o servidor:', error);

            setIsLoading(false)
         }
      } else {
         Toast.show({
            type: 'error',
            text1: 'Atenção',
            text2: 'Email ou senha invalidos'
         })
         setIsLoading(false)
      }


   };
   const visible = () => {

      setPassVisible(!passVisible)
   }



   return (
      <View style={styles.container}>
         <View style={{ padding: 20, flexDirection: 'column', gap: 5, alignItems: 'center' }}>
            <MaterialCommunityIcons name="gas-station-outline" size={50} color="#f04242" />
            <Text style={styles.title}>Login</Text>
         </View>

         <View style={styles.viewContainer}>
            <View style={{ gap: 20, }}>
               <View style={{ flexDirection: 'row', gap: 10, position: 'relative', alignItems: 'center', boxShadow: '0px 3px 6px #0009', borderRadius: 8 }}>

                  <TextInput
                     placeholder="E-mail"
                     style={styles.input}
                     value={email}
                     onChangeText={setEmail}
                     keyboardType="email-address"
                  />
               </View>
               <View style={{ flexDirection: 'row', gap: 10, position: 'relative', alignItems: 'center', boxShadow: '0px 3px 6px #0009', borderRadius: 8 }}>

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

            <View style={{ gap: 10, marginTop: 5 }}>


               <TouchableOpacity
                  onPress={handleLogin} // Desabilita o botão se estiver carregando
                  style={[
                     styles.button,
                     password.length > 0 ? { backgroundColor: '#1a1a1a', } : {backgroundColor: '#ffffff'}, // Muda o estilo para indicar carregamento
                  ]}
                  disabled={isLoading} // Impede cliques adicionais
               >
                  <Text style={[styles.buttonText, password.length > 0 ? { color: '#ffffff' }: {color: '#1a1a1a'}]}>{isLoading ? 'Logando...' : 'Logar'}</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={{ fontSize: 16, color: '#fff' }}>ainda não possui conta?</Text>
               </TouchableOpacity>
            </View>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
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
      color: '#1a1a1a'
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
   },
   buttonText: {
      color: Colors.green_dark.white,
      textAlign: 'center',
      fontSize: 18,
   },
});