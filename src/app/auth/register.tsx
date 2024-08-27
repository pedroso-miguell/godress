import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importa o ícone

import Api from '@/src/services/api';
import { router } from 'expo-router';

type FormData = {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirm_password: string;
};

const registerSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  surname: yup.string().required('Sobrenome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .matches(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .matches(/[0-9]/, 'Senha deve conter pelo menos um número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial')
    .required('Senha é obrigatória'),
  confirm_password: yup
    .string()
    .required('Confirme a senha')
    .oneOf([yup.ref('password')], 'As senhas devem ser iguais!'),
}).required();

export default function Register() {
  const [resultData, setResultData] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Começa com a senha oculta (olho fechado)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Começa com a senha de confirmação oculta (olho fechado)

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      password: '',
      confirm_password: '',
    },
    resolver: yupResolver(registerSchema),
  });

  const { handleSubmit, control, formState: { errors }, reset } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await Api.post('/auth/register', {
      name: data.name,
      surname: data.surname,
      email: data.email,
      password: data.password,
    })
      .then(function (response) {
        console.log(response.data);
        setResultData(response.data.msg);
        router.navigate('/auth/login');
        reset();
      })
      .catch(function (error) {
        console.log(error.response.data);
        setResultData(error.response.data.msg);
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Cadastre-se</Text>
        <Image
          source={require('../../../assets/images/Gzao.png')}
          style={styles.image}
        />
      </View>

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
              />
              {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
            </>
          )}
        />
        <Controller
          control={control}
          name="surname"
          render={({ field: { value, onChange } }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Sobrenome"
                onChangeText={onChange}
                value={value}
              />
              {errors.surname && <Text style={styles.error}>{errors.surname.message}</Text>}
            </>
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <>
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                placeholder="Email"
                value={value}
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
            </>
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordIcon}
                >
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="black" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
            </>
          )}
        />
        <Controller
          control={control}
          name="confirm_password"
          render={({ field: { value, onChange } }) => (
            <>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar senha"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.showPasswordIcon}
                >
                  <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={24} color="black" />
                </TouchableOpacity>
              </View>
              {errors.confirm_password && <Text style={styles.error}>{errors.confirm_password.message}</Text>}
            </>
          )}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        {resultData && (
          <View style={styles.resultContainer}>
            <Text style={{ fontWeight: '500', marginBottom: 10 }}>Status:</Text>
            <Text style={styles.resultText}>{resultData}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 100,
  },
  image: {
    width: 60,
    height: 70,
    marginLeft: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: '400',
    flex: 1,
    textAlign: 'left',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#593C9D',
    borderRadius: 5,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    width: '100%',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 10,
  },
  error: {
    color: 'red',
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '500',
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  resultText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
});
