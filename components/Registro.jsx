import React from "react";
import { StyleSheet, TextInput, View, Pressable, Text } from "react-native";
import { Link } from "expo-router";

const Registro = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registro</Text>

            <Text style={styles.label}>Nome de Usuário: </Text>
            <TextInput
                style={styles.input}
                placeholder="Insira o nome de usuário."
            />

            <Text style={styles.label}>E-mail: </Text>
            <TextInput
                style={styles.input}
                placeholder="Insira seu e-mail."
            />

            <Text style={styles.label}>Senha: </Text>   
            <TextInput 
                style={styles.input}
                placeholder="Insira sua senha."
            />

            <Text style={styles.label}>Confirme sua senha: </Text>
            <TextInput 
                style={styles.input}
                placeholder="Confirme sua senha."
            />

            <Link href={'/login'}>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Confirme</Text>
                </Pressable>
            </Link>
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
});

export default Registro;
