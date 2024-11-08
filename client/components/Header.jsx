import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { View, StyleSheet, Pressable,Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AppContext } from '../contexts/context';
const Header = () => {
    const navigation = useNavigation();
    const [token, SetToken] = useContext(AppContext);
    return (
        <View style={styles.headerContainer}>

            {token?<View>
                   
                <Pressable style={styles.iconCenter} onPress={() => navigation.navigate('post')}>
                    <AntDesign name="pluscircleo" size={35} color="#000" />
                </Pressable>

                <Pressable style={styles.iconCenter} onPress={() => SetToken(null)}>
                      <Text> Sair </Text>
                </Pressable>
                </View>:
                <Pressable style={styles.iconCenter} onPress={() => navigation.navigate('Login')}>
                    <FontAwesome name="user-o" size={24} color="#000" />
                </Pressable>
             
}
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
        marginLeft:50
    },
});

export default Header;
