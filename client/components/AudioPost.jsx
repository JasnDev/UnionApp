import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Pressable,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Import a partir do path "/legacy" evita o warning de depreciação do SDK 54+
// mantendo a mesma API (copyAsync, deleteAsync, documentDirectory) sem precisar
// migrar agora para as classes File/Directory.
import * as FileSystem from 'expo-file-system/legacy';
import GestureRecognizer from 'react-native-swipe-gestures';

const { width, height } = Dimensions.get('window');

const UPLOAD_URL = 'https://unionapp-hrw7.onrender.com/upload';

const TOPICS = ['Música ', 'Games', 'Culinária ', 'Engraçados'];

const AudioPost = () => {
    // recordingRef guarda a gravação em andamento de forma síncrona,
    // evitando a race condition entre onPressIn/onPressOut (setState é assíncrono).
    const recordingRef = useRef(null);
    const recordingStartRef = useRef(null);
    const navigation = useNavigation();

    const [recordingUri, setRecordingUri] = useState(null);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fileUrl, setFileUrl] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [dialog, setDialog] = useState({
        visible: false,
        title: '',
        message: '',
        confirmText: 'OK',
        onConfirm: null,
    });

    // --- Animação de pulso do botão de gravação ---
  
    const glowAnim = useRef(new Animated.Value(0)).current;

   const pulseAnim = useRef(new Animated.Value(1)).current;

    const showMessage = (title, message) => {
        setDialog({ visible: true, title, message, confirmText: 'OK', onConfirm: null });
    };

    const showConfirmation = (title, message, onConfirm) => {
        setDialog({ visible: true, title, message, confirmText: 'Confirmar', onConfirm });
    };

    const closeDialog = () => setDialog((current) => ({ ...current, visible: false }));

    const confirmDialog = () => {
        const action = dialog.onConfirm;
        closeDialog();
        if (action) action();
    };


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
                showMessage('Permissão negada', 'É necessário conceder permissão para gravar áudio.');
                return;
            }
            setIsRecording(true);
            recordingStartRef.current = Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            const { recording } = await recordingStartRef.current;
            recordingRef.current = recording;
        } catch (error) {
            console.error('Erro ao iniciar a gravação:', error);
            setIsRecording(false);
        } finally {
            recordingStartRef.current = null;
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);

            if (recordingStartRef.current) {
                await recordingStartRef.current;
            }

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
            showMessage('Erro', 'Selecione um tópico antes de salvar.');
            return;
        }
        if (isSaving) return; // evita envio duplicado por swipe repetido

        showConfirmation(
            'Enviar áudio',
            `Enviar este áudio no tópico "${selectedTopic}"?`,
            performSave
        );
    };

    const performSave = async () => {
        setIsSaving(true);
        try {
            const fileName = buildUniqueFileName();
            const formData = new FormData();
            let fileUri = recordingUri;

            if (Platform.OS === 'web') {
                const audioBlob = await fetch(recordingUri).then((response) => response.blob());
                formData.append('audio', audioBlob, fileName);
            } else {
                fileUri = FileSystem.documentDirectory + fileName;
                await FileSystem.copyAsync({ from: recordingUri, to: fileUri });
                formData.append('audio', {
                    uri: fileUri,
                    type: 'audio/m4a',
                    name: fileName,
                });
            }

            setFileUrl(fileUri);
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
            showMessage('Sucesso', 'Áudio enviado com sucesso!');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Erro ao enviar o áudio:', error);
            showMessage('Erro', 'Erro ao enviar o áudio.');
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

        showConfirmation(
            'Apagar áudio',
            'Tem certeza que deseja apagar esta gravação?',
            performDelete
        );
    };

    


    const performDelete = async () => {
        try {
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
            }
            if (Platform.OS === 'web') {
                if (recordingUri.startsWith('blob:')) {
                    URL.revokeObjectURL(recordingUri);
                }
            } else {
                await FileSystem.deleteAsync(recordingUri, { idempotent: true });
            }
            setRecordingUri(null);
            setFileUrl(null);
            setSelectedTopic(null);
            showMessage('Áudio apagado', 'O áudio foi apagado com sucesso.');
            navigation.navigate('Home');
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
                <MaterialIcons name="multitrack-audio" size={70} color="#2E7D32" />
            </Animated.View>

            <Pressable onPress={isRecording ? stopRecording : startRecording}>
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
                        color={isRecording ? '#FFFFFF' : '#2E7D32'}
                    />
                </Animated.View>
            </Pressable>
            <Text style={styles.statusText}>
                {isRecording ? 'TOQUE PARA PARAR' : 'TOQUE PARA GRAVAR'}
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
                        <Pressable
                            style={styles.swipeHintButton}
                            onPress={save}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel="Enviar áudio"
                        >
                            <Text style={styles.swipeHintText}>← ENVIAR</Text>
                        </Pressable>
                        <Pressable
                            style={styles.swipeHintButton}
                            onPress={isPlaying ? pauseAudio : playAudio}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel={isPlaying ? 'Pausar áudio' : 'Tocar áudio'}
                        >
                            <Text style={styles.swipeHintText}>↑ {isPlaying ? 'PAUSAR' : 'TOCAR'}</Text>
                        </Pressable>
                        <Pressable
                            style={styles.swipeHintButton}
                            onPress={deleteAudio}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel="Apagar áudio"
                        >
                            <Text style={styles.swipeHintText}>APAGAR →</Text>
                        </Pressable>
                    </View>

                    {isSaving && <Text style={styles.savingText}>Enviando...</Text>}
                </>
            ) : (
                <Text style={styles.hintText}>
                    Pressione e segure o microfone para começar
                </Text>
            )}

            <Modal
                visible={dialog.visible}
                transparent
                animationType="fade"
                onRequestClose={closeDialog}
            >
                <View style={styles.dialogOverlay}>
                    <View
                        style={styles.dialog}
                        accessible
                        accessibilityViewIsModal
                    >
                        <Text style={styles.dialogTitle}>{dialog.title}</Text>
                        <Text style={styles.dialogMessage}>{dialog.message}</Text>
                        <View style={styles.dialogActions}>
                            {dialog.onConfirm && (
                                <Pressable
                                    style={styles.dialogCancelButton}
                                    onPress={closeDialog}
                                    accessibilityRole="button"
                                    accessibilityLabel="Cancelar"
                                >
                                    <Text style={styles.dialogCancelText}>Cancelar</Text>
                                </Pressable>
                            )}
                            <Pressable
                                style={styles.dialogConfirmButton}
                                onPress={confirmDialog}
                                accessibilityRole="button"
                                accessibilityLabel={dialog.confirmText}
                            >
                                <Text style={styles.dialogConfirmText}>{dialog.confirmText}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </GestureRecognizer>
    );
};

const NEON = '#2E7D32';
const BG = '#FFFFFF';
const PANEL = '#F1F8E9';
const BORDER = '#A5D6A7';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height:'100%',
        backgroundColor: BG,
        paddingHorizontal: 24,
        paddingTop: 24,
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
        marginTop: 0,
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
        marginTop: 0,
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
        color: '#1B5E20',
        fontSize: 13,
        fontWeight: '600',

        letterSpacing: 2,

        marginTop: 18,
        marginBottom: 8,

        textAlign: 'center',
    },

    hintText: {
        color: '#1B5E20',
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
        color: '#1B5E20',
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

        backgroundColor: '#E8F5E9',
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
        color: '#1B5E20',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 0
    },

    topicTextActive: {
        color: '#1B5E20',
        fontWeight: '700'
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
        color: '#1B5E20',
        fontSize: 10,

        letterSpacing: 1,

        textAlign: 'center',
        marginTop: 0
    },

    swipeHintButton: {
        minWidth: 80,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    dialogOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },

    dialog: {
        width: '100%',
        maxWidth: 420,
        padding: 24,
        borderRadius: 12,
        backgroundColor: BG,
        borderWidth: 1,
        borderColor: BORDER,
    },

    dialogTitle: {
        color: '#1B5E20',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },

    dialogMessage: {
        color: '#263238',
        fontSize: 15,
        lineHeight: 22,
    },

    dialogActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 24,
        gap: 12,
    },

    dialogCancelButton: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 14,
    },

    dialogCancelText: {
        color: '#455A64',
        fontSize: 14,
        fontWeight: '600',
    },

    dialogConfirmButton: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 18,
        borderRadius: 8,
        backgroundColor: NEON,
    },

    dialogConfirmText: {
        color: BG,
        fontSize: 14,
        fontWeight: '700',
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
        marginTop: 0
    },
});
export default AudioPost;