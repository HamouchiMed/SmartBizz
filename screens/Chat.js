import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { listMessages, createMessage, updateMessage, deleteMessage as deleteMessageAPI } from '../services/api';

const messagesCache = new Map();

export default function Chat({ token, deal, conversation, onBack, theme = 'dark' }) {
  const cacheKey = `${token || 'anon'}:${deal?.id || 'nodeal'}:${conversation?.id || 'noconv'}`;
  const hasCached = messagesCache.has(cacheKey);
  const [messages, setMessages] = useState(hasCached ? messagesCache.get(cacheKey) : []);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [loading, setLoading] = useState(!hasCached);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef(null);

  // schedule an automatic bot-style response after a short delay
  const scheduleAutoReply = () => {
    setTimeout(async () => {
      if (!token) return;
      try {
        const reply = {
          text: 'Auto-reply: Thanks for reaching out!',
          type: 'text',
          dealId: deal?.id || null,
          from: 'client',
          conversation_id: conversation?.id || null,
        };
        const created = await createMessage(token, reply);
        setMessages(prev => {
          const next = [...prev, created];
          messagesCache.set(cacheKey, next);
          return next;
        });
        scrollToEnd();
      } catch (err) {
        console.warn('Auto reply failed', err);
      }
    }, 1000);
  };

  const chatTitle = conversation?.name || deal?.client || 'Chat';
  const chatSubtitle = conversation?.type || deal?.name || '';

  // load messages (used on mount and for pull-to-refresh)
  const loadMessages = async () => {
    if (!token) return;
    if (!messagesCache.has(cacheKey)) {
      setLoading(true);
    }
    try {
      let data = await listMessages(token);
      data = data || [];
      // if deal specified, only keep messages for that deal
      if (deal?.id) {
        data = data.filter(m => String(m.dealId) === String(deal.id));
      }
      // if conversation specified (like a contact chat), filter by its id
      if (conversation?.id) {
        data = data.filter(m => String(m.conversation_id) === String(conversation.id));
      }
      messagesCache.set(cacheKey, data);
      setMessages(data);
    } catch (err) {
      console.warn('Failed to load messages', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [token, deal?.id, conversation?.id, cacheKey]);

  const refreshMessages = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const sendMessage = async (type = null) => {
    if (!token) return;
    // type: null (text), 'image', or 'document'
    if (type === 'image') {
      try {
        const msgData = { text: '[Image]', type: 'image', dealId: deal?.id || null, from: 'me', conversation_id: conversation?.id || null };
        const created = await createMessage(token, msgData);
        setMessages(prev => {
          const next = [...prev, created];
          messagesCache.set(cacheKey, next);
          return next;
        });
        scrollToEnd();
        // auto reply when chatting with a contact (not via deal)
        if (conversation && !deal) scheduleAutoReply();
      } catch (err) {
        Alert.alert('Error', 'Failed to send message');
        console.warn(err);
      }
      return;
    }
    
    if (type === 'document') {
      try {
        const msgData = { text: '[Document]', type: 'document', dealId: deal?.id || null, from: 'me', conversation_id: conversation?.id || null };
        const created = await createMessage(token, msgData);
        setMessages(prev => {
          const next = [...prev, created];
          messagesCache.set(cacheKey, next);
          return next;
        });
        scrollToEnd();
        if (conversation && !deal) scheduleAutoReply();
      } catch (err) {
        Alert.alert('Error', 'Failed to send message');
        console.warn(err);
      }
      return;
    }

    if (text.trim() === '') return;
    try {
      const msgData = { text: text.trim(), type: 'text', dealId: deal?.id || null, from: 'me', conversation_id: conversation?.id || null };
      const created = await createMessage(token, msgData);
      setMessages(prev => {
        const next = [...prev, created];
        messagesCache.set(cacheKey, next);
        return next;
      });
      setText('');
      scrollToEnd();
      if (conversation && !deal) scheduleAutoReply();
    } catch (err) {
      Alert.alert('Error', 'Failed to send message');
      console.warn(err);
    }
  };

  const handleAttach = () => {
    Alert.alert(
      'Share File',
      'What would you like to send?',
      [
        {
          text: ' Image',
          onPress: () => handleImageSelection(),
        },
        {
          text: ' Document',
          onPress: () => openDocumentPicker(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleImageSelection = async () => {
    Alert.alert(
      'Choose Image Source',
      'How would you like to get an image?',
      [
        {
          text: 'Take Photo (Camera)',
          onPress: () => openCamera(),
        },
        {
          text: ' Choose from Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        addImageToChat(result.assets[0].uri, 'camera');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Gallery permission is required to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        addImageToChat(result.assets[0].uri, 'gallery');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const openDocumentPicker = async () => {
    try {
      console.log('Opening document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (result.type === 'success') {
        console.log('Document selected, processing...');
        const fileName = result.name || result.uri.split('/').pop();
        const fileSize = result.size ? (result.size / 1024 / 1024).toFixed(2) : '2.4';
        console.log('Document info:', { fileName, fileSize, uri: result.uri });
        addDocumentToChat(result.uri, fileName, fileSize);
      } else if (result.type === 'cancel') {
        console.log('Document picker cancelled by user');
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document: ' + (error.message || 'Unknown error'));
    }
  };

  const addDocumentToChat = (documentUri, fileName, fileSize) => {
    const id = `m${Date.now()}`;
    const newDoc = { 
      id, 
      from: 'me', 
      type: 'document', 
      documentUri: documentUri,
      documentName: fileName, 
      documentSize: fileSize,
      time: getTime()
    };
    
    console.log('Adding document to chat:', newDoc);
    setMessages(prev => {
      const updated = [...prev, newDoc];
      messagesCache.set(cacheKey, updated);
      console.log('Messages updated:', updated);
      return updated;
    });
    
    setTimeout(() => {
      scrollToEnd();
    }, 100);
  };

  const addImageToChat = (imageUri, source) => {
    const id = `m${Date.now()}`;
    
    setMessages(prev => {
      const next = [...prev, {
        id,
        from: 'me',
        type: 'image',
        image: imageUri,
        time: getTime(),
        source: source,
      }];
      messagesCache.set(cacheKey, next);
      return next;
    });
    scrollToEnd();
  };

  const getTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const handleLongPress = (message) => {
    if (message.from !== 'me') return; // Only allow editing/deleting own messages
    
    Alert.alert(
      '',
      `Do you want to edit or delete this message?`,
      [
        {
          text: 'Edit',
          onPress: () => {
            setEditingId(message.id);
            setText(message.text);
            setSelectedMessageId(message.id);
          },
        },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert('Delete Message', 'Are you sure?', [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  setMessages(prev => {
                    const next = prev.filter(m => m.id !== message.id);
                    messagesCache.set(cacheKey, next);
                    return next;
                  });
                  setSelectedMessageId(null);
                },
              },
            ]);
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedMessageId(null),
        },
      ]
    );
  };

  const handleSendOrUpdate = async () => {
    if (editingId) {
      // Update existing message in backend
      try {
        if (token) {
          const updated = await updateMessage(token, editingId, { text: text.trim() });
          setMessages(prev => {
            const next = prev.map(m => m.id === editingId ? updated : m);
            messagesCache.set(cacheKey, next);
            return next;
          });
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to update message');
        console.warn(err);
      }
      setEditingId(null);
      setText('');
      setSelectedMessageId(null);
      scrollToEnd();
    } else {
      // Send new message
      sendMessage();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setText('');
    setSelectedMessageId(null);
  };

  const renderMessage = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
      style={[styles.messageRow, item.from === 'me' ? styles.meRow : styles.clientRow]}
      activeOpacity={1}
    >
      <View style={[
        styles.bubble,
        item.from === 'me' ? styles.meBubble : styles.clientBubble,
        selectedMessageId === item.id && styles.selectedBubble,
      ]}>
        {item.type === 'text' && item.text ? (
          <Text style={[styles.msgText, item.from === 'me' ? styles.msgTextMe : styles.msgTextClient]}>
            {item.text}
          </Text>
        ) : null}
        
        {item.type === 'image' && item.image ? (
          <Image source={{ uri: item.image }} style={styles.msgImage} />
        ) : null}
        
        {item.type === 'document' && item.documentName ? (
          <View style={styles.documentContainer}>
            <View style={styles.documentInfo}>
              <Text style={[styles.documentName, item.from === 'me' ? styles.documentNameMe : styles.documentNameClient]}>
                {item.documentName}
              </Text>
              <Text style={[styles.documentSize, item.from === 'me' ? styles.documentSizeMe : styles.documentSizeClient]}>
                {item.documentSize} MB
              </Text>
            </View>
            <Text style={styles.downloadIcon}>⬇️</Text>
          </View>
        ) : null}
        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.msgTime, item.from === 'me' ? styles.msgTimeMe : styles.msgTimeClient]}>
            {item.time}{item.edited ? ' (edited)' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const scrollToEnd = () => {
    if (listRef.current) {
      setTimeout(() => listRef.current.scrollToEnd({ animated: true }), 150);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{chatTitle}</Text>
          <Text style={styles.subtitle}>{chatSubtitle}</Text>
        </View>
        <View style={{ width: 44, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 8 }}>
        
          <TouchableOpacity style={styles.headerIconButton}>
            <Text style={styles.headerIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderMessage}
        extraData={messages}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshMessages}
          />
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {editingId && (
          <View style={styles.editingIndicator}>
            <Text style={styles.editingText}>✏️ Editing message</Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.cancelEditText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.composer}>
          <TouchableOpacity style={styles.attach} onPress={handleAttach}>
            <Text style={styles.attachText}>Attach</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Write a message..."
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.send} onPress={handleSendOrUpdate}>
            <Text style={styles.sendText}>{editingId ? 'Update' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F0EDE5', borderBottomWidth: 1, borderBottomColor: '#EAEFF5' },
  backButton: { padding: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  backText: { fontSize: 18, color: '#111827' },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#6B7280' },
  headerIconButton: { padding: 8, marginLeft: 4 },
  headerIcon: { fontSize: 18 },
  messageRow: { marginBottom: 12, flexDirection: 'row' },
  meRow: { justifyContent: 'flex-end' },
  clientRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', padding: 10, borderRadius: 12 },
  meBubble: { backgroundColor: '#000000', borderBottomRightRadius: 2 },
  clientBubble: { backgroundColor: '#F0EDE5', borderWidth: 1, borderColor: '#E5E7EB' },
  selectedBubble: { opacity: 0.7, borderWidth: 2, borderColor: '#FFB800' },
  msgText: { color: '#fff', fontSize: 14 },
  msgTextMe: { color: '#fff' },
  msgTextClient: { color: '#0F172A' },
  msgImage: { width: 200, height: 120, borderRadius: 8, marginTop: 8 },
  msgTime: { fontSize: 11, marginTop: 6, textAlign: 'right' },
  msgTimeMe: { color: '#D1D5DB' },
  msgTimeClient: { color: '#9CA3AF' },
  editingIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF8E1', borderTopWidth: 1, borderTopColor: '#FFB800' },
  editingText: { fontSize: 12, color: '#B8860B', fontWeight: '600' },
  cancelEditText: { color: '#FF4444', fontWeight: '700', fontSize: 12 },
  composer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F0EDE5', borderTopWidth: 1, borderTopColor: '#EAEFF5' },
  attach: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F3F4F6', borderRadius: 8, marginRight: 8 },
  attachText: { color: '#111827', fontWeight: '700' },
  input: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F3F4F6', borderRadius: 12, fontSize: 14 },
  send: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#000000', borderRadius: 12, marginLeft: 8 },
  sendText: { color: '#fff', fontWeight: '700' },
  documentContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, marginTop: 6 },
  documentIcon: { fontSize: 20, marginRight: 8 },
  documentInfo: { flex: 1 },
  documentName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  documentNameMe: { color: '#fff' },
  documentNameClient: { color: '#0F172A' },
  documentSize: { fontSize: 11 },
  documentSizeMe: { color: '#D1D5DB' },
  documentSizeClient: { color: '#9CA3AF' },
  downloadIcon: { fontSize: 16, marginLeft: 8 },
});

