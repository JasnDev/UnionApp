import { Audio } from 'expo-av';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import GestureRecognizer from 'react-native-swipe-gestures';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Text, View, StyleSheet, Alert, Dimensions, Pressable } from 'react-native';

const { width, height } = Dimensions.get('window');

const AudioPost = () => {
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [gestureAction, setGestureAction] = useState("");

  const num = Math.random() * 100;

  // Função para iniciar a gravação
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permissão negada', 'É necessário conceder permissão para gravar áudio.');
        return;
      }
      setIsRecording(true);
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
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      console.log('Áudio gravado em:', uri);
    } catch (error) {
      console.error('Erro ao parar a gravação:', error);
    }
  };

  // Função para salvar e postar o áudio
  const save = async () => {
    if (!recordingUri) {
      console.error('Nenhum áudio para salvar');
      return;
    }

    // Define a URI de destino e realiza a cópia no momento em que save é pressionado
    const fileUri = FileSystem.documentDirectory + `audio_file${num}.m4a`;
    try {
      await FileSystem.copyAsync({ from: recordingUri, to: fileUri });
      console.log('Áudio copiado para:', fileUri);

      // Verifica se o arquivo foi copiado corretamente
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
          body: formData, // O fetch automaticamente define o content-type para multipart/form-data
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Áudio enviado com sucesso:', data);
          Alert.alert('Sucesso', 'Áudio enviado com sucesso!');
        } else {
          const errorData = await response.json();
          console.error('Erro no envio:', errorData);
          Alert.alert('Erro', 'Ocorreu um erro ao enviar o áudio.');
        }
      } catch (error) {
        console.error('Erro ao enviar o áudio:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao tentar enviar o áudio.');
      }
    } catch (error) {
      console.error('Erro ao copiar o arquivo:', error);
      Alert.alert('Erro', 'Erro ao salvar o arquivo de áudio.');
    }
  };

  // Função para tocar o áudio
  const playAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      setSound(sound);
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Erro ao tentar reproduzir o áudio', error);
    }
  };

  // Função para pausar o áudio
  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Configurações de gestos
  const onSwipe = (direction) => {
    switch (direction) {
      case 'SWIPE_LEFT':
        setGestureAction('Postar áudio');
        save();
        break;
      case 'SWIPE_RIGHT':
        setGestureAction('Descartar áudio');
        setRecordingUri(null);
        Alert.alert('Áudio descartado!');
        break;
      case 'SWIPE_UP':
        setGestureAction('Tocar áudio');
        playAudio();
        break;
      default:
        setGestureAction('');
        break;
    }
  };

  return (
    <GestureRecognizer
      onSwipe={(direction) => onSwipe(direction)}
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
      }}
      style={styles.container}
    >
      <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
        <FontAwesome name="microphone" size={60} color={isRecording ? 'red' : 'black'} />
      </Pressable>

      <Text style={styles.statusText}>
        {isRecording ? 'Gravando...' : gestureAction || 'Toque para gravar'}
      </Text>

      {/* Exibe o botão de pausa somente se o áudio está sendo reproduzido */}
      {recordingUri && isPlaying && (
        <Button title="Pausar" onPress={pauseAudio} />
      )}
    </GestureRecognizer>
  );
};

export default AudioPost;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: width, // Usa a largura da janela
    height: height, // Usa a altura da janela
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});
