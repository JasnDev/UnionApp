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
                <ActivityIndicator size="small" color="#fff" />
            ) : token ? (
                <View style={styles.iconsContainer}>
                    <Pressable style={styles.iconButton} onPress={() => navigation.navigate('post')}>
                        <AntDesign name="pluscircleo" size={35} color="#fff" />
                    </Pressable>
                    <Pressable style={styles.iconButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.iconCenter}>
                    <Pressable onPress={() => navigation.navigate('Login')}>
                        <FontAwesome name="user-o" size={24} color="#fff" />
                    </Pressable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',  // Centraliza os ícones verticalmente
        paddingTop: 40,  // Espaço superior para afastar os ícones da câmera do celular
        paddingBottom: 15,
        backgroundColor: '#403d39',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#3d3b37',
    },
    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',  // Centraliza os ícones horizontalmente
    },
    iconButton: {
        marginHorizontal: 20,  // Espaçamento entre os ícones
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
    },
    iconCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Header;
