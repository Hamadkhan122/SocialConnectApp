import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ChatScreen({ route }) {
  const { userName } = route.params || { userName: 'Hamad khan' };
  const [inputText, setInputText] = useState('');
  
  // Video Demo Sequence
  const [messages, setMessages] = useState([
    { id: '1', text: 'Assalam o Alaikum!', sender: 'them', time: '1:54 AM' },
    { id: '2', text: 'Kaise ho bhai?', sender: 'them', time: '1:55 AM' },
    { id: '3', text: 'Internship project complete hua?', sender: 'them', time: '1:56 AM' },
    { id: '4', text: 'Walaikum Assalam, main theek hoon. Ji project par kaam chal raha hai.', sender: 'me', time: '1:57 AM' },
  ]);

  const flatListRef = useRef();

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageWrapper, item.sender === 'me' ? styles.myWrapper : styles.theirWrapper]}>
      <View style={[styles.bubble, item.sender === 'me' ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.msgText, item.sender === 'me' ? styles.myText : styles.theirText]}>
          {item.text}
        </Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Icon name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 15, paddingBottom: 20 },
  messageWrapper: { marginBottom: 15, maxWidth: '80%' },
  myWrapper: { alignSelf: 'flex-end' },
  theirWrapper: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: 20, elevation: 1 },
  myBubble: { backgroundColor: '#007bff', borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  msgText: { fontSize: 16 },
  myText: { color: '#fff' },
  theirText: { color: '#333' },
  timeText: { fontSize: 10, color: '#aaa', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 10, 
    backgroundColor: '#fff', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  input: { 
    flex: 1, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100
  },
  sendButton: { 
    backgroundColor: '#007bff', 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    marginLeft: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});