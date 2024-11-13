import { Audio } from 'expo-av';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Button, Pressable, Text, View, StyleSheet } from 'react-native';

const AudioPost = () => {
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileUrl, setFileUrl] = useState(null); 
  
  const num = Math.random() * 100; 
  
  // Função para iniciar a gravação
  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error('Erro ao iniciar a gravação:', error);
    }
  };

  // Função para parar a gravação
  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      const fileUri = FileSystem.documentDirectory + `audio_file${num}.m4a`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      setFileUrl(fileUri); // Corrigido para armazenar o URI do arquivo corretamente
      console.log('Áudio salvo em:', fileUri);
    } catch (error) {
      console.error('Erro ao parar a gravação:', error);
    }
  };

  const save = async () => {
    const fileUri = fileUrl;
    const file = {
      uri: fileUri,
      type: 'audio/m4a', 
      name: `audio_file${num}.m4a`
    };
  
    const formData = new FormData();
    formData.append('audio', file);
  
    try {
      const response = await fetch('http://10.145.45.33:3030/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });
  
      const data = await response.json();
      console.log('Áudio enviado com sucesso:', data);
    } catch (error) {
      console.error('Erro ao enviar o áudio:', error);
    }
  };
  
  // Função para reproduzir o áudio
  const playAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUrl },
        { shouldPlay: true }
      );
      setSound(sound);
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Erro ao tentar reproduzir o áudio', error);
    }
  };

  // Função para pausar a reprodução do áudio
  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Solicitar permissões de gravação e configurar o áudio
  useEffect(() => {
    Audio.requestPermissionsAsync()
      .then(({ granted }) => {
        if (granted) {
          Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: true
          });
        }
      });

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View accessible={true} accessibilityLabel='Página para criação de áudios.'>
      <Text>Reproduzindo Áudio Localmente</Text>
      {recordingUri && (
        <>
          <Button
            title={isPlaying ? 'Pausar' : 'Tocar'}
            onPress={isPlaying ? pauseAudio : playAudio}
          />
          {isPlaying ? <Text>Áudio em reprodução...</Text> : <Text>Áudio pausado</Text>}
        </>
      )}
      {!recordingUri && <Text>Sem áudio gravado para reproduzir.</Text>}
      <Pressable onPressIn={startRecording} onPressOut={stopRecording} >
      <FontAwesome accessibilityLabel='Gravar' name="microphone" size={60} color='black'/>
      </Pressable>
      <Pressable onPress={save} >
        <Text>Postar o áudio.</Text>
      </Pressable>
    </View>
  );
};

export default AudioPost;

const styles = StyleSheet.create({
});
