import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const FeedWithTopics = () => {
  const categories = ['Música', 'Games', 'Culinaria', 'Engraçados'];
  const [index, setIndex] = useState(0);
  const [audios, setAudios] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isFocused = useIsFocused(); // Verifica se a tela está em foco

  useEffect(() => {
    const categoria = categories[index];
    axios
      .get(`http://10.145.45.33:3030/audios?categoria=${categoria}`)
      .then((response) => {
        setAudios(response.data);
        if (response.data.length > 0) {
          AudioPlay(response.data[0].url, 0);
        }
      })
      .catch((error) => console.error(error));
  }, [index]);

  useEffect(() => {
    if (isFocused) {
      // Reativa o áudio quando a tela é focada
      if (audios.length > 0) {
        AudioPlay(audios[playingIndex]?.url, playingIndex);
      }
    } else {
      // Pausa o áudio ao sair da tela
      AudioPause();
    }

    return () => {
      if (!isFocused) {
        // Garante que o áudio seja pausado ao desmontar a tela
        AudioPause();
      }
    };
  }, [isFocused]);

  const AudioPlay = async (uri, index) => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
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
    velocityThreshold: 0.3,
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
      <View style={styles.topicsContainer}>
        <Text style={styles.topicText}>{categories[index]}</Text>
      </View>
      <View style={styles.audioContainer}>
        {audios.length > 0 ? (
          <View style={styles.titleAndButtonContainer}>
            <Text style={styles.filename}>{audios[playingIndex]?.filename}</Text>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.playPauseButtonContainer}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color="#FFF"
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
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  topicsContainer: {
    marginTop: 50,
    marginBottom: 30,
    backgroundColor: '#3CB371',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
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
    marginTop: 150,
  },
  titleAndButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filename: {
    color: '#FFF',
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
});

export default FeedWithTopics;
