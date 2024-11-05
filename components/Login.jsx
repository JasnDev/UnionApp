import React, { useState } from "react";
import { StyleSheet, TextInput, View, Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";


const Login = () => {
    const[email,setemail]=useState('');
    const [senha,setsenha]=useState('');

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
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <Text style={styles.label}>E-mail: </Text>
            <TextInput
                onChange={(e) => setemail(e.target.value)}
                style={styles.input}
                placeholder="Insira seu e-mail."
            />

            <Text style={styles.label}>Senha: </Text>
            <TextInput 
                onChange={(e) => setsenha(e.target.value)}
                style={styles.input}
                placeholder="Insira sua senha."
            />

        
                <Pressable style={styles.button} onPress={logi}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </Pressable>
           

           
                <Pressable style={[styles.button, styles.registerButton]} onPress={() => navigation.navigate("Register")}>
                    <Text style={[styles.buttonText, styles.registerButtonText]}>Registrar</Text>
                </Pressable>
           

            <Text style={styles.orText}>Entrar com:</Text>

            <View style={styles.socialContainer}>
                <Pressable style={styles.socialButton}>
                    <Text style={styles.socialText}>Google</Text>
                </Pressable>
                
                <Pressable style={styles.socialButton}>
                    <Text style={styles.socialText}>Facebook</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8FF', // AliceBlue 
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2F4F4F', // Verde escuro para bom contraste
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        color: '#2F4F4F',
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    input: {
        width: '100%',
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        borderColor: '#8FBC8F', // Verde suave nas bordas para contraste
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        color: '#333',
    },
    button: {
        width: '100%',
        padding: 14,
        backgroundColor: '#3CB371', // Verde médio para o botão
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    registerButton: {
        backgroundColor: '#8FBC8F', // Verde suave para o botão de registro
    },
    registerButtonText: {
        color: '#2F4F4F', // Texto mais escuro no botão de registro
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
        backgroundColor: '#2F4F4F', // Verde escuro nos botões de redes sociais
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