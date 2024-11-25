import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const Header = () => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const fetchToken = async () => {
                try {
                    const storedToken = await AsyncStorage.getItem('Authorization-token');
                    setToken(storedToken || ''); // Garante que o token será uma string, mesmo se null
                } catch (error) {
                    console.log('Erro ao buscar token:', error);
                } finally {
                    setLoading(false); // Garante que o estado de carregamento será atualizado
                }
            };

            fetchToken();
        }, [])
    );

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('Authorization-token');
            setToken(''); // Reseta o token
        } catch (error) {
            console.log('Erro ao limpar o token:', error);
        }
    };

    return (
        <View style={styles.headerContainer}>
            {loading ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : token ? (
                <View style={styles.iconsContainer}>
                    <Pressable
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('post')}
                    >
                        <AntDesign name="pluscircleo" size={35} color="#000" />
                    </Pressable>
                    <Pressable style={styles.iconButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.iconCenter}>
                    <Pressable onPress={() => navigation.navigate('Login')}>
                        <FontAwesome name="user-o" size={24} color="#000" />
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
        justifyContent: 'center',
        paddingTop: 40,
        paddingBottom: 30,
        backgroundColor: '#92B061',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#3d3b37',
       
    },
    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButton: {
        marginHorizontal: 20,
        
        
    },
    logoutText: {
        color: '#00000',
        fontSize: 16,
    },
    iconCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Header;
