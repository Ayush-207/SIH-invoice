import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

interface ComponentProps {
  handleLogin: (email: string, password: string) => void;
  handleSignUp: (email: string, password: string) => void;
}

const LoginFormComponent: React.FC<ComponentProps> = ({
  handleLogin,
  handleSignUp,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <Button title="Login" onPress={() => handleLogin(email, password)} />
      <Button title="SignUp" onPress={() => handleSignUp(email, password)} />
    </View>
  );
};

export default LoginFormComponent;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
