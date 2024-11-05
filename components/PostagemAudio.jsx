import React, { useState, useEffect } from 'react';
import { Button, View, Text,Pressable } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
function PostagemAudio(){

const [recording, setRecording] = useState(null);
const [recordingUri, setRecordingUri] = useState(null);
const [sound, setSound] = useState();
const [isPlaying, setIsPlaying] = useState(false);
const [fileur, setfileur] = useState(false);

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
    // Salvar o áudio localmente usando o FileSystem
    const fileUri = await FileSystem.documentDirectory + 'audio_file.m4a';
    await FileSystem.copyAsync({ from: uri, to: fileUri });
    setfileur(fileUri)
    console.log('Áudio salvo em:', fileUri);
    
  } catch (error) {
    console.error('Erro ao parar a gravação:', error);
  }
};

   
   
    // Caminho do arquivo de áudio gravado (exemplo: diretório de documentos)
    const audioFilePath = FileSystem.documentDirectory + 'audio_file.m4a';
   async function salvar (){
    await axios.post('http://10.145.45.50:3030/auio',{
        uri:fileur

    })

}
    // Função para carregar e tocar o áudio
    const playAudio = async () => {
      try {
        // Carregar o áudio
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioFilePath },  // Uri do arquivo de áudio gravado
          { shouldPlay: true }      // Tocar imediatamente
        );
        setSound(sound);
        setIsPlaying(true);
   
        // Aguardar o áudio terminar
        sound.setOnPlaybackStatusUpdate(status => {
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
   
    // Função para liberar os recursos do áudio quando não for mais necessário
    useEffect(() => {

        Audio
        .requestPermissionsAsync()
        .then(({granted})=>{
            if(granted){
                Audio.setAudioModeAsync({
                    allowsRecordingIOS:true,
                    interruptionModeIOS:InterruptionModeIOS.DoNotMix,
                    playsInSilentModeIOS:true,
                    shouldDuckAndroid:true,
                    interruptionModeAndroid:InterruptionModeAndroid.DoNotMix,
                    playThroughEarpieceAndroid:true
                })
            }
        })
       
      return sound
        ? () => {
            sound.unloadAsync(); // Descarregar o áudio quando o componente for desmontado
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
          <Pressable onPress={salvar} >
            <Text>Salvar</Text>
          </Pressable>
        </View>
      );
      
 
 }

 export default PostagemAudio