import React, { useState } from "react";
import { StyleSheet, TextInput, View, Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const Login = () => {
    const[email, setEmail]=useState('');
    const [senha, setSenha]=useState('');

    const navigation = useNavigation()
    async function logi (){
        await axios.post('http://localhost:3030/login',{
             email:email,
             senha:senha
             
         },{
            headers: {'Content-Type': 'application/json'}
         }).then(async(response)=>{
            localStorage.setItem('Authorization-token',response.data.jwt)
            console.log("deu certo")
            navigation.navigate('Home')
         }).catch((error) => {
            console.log(error)
         })
     }
    return (
        <View style={styles.mainContainer} accessible={true} accessibilityLabel="Tela de Login do usuário">
            <View style={styles.container}>
                <Text style={styles.title}>Login</Text>


            <Text style={styles.label}>E-mail: </Text>
            <TextInput
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Insira seu e-mail."
            />

            <Text style={styles.label}>Senha: </Text>
            <TextInput 
                onChange={(e) => setSenha(e.target.value)}
                style={styles.input}
                placeholder="Insira sua senha."
            />

        
                <Pressable style={styles.button} onPress={logi}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </Pressable>
           

                <Pressable style={[styles.button, styles.registerButton]} onPress={() => navigation.navigate("Register")}>
                    <Text style={[styles.buttonText, styles.registerButtonText]}>Registrar</Text>
                </Pressable>
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
        backgroundColor: '#F0F8FF',
    },
    container: {
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2F4F4F',
        marginBottom: 30,
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        color: '#2F4F4F',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    input: {
        width: '70%',
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        borderColor: '#8FBC8F',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 25,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Centraliza os botões
        width: '100%',
        marginBottom: 20,
    },
    button: {
        width: '40%',
        padding: 14,
        backgroundColor: '#3CB371',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10, // Espaço entre os botões
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    registerButton: {
        backgroundColor: '#8FBC8F',
    },
    registerButtonText: {
        color: '#2F4F4F',
    },
    orText: {
        fontSize: 16,
        color: '#2F4F4F',
        marginVertical: 20,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    socialButton: {
        backgroundColor: '#2F4F4F',
        padding: 12,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    socialText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Login;
