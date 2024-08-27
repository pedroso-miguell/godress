import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const hasToken = async () => {
    const token = await AsyncStorage.getItem('jwtToken');

    if (token) {
      router.replace('(tabs)');
    }
  };

  useEffect(() => {
    hasToken();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer1}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Olá</Text>
          <Text style={styles.subtitle}>Bem-vindo a GoDress</Text>
        </View>
        <Image
          source={require('../../assets/images/Gzao.png')}
          style={styles.image}
        />
      </View>
      <View style={styles.subcontainer2}>
        <Link href={'/auth/login'} style={styles.button}>
          Login
        </Link>
        <Link href={'/auth/register'} style={styles.button}>
          Cadastre-se
        </Link>
      </View>
      <Text style={{ color: 'grey', fontSize: 10 }}>powered by GoDress</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  subcontainer1: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    paddingTop: 120,
  },
  subcontainer2: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 52,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#8F8F8F',
  },
  image: {
    width: 100, 
    height: 100, 
    resizeMode: 'contain', 
  },
  button: {
    backgroundColor: '#593C9D',
    borderRadius: 5,
    paddingVertical: 15, 
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    width: '100%',
    textAlign: 'center',
  },
});
