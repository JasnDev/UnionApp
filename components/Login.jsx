import React from "react";
import { StyleSheet ,TextInput, View, Pressable, Text } from "react-native";
import { Link } from "expo-router";

const Login = () => {
    return (
        <View style={styles.container}>
            <Text>Login</Text>

            <Text>E-mail: </Text>
            <TextInput
                placeholder="Insira seu e-mail."
            />

            <Text>Senha: </Text>   
            <TextInput 
                placeholder="Insira sua senha."
            />
            
            <Link href={'/'}>
            <Pressable>
                <Text>Entrar</Text>
            </Pressable>
            </Link>

            
            <Link href={'/registro'}>
            <Pressable>
                <Text>Registrar</Text>
            </Pressable>
            </Link>

            <Text>Entrar com:</Text>

            <Pressable>
                <Text>Google</Text>
            </Pressable>

            <Pressable>
                <Text>Facebook</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
});

export default Login;