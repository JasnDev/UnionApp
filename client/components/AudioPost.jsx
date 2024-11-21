import { Audio } from 'expo-av'; 
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import GestureRecognizer from 'react-native-swipe-gestures';
import React, { useState } from 'react';
import { Button, Text, StyleSheet, Alert, Dimensions, Pressable, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const AudioPost = () => {
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [gestureAction, setGestureAction] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]); // Estado para os tópicos selecionados

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
      Alert.alert('Erro', 'Erro ao iniciar a gravação.');
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
      Alert.alert('Erro', 'Erro ao parar a gravação.');
    }
  };

  // Função para salvar e postar o áudio
  const save = async () => {
    if (!recordingUri) {
      console.error('Nenhum áudio para salvar');
      Alert.alert('Erro', 'Nenhum áudio gravado para salvar.');
      return;
    }
  
    const fileUri = FileSystem.documentDirectory + `audio_file${num}.m4a`;
    try {
      await FileSystem.copyAsync({ from: recordingUri, to: fileUri });
      console.log('Áudio copiado para:', fileUri);
  
      const file = {
        uri: fileUri,
        type: 'audio/m4a', 
        name: `audio_file${num}.m4a`
      };
  
      const formData = new FormData();
      formData.append('audio', file);
  
      // Adicionando os tópicos selecionados ao FormData
      formData.append('topicos', JSON.stringify(selectedTopics)); // Enviando como JSON
  
      try {
        const response = await fetch('http://10.145.45.33:3030/upload', {
          method: 'POST',
          body: formData,
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
    if (!recordingUri) {
      Alert.alert('Erro', 'Nenhum áudio gravado para tocar.');
      return;
    }
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
      Alert.alert('Erro', 'Erro ao tentar reproduzir o áudio.');
    }
  };

  // Função para pausar o áudio
  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Função para selecionar/desmarcar tópicos
  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
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
      accessibilityLabel='Segure para gravar, arraste para cima para ouvir o áudio gravado, arraste para direita para descartar, e arraste para esquerda para postar o áudio'
    >
      <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
        <FontAwesome name="microphone" size={60} color={isRecording ? 'red' : 'black'} />
      </Pressable>

      <Text style={styles.statusText}>
        {isRecording ? 'Gravando...' : gestureAction || 'Toque para gravar'}
      </Text>

      {/* Exibe os botões para selecionar tópicos após a gravação */}
      {recordingUri && !isRecording && (
        <View style={styles.topicsContainer}>
          <Text style={styles.topicLabel}>Escolha os tópicos:</Text>
          {['Música', 'Games', 'Culinaria', 'Engraçados'].map((topic) => (
            <Pressable
              key={topic}
              style={[
                styles.topicButton,
                selectedTopics.includes(topic) && styles.selectedTopicButton
              ]}
              onPress={() => toggleTopic(topic)}
            >
              <Text style={styles.topicButtonText}>{topic}</Text>
            </Pressable>
          ))}
        </View>
      )}

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
    width: width,
    height: height,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  topicsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  topicLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  topicButton: {
    backgroundColor: '#ddd',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  selectedTopicButton: {
    backgroundColor: '#4CAF50',
  },
  topicButtonText: {
    fontSize: 16,
    color: 'black',
  },
});
