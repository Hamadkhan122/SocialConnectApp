import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function UserProfileScreen({ route }) {
  const { userData } = route.params;
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        
        // 1. Pehle simple query try karte hain (without orderBy) taake index ka masla na aaye
        const q = query(
          collection(db, "posts"), 
          where("userId", "==", userData.uid)
        );

        const querySnapshot = await getDocs(q);
        let posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 2. Client-side par sort kar lete hain taake app crash na ho
        posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setUserPosts(posts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.uid) {
      fetchUserPosts();
    }
  }, [userData.uid]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: userData.profilePic || "https://ui-avatars.com/api/?name=" + userData.name }} 
          style={styles.largeAvatar} 
        />
        <Text style={styles.profileName}>{userData.name}</Text>
        <Text style={styles.profileBio}>{userData.bio || "Hey there! I am using Social Connect."}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={userPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <Text style={styles.postText}>{item.text}</Text>
              <Text style={styles.postDate}>
                {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No posts yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profileHeader: { alignItems: "center", padding: 30, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  largeAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 3, borderColor: "#f0f7ff" },
  profileName: { fontSize: 22, fontWeight: "bold", color: "#1a1a1a" },
  profileBio: { fontSize: 14, color: "#666", marginTop: 5, textAlign: 'center' },
  statsRow: { flexDirection: "row", marginTop: 20 },
  statBox: { alignItems: "center", paddingHorizontal: 20 },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#007bff" },
  statLabel: { fontSize: 12, color: "#999" },
  postCard: { padding: 15, backgroundColor: "#f8f9fa", borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
  postText: { fontSize: 16, color: "#333" },
  postDate: { fontSize: 11, color: "#aaa", marginTop: 8 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' }
});