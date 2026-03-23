import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, RefreshControl } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";
// getDocs ko yahan import list mein add kar diya hai
import { doc, getDoc, updateDoc, collection, query, where, deleteDoc, getDocs } from "firebase/firestore"; 
import { updateProfile } from "firebase/auth";
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState(auth.currentUser?.displayName || "");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(auth.currentUser?.photoURL || "https://via.placeholder.com/150");
  const [loading, setLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    try {
      setRefreshing(true);
      // User ka bio fetch karne ke liye
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) { 
        setBio(userDoc.data().bio || ""); 
      }
      
      // Sirf is user ki posts dhoondne ke liye query
      const q = query(collection(db, "posts"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q); // Ab ye error nahi dega
      setMyPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Screen load hote hi data mangwane ke liye
  useEffect(() => { 
    fetchUserData(); 
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name, photoURL: profilePic });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { name, bio, profilePic });
      Alert.alert("Success", "Profile Updated!");
    } catch (error) { 
      Alert.alert("Error", error.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to exit?", [
      { text: "No" },
      { text: "Yes", onPress: () => auth.signOut().then(() => navigation.replace("Login")) }
    ]);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserData} />}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={26} color="#ff4d4d" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => launchImageLibrary({mediaType:'photo', quality: 0.5}, (r) => r.assets && setProfilePic(r.assets[0].uri))}>
          <Image source={{ uri: profilePic }} style={styles.avatar} />
          <View style={styles.editIconBadge}><Icon name="camera" size={16} color="#fff" /></View>
        </TouchableOpacity>
        <Text style={styles.emailText}>{auth.currentUser.email}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" />
        
        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, { height: 70 }]} value={bio} onChangeText={setBio} placeholder="Write a bio..." multiline />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Update Profile"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.myPostsContainer}>
        <Text style={styles.sectionTitle}>My Activity ({myPosts.length})</Text>
        {myPosts.map((item) => (
          <View key={item.id} style={styles.postCard}>
            <Text style={styles.postText} numberOfLines={2}>{item.text}</Text>
            <TouchableOpacity onPress={() => {
               Alert.alert("Delete", "Delete this post?", [
                 { text: "Cancel" },
                 { text: "Delete", onPress: async () => {
                    await deleteDoc(doc(db, "posts", item.id));
                    fetchUserData(); // Delete ke baad list refresh karne ke liye
                 }}
               ])
            }}>
              <Icon name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", paddingVertical: 40, backgroundColor: "#f8f9fa" },
  logoutBtn: { position: 'absolute', right: 20, top: 20 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: "#007bff" },
  editIconBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#007bff', padding: 6, borderRadius: 15 },
  emailText: { marginTop: 10, color: "#666", fontWeight: '500' },
  form: { padding: 20 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#333" },
  input: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  saveButton: { backgroundColor: "#007bff", padding: 16, borderRadius: 10, alignItems: "center", elevation: 3 },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  myPostsContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  postCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
  postText: { flex: 1, fontSize: 14, color: "#444", marginRight: 10 }
});