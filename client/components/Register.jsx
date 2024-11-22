import React, { useState } from "react";
import { StyleSheet, TextInput, View, Pressable, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import * as Crypto from 'expo-crypto';

const Register = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [nome, setNome] = useState('');
    const [error, setError] = useState('');

    const navigation = useNavigation();

    // Função de hash da senha
    const hashPassword = async (senha) => {
        try {
            const hashedPassword = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                senha
            );
            return hashedPassword;
        } catch (error) {
            console.error('Erro ao gerar o hash da senha', error);
            return null;
        }
    };

    // Expressão regular para validação de e-mail
    const emailRegex = /^\S+@\S+\.\S+$/;

    // Função para validar dados antes de enviar
    const validacaoDados = () => {
        if (!emailRegex.test(email)) {
            setError('E-mail inválido');
            return false;
        }
        if (senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return false;
        }
        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem');
            return false;
        }
        setError('');
        return true;
    };

    // Função para registro do usuário
    const regi = async () => {
        if (validacaoDados()) {
            // Gerando o hash da senha
            hashPassword(senha).then((hashedPassword) => {
                if (hashedPassword) {
                    axios.post('http://10.145.45.33:3030/registro', {
                        nome: nome,
                        email: email,
                        senha: hashedPassword
                    })
                    .then(() => {
                        navigation.navigate("Login");
                        Alert.alert("Registrado com sucesso!");
                    })
                    .catch(() => {
                        Alert.alert("Erro", "E-mail já cadastrado ou erro no servidor.");
                    });
                } else {
                    setError('Erro ao gerar o hash da senha');
                }
            });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registro</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome de usuário"
                value={nome}
                onChangeText={(text) => setNome(text)}
            />

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={(text) => setSenha(text)}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChangeText={(text) => setConfirmarSenha(text)}
                secureTextEntry
            />

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Pressable style={styles.button} onPress={regi}>
                <Text style={styles.buttonText}>Confirmar Registro</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E7F1D6',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        width: '100%',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 40,
    },
    input: {
        width: 270,
        height: 70,
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        backgroundColor: '#fff',
        borderColor: '#556639',
        borderWidth: 1.5,
        borderRadius: 10,
        marginBottom: 20,
        color: '#333',
    },
    button: {
        width: '50%',
        padding: 14,
        backgroundColor: '#75943E',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 15,
        color: 'red',
        marginBottom: 10,
    },
});

export default Register;
