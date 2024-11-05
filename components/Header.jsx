import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
    const navigation = useNavigation()


    return (
        <View style={styles.headerContainer}>

                <Pressable style={styles.iconLeft} onPress={() => navigation.navigate('Login')}>
                    <FontAwesome name="user-o" size={24} color="#000" />
                </Pressable>

                <Pressable style={styles.iconCenter}>
                    <AntDesign name="pluscircleo" size={35} color="#000" />
                </Pressable>
                <Pressable style={styles.iconCenter} onPress={() => localStorage.clear()}>
                      sair
                </Pressable>
                
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
        alignItems: 'center',
    },
});

export default Header;
