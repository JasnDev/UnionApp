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
                <Text style={styles.title}>Sign-in</Text>


            <View style={styles.buttonContainer}>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Entrar</Text>
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

            {/* Seção de Registrar, fixada no rodapé */}
            <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem uma conta? </Text>
                <Pressable style={ styles.registerButton}>
                    <Text style={styles.buttonText}>Registrar</Text>
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
    },
    container: {
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: '#2F4F4F',
        marginBottom: 8,
        alignSelf: 'flex-start',
        paddingLeft: 55,
    },
    input: {
        width: '70%',
        paddingVertical: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        borderColor: '#8FBC8F',
        borderWidth: 1.5,
        borderRadius: 10,
        marginBottom: 30,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 25,
    },
    button: {
        padding: 35,
        backgroundColor: '#75943E',
        borderRadius: 8,
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
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    registerText: {
        fontSize: 16,
        color: '#2F4F4F',
    },
    registerButton: {
        marginLeft: 10,
        paddingHorizontal: 20,  // Largura personalizada para ficar mais como um botão
        padding: 10,
        backgroundColor: '#313B22',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Login;
