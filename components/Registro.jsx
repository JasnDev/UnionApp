import React, {useState} from "react";
import { StyleSheet, TextInput, View, Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios'

const Registro = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [senha, setSenha] = useState('');
    const [nome,setNome] = useState('');
    

    const navigation = useNavigation();

    async function regi (){
       await axios.post('http://10.145.45.50:3030/registro',{
            nome:nome,
            email:email,
            senha:senha
        }).then(() => {navigation.navigate("Login")}).catch((error) => {
            console.log(error)
        })
    };

    const emailRegex = /^\S+@\S+\.\S+$/;

    const validacaoDados = () => {
        if (!emailRegex.test(email)) {
            setError('Email inválido.');
            return false;
        }
        if (senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caractéres.');   
            return false;
        }
        else {
            setError('')
            return true;
        };
    };

    return (
        <View style={styles.container} accessible={true} accessibilityLabel="Tela de registro do usuário.">
            <Text style={styles.title}>Registro</Text>

            <Text style={styles.label}>Nome de Usuário: </Text>
            <TextInput
                style={styles.input}
                placeholder="Insira o nome de usuário."
                onChange={(e) => setNome(e.target.value)}
            />

            <Text style={styles.label}>E-mail: </Text>
            <TextInput
                style={styles.input}
                placeholder="Insira seu e-mail."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                keyboardType="email-address"
            />

            <Text style={styles.label}>Senha: </Text>   
            <TextInput 
                style={styles.input}
                placeholder="Insira sua senha."
                onChange={(e) => setSenha(e.target.value)}
            />

            <Text style={styles.label}>Confirme sua senha: </Text>
            <TextInput 
                style={styles.input}
                placeholder="Confirme sua senha."
            />

            {error ? 
            <Text style={styles.errorText}
            accessible={true} 
            accessibilityLabel={error}>
                {error}
            </Text> 
            : null}


            <Pressable style={styles.button} accessibilityLabel="botão para confirmar o registro" onPress={regi}> 
                <Text style={styles.buttonText}>Confirme</Text>
            </Pressable>
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
        marginTop: 5,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 15,
        color: 'red',
    }
});

export default Registro;
