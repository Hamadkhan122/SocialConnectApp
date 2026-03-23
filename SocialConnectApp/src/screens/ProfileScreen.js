import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, FlatList } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot, deleteDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { launchImageLibrary } from 'react-native-image-picker';

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState(auth.currentUser?.displayName || "");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(auth.currentUser?.photoURL || "https://via.placeholder.com/150");
  const [loading, setLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    // Fetch User Bio
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setBio(userDoc.data().bio || "");
      }
    };
    fetchUserData();

    // Real-time fetch only current user's posts
    const q = query(collection(db, "posts"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMyPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, []);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
      if (response.assets) {
        setProfilePic(response.assets[0].uri);
      }
    });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name, photoURL: profilePic });
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: name,
        bio: bio,
        profilePic: profilePic
      });
      Alert.alert("Success", "Profile Updated!");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => await deleteDoc(doc(db, "posts", postId)) }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: profilePic }} style={styles.avatar} />
          <Text style={styles.changeText}>Change Photo</Text>
        </TouchableOpacity>
        <Text style={styles.emailText}>{auth.currentUser.email}</Text>
      </View>

      {/* Edit Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your Name" />

        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={bio} onChangeText={setBio} placeholder="Tell us about yourself..." multiline />

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </View>

      {/* User's Posts Section */}
      <View style={styles.myPostsContainer}>
        <Text style={styles.sectionTitle}>My Posts ({myPosts.length})</Text>
        {myPosts.map((item) => (
          <View key={item.id} style={styles.postCard}>
            <Text style={styles.postText}>{item.text}</Text>
            <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
              <Text style={styles.deleteText}>Delete Post</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => auth.signOut().then(() => navigation.replace("Login"))}>
        <Text style={styles.logoutText}>Logout Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", paddingVertical: 30, backgroundColor: "#f8f9fa" },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: "#007bff" },
  changeText: { color: "#007bff", marginTop: 10, fontWeight: "600" },
  emailText: { marginTop: 5, color: "#666" },
  form: { padding: 20 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
  saveButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  myPostsContainer: { padding: 20, borderTopWidth: 10, borderTopColor: "#f0f2f5" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  postCard: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
  postText: { fontSize: 15, color: "#444" },
  deleteText: { color: "red", marginTop: 10, fontWeight: "600", fontSize: 12 },
  logoutButton: { margin: 20, padding: 15, alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee" },
  logoutText: { color: "#888", fontWeight: "600" }
});