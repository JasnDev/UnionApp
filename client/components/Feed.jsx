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
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    }

    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audiouri },
        { shouldPlay: true }
      );
      setCurrentSound(sound);
      setPlayingIndex(index);

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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  playButton: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 50,
    marginRight: 15,
  },
  filename: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
  },
});
