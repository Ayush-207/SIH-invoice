import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { APP_NAME, DATA } from "../app-data";
import Login from "../components/Login/Login";
import * as AppGeneral from "../components/SocialCalc/index.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import Menu from "../components/Menu/Menu";
import Files from "../components/Files/Files";
import NewFile from "../components/NewFile/NewFile";
import { initFirebase } from "../firebase/index";

const Home = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<Object | null>(null);
  const [selectedFile, updateSelectedFile] = useState("default");
  const [billType, updateBillType] = useState(1);

  const [device] = useState<keyof typeof DATA.home>("default");

  initFirebase();

  const activateFooter = (footer: Number) => {
    AppGeneral.activateFooterButton(footer);
  };

  useEffect(() => {
    const data = DATA["home"][device]["msc"];
    AppGeneral.initializeApp(JSON.stringify(data));
    console.log("SocialCalc initialized");
  }, []);

  useEffect(() => {
    activateFooter(billType);
  }, [billType.valueOf]);

  const closeMenu = () => {
    setShowMenu(false);
  };

  const footers = DATA["home"][device]["footers"];
  const footersList = footers.map((footerArray) => (
    <Button
      key={footerArray.index}
      title={footerArray.name}
      onPress={() => {
        updateBillType(footerArray.index);
        activateFooter(footerArray.index);
        setShowPopover(false);
      }}
    />
  ));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{APP_NAME}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Login />

        <View style={styles.toolbar}>
          <TouchableOpacity
            onPress={(e) => {
              setShowPopover(true);
              setPopoverEvent(e.nativeEvent);
            }}
          >
            <FontAwesome name="cog" size={24} color="black" />
          </TouchableOpacity>

          <Files
            filesFrom="Local"
            store={AsyncStorage}
            file={selectedFile}
            updateSelectedFile={updateSelectedFile}
            updateBillType={updateBillType}
          />
          <Files
            filesFrom="Cloud"
            store={AsyncStorage}
            file={selectedFile}
            updateSelectedFile={updateSelectedFile}
            updateBillType={updateBillType}
          />

          <NewFile
            file={selectedFile}
            updateSelectedFile={updateSelectedFile}
            store={AsyncStorage}
            billType={billType}
          />
        </View>

        <View style={styles.secondaryToolbar}>
          <Text style={styles.editingText}>Editing: {selectedFile}</Text>
        </View>

        <TouchableOpacity style={styles.fab} onPress={() => setShowMenu(true)}>
          <FontAwesome name="bars" size={24} color="white" />
        </TouchableOpacity>

        <Menu
          showM={showMenu}
          setM={closeMenu}
          file={selectedFile}
          updateSelectedFile={updateSelectedFile}
          store={AsyncStorage}
          bT={billType}
        />
        <div id="container">
          <div id="workbookControl"></div>
          <div id="tableeditor"></div>
          <div id="msg"></div>
        </div>
      </ScrollView>
      <Modal
        visible={showPopover}
        transparent={true}
        onRequestClose={() => setShowPopover(false)}
      >
        <View style={styles.popover}>
          {footersList}
          <Button title="Close" onPress={() => setShowPopover(false)} />
        </View>
      </Modal>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#6200EE",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#6200EE",
  },
  secondaryToolbar: {
    padding: 8,
    backgroundColor: "#03DAC6",
  },
  editingText: {
    textAlign: "center",
    fontSize: 18,
    color: "#000",
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#6200EE",
    borderRadius: 50,
    padding: 16,
    elevation: 4,
  },
  popover: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 32,
    borderRadius: 8,
    elevation: 4,
  },
});
