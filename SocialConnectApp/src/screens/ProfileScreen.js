import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, RefreshControl } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";
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
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  const fetchUserData = useCallback(async () => {
    try {
      setRefreshing(true);
      if (!auth.currentUser) return;

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) { 
        const userData = userDoc.data();
        setBio(userData.bio || ""); 
        setStats({
          followers: userData.followers?.length || 0,
          following: userData.following?.length || 0
        });
        if (userData.profilePic) setProfilePic(userData.profilePic);
        if (userData.name) setName(userData.name);
      }
      
      const q = query(collection(db, "posts"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      setMyPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchUserData(); 
  }, [fetchUserData]);

  const handleUpdate = async () => {
    if (!name.trim()) {
        Alert.alert("Error", "Name cannot be empty");
        return;
    }
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

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (r) => {
      if (r.assets) setProfilePic(r.assets[0].uri);
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUserData} colors={["#007bff"]} />}
    >
      <View style={styles.header}>
        {/* Left Side: Create Post Icon */}
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate("Create")}>
          <Icon name="add-circle-outline" size={30} color="#007bff" />
        </TouchableOpacity>

        {/* Profile Picture Section */}
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image source={{ uri: profilePic }} style={styles.avatar} />
          <View style={styles.editIconBadge}><Icon name="camera" size={16} color="#fff" /></View>
        </TouchableOpacity>

        <Text style={styles.userNameHeader}>{name || "User"}</Text>
        <Text style={styles.emailText}>{auth.currentUser?.email}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.statBox} 
            onPress={() => navigation.navigate("FollowList", { type: "Followers", userId: auth.currentUser.uid })}
          >
            <Text style={styles.statNumber}>{stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statBox} 
            onPress={() => navigation.navigate("FollowList", { type: "Following", userId: auth.currentUser.uid })}
          >
            <Text style={styles.statNumber}>{stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" />
        
        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder="Write a bio..." multiline />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Update Profile"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.myPostsContainer}>
        <Text style={styles.sectionTitle}>My Activity (Posts)</Text>
        {myPosts.length === 0 ? (
            <Text style={styles.emptyText}>You haven't posted anything yet.</Text>
        ) : (
            myPosts.map((item) => (
                <View key={item.id} style={styles.postCard}>
                  <View style={{flex: 1}}>
                    <Text style={styles.postText} numberOfLines={2}>{item.text || "Image Post"}</Text>
                    <Text style={styles.dateText}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "Recent"}</Text>
                  </View>
                  <TouchableOpacity onPress={() => {
                     Alert.alert("Delete", "Delete this post permanently?", [
                       { text: "Cancel" },
                       { text: "Delete", onPress: async () => {
                          await deleteDoc(doc(db, "posts", item.id));
                          fetchUserData();
                       }}
                     ])
                  }}>
                    <Icon name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", paddingVertical: 30, backgroundColor: "#f8f9fa", borderBottomWidth: 1, borderBottomColor: '#eee' },
  createBtn: { position: 'absolute', left: 20, top: 20 },
  avatarContainer: { marginTop: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#007bff" },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007bff', padding: 6, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },
  userNameHeader: { fontSize: 22, fontWeight: 'bold', marginTop: 10, color: '#333' },
  emailText: { color: "#666", fontSize: 13, marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '90%', marginTop: 10, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 15, elevation: 2 },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
  statLabel: { fontSize: 12, color: '#777' },
  form: { padding: 20 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#555", fontSize: 14 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#eee', color: '#333' },
  saveButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, alignItems: "center", elevation: 3 },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  myPostsContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: '#333' },
  postCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#eee", elevation: 1 },
  postText: { fontSize: 14, color: "#444", fontWeight: '500' },
  dateText: { fontSize: 11, color: '#999', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 }
});