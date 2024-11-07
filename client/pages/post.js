import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../client/components/Header.jsx'
import Topicos from '../client/components/Topicos.jsx'
import PostagemAudio from '../client/components/PostagemAudio.jsx';


export default function Postpage() {
    return (
      <View >
        <PostagemAudio />
        <StatusBar style="auto" />
      </View>
    );
  }