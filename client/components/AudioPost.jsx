import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Button, Pressable, Text, View, StyleSheet, Alert, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import GestureRecognizer from 'react-native-swipe-gestures';

const { width, height } = Dimensions.get('window');

const AudioPost = () => {
    const [recording, setRecording] = useState(null);
    const [recordingUri, setRecordingUri] = useState(null);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fileUrl, setFileUrl] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);

    const topics = ['Música', 'Games', 'Culinária', 'Engraçados'];

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

    const stopRecording = async () => {
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

    const save = async () => {
        if (!recordingUri || !selectedTopic) {
            Alert.alert('Erro', 'Selecione um tópico antes de salvar.');
            return;
        }

        console.log('Tópico Selecionado:', selectedTopic);

        // Copiar o arquivo gravado para um novo caminho no sistema de arquivos
        const fileUri = FileSystem.documentDirectory + `audio_file_${Math.random() * 100}.m4a`;
        await FileSystem.copyAsync({ from: recordingUri, to: fileUri });
        setFileUrl(fileUri);

        const file = {
            uri: fileUri,
            type: 'audio/m4a',
            name: `audio_file_${Math.random() * 100}.m4a`
        };

        const formData = new FormData();
        formData.append('audio', {
            uri: file.uri,
            type: file.type,
            name: file.name
        });
        formData.append('topic', selectedTopic); // Adiciona o tópico

        // Log para verificar o conteúdo do FormData antes do envio
        for (let value of formData.entries()) {
            console.log(value);
        }

        try {
            const response = await fetch('http://10.0.0.225:3030/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Áudio enviado com sucesso:', data);
            Alert.alert('Sucesso', 'Áudio enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar o áudio:', error);
            Alert.alert('Erro', 'Erro ao enviar o áudio.');
        }
    };

    const playAudio = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: recordingUri || fileUrl },
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

    const deleteAudio = async () => {
        if (recordingUri) {
            await FileSystem.deleteAsync(recordingUri);
            setRecordingUri(null);
            setFileUrl(null);
            Alert.alert('Áudio apagado', 'O áudio foi apagado com sucesso.');
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
        <GestureRecognizer
            onSwipeLeft={save}         // Envia o áudio ao arrastar para a esquerda
            onSwipeRight={deleteAudio} // Apaga o áudio ao arrastar para a direita
            onSwipeUp={playAudio}     // Reproduz o áudio ao arrastar para cima
            style={styles.container}
        >
            <MaterialIcons name="multitrack-audio" size={100} color="black" />
            <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
                <Ionicons style={styles.iconStyle} name="mic-circle-outline" size={120} color="black" />
                {isRecording && <Text>Gravando...</Text>}
            </Pressable>

            {recordingUri ? (
                <>
                    <Pressable style={[styles.pauseButton, isPlaying ? styles.playingButton : styles.pausedButton]} onPress={isPlaying ? pauseAudio : playAudio}>
                        <Text style={styles.buttonText}>{isPlaying ? 'Pausar' : 'Tocar'}</Text>
                    </Pressable>
                    {isPlaying ? <Text>Áudio em reprodução...</Text> : <Text>Áudio pausado</Text>}

                    <View style={styles.topicsContainer}>
                        {topics.map((topic) => (
                            <Pressable
                                key={topic}
                                style={[styles.topicButton, selectedTopic === topic ? { backgroundColor: '#5A7426' } : {}]}
                                onPress={() => setSelectedTopic(topic)} // Atualiza o estado do tópico selecionado
                            >
                                <Text style={styles.topicText}>{topic}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {selectedTopic && <Text style={styles.selectedTopicText}>Tópico Selecionado: {selectedTopic}</Text>}
                </>
            ) : null}

        </GestureRecognizer>
    );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: width, 
    height: height, 
    backgroundColor: '#E8F9CA',
  },
  pauseButton: {
    padding: 15,
    width: '50%',
    borderRadius: 5,
    backgroundColor: '#75943E',
    marginBottom: 20,
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#FFFFFF', 
    fontSize: 16,     
  },
  iconStyle: {
    marginTop: 50,
  },
  topicsContainer: {
    marginTop: 20,
  },
  topicButton: {
    padding: 10,
    backgroundColor: '#75943E',
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    color: '#fff',
    fontSize: 16,
  }
});

export default AudioPost;
