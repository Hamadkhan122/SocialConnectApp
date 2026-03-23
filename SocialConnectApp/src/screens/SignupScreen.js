import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import Icon from 'react-native-vector-icons/Ionicons';

// 🔥 Validation Schema
const SignupSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name too short").required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password required"),
});

export default function SignupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email.trim(), values.password);
      const user = userCredential.user;

      // Update Firebase Auth Profile
      await updateProfile(user, { displayName: values.name });

      // Save User to Firestore (Search feature isi data se chalega)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: values.name,
        email: values.email,
        profilePic: "", // Default empty
        bio: "Hey there! I am using Social Connect.",
        createdAt: new Date(),
      });

      navigation.replace("Main");
    } catch (err) {
      Alert.alert("Signup Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.content}>
          
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Icon name="person-add" size={45} color="#007bff" />
            </View>
            <Text style={styles.title}>Join Us</Text>
            <Text style={styles.subtitle}>Create an account to start connecting</Text>
          </View>

          <Formik 
            initialValues={{ name: "", email: "", password: "" }} 
            validationSchema={SignupSchema} 
            onSubmit={handleSignup}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                
                {/* Full Name Input */}
                <View style={[styles.inputWrapper, touched.name && errors.name && styles.inputError]}>
                  <Icon name="person-outline" size={20} color="#666" style={styles.icon} />
                  <TextInput
                    placeholder="Full Name"
                    style={styles.input}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    value={values.name}
                  />
                </View>
                {errors.name && touched.name && <Text style={styles.errorLabel}>{errors.name}</Text>}

                {/* Email Input */}
                <View style={[styles.inputWrapper, touched.email && errors.email && styles.inputError]}>
                  <Icon name="mail-outline" size={20} color="#666" style={styles.icon} />
                  <TextInput
                    placeholder="Email Address"
                    style={styles.input}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && touched.email && <Text style={styles.errorLabel}>{errors.email}</Text>}

                {/* Password Input */}
                <View style={[styles.inputWrapper, touched.password && errors.password && styles.inputError]}>
                  <Icon name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                  <TextInput
                    placeholder="Password"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && <Text style={styles.errorLabel}>{errors.password}</Text>}

                <TouchableOpacity style={styles.mainBtn} onPress={handleSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Sign Up</Text>}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={{ color: "#777" }}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.loginAnchor}>Login</Text>
                  </TouchableOpacity>
                </View>

              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 25, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 35 },
  logoBadge: { width: 80, height: 80, backgroundColor: "#f0f7ff", borderRadius: 25, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 32, fontWeight: "bold", color: "#1a1a1a" },
  subtitle: { fontSize: 15, color: "#888", marginTop: 5 },
  form: { width: "100%" },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, paddingHorizontal: 15, height: 60, marginBottom: 5, borderWidth: 1, borderColor: "#eee" },
  inputError: { borderColor: "#ff4d4d" },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#333" },
  errorLabel: { color: "#ff4d4d", fontSize: 12, marginBottom: 10, marginLeft: 5 },
  mainBtn: { backgroundColor: "#007bff", height: 60, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 20, elevation: 4, shadowColor: "#007bff", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  mainBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  loginAnchor: { color: "#007bff", fontWeight: "bold" }
});