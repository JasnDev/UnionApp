import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
const FeedWithTopics = () => {
  const categories = ['Todos', 'Música', 'Games', 'Culinaria', 'Engraçados'];  // Adiciona a opção "Todos"
  const [index, setIndex] = useState(0);  // Índice inicial é 0, ou seja, "Todos"
  const [audios, setAudios] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isFocused = useIsFocused(); // Verifica se a tela está em foco

  useEffect(() => {
    const categoria = categories[index];  // Obtém o tópico atual com base no índice
    let url = 'http://10.145.45.33:3030/audios';  // URL base para requisição

    // Verifica se a categoria é "Todos", se for, não aplica filtro
    if (categoria !== 'Todos') {
      url += `?topico=${categoria}`;  // Adiciona o filtro para a categoria selecionada
    }

    axios.get(`http://10.145.45.26:3030/audios?categoria=${categoria}`).get(url) // Filtro por tópico ou todos os áudios
      .then((response) => {
        if (response.data.length === 0) {
          setAudios([]); // Caso não haja áudios para o tópico
        } else {
          setAudios(response.data);
          AudioPlay(response.data[0].url, 0); // Toca o primeiro áudio ao carregar
        }
      })
      .catch((error) => {
        console.error('Erro na requisição:', error.response || error.message);
        setAudios([]); // Garantir que o estado fique vazio em caso de erro
      });
  }, [index]);

  useEffect(() => {
    if (isFocused) {
      if (audios.length > 0) {
        AudioPlay(audios[playingIndex]?.url, playingIndex);
      }
    } else {
      AudioPause();
    }

    return () => {
      if (!isFocused) {
        AudioPause();
      }
    };
  }, [isFocused]);

  const AudioPlay = async (uri, index) => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync(); // Descarregar o áudio anterior
    }
  
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: true }
      );
  
      setCurrentSound(sound);
      setPlayingIndex(index);
      setIsPlaying(true);
  
      sound.setOnPlaybackStatusUpdate((status) => {
        setIsPlaying(status.isPlaying);
      });
    } catch (error) {
      console.error('Erro ao reproduzir o áudio:', error);
    }
  };
  
  const AudioPause = async () => {
    if (currentSound) {
      await currentSound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      AudioPause();
    } else {
      AudioPlay(audios[playingIndex]?.url, playingIndex);
    }
  };

  const handleSwipeDown = () => {
    const nextIndex = (index + 1) % categories.length;
    setIndex(nextIndex);
  };

  const handleSwipeLeft = () => {
    if (playingIndex < audios.length - 1) {
      AudioPlay(audios[playingIndex + 1]?.url, playingIndex + 1);
    }
  };
  
  const handleSwipeRight = () => {
    if (playingIndex > 0) {
      AudioPlay(audios[playingIndex - 1]?.url, playingIndex - 1);
    }
  };

  const config = {
    velocityThreshold: 0.5,
    directionalOffsetThreshold: 80,
  };

  return (
    <GestureRecognizer
      onSwipeDown={handleSwipeDown}
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      config={config}
      style={styles.gestureContainer}
      scrollEnabled={false}
    >
      <View style={styles.backgroundContainer}></View>
      <View style={styles.topicsContainer}>
        <Text style={styles.topicText}>{categories[index]}</Text>
      </View>
      
      <View style={styles.audioContainer}>
        {audios.length > 0 ? (
          <View style={styles.titleAndButtonContainer}>
             <MaterialIcons style={styles.icon} name="graphic-eq" size={85} color="black" />

            <Text style={styles.filename}>{audios[playingIndex]?.filename}</Text>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.playPauseButtonContainer}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noAudioMessage}>Nenhum áudio disponível</Text>
        )}
      </View>
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  gestureContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    
    
  },
  topicsContainer: {
    marginTop: 0,
    marginBottom: 30,
    backgroundColor: '#A9CD6F',
    padding: 30,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  topicText: {
    color: '#000000',
    fontSize: 18,
    textAlign: 'center',
  },
  audioContainer: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    bottom: '35',
    height: '65%',
    width: Dimensions.get('window').width,
    backgroundColor: '#BFE87A',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,  
    marginTop: 150,
    height:200,
    
  },
  titleAndButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filename: {
    color: '#00000',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  playPauseButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAudioMessage: {
    color: '#FFF',
    fontSize: 16,
  },
  icon: {
    marginBottom: 60,
  
  }
});

export default FeedWithTopics;
