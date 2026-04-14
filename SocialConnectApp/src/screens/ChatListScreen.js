import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ThemeContext } from '../../App';

export default function ChatListScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);

  const dummyChats = [
    { id: '1', name: 'Hamad khan', lastMsg: 'Internship project complete hua?', time: '1:56 AM', avatar: 'https://ui-avatars.com/api/?name=Hamad&background=007bff&color=fff' },
    { id: '2', name: 'Zarak khan', lastMsg: 'Ji bhai, bilkul theek.', time: 'Yesterday', avatar: 'https://ui-avatars.com/api/?name=Zarak&background=28a745&color=fff' },
    { id: '3', name: 'Ahmad', lastMsg: 'Sent a photo', time: 'Monday', avatar: 'https://ui-avatars.com/api/?name=Ahmad&background=ffc107&color=333' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
      </View>
      <FlatList
        data={dummyChats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.chatItem, { borderBottomColor: colors.border }]} 
            onPress={() => navigation.navigate('Chat', { userName: item.name })}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.time, { color: colors.subText }]}>{item.time}</Text>
              </View>
              <Text style={[styles.lastMsg, { color: colors.subText }]} numberOfLines={1}>{item.lastMsg}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  title: { fontSize: 28, fontWeight: 'bold' },
  chatItem: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 0.5 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  chatInfo: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  userName: { fontSize: 17, fontWeight: 'bold' },
  time: { fontSize: 12 },
  lastMsg: { fontSize: 14 }
});