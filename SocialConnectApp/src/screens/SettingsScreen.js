import React, { useContext } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { ThemeContext } from '../../App'; // Path check kar lein

export default function SettingsScreen({ navigation }) {
  const { dark, colors, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => {
          signOut(auth).then(() => navigation.replace('Login'));
      }}
    ]);
  };

  const SettingItem = ({ icon, title, type = 'link', value, onValueChange }) => (
    <TouchableOpacity 
      style={[styles.itemRow, { borderBottomColor: colors.border }]}
      disabled={type === 'toggle'}
    >
      <View style={styles.itemLeft}>
        <Icon name={icon} size={22} color={dark ? colors.primary : "#333"} />
        <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch 
            value={value} 
            onValueChange={onValueChange} 
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={value ? colors.primary : "#f4f3f4"}
        />
      ) : (
        <Icon name="chevron-forward" size={18} color={colors.subText} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.sectionLabel}>Appearance</Text>
        <SettingItem 
          icon="moon-outline" 
          title="Dark Mode" 
          type="toggle" 
          value={dark} 
          onValueChange={toggleTheme} 
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.sectionLabel}>Account & Privacy</Text>
        <SettingItem icon="person-outline" title="Edit Profile" />
        <SettingItem icon="notifications-outline" title="Notifications" />
        <SettingItem icon="lock-closed-outline" title="Privacy Policy" />
      </View>

      <TouchableOpacity 
        style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
        onPress={handleLogout}
      >
        <Icon name="log-out-outline" size={22} color="#ff4757" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={[styles.version, { color: colors.subText }]}>SocialConnect v1.0.4</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  section: { marginTop: 20, borderTopWidth: 1, borderBottomWidth: 1, paddingHorizontal: 15 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#999', marginVertical: 10, textTransform: 'uppercase', letterSpacing: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 16, marginLeft: 15 },
  logoutBtn: { marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderTopWidth: 1, borderBottomWidth: 1 },
  logoutText: { color: '#ff4757', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  version: { textAlign: 'center', marginVertical: 30, fontSize: 12 }
});