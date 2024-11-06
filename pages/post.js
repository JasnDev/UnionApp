import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header.jsx'
import Topicos from '../components/Topicos.jsx'
import PostagemAudio from '../components/PostagemAudio.jsx';


export default function Postpage() {
    return (
      <View >
        <PostagemAudio />
        <StatusBar style="auto" />
      </View>
    );
  }