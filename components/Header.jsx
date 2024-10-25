import FontAwesome from '@expo/vector-icons/FontAwesome';;
import AntDesign from '@expo/vector-icons/AntDesign';;
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Header } from 'react-native/Libraries/NewAppScreen';

const Header = () => {
    <View styles={styles.headerContainer}>
        <View styles={styles.iconContainer}>

            {/* Navegação para o perfil do usuário */}
            <Link href="/perfil" asChild>   
                <TouchableOpacity styles={styles.icon}>
                    <FontAwesome name="user-o" size={24} color="black" />
                </TouchableOpacity>
            </Link>
    
            <TouchableOpacity styles={styles.icon}>
                <AntDesign name="pluscircleo" size={24} color="black" />
            </TouchableOpacity>
        </View>
    </View>
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginHorizontal: 10,
    },
})

export default Header;