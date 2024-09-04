import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import alert from "../alert";
import Icon from "@expo/vector-icons/Ionicons.js";
import * as AppGeneral from "../SocialCalc/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DATA } from "../../app-data";
import { AsyncStorageStatic } from "@react-native-async-storage/async-storage/lib/typescript/types.js";

const NewFile: React.FC<{
  file: string;
  updateSelectedFile: Function;
  store: AsyncStorageStatic;
  billType: number;
}> = (props) => {
  const [showAlertNewFileCreated, setShowAlertNewFileCreated] = useState(false);

  const newFile = () => {
    if (props.file !== "default") {
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const data = props.store.getItem(props.file);
      const file = {
        created: (data as any).created,
        date: new Date().toString(),
        content,
        name: props.file,
        billType: props.billType,
      };
      const fileData = JSON.stringify(file);
      props.store.setItem(props.file, fileData);
      props.updateSelectedFile(props.file);
    }
    const deviceType = AppGeneral.getDeviceType() as keyof typeof DATA.home;
    const msc = DATA.home[deviceType].msc;
    AppGeneral.viewFile("default", JSON.stringify(msc));
    props.updateSelectedFile("default");
    setShowAlertNewFileCreated(true);

    // Show an alert
    alert("Alert Message", "New file created!", [{ text: "Ok" }]);
  };

  return (
    <View>
      <TouchableOpacity onPress={newFile} style={styles.iconContainer}>
        <Icon name="add" size={32} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    paddingEnd: 16, // Equivalent to ion-padding-end
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NewFile;
