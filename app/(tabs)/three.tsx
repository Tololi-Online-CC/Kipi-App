import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';

const UserProfile = () => {

  const handleLogout = () => {
    router.replace("/")
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('./../../assets/images/icon.png')}
          style={styles.profileImage}
          resizeMode="contain"
        />
        <Text style={styles.userName}>Operations Manager</Text>
        <Text style={styles.userEmail}>info@didactdigital.com</Text>
      </View>

      <View style={styles.cardContainer}>

        <Link href={{ pathname: "/Notifications" }} asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>Updates & Support</Text>
          </TouchableOpacity>
        </Link>

        <Link href={{ pathname: "/Settings" }} asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>Settings</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={[styles.card, styles.logoutCard]} onPress={handleLogout}>
          <Text style={[styles.cardTitle, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#c1d1d1",
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    marginTop: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutCard: {
    backgroundColor: '#FF6961', // Red color for logout
  },
  logoutText: {
    color: 'white',
  },
});

export default UserProfile;
