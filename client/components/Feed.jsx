import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, StyleSheet, View, Text, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const Feed = () => {
  const [audios, setAudios] = useState([]); // Lista de URIs dos áudios
  const [sounds, setSounds] = useState([]); // Estado para armazenar instâncias de áudio
  const [duracao, setDuracao] = useState([]); // Duração de cada áudio
  const [playingIndex, setPlayingIndex] = useState(null); // Índice do áudio que está tocando

  useEffect(() => {
    // Fetch de áudios da API
    axios
      .get('http://10.145.44.63:3030/aud')
      .then((response) => {
        const audioUris = response.data.map((item) => item.uri);
        setAudios(audioUris);
      })
      .catch((error) => {
        console.error('Erro ao buscar os áudios:', error);
      });
  }, []);

  // Função para tocar o áudio
  async function AudioPlay(audiouri, index) {
    if (!audiouri) {
      console.log('URI não encontrada');
      return;
    }

    try {
      // Cria o som e inicializa
      const { sound } = await Audio.Sound.createAsync({ uri: audiouri });
      await sound.setPositionAsync(0); // Inicia o áudio no início
      await sound.playAsync(); // Toca o áudio

      // Armazena a instância de áudio para controle futuro
      setSounds((prevSounds) => {
        const newSounds = [...prevSounds];
        newSounds[index] = sound;
        return newSounds;
      });

      // Atualiza o índice do áudio tocando
      setPlayingIndex(index);

      // Obtém a duração do áudio
      const status = await sound.getStatusAsync();
      setDuracao((prevDuracao) => {
        const newDuracao = [...prevDuracao];
        newDuracao[index] = status.durationMillis;
        return newDuracao;
      });

      // Monitora a atualização do progresso do áudio
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          const currentPosition = status.positionMillis;
          const duration = status.durationMillis;
          if (currentPosition === duration) {
            setPlayingIndex(null); // Quando o áudio termina, limpa o índice de reprodução
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  // Função para pausar o áudio
  async function pauseAudio(index) {
    const sound = sounds[index];
    if (sound) {
      await sound.pauseAsync();
      setPlayingIndex(null); // Pausa o áudio
    }
  }

  return (
    <SafeAreaView>
      <FlatList
        data={audios}
        renderItem={({ item, index }) => {
          const currentDuration = duracao[index] || 0; // Duração do áudio, se disponível
          const durationInSeconds = (currentDuration / 1000).toFixed(2); // Converte para segundos
          const progress = (currentDuration > 0 ? (currentDuration / duracao[index]) * 100 : 0) // Cálculo do progresso da barra

          return (
            <View style={styles.container}>
              <Pressable
                onPress={() =>
                  playingIndex === index ? pauseAudio(index) : AudioPlay(item, index)
                }
                style={styles.playButton}
              >
                <Ionicons size={30} color="#FFF" name={playingIndex === index ? 'pause' : 'play'} />
              </Pressable>

              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${progress}%` }]} />
              </View>

              <Text style={styles.time}>{durationInSeconds}s</Text>
            </View>
          );
        }}
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
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: '#777',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  time: {
    color: '#FFF',
    fontSize: 12,
  },
});
