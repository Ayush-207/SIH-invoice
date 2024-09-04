import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ToastAndroid,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import alert from "../alert";
import * as AppGeneral from "../SocialCalc/index";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
// import { APP_NAME } from "../../app-data.js";
import { AsyncStorageStatic } from "@react-native-async-storage/async-storage/lib/typescript/types.js";

const Menu: React.FC<{
  showM: boolean;
  setM: Function;
  file: string;
  updateSelectedFile: Function;
  store: AsyncStorageStatic;
  bT: number;
}> = (props) => {
  const [showAlert, setShowAlert] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [newFilename, setNewFilename] = useState<string>("");

  const _validateName = async (filename: string) => {
    filename = filename.trim();
    if (filename === "default" || filename === "Untitled") {
      setShowToast("Cannot update default file!");
      return false;
    } else if (filename === "" || !filename) {
      setShowToast("Filename cannot be empty");
      return false;
    } else if (filename.length > 30) {
      setShowToast("Filename too long");
      return false;
    } else if (/^[a-zA-Z0-9- ]*$/.test(filename) === false) {
      setShowToast("Special Characters cannot be used");
      return false;
    } else if (await props.store.getItem(filename)) {
      setShowToast("Filename already exists");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (showToast !== null) {
      ToastAndroid.show(showToast, ToastAndroid.SHORT);
    }
  }, [showToast]);

  const getCurrentFileName = () => {
    return props.file;
  };

  const _formatString = (filename: string) => {
    return filename.replace(/\s+/g, ""); // Remove all whitespaces
  };

  const doPrint = async () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      const content = AppGeneral.getCurrentHTMLContent();
      const { uri } = await Print.printToFileAsync({ html: content });
      console.log("File has been saved to:", uri);
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } else {
      alert("Print", "Printing is not supported on this platform.");
    }
  };

  const doSave = () => {
    if (props.file === "default") {
      setShowAlert("Cannot update default file!");
      return;
    }
    const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
    const data = props.store.getItem(props.file);
    const file = {
      created: (data as any).created,
      date: new Date().toString(),
      content,
      name: props.file,
      billType: props.bT,
    };
    const fileData = JSON.stringify(file);
    props.store.setItem(props.file, fileData);
    props.updateSelectedFile(props.file);
    setShowAlert("File updated successfully");
  };

  const doSaveAs = async (filename: string) => {
    if (filename) {
      if (await _validateName(filename)) {
        const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
        const file = {
          created: new Date().toString(),
          date: new Date().toString(),
          content,
          name: filename,
          billType: props.bT,
        };
        const fileData = JSON.stringify(file);
        props.store.setItem(filename, fileData);
        props.updateSelectedFile(filename);
        setShowAlert("File saved successfully");
      } else {
        setShowToast("Invalid filename");
      }
    }
  };

  const sendEmail = async () => {
    // const isAvailable = await MailComposer.isAvailableAsync();
    if (Platform.OS === "ios" || Platform.OS === "android") {
      const content = AppGeneral.getCurrentHTMLContent();
      const base64 = btoa(content);

      // const result = await MailComposer.composeAsync({
      //   bccRecipients: [],
      //   body: "PFA",
      //   attachments: [],
      //   subject: `${APP_NAME} attached`,
      // });
    } else {
      alert("Email", "Email functionality is not supported on this platform.");
    }
  };

  return (
    <View>
      {props.showM && (
        <View>
          <Button title="Save" onPress={doSave} />
          <Button
            title="Save As"
            onPress={() => setShowAlert("Enter filename")}
          />
          <Button title="Print" onPress={doPrint} />
          <Button title="Email" onPress={sendEmail} />
          <Button title="Back" onPress={() => props.setM()} />
        </View>
      )}

      <Modal visible={!!showAlert} transparent={true} animationType="slide">
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{ padding: 20, backgroundColor: "white", borderRadius: 10 }}
          >
            <Text>{showAlert}</Text>
            <Button title="Ok" onPress={() => setShowAlert(null)} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!showAlert && showAlert === "Enter filename"}
        transparent={true}
        animationType="slide"
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{ padding: 20, backgroundColor: "white", borderRadius: 10 }}
          >
            <TextInput
              placeholder="Enter filename"
              value={newFilename}
              onChangeText={setNewFilename}
              style={{ borderBottomWidth: 1, marginBottom: 20, width: 200 }}
            />
            <Button
              title="Ok"
              onPress={() => {
                doSaveAs(newFilename);
                setNewFilename("");
                setShowAlert(null);
              }}
            />
            <Button title="Cancel" onPress={() => setShowAlert(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Menu;
