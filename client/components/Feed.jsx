import React, { useState, useEffect, useRef } from 'react';
import { FlatList, View, Text, Dimensions, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const Feed = ({ categoria }) => {
  const [audios, setAudios] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null); // Para controle da barra de progresso
  const [waveAnimation, setWaveAnimation] = useState(new Animated.Value(0)); // Animação da onda
  const flatListRef = useRef(null); // Ref para o FlatList

  useEffect(() => {
    axios
      .get(`http://10.145.45.33:3030/audios?categoria=${categoria}`)
      .then((response) => {
        const audioData = response.data.map((item, index) => ({
          id: index.toString(),
          filename: item.filename,
          url: item.url,
        }));
        setAudios(audioData);
      })
      .catch((error) => {
        console.error('Erro ao buscar os áudios:', error);
      });
  }, [categoria]);

  const AudioPlay = async (audiouri, index) => {
    if (currentSound) {
      await currentSound.stopAsync(); // Pausa o áudio atual
      await currentSound.unloadAsync(); // Limpa o áudio
    }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audiouri }, { shouldPlay: true });
      setCurrentSound(sound);
      setPlayingIndex(index);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingIndex(null);
          setCurrentSound(null);
        }
        setPlaybackStatus(status); // Atualiza o status de reprodução

        // Inicia a animação de onda
        if (status.isPlaying) {
          startWaveAnimation();
        }
      });
    } catch (error) {
      console.error('Erro ao reproduzir o áudio:', error);
    }
  };

  const AudioPause = async () => {
    if (currentSound) {
      await currentSound.pauseAsync(); // Pausa o áudio
      setPlayingIndex(null); // Atualiza o índice para indicar que não está mais tocando
      setPlaybackStatus(null); // Limpa o status de reprodução
    }
  };

  // Função para iniciar a animação de onda
  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Função para navegar entre os áudios (rolagem rápida)
  const scrollToNextAudio = () => {
    if (flatListRef.current && playingIndex < audios.length - 1) {
      flatListRef.current.scrollToIndex({ index: playingIndex + 1, animated: false }); // Desabilita animação
    }
  };

  const scrollToPreviousAudio = () => {
    if (flatListRef.current && playingIndex > 0) {
      flatListRef.current.scrollToIndex({ index: playingIndex - 1, animated: false }); // Desabilita animação
    }
  };

  return (
    <View style={styles.feedContainer}>
      <FlatList
        ref={flatListRef}
        data={audios}
        horizontal={true} // Exibir itens horizontalmente
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.container}>
            <Text style={styles.filename}>{item.filename}</Text>

            {/* Animação de onda */}
            {playingIndex === index && playbackStatus && playbackStatus.isPlaying ? (
              <Animated.View
                style={[styles.waveContainer, {
                  transform: [
                    {
                      scaleY: waveAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5], // Ajuste o efeito da onda
                      }),
                    },
                  ],
                }]}
              >
                <View style={styles.wave} />
                <View style={styles.wave} />
                <View style={styles.wave} />
              </Animated.View>
            ) : null}

            {/* Botão Play/Pause */}
            <TouchableOpacity
              style={styles.playPauseButtonContainer}
              onPress={() => {
                if (playingIndex === index) {
                  AudioPause(); // Pausa o áudio se estiver tocando
                } else {
                  AudioPlay(item.url, index); // Toca o áudio
                }
              }}
            >
              <Ionicons
                name={playingIndex === index ? 'pause' : 'play'}
                size={30}
                color="#FFF"
                style={styles.playPauseButton}
              />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.flatListContent}
        scrollEventThrottle={16} // Melhora a rolagem (valor mais baixo dá maior controle)
        showsHorizontalScrollIndicator={false} // Remove o indicador de rolagem horizontal
        getItemLayout={(data, index) => ({
          length: Dimensions.get('window').width, // Largura do item para ocupar a tela inteira
          offset: Dimensions.get('window').width * index, // Deslocamento horizontal
          index,
        })}
      />

      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={scrollToPreviousAudio} disabled={playingIndex === 0}>
          <Ionicons name="arrow-back-circle" size={40} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={scrollToNextAudio} disabled={playingIndex === audios.length - 1}>
          <Ionicons name="arrow-forward-circle" size={40} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Feed;

const styles = StyleSheet.create({
  feedContainer: {
    width: Dimensions.get('window').width,
    backgroundColor: '#1C1C1C', // Tom de fundo mais escuro
    paddingVertical: 20,
  },
  flatListContent: {
    alignItems: 'center',
  },
  container: {
    width: Dimensions.get('window').width, // Cada item ocupa a tela inteira
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 15,
    backgroundColor: '#2C2C2C', // Cor do fundo dos itens
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  filename: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  wave: {
    width: 5,
    height: 20,
    marginHorizontal: 5,
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  playPauseButtonContainer: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    padding: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
