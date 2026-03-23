import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Modal, TextInput, Button, RefreshControl } from "react-native";
import { collection, onSnapshot, updateDoc, doc, query, orderBy, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import Icon from 'react-native-vector-icons/Ionicons';

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchPosts();
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
        userName: auth.currentUser.displayName || "User",
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPosts()} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Header: Clickable Profile */}
            <TouchableOpacity 
              style={styles.postHeader} 
              onPress={() => navigation.navigate("UserProfile", { 
                userData: { uid: item.userId, name: item.userName, profilePic: item.userProfilePic } 
              })}
            >
              <Image source={{ uri: item.userProfilePic || "https://ui-avatars.com/api/?name=" + item.userName }} style={styles.postAvatar} />
              <View>
                <Text style={styles.userName}>{item.userName || "User"}</Text>
                <Text style={styles.date}>{item.createdAt?.toDate().toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.postText}>{item.text}</Text>
            
            {/* Post Image Support */}
            {item.postImage ? (
              <Image source={{ uri: item.postImage }} style={styles.postImg} resizeMode="cover" />
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => handleLike(item)} style={styles.actionBtn}>
                <Icon name={item.likedBy?.includes(auth.currentUser.uid) ? "heart" : "heart-outline"} size={22} color={item.likedBy?.includes(auth.currentUser.uid) ? "red" : "#666"} />
                <Text style={styles.actionCount}>{item.likes || 0}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => { setSelectedPost(item); setCommentModal(true); }} style={styles.actionBtn}>
                <Icon name="chatbubble-outline" size={20} color="#666" />
                <Text style={styles.actionCount}>{item.comments?.length || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Comment Modal Code (Upar wala hi use karein) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  card: { backgroundColor: "#fff", padding: 15, marginBottom: 8, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#1c1e21' },
  date: { fontSize: 12, color: '#65676b' },
  postText: { fontSize: 16, marginBottom: 12, color: '#050505', lineHeight: 22 },
  postImg: { width: '100%', height: 300, borderRadius: 10, marginBottom: 12 },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f2f5', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  actionCount: { marginLeft: 6, color: '#65676b', fontWeight: '600' }
});