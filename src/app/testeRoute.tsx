import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';


interface User {
  id: string;
  name: string;
  email: string
}

export default function TesteToute() {

  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)


  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('tokenAuthentication');
      console.log(token)
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Erro de autenticação',
          text2: 'Token de autenticação não encontrado.',
        });
        setIsLoading(false);
        console.log('Token enviado', token)
        return;

      }

      const response = await fetch(`https://gas-price-api.vercel.app/register-userId`, {
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


  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ width: '50%', height: 40, borderRadius: 8, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}
        onPress={fetchUserData}
      >
        {isLoading ? <ActivityIndicator /> : <Text style={{ textAlign: 'center', color: '#fff' }}>Buscar dados</Text>}
      </TouchableOpacity>
      <Text>Silva Developer { }</Text>
      {user ? (
        <Text>{user.name}</Text>
      ) : null}
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
});