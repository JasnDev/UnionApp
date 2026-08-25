import React, { useCallback, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const TOKEN_KEY = 'Authorization-token';

const Header = () => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            let cancelled = false;

            const fetchToken = async () => {
                try {
                    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
                    if (!cancelled) {
                        setToken(storedToken || ''); // garante string, mesmo se null
                    }
                } catch (error) {
                    console.log('Erro ao buscar token:', error);
                } finally {
                    if (!cancelled) setLoading(false);
                }
            };

            fetchToken();

            // Evita setState após o componente perder foco/desmontar
            // enquanto a leitura do AsyncStorage ainda está em andamento.
            return () => {
                cancelled = true;
            };
        }, [])
    );

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            setToken('');
            navigation.navigate('Login');
        } catch (error) {
            console.log('Erro ao limpar o token:', error);
        }
    };

    return (
        <View style={styles.headerContainer}>
         <View style={styles.headerLine} />

            {loading ? (
                <ActivityIndicator size="small" color="#00F0FF" />
            ) : token ? (
                <View style={styles.iconsContainer}>
                <Pressable
    style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.iconButtonPressed,
    ]}
    onPress={() => navigation.navigate('post')}
    accessible
    accessibilityRole="button"
    accessibilityLabel="Adicionar novo áudio"
    accessibilityHint="Abre a tela para publicar um áudio"
>
    <AntDesign name="plus" size={28} color="#000000" />
</Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.logoutButton, pressed && styles.iconButtonPressed]}
                        onPress={handleLogout}
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel="Sair da conta"
                    >
                        <Text style={styles.logoutText}>SAIR</Text>
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    style={({ pressed }) => [styles.loginButton, pressed && styles.iconButtonPressed]}
                    onPress={() => navigation.navigate('Login')}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Entrar na conta"
                >
                    <FontAwesome name="user-o" size={22} color="#020202" />
                </Pressable>
            )}
        </View>
    );
};

const NEON = '#2E7D32';
const BG = '#FFFFFF';
const PANEL = '#F1F8E9';
const BORDER = '#A5D6A7';

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 44,
        paddingBottom: 22,
        backgroundColor: PANEL,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    headerLine: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 1,
        backgroundColor: NEON,
        opacity: 0.3,
    },
    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButton: {
        marginHorizontal: 16,
        padding: 4,
    },
    iconButtonPressed: {
        opacity: 0.6,
    },
    logoutButton: {
        marginHorizontal: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: BORDER,
    },
    logoutText: {
        color: '#1B5E20',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    loginButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BG,
    },
});

export default Header;