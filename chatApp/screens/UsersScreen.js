import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import API from "../api/api";

export default function UsersScreen({ navigation, route }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = route.params?.user;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      const filteredUsers = res.data.filter((u) => u._id !== currentUser._id);
      setUsers(filteredUsers);
    } catch (err) {
      console.log("Error fetching users", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user) => {
    navigation.navigate("Chat", { currentUser, selectedUser: user });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Chat</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item)}>
            <Text style={styles.username}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  userCard: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 10,
  },
  username: { fontSize: 18 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#888" },
});
