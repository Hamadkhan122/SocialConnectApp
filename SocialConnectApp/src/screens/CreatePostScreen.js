import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Image, StyleSheet, Alert } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Icon from 'react-native-vector-icons/Ionicons';

export default function CreatePostScreen({ navigation }) {
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
      if (!response.didCancel && response.assets) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const handlePost = async () => {
    if (!text && !imageUri) return Alert.alert("Error", "Post cannot be empty!");
    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        text: text,
        postImage: imageUri || "", // Image URI yahan save hogi
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
        userProfilePic: auth.currentUser.photoURL || "",
        createdAt: serverTimestamp(),
      });
      setText("");
      setImageUri(null);
      navigation.navigate("Home");
    } catch (e) {
      Alert.alert("Upload Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="What's on your mind?" 
        multiline style={styles.input} 
        value={text} 
        onChangeText={setText} 
      />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
          <Icon name="image-outline" size={30} color="#007bff" />
          <Text style={{color: '#007bff'}}> Add Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={loading}>
          <Text style={styles.postBtnText}>{loading ? "Posting..." : "Post"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { fontSize: 18, height: 150, textAlignVertical: 'top' },
  previewImage: { width: '100%', height: 250, borderRadius: 15, marginBottom: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
  iconBtn: { flexDirection: 'row', alignItems: 'center' },
  postBtn: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20 },
  postBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});