import React, { useState } from "react";
import { StyleSheet, TextInput, View, Pressable, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as Crypto from 'expo-crypto';
import { AppContext } from '../contexts/context.js';
import { useContext } from "react";
const Login = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [token, SetToken] = useContext(AppContext);
    const navigation = useNavigation();


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

    function loginSaveDates() {
        
        hashPassword(senha).then((hashedPassword) => {
            if (hashedPassword) {
                axios.post('http://10.0.0.225:3030/login', {
                    email: email,
                    senha: hashedPassword  
                },{
                    headers: {'Content-Type': 'application/json'}
                 }).then((response) => {
                    SetToken(`Authorization-token ${response.data.jwt}`)
                    navigation.navigate("Home");
                    Alert.alert("LOGADO")
                }).catch((error) => {
                    console.log(error);
                    console.log("erro")
                    Alert.alert("ERRO EMAIL OU SENHA INCORRETOS")
                });
            } else {
                setError('Erro ao gerar o hash da senha');
            }
        });
    }
    

    return (
        <View style={styles.mainContainer} accessible={true} accessibilityLabel="Tela de Login do usuário">
            <View style={styles.container}>
                <Text style={styles.title}>Sign-in</Text>

                <Text style={styles.label}>E-mail: </Text>
                <TextInput
                onChangeText={(text) => setEmail(text)}
                style={styles.input}
                placeholder="Insira seu e-mail."
                />

                <Text style={styles.label}>Senha: </Text>
                <TextInput 
                onChangeText={(text) => setSenha(text)}
                style={styles.input}
                placeholder="Insira sua senha."
                />

            <View style={styles.buttonContainer}>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText} onPress={loginSaveDates}>Entrar</Text>
                </Pressable>
            </View>

            <Text style={styles.orText} accessibilityLabel="Entrar em sua conta com">Entrar com:</Text>

            <View style={styles.socialContainer}>
                <Pressable style={[styles.socialButton, styles.googleButton]}>
                    <Text style={styles.socialText}>Google</Text>
                </Pressable>

                <Pressable style={[styles.socialButton, styles.facebookButton]}>
                    <Text style={styles.socialText}>Facebook</Text>
                </Pressable>
            </View>

            {/* Seção de Registrar, fixada no rodapé  */}
            <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem uma conta? </Text>
                <Pressable style={ styles.registerButton} onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.buttonresgisterText}>Registrar</Text>
                </Pressable>
            </View>
           
        </View>
    </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#E7F1D6',
        width: '100%',
    },
    container: {
       
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 35,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: '#2F4F4F',
        marginBottom: 8,
        alignSelf: 'flex-start',
        paddingLeft: 35,
    },
    input: {
        width: '100%',
        paddingVertical: 18,
        paddingHorizontal: 40,
        fontSize: 16,
        backgroundColor: '#fff',
        borderColor: '#556639',
        borderWidth: 1.5,
        borderRadius: 10,
        marginBottom: 30,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 25,

    },
    button: {
        padding: 35,
        backgroundColor: '#75943E',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
      
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    orText: {
        fontSize: 16,
        color: '#2F4F4F',
        marginVertical: 20,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '70%',
    },
    socialButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '45%',
    },
    googleButton: {
        backgroundColor: '#556639',
    },
    facebookButton: {
        backgroundColor: '#556639',
    },
    socialText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 35,
    },
    registerText: {
        fontSize: 16,
        color: '#2F4F4F',
        padding: 10,
    },
    buttonresgisterText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    registerButton: {
        padding: 20,
        backgroundColor: '#75943E',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    }
});

export default Login;
