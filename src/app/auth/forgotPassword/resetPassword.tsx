import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '@/src/services/api';
import { router } from 'expo-router';

type FormData = {
    token: string;
    password: string;
    confirm_password: string;
}

const registerSchema = yup.object({
    token: yup.string().required('Código é obrigatório'),
    password: yup.string()
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
        .matches(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .matches(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
        .matches(/[0-9]/, 'Senha deve conter pelo menos um número')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial')
        .required('Senha é obrigatória'),
    confirm_password: yup.string()
        .required('Confirme a senha')
        .oneOf([yup.ref('password')], 'As senhas devem ser iguais!')
}).required();

interface ApiError {
    response?: {
        data?: {
            msg: string;
        };
    };
}

export default function ResetPassword() {
    const [resultData, setResultData] = useState<string | null>(null);

    const form = useForm<FormData>({
        defaultValues: {
            token: "",
            password: "",
            confirm_password: ""
        },
        resolver: yupResolver(registerSchema),
    });

    const { handleSubmit, control, formState: { errors }, reset } = form;

    const resendToken = async () => {
        const email = await AsyncStorage.getItem('userEmail');

        try {
            const response = await Api.post('/auth/forgot_password', { email });
            setResultData(response.data.msg);
            reset();
        } catch (error) {
            const apiError = error as ApiError;
            console.error(apiError.response?.data);
            setResultData(apiError.response?.data?.msg || 'Ocorreu um erro.');
        }
    }

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const email = await AsyncStorage.getItem('userEmail')

        try {
            const response = await Api.post('/auth/reset_password', {
                email,
                token: data.token,
                password: data.password
            });
            setResultData(response.data.msg);
            reset();
            await AsyncStorage.removeItem('userEmail');
            router.replace('/');
        } catch (error) {
            const apiError = error as ApiError;
            console.error(apiError.response?.data);
            setResultData(apiError.response?.data?.msg || 'Ocorreu um erro.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.subtitle}>Digite o código e a nova senha para redefinir sua senha.</Text>

            <Controller
                control={control}
                name="token"
                render={({ field: { value, onChange } }) => (
                    <>
                        <TextInput
                            style={styles.input}
                            onChangeText={onChange}
                            placeholder="Código"
                            value={value}
                            autoCapitalize="none"
                        />
                        {errors.token && <Text style={styles.error}>{errors.token.message}</Text>}
                    </>
                )}
            />

            <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange } }) => (
                    <>
                        <TextInput
                            style={styles.input}
                            onChangeText={onChange}
                            placeholder="Nova senha"
                            value={value}
                            autoCapitalize="none"
                            secureTextEntry
                        />
                        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
                    </>
                )}
            />

            <Controller
                control={control}
                name="confirm_password"
                render={({ field: { value, onChange } }) => (
                    <>
                        <TextInput
                            style={styles.input}
                            onChangeText={onChange}
                            placeholder="Confirmar senha"
                            value={value}
                            autoCapitalize="none"
                            secureTextEntry
                        />
                        {errors.confirm_password && <Text style={styles.error}>{errors.confirm_password.message}</Text>}
                    </>
                )}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.resendButton} onPress={resendToken}>
                    <Text style={styles.buttonText}>Reenviar código</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.buttonText}>Alterar senha</Text>
                </TouchableOpacity>
            </View>

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
    error: {
        color: 'red',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
    },
    buttonContainer: {
        marginTop: 30,
        gap: 15,
    },
    resendButton: {
        backgroundColor: '#ddd',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#593C9D',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 16,
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
