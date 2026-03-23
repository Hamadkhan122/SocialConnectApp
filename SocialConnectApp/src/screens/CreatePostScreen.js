import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function CreatePostScreen({ navigation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const addPost = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "posts"), {
        text,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "User",
        userProfilePic: auth.currentUser.photoURL || "https://via.placeholder.com/150", // Added this
        userEmail: auth.currentUser.email,
        createdAt: new Date(),
        likes: 0,
        likedBy: [],
        comments: [], // Ready for comments system
      });
      setText("");
      Alert.alert("Success", "Post Shared!");
      navigation.navigate("Home");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Create Post</Text>
      <TextInput
        placeholder="What's on your mind?"
        multiline
        style={styles.input}
        value={text}
        onChangeText={setText}
        autoFocus
      />
      <TouchableOpacity style={styles.button} onPress={addPost} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Sharing..." : "Post Now"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { height: 200, borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, textAlignVertical: 'top', fontSize: 18, marginBottom: 20, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#007bff', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: "#007bff", shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});