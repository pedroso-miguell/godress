import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { router, Link } from 'expo-router';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

import Api from '@/src/services/api';
import { useClothes } from '@/src/services/contexts/clothesContext';
import LoadingScreen from '../../hooks/LoadingScreen'; // Importa o componente de tela de carregamento

type FormData = {
    email: string;
    password: string;
}

const registerSchema = yup.object({
    email: yup.string().email('Email inválido').required('Email é obrigatório'),
    password: yup.string().required('Senha é obrigatória'),
}).required();

export default function Login() {
    const [resultData, setResultData] = useState<string | null>(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const { getClothes } = useClothes();

    const form = useForm<FormData>({
        defaultValues: {
            email: "",
            password: ""
        },
        resolver: yupResolver(registerSchema),
    });

    const { handleSubmit, control, formState: { errors }, reset } = form;

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true); // Inicia o carregamento

        try {
            const response = await Api.post('/auth/login', data);
            console.log(response.data);
            setResultData(response.data.msg);
            reset();

            const { token } = response.data;
            await AsyncStorage.setItem('jwtToken', token);

            getClothes();
            router.replace('(tabs)'); // Navega para as tabs após o login
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response: { data: { msg: string } } };
                console.log(err.response.data);
                setResultData(err.response.data.msg);
            } else {
                console.error('Unexpected error', error);
            }
        } finally {
            setLoading(false); // Para o carregamento
        }
    };

    if (loading) {
        return <LoadingScreen />; // Retorna a tela de carregamento se estiver carregando
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.topContainer}>
                <Text style={styles.title}>Faça Login</Text>
                <Image
                    source={require('../../../assets/images/Gzao.png')}
                    style={styles.image}
                />
            </View>

            <View style={styles.formContainer}>
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
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Senha"
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry={!isPasswordVisible}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                                <Icon name={isPasswordVisible ? "eye" : "eye-off"} size={24} color="#000" /> 
                            </TouchableOpacity>
                            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
                        </View>
                    )}
                />

                <TouchableOpacity>
                    <Link href={"/auth/forgotPassword/sendEmail"} style={styles.link}>Esqueci a senha</Link>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                {resultData && (
                    <View style={styles.resultContainer}>
                        <Text style={{ fontWeight: "500", marginBottom: 10 }}>Status:</Text>
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
        justifyContent: 'space-between',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 100,
    },
    backButton: {
        marginRight: 10,
    },
    image: {
        width: 60,
        height: 70,
        marginLeft: 70,
    },
    title: {
        fontSize: 40,
        fontWeight: '400',
        textAlign: 'center',
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
        color: "#fff",
        fontWeight: "700",
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
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
        padding: 10,
    },
    error: {
        color: 'red',
        alignSelf: 'flex-start',
        fontSize: 10,
        fontWeight: '500',
        marginBottom: 10,
    },
    resultContainer: {
        marginTop: 20,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
        width: '100%',
        gap: 10,
    },
    resultText: {
        fontSize: 14,
    },
    link: {
        textDecorationLine: "underline",
        color: "#593C9D",
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
});
