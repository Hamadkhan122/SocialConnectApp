import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function FollowListScreen({ route, navigation }) {
  const { type, userId } = route.params; // "Followers" ya "Following"
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const idList = type === "Followers" ? userDoc.data().followers || [] : userDoc.data().following || [];
          
          // Har ID ke liye user ka data fetch karna
          const userPromises = idList.map(id => getDoc(doc(db, "users", id)));
          const userSnapshots = await Promise.all(userPromises);
          
          const userData = userSnapshots.map(snap => ({ uid: snap.id, ...snap.data() }));
          setUsers(userData);
        }
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };

    fetchUsers();
  }, [userId, type]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{type}</Text>
      {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userCard}
              onPress={() => navigation.navigate("UserProfile", { userData: item })}
            >
              <Image source={{ uri: item.profilePic || "https://via.placeholder.com/150" }} style={styles.avatar} />
              <Text style={styles.userName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No {type} yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  userCard: { flexDirection: "row", alignItems: "center", marginBottom: 15, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  userName: { fontSize: 16, fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 50, color: "#999" }
});