import React, { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Icon from 'react-native-vector-icons/Ionicons';

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  const searchUsers = async (text) => {
    setSearch(text);
    if (text.trim().length > 0) {
      const q = query(
        collection(db, "users"), 
        where("name", ">=", text), 
        where("name", "<=", text + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => doc.data());
      setUsers(userList);
    } else {
      setUsers([]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <Text style={styles.headerTitle}>Find Friends</Text>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            placeholder="Search by name..."
            style={styles.input}
            value={search}
            onChangeText={searchUsers}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.userCard} 
            onPress={() => navigation.navigate("UserProfile", { userData: item })}
          >
            <Image 
              source={{ uri: item.profilePic || "https://ui-avatars.com/api/?name=" + item.name }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => search.length > 0 && (
          <Text style={styles.emptyText}>No users found with this name.</Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchHeader: { padding: 20, backgroundColor: "#f8f9fa" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 15 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 15, paddingHorizontal: 15, height: 55, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#333" },
  userCard: { flexDirection: "row", alignItems: "center", marginBottom: 15, padding: 12, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f0f0f0" },
  avatar: { width: 55, height: 55, borderRadius: 18, marginRight: 15 },
  userName: { fontSize: 17, fontWeight: "bold", color: "#1a1a1a" },
  userEmail: { fontSize: 13, color: "#777", marginTop: 2 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#999", fontSize: 16 }
});