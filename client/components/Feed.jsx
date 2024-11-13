import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, StyleSheet, View, Text, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const Feed = () => {
  const [audios, setAudios] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);

  useEffect(() => {
    axios
      .get('http://10.0.0.225:3030/audios')  // Chama a API para obter todos os áudios
      .then((response) => {
        const audioData = response.data.map((item, index) => ({
          id: index.toString(),
          filename: item.filename,
          url: item.url,  // Agora a URL completa é retornada
        }));
        setAudios(audioData);
      })
      .catch((error) => {
        console.error('Erro ao buscar os áudios:', error);
      });
  }, []);

  const AudioPlay = async (audiouri, index) => {
    // Pausa e descarrega o áudio anterior se houver
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    }

    try {
      // Cria um novo áudio e começa a tocar
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audiouri },
        { shouldPlay: true }
      );
      setCurrentSound(sound);
      setPlayingIndex(index);

      // Atualiza o estado de reprodução quando o áudio terminar
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingIndex(null);
          setCurrentSound(null);
        }
      });
    } catch (error) {
      console.error('Erro ao reproduzir o áudio:', error);
    }
  };

  const pauseAudio = async () => {
    if (currentSound) {
      await currentSound.pauseAsync();
      setPlayingIndex(null);
    }
  };

  return (
    <SafeAreaView>
      <FlatList
        data={audios}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.container}>
            <Pressable
              onPress={() =>
                playingIndex === index ? pauseAudio() : AudioPlay(item.url, index)
              }
              style={styles.playButton}
            >
              <Ionicons
                size={30}
                color="#FFF"
                name={playingIndex === index ? 'pause' : 'play'}
              />
            </Pressable>
            <Text style={styles.filename}>{item.filename}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Feed;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
    width: 200,  // Ajuste o tamanho para exibir melhor o carrossel
    height: 250, // Ajuste o tamanho do item no carrossel
  },
  playButton: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
  },
  filename: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center', // Centraliza o texto
    marginTop: 5, // Dá um espaço entre o texto e o botão
  },
});
