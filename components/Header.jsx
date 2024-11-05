import FontAwesome from '@expo/vector-icons/FontAwesome';
<<<<<<< HEAD
import AntDesign from '@expo/vector-icons/AntDesign';
import { View, StyleSheet, Pressable,Text } from 'react-native';
=======
import { View, StyleSheet, Pressable, Text } from 'react-native';
>>>>>>> 53076ecc69a3cf41d289552788b357d668ea9926
import { useNavigation } from '@react-navigation/native';

const Header = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.headerContainer}>
                <Pressable style={styles.iconLeft} onPress={() => navigation.navigate('Login')}>
                    <FontAwesome name="user-o" size={24} color="#000" />
                </Pressable>

<<<<<<< HEAD
                <Pressable style={styles.iconCenter} onPress={() => navigation.navigate('post')}>
                    <AntDesign name="pluscircleo" size={35} color="#000" />
                </Pressable>
                <Pressable style={styles.iconCenter} onPress={() => localStorage.clear()}>
                      <Text> Sair </Text>
=======
                <Pressable style={styles.iconCenter} onPress={() => localStorage.clear()}>
                      <Text>Sair</Text>
>>>>>>> 53076ecc69a3cf41d289552788b357d668ea9926
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
        position: 'relative',
    },
});

export default Header;
