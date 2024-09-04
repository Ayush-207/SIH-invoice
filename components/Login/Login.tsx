import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoginFormComponent from "./LoginFormComponent";
import {
  logOut,
  signUpWithEmailAndPassword,
  loginWithEmailPassword,
} from "../../firebase/auth";
import useUser from "../../hooks/useUser";

const Login: React.FC = () => {
  const { user, isLoading } = useUser();
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const doSignIn = async (email: string, password: string) => {
    try {
      await loginWithEmailPassword(email, password);
      closeLoginModal();
    } catch {
      console.error("Something Went Wrong");
    }
  };

  const doSignUp = async (email: string, password: string) => {
    try {
      await signUpWithEmailAndPassword(email, password);
      closeLoginModal();
    } catch {
      console.error("Something Went Wrong");
    }
  };

  const closeLoginModal = () => setOpenLoginModal(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.loginButton}>
          <Ionicons name="person-circle-outline" size={32} color="black" />
          <Text>Loading</Text>
        </TouchableOpacity>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={async () => {
          if (!user) setOpenLoginModal(true);
          else {
            try {
              await logOut();
            } catch {
              console.error("Something Went Wrong");
            }
          }
        }}
      >
        <Ionicons name="person-circle-outline" size={32} color="black" />
        <Text>{user ? "Logout" : "Login"}</Text>
      </TouchableOpacity>

      <Modal
        visible={openLoginModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeLoginModal}
      >
        <View style={styles.modalContent}>
          <LoginFormComponent handleSignUp={doSignUp} handleLogin={doSignIn} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default Login;
