import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import Topicos from '../components/Topicos';
import Feed from '../components/Feed';

export default function HomePage() {
  return (
    <View>
      <View>
        <Header/>
        <Topicos />
      </View>
      <View style={styles.container}>
        <Feed />
        <StatusBar style="auto" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
