import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGIN_URL = 'http://10.0.0.61:3030/login';
const TOKEN_KEY = 'Authorization-token';

const Login = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const hashPassword = async (plainPassword) => {
        try {
            return await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                plainPassword
            );
        } catch (error) {
            console.error('Erro ao gerar o hash da senha', error);
            return null;
        }
    };

    const handleLogin = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !senha) {
            Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha para continuar.');
            return;
        }

        setLoading(true);
        try {
            const hashedPassword = await hashPassword(senha);
            if (!hashedPassword) {
                Alert.alert('Erro', 'Não foi possível processar a senha. Tente novamente.');
                return;
            }

            const response = await axios.post(
                LOGIN_URL,
                { email: trimmedEmail, senha: hashedPassword },
                { headers: { 'Content-Type': 'application/json' } }
            );

            await AsyncStorage.setItem(TOKEN_KEY, response.data.token);

            // reset (em vez de navigate) para que o usuário não consiga voltar
            // para a tela de Login pelo botão "voltar" depois de logado.
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);

            // Diferencia erro de credenciais de erro de rede/servidor,
            // em vez de sempre mostrar "email ou senha incorretos".
            if (error.response) {
                const status = error.response.status;
                if (status === 401 || status === 400) {
                    Alert.alert('Erro', 'E-mail ou senha incorretos.');
                } else {
                    Alert.alert('Erro', `Servidor respondeu com erro (${status}). Tente novamente.`);
                }
            } else if (error.request) {
                Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor. Verifique sua internet.');
            } else {
                Alert.alert('Erro', 'Algo deu errado ao tentar fazer login.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer} accessible accessibilityLabel="Tela de Login do usuário">
            <View style={styles.gridOverlay} pointerEvents="none" />

            <View style={styles.container}>
                <Text style={styles.title}>SIGN-IN</Text>
                <Text style={styles.subtitle}>Acesse sua conta</Text>

                <Text style={styles.label}>E-MAIL</Text>
                <TextInput
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#4C5D73"
                    value={email}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                />

                <Text style={styles.label}>SENHA</Text>
                <TextInput
                    onChangeText={setSenha}
                    style={styles.input}
                    placeholder="Insira sua senha"
                    placeholderTextColor="#4C5D73"
                    secureTextEntry
                    value={senha}
                    autoCapitalize="none"
                    textContentType="password"
                />

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        loading && styles.buttonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#0B0F1A" />
                    ) : (
                        <Text style={styles.buttonText}>ENTRAR</Text>
                    )}
                </Pressable>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Não tem uma conta?</Text>
                    <Pressable onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>Registrar</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const NEON = '#00F0FF';
const BG = '#0B0F1A';
const PANEL = '#121826';
const BORDER = '#1E2A3D';

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: BG,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        width:'100%'
    },

    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderColor: BORDER,
        opacity: 0.5,
    },

    container: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: NEON,
        letterSpacing: 3,
        marginBottom: 6,
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 13,
        color: '#7FA9B5',
        marginBottom: 32,
        letterSpacing: 1,
        textAlign: 'center',
    },

    label: {
        width: '100%',
        fontSize: 11,
        color: '#7FA9B5',
        letterSpacing: 1.5,
        marginBottom: 8,
        textAlign: 'left',
    },

    input: {
        width: '100%',
        height: 54,
        paddingHorizontal: 18,
        fontSize: 15,
        backgroundColor: PANEL,
        borderColor: BORDER,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 22,
        color: '#E6F7FA',
    },

    button: {
        width: '100%',
        height: 54,
        backgroundColor: NEON,
        borderRadius: 10,

        alignItems: 'center',
        justifyContent: 'center',

        marginTop: 4,

        shadowColor: NEON,
        shadowOpacity: 0.5,
        shadowRadius: 14,
        shadowOffset: {
            width: 0,
            height: 0,
        },

        elevation: 8,
    },

    buttonPressed: {
        opacity: 0.85,
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    buttonText: {
        fontSize: 15,
        color: BG,
        fontWeight: '800',
        letterSpacing: 1.5,
    },

    registerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 28,
    },

    registerText: {
        fontSize: 13,
        color: '#7FA9B5',
        marginRight: 6,
    },

    registerLink: {
        fontSize: 13,
        color: NEON,
        fontWeight: '700',
    },
});

export default Login;