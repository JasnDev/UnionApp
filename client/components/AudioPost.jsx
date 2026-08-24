import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Import a partir do path "/legacy" evita o warning de depreciação do SDK 54+
// mantendo a mesma API (copyAsync, deleteAsync, documentDirectory) sem precisar
// migrar agora para as classes File/Directory.
import * as FileSystem from 'expo-file-system/legacy';
import GestureRecognizer from 'react-native-swipe-gestures';

const { width, height } = Dimensions.get('window');

const UPLOAD_URL = 'http://10.0.0.61:3030/upload';

const TOPICS = ['Música', 'Games', 'Culinária', 'Engraçados'];

const AudioPost = () => {
    // recordingRef guarda a gravação em andamento de forma síncrona,
    // evitando a race condition entre onPressIn/onPressOut (setState é assíncrono).
    const recordingRef = useRef(null);

    const [recordingUri, setRecordingUri] = useState(null);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fileUrl, setFileUrl] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);

    // --- Animação de pulso do botão de gravação ---
  
    const glowAnim = useRef(new Animated.Value(0)).current;

   const pulseAnim = useRef(new Animated.Value(1)).current;


    // --- Configura o modo de áudio uma única vez ao montar ---
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            playThroughEarpieceAndroid: false,
            shouldDuckAndroid: true,
        }).catch((error) => console.error('Erro ao configurar modo de áudio:', error));
    }, []);

    // --- Descarrega o som sempre que ele mudar/desmontar ---
    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync().catch(() => {});
            }
        };
    }, [sound]);

    const startRecording = async () => {
        if (isRecording) return; // evita início duplicado
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
            recordingRef.current = recording;
        } catch (error) {
            console.error('Erro ao iniciar a gravação:', error);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);

            if (!recordingRef.current) {
                console.warn('Nenhuma gravação em andamento para parar.');
                return;
            }

            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            console.log('URI:', uri);
            setRecordingUri(uri);
            recordingRef.current = null;
        } catch (error) {
            console.error('Erro ao parar a gravação:', error);
        }
    };

    const buildUniqueFileName = () => {
        const randomId = Math.random().toString(36).substring(2, 10);
        return `audio_file_${randomId}.m4a`;
    };

    const save = async () => {
        if (!recordingUri || !selectedTopic) {
            Alert.alert('Erro', 'Selecione um tópico antes de salvar.');
            return;
        }
        if (isSaving) return; // evita envio duplicado por swipe repetido

        Alert.alert(
            'Enviar áudio',
            `Enviar este áudio no tópico "${selectedTopic}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Enviar', onPress: () => performSave() },
            ]
        );
    };

    const performSave = async () => {
        setIsSaving(true);
        try {
            const fileName = buildUniqueFileName();
            const fileUri = FileSystem.documentDirectory + fileName;
            await FileSystem.copyAsync({ from: recordingUri, to: fileUri });
            setFileUrl(fileUri);

            const formData = new FormData();
            formData.append('audio', {
                uri: fileUri,
                type: 'audio/m4a',
                name: fileName,
            });
            formData.append('topic', selectedTopic);

            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Erro do servidor: ${response.status}`);
            }

            const data = await response.json();
            console.log('Áudio enviado com sucesso:', data);
            Alert.alert('Sucesso', 'Áudio enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar o áudio:', error);
            Alert.alert('Erro', 'Erro ao enviar o áudio.');
        } finally {
            setIsSaving(false);
        }
    };

    const playAudio = async () => {
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: recordingUri || fileUrl },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);
            newSound.setOnPlaybackStatusUpdate((status) => {
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

    const deleteAudio = () => {
        if (!recordingUri) return;

        Alert.alert(
            'Apagar áudio',
            'Tem certeza que deseja apagar esta gravação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Apagar', style: 'destructive', onPress: () => performDelete() },
            ]
        );
    };

    const performDelete = async () => {
        try {
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
            }
            await FileSystem.deleteAsync(recordingUri, { idempotent: true });
            setRecordingUri(null);
            setFileUrl(null);
            setSelectedTopic(null);
            Alert.alert('Áudio apagado', 'O áudio foi apagado com sucesso.');
        } catch (error) {
            console.error('Erro ao apagar o áudio:', error);
        }
    };

    return (
        <GestureRecognizer
            onSwipeLeft={save}
            onSwipeRight={deleteAudio}
            onSwipeUp={playAudio}
            style={styles.container}
        >
            {/* Grid decorativo de fundo, estilo HUD */}
            <View style={styles.gridOverlay} pointerEvents="none" />

            <View style={styles.header}>
                <View style={styles.headerLine} />
                <Text style={styles.headerText}>NOVA GRAVAÇÃO</Text>
                <View style={styles.headerLine} />
            </View>

            <Animated.View
                style={[
                    styles.iconRing,
                    {
                      //  shadowOpacity: glowShadowOpacity,
                        transform: [{ scale: pulseAnim }],
                    },
                ]}
            >
                <MaterialIcons name="multitrack-audio" size={70} color="#00F0FF" />
            </Animated.View>

            <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
                <Animated.View
                    style={[
                        styles.micButton,
                        isRecording && styles.micButtonActive,
                        { transform: [{ scale: pulseAnim }] },
                    ]}
                >
                    <Ionicons
                        name={isRecording ? 'mic' : 'mic-circle-outline'}
                        size={70}
                        color={isRecording ? '#FFFF' : '#00F0FF'}
                    />
                </Animated.View>
            </Pressable>
            <Text style={styles.statusText}>
                {isRecording ? 'GRAVANDO...' : 'Segure para gravar'}
            </Text>

            {recordingUri ? (
                <>
                    <Pressable
                        style={[styles.actionButton, isPlaying && styles.actionButtonActive]}
                        onPress={isPlaying ? pauseAudio : playAudio}
                    >
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={22}
                            color={isPlaying ? '#fcfcfc' : '#00F0FF'}
                            style={{ marginRight: 8 }}
                        />
                        <Text
                            style={[
                                styles.actionButtonText,
                                isPlaying && styles.actionButtonTextActive,
                            ]}
                        >
                            {isPlaying ? 'PAUSAR' : 'TOCAR'}
                        </Text>
                    </Pressable>

                    <View style={styles.topicsContainer}>
                        <Text style={styles.sectionLabel}>TÓPICO</Text>
                        <View style={styles.topicsRow}>
                            {TOPICS.map((topic) => {
                                const active = selectedTopic === topic;
                                return (
                                    <Pressable
                                        key={topic}
                                        style={[styles.topicButton, active && styles.topicButtonActive]}
                                        onPress={() => setSelectedTopic(topic)}
                                    >
                                        <Text
                                            style={[
                                                styles.topicText,
                                                active && styles.topicTextActive,
                                            ]}
                                        >
                                            {topic}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.swipeHints}>
                        <Text style={styles.swipeHintText}>← ENVIAR</Text>
                        <Text style={styles.swipeHintText}>↑ TOCAR</Text>
                        <Text style={styles.swipeHintText}>APAGAR →</Text>
                    </View>

                    {isSaving && <Text style={styles.savingText}>Enviando...</Text>}
                </>
            ) : (
                <Text style={styles.hintText}>
                    Pressione e segure o microfone para começar
                </Text>
            )}
        </GestureRecognizer>
    );
};

const NEON = '#00F0FF';
const BG = '#0B0F1A';
const PANEL = '#121826';
const BORDER = '#1E2A3D';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height:'100%',
        backgroundColor: BG,
        paddingHorizontal: 24,
        paddingTop: 900,
        paddingBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderColor: BORDER,
        opacity: 0.35,
    },

    // =========================
    // HEADER
    // =========================

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop:-950,
        marginBottom: 32,
    },

    headerLine: {
        flex: 1,
        height: 1,
        backgroundColor: BORDER,
    },

    headerText: {
        color: NEON,
        fontSize: 12,
        letterSpacing: 3,
        marginHorizontal: 12,
        fontWeight: '700',
    },

    // =========================
    // ÍCONE DE ÁUDIO
    // =========================

    iconRing: {
        width: 120,
        height: 120,
        borderRadius: 60,

        borderWidth: 1,
        borderColor: NEON,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: PANEL,

        marginBottom: 22,

        shadowColor: NEON,
        shadowRadius: 20,
        shadowOffset: {
            width: 0,
            height: 0,
        },

        elevation: 10,
    },

    // =========================
    // MICROFONE
    // =========================

    micButton: {
        width: 140,
        height: 140,
        borderRadius: 70,

        borderWidth: 2,
        borderColor: NEON,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: PANEL,

        shadowColor: NEON,
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: {
            width: 0,
            height: 0,
        },

        elevation: 8,
        marginTop:300
    },

    micButtonActive: {
        backgroundColor: NEON,
        borderColor: '#FFFFFF',

        shadowColor: NEON,
        shadowOpacity: 0.9,
        shadowRadius: 25,
        shadowOffset: {
            width: 0,
            height: 0,
        },

        elevation: 15,
    },

    // =========================
    // STATUS
    // =========================

    statusText: {
        color: '#f6fcfd',
        fontSize: 13,
        fontWeight: '600',

        letterSpacing: 2,

        marginTop: 18,
        marginBottom: 8,

        textAlign: 'center',
    },

    hintText: {
        color: '#ffffff',
        fontSize: 13,

        marginTop: 25,

        textAlign: 'center',
        lineHeight: 20,

        maxWidth: 280,
    },

    // =========================
    // BOTÃO TOCAR / PAUSAR
    // =========================

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        alignSelf: 'center',

        minWidth: 150,

        paddingVertical: 13,
        paddingHorizontal: 28,

        borderRadius: 30,
        borderWidth: 1,
        borderColor: NEON,

        backgroundColor: PANEL,

        marginTop: 20,

        shadowColor: NEON,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 0,
        },

        elevation: 5,
    },

    actionButtonActive: {
        backgroundColor: NEON,

        shadowOpacity: 0.8,
        shadowRadius: 18,

        elevation: 10,
    },

    actionButtonText: {
        
        color: NEON,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    actionButtonTextActive: {
        color: BG,
    },

    // =========================
    // TÓPICOS
    // =========================

    topicsContainer: {
        width: '100%',
        alignItems: 'center',
        color:'#ffff',
        marginTop: 24,
    },

    sectionLabel: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',

        letterSpacing: 2,

        marginBottom: 12,
    },

    topicsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        
        justifyContent: 'center',
        alignItems: 'center',

        width: '100%',
    },

    topicButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,

        borderRadius: 20,
        borderWidth: 1,
        borderColor: BORDER,

        backgroundColor: PANEL,
        color:'#ffff',
        margin: 4,
    },

    topicButtonActive: {
        borderColor: NEON,

        backgroundColor: 'rgba(0, 240, 255, 0.12)',
        color:'WHITE',
        shadowColor: NEON,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 0,
        },

        elevation: 4,
    },

    topicText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
        marginTop:'-5%'
    },

    topicTextActive: {
        color: "#FFF",
        fontWeight: '700',
        color:'#fff',
         marginTop:'-5%'
    },

    // =========================
    // INDICAÇÕES DE SWIPE
    // =========================

    swipeHints: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        width: '90%',

        marginTop: 28,
    },

    swipeHintText: {
        color: '#FFF',
        fontSize: 10,

        letterSpacing: 1,

        textAlign: 'center',
         marginTop:'-18%'
    },

    // =========================
    // ENVIO
    // =========================

    savingText: {
        color: '#ffff',
        fontSize: 12,

        marginTop: 14,

        letterSpacing: 1,

        fontWeight: '600',
         marginTop:'-5%'
    },
});
export default AudioPost;