import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import Topics from '../components/Topics';
import Feed from '../components/Feed';

export default function HomePage() {
  return (
    <View>
        <View>
          <Header/>
        </View>

        <Feed></Feed>
        <Topics> </Topics>
      
    
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
