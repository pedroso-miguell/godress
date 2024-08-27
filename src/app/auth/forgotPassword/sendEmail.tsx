import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '@/src/services/api';
import { router } from 'expo-router';

type FormData = {
    email: string;
}

const registerSchema = yup.object({
    email: yup.string().email('Email inválido').required('Email é obrigatório')
}).required();

interface ApiError {
    response?: {
        data?: {
            msg: string;
        };
    };
}

export default function ForgotPassword() {
    const [resultData, setResultData] = useState<string | null>(null);

    const form = useForm<FormData>({
        defaultValues: {
            email: ""
        },
        resolver: yupResolver(registerSchema),
    });

    const { handleSubmit, control, formState: { errors }, reset } = form;

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            const response = await Api.post('/auth/forgot_password', { ...data });
            setResultData(response.data.msg);
            reset();
            await AsyncStorage.setItem('userEmail', data.email);
            router.push('/auth/forgotPassword/resetPassword');
        } catch (error) {
            const apiError = error as ApiError;
            console.error(apiError.response?.data);
            setResultData(apiError.response?.data?.msg || 'Ocorreu um erro.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Esqueceu a senha?</Text>
            <Text style={styles.subtitle}>Sem problemas, enviaremos um email de alteração de senha para você.</Text>
            
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
                            keyboardType="email-address"
                            returnKeyType="done"
                        />
                        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                    </>
                )}
            />
            
            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>

            {resultData && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Status:</Text>
                    <Text style={styles.resultText}>{resultData}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#593C9D',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 16,
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
    },
    resultTitle: {
        fontWeight: '500',
        marginBottom: 10,
    },
    resultText: {
        fontSize: 14,
    },
});
