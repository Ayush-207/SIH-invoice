import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import alert from "../alert";
import Icon from "@expo/vector-icons/Ionicons";
import * as AppGeneral from "../SocialCalc/index.js";
import { DATA } from "../../app-data";
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import useUser from "../../hooks/useUser";
import {
  getFilesKeysFromFirestore,
  uploadFileToCloud,
  downloadFileFromFirebase,
  deleteFileFromFirebase,
} from "../../firebase/firestore";

import { File } from "../../firebase/firestore";

const Files: React.FC<{
  store: AsyncStorageStatic;
  file: string;
  updateSelectedFile: Function;
  updateBillType: Function;
  filesFrom: "Local" | "Cloud";
}> = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fileList, setFileList] = useState<React.JSX.Element[]>([]);
  const [currentKey, setCurrentKey] = useState<string>("");
  const { user, isLoading } = useUser();

  const editFile = (key: string) => {
    props.store.getItem(key).then((data) => {
      const parsedData = JSON.parse(data as string);
      console.log(parsedData);
      AppGeneral.viewFile(key, decodeURIComponent((parsedData as any).content));
      props.updateSelectedFile(key);
      props.updateBillType((data as any).billType);
    });
  };

  const moveFileToCloud = (key: string) => {
    props.store.getItem(key).then((fileData) => {
      if (user && fileData) {
        uploadFileToCloud(user, JSON.parse(fileData), () => {
          alert("Success", "File Uploaded to Cloud");
          setModalVisible(false);
        });
      } else if (user && !fileData) {
        alert("Error", "Failed to read file");
        setModalVisible(false);
      } else {
        alert("Error", "Login to Continue");
        setModalVisible(false);
      }
    });
  };

  const deleteFile = (key: string) => {
    setCurrentKey(key);
    alert("Delete file", `Do you want to delete the ${key} file?`, [
      {
        text: "No",
        style: "cancel",
        onPress: () => {
          setModalVisible(false);
          loadDefault();
          setCurrentKey("");
        },
      },
      {
        text: "Yes",
        onPress: () => {
          if (props.filesFrom === "Local") {
            console.log(currentKey);
            props.store.removeItem(currentKey).then(() => {
              setModalVisible(false);
              loadDefault();
              setCurrentKey("");
            });
          } else if (user) {
            deleteFileFromFirebase(user.uid, currentKey, () => {
              setModalVisible(false);
              loadDefault();
              setCurrentKey("");
            });
          }
        },
      },
    ]);
  };

  const loadDefault = () => {
    const deviceType = AppGeneral.getDeviceType() as keyof typeof DATA.home;
    const msc = DATA.home[deviceType].msc;
    AppGeneral.viewFile("default", JSON.stringify(msc));
    props.updateSelectedFile("default");
  };

  const _formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const loadFiles = async () => {
    let files: Record<string, string> = {};
    if (props.filesFrom === "Local") {
      const keys = await props.store.getAllKeys();
      const filesData = await props.store.multiGet(keys);
      filesData.forEach((value) => {
        const key = value[0] as string;
        const keyvalue = JSON.parse(value[1] as string) as File;
        files[key] = keyvalue.created;
      });
    } else if (props.filesFrom === "Cloud") {
      if (isLoading) return;
      if (!user) {
        alert("Error", "Login to Continue");
        return;
      } else {
        files = await getFilesKeysFromFirestore(user.uid);
      }
    }

    const fileList = Object.keys(files).map((key: string) => (
      <View key={key} style={styles.fileItem}>
        <Text>{key}</Text>
        <Text>{_formatDate(files[key])}</Text>
        {props.filesFrom === "Local" && (
          <TouchableOpacity onPress={() => editFile(key)}>
            <Icon name="create" size={24} color="orange" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            if (user) {
              props.filesFrom === "Local"
                ? moveFileToCloud(key)
                : downloadFileFromFirebase(user.uid, key, () =>
                    setModalVisible(false)
                  );
            } else {
              alert("Error", "Login to Continue");
            }
          }}
        >
          <Icon
            name={
              props.filesFrom === "Local" ? "cloud-upload" : "cloud-download"
            }
            size={24}
            color="blue"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteFile(key)}>
          <Icon name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    ));
    setFileList(fileList);
  };

  useEffect(() => {
    if (modalVisible) {
      loadFiles();
    }
  }, [modalVisible]);

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Icon
          name={
            props.filesFrom === "Local" ? "file-tray-full" : "cloud-download"
          }
          size={32}
          color="black"
          style={styles.icon}
        />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView style={styles.modalContent}>{fileList}</ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingEnd: 16, // Equivalent to ion-padding-end
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalContent: {
    padding: 20,
  },
  backButton: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#6200ee",
    margin: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default Files;
