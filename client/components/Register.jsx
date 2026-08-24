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
import axios from 'axios';
import * as Crypto from 'expo-crypto';

const REGISTER_URL = 'https://unionapp-hrw7.onrender.com/registro';
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const Register = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const hashPassword = async (plainPassword) => {
        try {
            return await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                plainPassword
            );
        } catch (err) {
            console.error('Erro ao gerar o hash da senha', err);
            return null;
        }
    };

    const validarDados = ({ nomeValue, emailValue, senhaValue, confirmarSenhaValue }) => {
        if (!nomeValue) {
            setError('Informe um nome de usuário.');
            return false;
        }
        if (!EMAIL_REGEX.test(emailValue)) {
            setError('E-mail inválido.');
            return false;
        }
        if (senhaValue.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres.');
            return false;
        }
        if (senhaValue !== confirmarSenhaValue) {
            setError('As senhas não coincidem.');
            return false;
        }
        setError('');
        return true;
    };

    const handleRegister = async () => {
        if (loading) return; // evita envio duplicado por toque repetido

        const nomeValue = nome.trim();
        const emailValue = email.trim();

        const isValid = validarDados({
            nomeValue,
            emailValue,
            senhaValue: senha,
            confirmarSenhaValue: confirmarSenha,
        });
        if (!isValid) return;

        setLoading(true);
        try {
            const hashedPassword = await hashPassword(senha);
            if (!hashedPassword) {
                setError('Erro ao gerar o hash da senha. Tente novamente.');
                return;
            }

            await axios.post(REGISTER_URL, {
                nome: nomeValue,
                email: emailValue,
                senha: hashedPassword,
            });

            Alert.alert('Sucesso', 'Registrado com sucesso!');
            navigation.navigate('Login');
        } catch (err) {
            console.error('Erro ao registrar:', err);

            if (err.response) {
                const status = err.response.status;
                if (status === 409 || status === 400) {
                    Alert.alert('Erro', 'E-mail já cadastrado ou dados inválidos.');
                } else {
                    Alert.alert('Erro', `Servidor respondeu com erro (${status}). Tente novamente.`);
                }
            } else if (err.request) {
                Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor. Verifique sua internet.');
            } else {
                Alert.alert('Erro', 'Algo deu errado ao tentar registrar.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.gridOverlay} pointerEvents="none" />

            <Text style={styles.title}>REGISTRO</Text>
            <Text style={styles.subtitle}>Crie sua conta </Text>

            <TextInput
                style={styles.input}
                placeholder="Nome de usuário"
                placeholderTextColor="#444444"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
            />

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#444444"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#444444"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
            />

            <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                placeholderTextColor="#444444"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
            />

         <Text>   {error ? <Text style={styles.errorText}>{error}</Text> : null}</Text>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    loading && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#0B0F1A" />
                ) : (
                    <Text style={styles.buttonText}>REGISTRAR</Text>
                )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Já tem uma conta? <Text style={styles.loginLinkHighlight}> Entrar </Text> </Text>
            </Pressable>
        </View>
    );
};

const NEON = '#2E7D32';
const BG = '#FFFFFF';
const PANEL = '#F1F8E9';
const BORDER = '#A5D6A7';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        width: '100%',
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderColor: BORDER,
        opacity: 0.5,
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
        color: '#4C5D73',
        marginBottom: 32,
        letterSpacing: 1,
    },
    input: {
        width: '100%',
        maxWidth: 320,
        paddingVertical: 16,
        paddingHorizontal: 18,
        fontSize: 15,
        backgroundColor: PANEL,
        borderColor: BORDER,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 16,
        color: '#000000',
    },
    button: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: NEON,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginTop: 12,
        marginBottom: 20,
        shadowColor: NEON,
        shadowOpacity: 0.5,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 0 },
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 15,
        color: '#0B0F1A',
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    errorText: {
        fontSize: 13,
        color: '#FF4D6D',
        marginBottom: 12,
        textAlign: 'center',
    },
    loginLink: {
        fontSize: 13,
        color: '#4C5D73',
        marginTop: 4,
    },
    loginLinkHighlight: {
        color: NEON,
        fontWeight: '700',
    },
});

export default Register;