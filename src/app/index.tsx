import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated, Easing } from 'react-native';
import { Colors } from '../../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage'

/* interface imagePropos {
   image: string
} */

export default function Index() {
   const router = useRouter();
   const [isLoading, setIsloading] = useState(false)
   const rotateValue = useRef(new Animated.Value(0)).current; // Valor animado para rotação


   useEffect(() => {

      const checkAuthentication = async () => {
         const token = await AsyncStorage.getItem('authToken');
         if (token) {
            router.push('/welcome');
         } else {
            router.push('/');
         }
      }

      checkAuthentication()
   }, [])



   useEffect(() => {
      setIsloading(true)
      setTimeout(() => {
         startRotation(); // Inicia a rotação ao montar o componente
         setIsloading(false)
      }, 2000);
   }, []);

   const startRotation = () => {

      rotateValue.setValue(0)

      Animated.loop(
         Animated.timing(rotateValue, {
            toValue: 1,
            duration: 7000,
            easing: Easing.linear,
            delay: 500,
            useNativeDriver: true,
         }),
      ).start()
   };


   // Interpolação para rotação
   const rotateAnimation = rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
   });

   const handleInitial = () => {

      setIsloading(true)
      setTimeout(() => {

         router.push('/login')
         setIsloading(false)
      }, 2000);
   }

   return (
      <View style={styles.container}>
         <View style={styles.content}>
            {/* Imagem estática */}
            <Image
               source={require('./../../assets/images/icon-gasoline-price1.png')}
               alt="logo"
               style={{
                  objectFit: 'contain',
                  width: 250,
                  height: 250,

               }}
            />
            {/* Imagem animada */}
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

         <Pressable onPress={handleInitial} style={styles.button/* { width: '80%', backgroundColor: Colors.green_dark.light, padding: 20, borderRadius: 8, marginTop: 50 } */}>
            <Text style={styles.buttonText/* { color: Colors.green_dark.white, textAlign: 'center', textTransform: 'uppercase' } */}>{isLoading ? 'Iniciando...' : 'Iniciar'}</Text>
         </Pressable>
         <Text style={styles.buttonText}></Text>


         {/* Botão visível após completar os ciclos */}

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
      backgroundColor: "#fff",
      padding: 18,
      borderRadius: 8,
   },
   buttonText: {
      color: "#1a1a1a",
      textAlign: 'center',
      fontSize: 18,
   },
});
