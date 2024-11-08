import React, {useState} from "react";
import { StyleSheet, TextInput, View, Pressable, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios'
import * as Crypto from 'expo-crypto';
const Registro = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [senha, setSenha] = useState('');
    const [nome,setNome] = useState('');
    

    const navigation = useNavigation();


    async function regi() {
        
        hashPassword(senha).then((hashedPassword) => {
            if (hashedPassword) {
                axios.post('http://10.145.45.33:3030/registro', {
                    nome: nome,
                    email: email,
                    senha: hashedPassword  
                }).then(() => {
                    navigation.navigate("Login");
                    Alert.alert("REGISTRADO")
                }).catch((error) => {
                    Alert.alert("Email já cadastrado")
                    console.log(error);
                });
            } else {
                setError('Erro ao gerar o hash da senha');
            }
        });
    }
    const hashPassword = async (senha) => {
        try {
            // Gerando o hash da senha usando SHA-256
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

    const emailRegex = /^\S+@\S+\.\S+$/;

    const validacaoDados = () => {
        if (!emailRegex.test(email)) {
            setError('Email inválido.');
            return false;
        }
        if (senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return false;
        } else {
            setError('');
            return true;
        }
    };

    return (
        <View style={styles.container} accessible={true} accessibilityLabel="Tela de registro do usuário.">
            <Text style={styles.title}>Registro</Text>

            <TextInput
                style={styles.input}
                placeholder="Insira o nome de usuário."
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
                placeholder="Insira sua senha."
                onChangeText={(text) => setSenha(text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Confirmar senha"
                secureTextEntry
            />

            {error ? (
                <Text style={styles.errorText} accessible={true} accessibilityLabel={error}>
                    {error}
                </Text>
            ) : null}


            <Pressable style={styles.button} accessibilityLabel="botão para confirmar o registro" onPress={regi}> 
                <Text style={styles.buttonText}>Confirme</Text>
            </Pressable>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E7F1D6', // Cor de fundo semelhante à da imagem
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
        width: '80%', // Definindo a largura para 80% da tela
        paddingVertical: 15,
        paddingHorizontal: 20, // Mantendo um leve padding horizontal
        fontSize: 16,
        backgroundColor: '#fff',
        borderColor: '#556639',
        borderWidth: 1.5, // Largura da borda para que seja visível
        borderRadius: 10, // Bordas arredondadas
        marginBottom: 20, // Menor espaço entre os inputs
        color: '#333',
        
    },
    button: {
        width: '50%', // Reduzindo a largura do botão para se ajustar ao centro
        padding: 14,
        backgroundColor: '#75943E', // Cor verde suave
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
    loginText: {
        marginBottom: 15,
        fontSize: 20, // Aumentando o tamanho do texto principal
        color: '#333',
    },
    errorText: {
        fontSize: 15,
        color: 'red',
        marginBottom: 10,
    },
    loginContainer: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonLogin:{
        width: '35%', // Reduzindo a largura do botão para se ajustar ao centro
        padding: 14,
        backgroundColor: '#313B22', 
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    }
});

export default Registro;
