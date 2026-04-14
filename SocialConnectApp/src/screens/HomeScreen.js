import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Modal, TextInput, RefreshControl, Alert, SafeAreaView } from "react-native";
import { collection, onSnapshot, updateDoc, doc, query, orderBy, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import Icon from 'react-native-vector-icons/Ionicons';

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [commentModal, setCommentModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [editText, setEditText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  useEffect(() => {
    const unsubscribe = fetchPosts();
    return unsubscribe;
  }, []);

  // Post Deletion
  const handleDeletePost = (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await deleteDoc(doc(db, "posts", postId));
      }}
    ]);
  };

  // Post Editing
  const handleUpdatePost = async () => {
    if (!editText.trim()) return;
    const postRef = doc(db, "posts", selectedPost.id);
    await updateDoc(postRef, { text: editText });
    setEditModal(false);
    setSelectedPost(null);
  };

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
    if (!commentText.trim() || !selectedPost?.id) return;
    try {
      const postRef = doc(db, "posts", selectedPost.id);
      await updateDoc(postRef, {
        comments: arrayUnion({
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || "User",
          text: commentText.trim(),
          createdAt: new Date().toISOString()
        })
      });
      setCommentText("");
    } catch (error) {
      Alert.alert("Error", "Could not add comment.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPosts} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <TouchableOpacity 
                style={styles.postHeader} 
                onPress={() => navigation.navigate("UserProfile", { userData: { uid: item.userId, name: item.userName, profilePic: item.userProfilePic } })}
              >
                <Image source={{ uri: item.userProfilePic || "https://ui-avatars.com/api/?name=" + item.userName }} style={styles.postAvatar} />
                <View>
                  <Text style={styles.userName}>{item.userName || "User"}</Text>
                  <Text style={styles.date}>{item.createdAt?.toDate() ? item.createdAt.toDate().toLocaleDateString() : "Just now"}</Text>
                </View>
              </TouchableOpacity>

              {/* Edit/Delete Options for Owner only */}
              {item.userId === auth.currentUser.uid && (
                <View style={styles.ownerActions}>
                  <TouchableOpacity onPress={() => { setSelectedPost(item); setEditText(item.text); setEditModal(true); }}>
                    <Icon name="create-outline" size={20} color="#007bff" style={{marginRight: 15}} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
                    <Icon name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <Text style={styles.postText}>{item.text}</Text>
            
            {item.postImage && (
              <Image source={{ uri: item.postImage }} style={styles.postImg} />
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => handleLike(item)} style={styles.actionBtn}>
                <Icon name={item.likedBy?.includes(auth.currentUser.uid) ? "heart" : "heart-outline"} size={24} color={item.likedBy?.includes(auth.currentUser.uid) ? "#ff4757" : "#65676b"} />
                <Text style={styles.actionCount}>{item.likes || 0}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => { setSelectedPost(item); setCommentModal(true); }} style={styles.actionBtn}>
                <Icon name="chatbubble-outline" size={22} color="#65676b" />
                <Text style={styles.actionCount}>{item.comments?.length || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit Post Modal */}
      <Modal visible={editModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.editBox}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            <TextInput 
              style={styles.editInput} 
              multiline 
              value={editText} 
              onChangeText={setEditText} 
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={{color: '#666'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateBtn} onPress={handleUpdatePost}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comments Modal... (Keep your existing modal logic here) */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  card: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 12, marginHorizontal: 10, elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  ownerActions: { flexDirection: 'row' },
  postAvatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 10 },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#1c1e21' },
  date: { fontSize: 12, color: '#65676b' },
  postText: { fontSize: 15, marginBottom: 12, color: '#050505', lineHeight: 22 },
  postImg: { width: '100%', height: 250, borderRadius: 10, marginBottom: 12 },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f2f5', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  actionCount: { marginLeft: 6, color: '#65676b', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  editBox: { backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  editInput: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 20, fontSize: 16, padding: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 10 },
  updateBtn: { backgroundColor: '#007bff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }
});