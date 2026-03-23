import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too short!").required("Required"),
});

export default function SignupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Update Firebase Auth Profile
      await updateProfile(user, { displayName: values.name });

      // Save User to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: values.name,
        email: values.email,
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
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Formik initialValues={{ name: "", email: "", password: "" }} validationSchema={SignupSchema} onSubmit={handleSignup}>
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput placeholder="Full Name" style={styles.input} onChangeText={handleChange("name")} value={values.name} />
            {errors.name && touched.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput placeholder="Email" style={styles.input} onChangeText={handleChange("email")} value={values.email} keyboardType="email-address" autoCapitalize="none" />
            {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={handleChange("password")} value={values.password} />
            {errors.password && touched.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 15 }}>
              <Text style={{ textAlign: 'center', color: '#007bff' }}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30, color: "#333" },
  form: { width: "100%" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 15, borderRadius: 10, marginBottom: 5, fontSize: 16 },
  errorText: { color: "red", fontSize: 12, marginBottom: 10 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});