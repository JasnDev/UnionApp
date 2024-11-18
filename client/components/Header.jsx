import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = () => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);  // Estado para controle de carregamento
    const navigation = useNavigation();

    useEffect(() => {
        // Função assíncrona para buscar o token do AsyncStorage
        const fetchToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('Authorization-token');
                setToken(storedToken);  // Atualiza o contexto com o token
            } catch (error) {
                console.log("Erro ao buscar token:", error);
            } finally {
                setLoading(false);  // Quando terminar de carregar, muda o estado de loading
            }
        };

        fetchToken();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('Authorization-token');
            setToken(null);  // Atualiza o contexto removendo o token  // Redireciona para a tela de Login
        } catch (error) {
            console.log("Erro ao limpar o token:", error);
        }
    };

    return (
        <View style={styles.headerContainer}>
            {loading ? (
                <ActivityIndicator size="small" color="#000" />
            ) : token ? (
                <View>
                <Pressable style={styles.iconCenter} onPress={() => navigation.navigate('post')}>
                    <AntDesign name="pluscircleo" size={35} color="#000" />
                </Pressable>
                <Pressable style={styles.iconCenter} onPress={handleLogout}>
                    <Text>Sair</Text>
                </Pressable>
            </View>
               
            ) : (
                <View style={styles.iconCenter}>
                    <Pressable style={styles.iconCenter} onPress={() => navigation.navigate('Login')}>
                        <FontAwesome name="user-o" size={24} color="#000" />
                    </Pressable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    iconLeft: {
        position: 'absolute',
        left: 20,
    },
    iconCenter: {
        position: 'relative',
        marginLeft: 50,
    },
});

export default Header;
