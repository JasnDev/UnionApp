import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Button, Pressable, Text, View, StyleSheet } from 'react-native';

const PostagemAudio = () => {
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileUrl, setFileUrl] = useState(false);
  
  
  let num;
  num=Math.random()*100
  
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

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      const fileUri = await FileSystem.documentDirectory + `audio_file${num}.m4a`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      setFileUrl(fileUri)
      console.log('Áudio salvo em:', fileUri);
      console.log(recording)
    } catch (error) {
      console.error('Erro ao parar a gravação:', error);
    };
  };

  const audioFilePath = fileUrl ;
  async function salvar() {
    await axios.post('http://10.145.45.33:3030/auio', {
      uri: fileUrl
    });
  };

  const playAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioFilePath },
        { shouldPlay: true }
      );
      setSound(sound);
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        };
      });
    } catch (error) {
      console.error('Erro ao tentar reproduzir o áudio', error);
    };
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    };
  };

  useEffect(() => {
    Audio
      .requestPermissionsAsync()
      .then(({ granted }) => {
        if (granted) {
          Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: true
          });
        };
      });

    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  return (
    <View style={{ padding: 20 }}>
      <Text>Reproduzindo Áudio Localmente</Text>
      {recordingUri && (
        <>
          <Button
            title={isPlaying ? "Pausar" : "Tocar"}
            onPress={isPlaying ? pauseAudio : playAudio}
          />
          {isPlaying ? <Text>Áudio em reprodução...</Text> : <Text>Áudio pausado</Text>}
        </>
      )}
      {!recordingUri && <Text>Sem áudio gravado para reproduzir.</Text>}
      <Pressable onPressIn={startRecording} onPressOut={stopRecording} >
        <Text>GRAVAR</Text>
      </Pressable>
      <Pressable onPress={salvar} style={{marginTop:10}} >
        <Text>Salvar</Text>
      </Pressable>
    </View>
  );
};

export default PostagemAudio;

const styles = StyleSheet.create({
  
})