import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Modal, TextInput, Button } from "react-native";
import { collection, onSnapshot, updateDoc, doc, query, orderBy, arrayUnion, arrayRemove, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleLike = async (item) => {
    const postRef = doc(db, "posts", item.id);
    const userId = auth.currentUser.uid;
    if (item.likedBy?.includes(userId)) {
      await updateDoc(postRef, { likes: (item.likes || 1) - 1, likedBy: arrayRemove(userId) });
    } else {
      await updateDoc(postRef, { likes: (item.likes || 0) + 1, likedBy: arrayUnion(userId) });
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    const postRef = doc(db, "posts", selectedPost.id);
    await updateDoc(postRef, {
      comments: arrayUnion({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        text: commentText,
        createdAt: new Date().toISOString()
      })
    });
    setCommentText("");
    setCommentModal(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.postHeader}>
              <Image source={{ uri: item.userProfilePic || "https://via.placeholder.com/50" }} style={styles.postAvatar} />
              <View>
                <Text style={styles.userName}>{item.userName || "User"}</Text>
                <Text style={styles.date}>{item.createdAt?.toDate().toLocaleTimeString()}</Text>
              </View>
            </View>
            
            <Text style={styles.postText}>{item.text}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => handleLike(item)}>
                <Text style={{ color: item.likedBy?.includes(auth.currentUser.uid) ? "red" : "#666" }}>
                  ❤️ {item.likes || 0}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => { setSelectedPost(item); setCommentModal(true); }}>
                <Text style={{ color: "#666", marginLeft: 20 }}>💬 {item.comments?.length || 0} Comments</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Comment Modal */}
      <Modal visible={commentModal} animationType="slide" transparent>
        <View style={styles.modalContent}>
          <View style={styles.innerModal}>
            <Text style={styles.modalTitle}>Comments</Text>
            <FlatList
              data={selectedPost?.comments || []}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={{ fontWeight: 'bold' }}>{item.userName}</Text>
                  <Text>{item.text}</Text>
                </View>
              )}
            />
            <TextInput 
              placeholder="Write a comment..." 
              style={styles.commentInput} 
              value={commentText} 
              onChangeText={setCommentText} 
            />
            <Button title="Post Comment" onPress={addComment} />
            <TouchableOpacity onPress={() => setCommentModal(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  card: { backgroundColor: "#fff", padding: 15, marginVertical: 6, borderRadius: 0 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontWeight: 'bold', fontSize: 15 },
  date: { fontSize: 11, color: '#888' },
  postText: { fontSize: 16, marginBottom: 15 },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  modalContent: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  innerModal: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  commentInput: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 10, marginBottom: 10 },
  commentItem: { marginBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingBottom: 5 }
});