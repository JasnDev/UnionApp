import { Audio } from 'expo-av';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Button, Pressable, Text, View, StyleSheet, Alert, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const AudioPost = () => {
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileUrl, setFileUrl] = useState(null); 
  const [isRecording, setIsRecording] = useState(false);

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
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri); // Armazena URI temporário
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
    await FileSystem.copyAsync({ from: recordingUri, to: fileUri });
    setFileUrl(fileUri); // Armazena a URL salva para enviar ao servidor

    console.log('Áudio salvo em:', fileUri);

    const file = {
      uri: fileUri,
      type: 'audio/m4a', 
      name: `audio_file${num}.m4a`
    };

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('http://10.145.45.26:3030/upload', {
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

  const playAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri || fileUrl }, // Usar o URI temporário ou salvo
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

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false, 
      shouldDuckAndroid: true,
    }).catch((error) => console.error('Erro ao configurar modo de áudio:', error));
  
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);
  
  

  return (
    <View accessible={true} accessibilityLabel='Página para criação de áudios.' style={styles.container}>
      <Pressable onPressIn={startRecording} onPressOut={stopRecording} >
        <FontAwesome name="microphone" size={60} color={isRecording ? 'red' : 'black'} />
        {isRecording && <Text>Gravando...</Text>}
      </Pressable>
      {recordingUri ? (
        <>
          <Button style={styles.pauseButton} title={isPlaying ? 'Pausar' : 'Tocar'} onPress={isPlaying ? pauseAudio : playAudio} />
          {isPlaying ? <Text>Áudio em reprodução...</Text> : <Text>Áudio pausado</Text>}
        </>
      ) : (
        console.log('err')
      )}
      <Pressable onPress={save} style={styles.saveButton}>
        <Text>Postar o áudio</Text>
      </Pressable>
    </View>
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
  saveButton: {
    marginTop: 20,
    padding: 10,
    color: 'white',
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  pauseButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  }
});