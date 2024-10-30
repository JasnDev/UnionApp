import React from "react";
import { StyleSheet ,TextInput, View, Pressable, Text } from "react-native";
import { Link } from "expo-router";

const Registro = () => {
    return (
        <View style={styles.container}>
            <Text>Registro</Text>

            <Text>Nome de Usuário: </Text>
            <TextInput
                placeholder="Insira o nome de usuário."
            />

            <Text>E-mail: </Text>
            <TextInput
                placeholder="Insira seu e-mail."
            />

            <Text>Senha: </Text>   
            <TextInput 
                placeholder="Insira sua senha."
            />

            <Text>Confirme sua senha: </Text>
            <TextInput 
                placeholder="Confirme sua senha."
            />
            
            <Link href={'/login'}>
            <Pressable>
                <Text>Confirme</Text>
            </Pressable>
            </Link>
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

export default Registro;