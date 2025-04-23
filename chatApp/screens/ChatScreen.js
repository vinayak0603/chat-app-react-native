import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { io } from "socket.io-client";
import API from "../api/api";

// Connect to backend server
const socket = io("http://192.168.0.107:5000"); // Update with your backend IP

export default function ChatScreen({ route }) {
  const { currentUser, selectedUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef();

  const handleReceiveMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    socket.emit("joinRoom", {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
    });

    socket.on("receiveMessage", handleReceiveMessage);
    fetchMessages();

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [currentUser._id, selectedUser._id]);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${currentUser._id}/${selectedUser._id}`);
      setMessages(res.data);
    } catch (err) {
      console.log("Error loading messages:", err.message);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const msg = {
      sender: currentUser._id,
      receiver: selectedUser._id,
      text: newMessage,
      createdAt: new Date().toISOString(),
    };

    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderItem = ({ item }) => {
    const senderId = item?.sender?._id || item?.sender || "";
    const isMe = senderId === currentUser._id;

    const time = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={[styles.messageContainer, isMe ? styles.me : styles.them]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type your message"
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    maxWidth: "80%",
    borderRadius: 10,
  },
  me: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  them: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: {
    color: "#000",
  },
  timeText: {
    fontSize: 10,
    color: "#555",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});
