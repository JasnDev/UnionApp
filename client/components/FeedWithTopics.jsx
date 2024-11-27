import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const FeedWithTopics = () => {
  const categories = ['Todos', 'Música', 'Games', 'Culinaria', 'Engraçados']; // Add the "Todos" option
  const [index, setIndex] = useState(0); // Initial index is 0, which means "Todos"
  const [audios, setAudios] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isFocused = useIsFocused(); // Check if the screen is focused

  useEffect(() => {
    const categoria = categories[index]; // Get the current topic based on the index
    let url = 'http://10.145.45.50:3030/audios'; // Base URL for the request

    // If the category is not "Todos", apply a filter for the selected category
    if (categoria !== 'Todos') {
      url += `?topico=${categoria}`;
    }

    // Make the API request with the URL
    axios.get(url)
      .then((response) => {
        if (response.data.length === 0) {
          setAudios([]); // If no audio for the topic
        } else {
          setAudios(response.data);
          AudioPlay(response.data[0].url, 0); // Play the first audio when data is loaded
        }
      })
      .catch((error) => {
        console.error('Error in request:', error.response || error.message);
        setAudios([]); // Ensure the state is empty in case of an error
      });
  }, [index]);

  useEffect(() => {
    // Handle if the screen is focused or not
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
      // Stop and unload any currently playing audio before playing a new one
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
      console.error('Error while playing audio:', error);
    }
  };

  const AudioPause = async () => {
    if (currentSound) {
      // Pause audio only if it is currently playing
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
    setIndex(nextIndex); // Cycle through the categories
  };

  const handleSwipeLeft = () => {
    if (playingIndex < audios.length - 1) {
      AudioPlay(audios[playingIndex + 1]?.url, playingIndex + 1); // Go to the next audio
    }
  };

  const handleSwipeRight = () => {
    if (playingIndex > 0) {
      AudioPlay(audios[playingIndex - 1]?.url, playingIndex - 1); // Go to the previous audio
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
            <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButtonContainer}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={40} color="#000" />
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
