import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import Icon from 'react-native-vector-icons/Ionicons';

export default function UserProfileScreen({ route, navigation }) {
  const { userData } = route.params;
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const currentUser = auth.currentUser;

  // Optimized Fetch Function
  const fetchInfo = useCallback(async () => {
    if (!currentUser) return;

    try {
      // Check if following
      const myDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (myDoc.exists()) {
        const followingList = myDoc.data().following || [];
        setIsFollowing(followingList.includes(userData.uid));
      }
      
      // Get target user stats
      const userDoc = await getDoc(doc(db, "users", userData.uid));
      if (userDoc.exists()) {
        setStats({ 
          followers: userDoc.data().followers?.length || 0, 
          following: userDoc.data().following?.length || 0 
        });
      }

      // Get posts
      const q = query(collection(db, "posts"), where("userId", "==", userData.uid));
      const snap = await getDocs(q);
      setUserPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.log("Fetch Error:", error);
    }
  }, [userData.uid, currentUser]); // Fixed the missing dependency here

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const handleFollow = async () => {
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setStats(p => ({ ...p, followers: wasFollowing ? p.followers - 1 : p.followers + 1 }));

    try {
      const myRef = doc(db, "users", currentUser.uid);
      const tarRef = doc(db, "users", userData.uid);
      
      if (wasFollowing) {
        await updateDoc(myRef, { following: arrayRemove(userData.uid) });
        await updateDoc(tarRef, { followers: arrayRemove(currentUser.uid) });
      } else {
        await updateDoc(myRef, { following: arrayUnion(userData.uid) });
        await updateDoc(tarRef, { followers: arrayUnion(currentUser.uid) });
      }
    } catch (e) {
      setIsFollowing(wasFollowing);
      setStats(p => ({ ...p, followers: wasFollowing ? p.followers + 1 : p.followers - 1 }));
      Alert.alert("Error", "Action failed. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={userPosts}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Image 
              source={{ uri: userData.profilePic || "https://ui-avatars.com/api/?name=" + userData.name }} 
              style={styles.avatar} 
            />
            <Text style={styles.name}>{userData.name}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}><Text style={styles.statNum}>{userPosts.length}</Text><Text>Posts</Text></View>
              <View style={styles.stat}><Text style={styles.statNum}>{stats.followers}</Text><Text>Followers</Text></View>
              <View style={styles.stat}><Text style={styles.statNum}>{stats.following}</Text><Text>Following</Text></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.btn, isFollowing && styles.unfollow]} onPress={handleFollow}>
                <Text style={{ color: isFollowing ? '#333' : '#fff', fontWeight: 'bold' }}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.msgBtn} 
                onPress={() => navigation.navigate("Chat", { receiverId: userData.uid, userName: userData.name })}
              >
                <Icon name="chatbubble-ellipses-outline" size={20} color="#007bff" />
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.postText}>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No posts yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 1, borderColor: '#007bff' },
  name: { fontSize: 18, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginVertical: 15, gap: 30 },
  stat: { alignItems: 'center' },
  statNum: { fontWeight: 'bold', fontSize: 16 },
  btn: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 35, borderRadius: 25 },
  unfollow: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  msgBtn: { borderWidth: 1, borderColor: '#007bff', padding: 10, borderRadius: 25 },
  post: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#f9f9f9', marginHorizontal: 10, marginTop: 5, borderRadius: 10 },
  postText: { fontSize: 14, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});