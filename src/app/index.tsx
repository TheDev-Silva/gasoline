import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFuelPrices from './context/fuelPriceAPI';

export default function Index() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(true);
   const rotateValue = useRef(new Animated.Value(0)).current;
   //const { checkAuthentication } = useFuelPrices()

   // Função para validar o token com a API externa
   /* const validateToken = async (token: string) => {
      try {
         // Chame a API para verificar a validade do token
         const response = await fetch('https://gas-price-api.vercel.app/validate-token', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
         });

         if (response.ok) {
            const data = await response.json();
            return data.valid; // Suponha que a API retorne um campo `valid`
         }
         return false;
      } catch (error) {
         console.error('Erro ao validar token:', error);
         return false;
      }
   };

   // Verificar autenticação
   const checkAuthentication = async () => {
      setIsLoading(true);
      try {
         const token = await AsyncStorage.getItem('tokenAuthentication');
         if (token) {
            const isValid = await validateToken(token);
            if (isValid) {
               router.push('/welcome'); // Redireciona para a tela de boas-vindas
            } else {
               await AsyncStorage.removeItem('tokenAuthentication'); // Remove o token expirado
               router.push('/login'); // Redireciona para a tela de login
            }
         } else {
            router.push('/login'); // Redireciona para a tela de login
         }
      } catch (error) {
         console.error('Erro ao verificar autenticação:', error);
         router.push('/login'); // Redireciona para login em caso de erro
      } finally {
         setIsLoading(false); // Finaliza o estado de carregamento
      }
   }; */

   // Inicializar animação
   const startRotation = () => {
      rotateValue.setValue(0);
      Animated.loop(
         Animated.timing(rotateValue, {
            toValue: 1,
            duration: 7000,
            easing: Easing.linear,
            useNativeDriver: true,
         })
      ).start();
   };

   /* useEffect(() => {
      checkAuthentication(); // Verifica a autenticação ao montar o componente
      startRotation(); // Inicia a animação
   }, []); */

   // Interpolação para animação de rotação
   const rotateAnimation = rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
   });

   return (
      <View style={styles.container}>
         <View style={styles.content}>
            <Image
               source={require('./../../assets/images/icon-gasoline-price1.png')}
               alt="logo"
               style={{
                  objectFit: 'contain',
                  width: 250,
                  height: 250,
               }}
            />
            <Animated.Image
               source={require('./../../assets/images/icon-gasoline-price2.png')}
               alt="logo"
               style={{
                  objectFit: 'contain',
                  width: 285,
                  height: 285,
                  position: 'absolute',
                  transform: [{ rotate: rotateAnimation }],
               }}
            />
         </View>
         {!isLoading && (
            <Pressable onPress={() => router.push('/login')} style={styles.button}>
               <Text style={styles.buttonText}>
                  {isLoading ? 'Carregando...' : 'Iniciar'}
               </Text>
            </Pressable>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
   },
   content: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: 430,
   },
   button: {
      width: '80%',
      backgroundColor: '#fff',
      padding: 18,
      borderRadius: 8,
      marginTop: 50,
   },
   buttonText: {
      color: '#1a1a1a',
      textAlign: 'center',
      fontSize: 18,
   },
});
