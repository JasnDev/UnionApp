import React from "react";
import { StyleSheet ,TextInput, View, Pressable, Text } from "react-native";

const Signup = () => {
    return (
        <View style={styles.container}>
            <Text>Sign-Up</Text>

            <Text>E-mail: </Text>
            <TextInput
                placeholder="E-mail."
            />

            <Text>Senha: </Text>   
            <TextInput 
                placeholder="Senha."
            />

            <Pressable>
                <Text>Entrar</Text>
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

export default Signup;