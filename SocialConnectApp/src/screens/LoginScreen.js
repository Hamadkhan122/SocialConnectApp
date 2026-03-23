import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../firebase/firebaseConfig";
import Icon from 'react-native-vector-icons/Ionicons';

const auth = getAuth(app);

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password required"),
});

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, values.email.trim(), values.password);
      navigation.replace("Main");
    } catch (err) {
      Alert.alert("Login Error", err.message);
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
              <Icon name="planet" size={50} color="#007bff" />
            </View>
            <Text style={styles.title}>Social Connect</Text>
            <Text style={styles.subtitle}>Connect with the world around you</Text>
          </View>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                
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

                <TouchableOpacity onPress={() => navigation.navigate("Forgot")} style={styles.forgotAnchor}>
                  <Text style={styles.forgotBtnText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mainBtn} onPress={handleSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Login</Text>}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={{ color: "#777" }}>New here? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                    <Text style={styles.signupAnchor}>Create Account</Text>
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
  header: { alignItems: "center", marginBottom: 40 },
  logoBadge: { width: 80, height: 80, backgroundColor: "#f0f7ff", borderRadius: 25, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 32, fontWeight: "bold", color: "#1a1a1a" },
  subtitle: { fontSize: 15, color: "#888", marginTop: 5 },
  form: { width: "100%" },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, paddingHorizontal: 15, height: 60, marginBottom: 5, borderWidth: 1, borderColor: "#eee" },
  inputError: { borderColor: "#ff4d4d" },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#333" },
  errorLabel: { color: "#ff4d4d", fontSize: 12, marginBottom: 10, marginLeft: 5 },
  forgotAnchor: { alignSelf: "flex-end", marginVertical: 15 },
  forgotBtnText: { color: "#007bff", fontWeight: "700" },
  mainBtn: { backgroundColor: "#007bff", height: 60, borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: "#007bff", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  mainBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  signupAnchor: { color: "#007bff", fontWeight: "bold" }
});