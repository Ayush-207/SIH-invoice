import { User } from "firebase/auth";
import { db } from "./index";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  getDoc,
  deleteDoc,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface File {
  created: string;
  modified: string;
  name: string;
  content: string;
  billType: number;
}

const uploadFileToCloud = async (
  user: User,
  fileData: File,
  onSuccess?: () => void
): Promise<void> => {
  try {
    const fileDocRef = doc(db, "invoices", `${user.uid}-${fileData.name}`);
    const prevFile = await getDoc(fileDocRef);

    if (prevFile.exists()) {
      alert("File with the same name exists");
      const newName = prompt("Enter new name for file");
      if (!newName) {
        alert("Name cannot be empty");
        return;
      }

      const newFileDocRef = doc(db, "invoices", `${user.uid}-${newName}`);
      const newPrevFile = await getDoc(newFileDocRef);
      if (newPrevFile.exists()) {
        alert("File with the same name exists");
        return;
      }

      fileData.name = newName;
      await setDoc(newFileDocRef, { ...fileData, owner: user.uid });
    } else {
      await setDoc(fileDocRef, { ...fileData, owner: user.uid });
    }

    if (onSuccess) onSuccess();
  } catch (e: unknown) {
    if (e instanceof Error) {
      alert(e.message);
      console.error(e.message);
    }
  }
};

const getFilesKeysFromFirestore = async (
  userId: string
): Promise<Record<string, string>> => {
  try {
    const q = query(collection(db, "invoices"), where("owner", "==", userId));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    if (querySnapshot.empty) {
      return {};
    }

    const files: Record<string, string> = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      files[data.name] = data.modified;
    });

    return files;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return {};
  }
};

const downloadFileFromFirebase = async (
  userId: string,
  key: string,
  onSuccess?: () => void
): Promise<void> => {
  try {
    const getFile = async (): Promise<File | undefined> => {
      const docSnapshot = await getDoc(doc(db, "invoices", `${userId}-${key}`));
      const data = docSnapshot.data() as Omit<File, "owner"> | undefined;
      return data;
    };

    const localFile = await AsyncStorage.getItem(key);
    let option = true;
    if (localFile !== null) {
      option = confirm(
        "File with the same name exists in local storage. Press OK to override and Cancel to get a new name."
      );
    }

    if (option || !localFile) {
      const file = await getFile();
      if (file) {
        const fileData = JSON.stringify(file)
        AsyncStorage.setItem(key,fileData);
        alert("File downloaded");
        onSuccess && onSuccess();
      }
      return;
    }

    if (!option) {
      const newName = prompt("Enter new name for file");
      if (!newName) {
        alert("Name cannot be empty");
        return;
      }

      const newLocalFile = await AsyncStorage.getItem(newName);
      if (newLocalFile) {
        alert("File with this name also exists");
        return;
      }

      const file = await getFile();
      if (file) {
        file.name = newName;
        const fileData = JSON.stringify(file)
        AsyncStorage.setItem(newName,fileData);
        alert("File downloaded");
        onSuccess && onSuccess();
      }
    }
  } catch (e: unknown) {
    alert("Something went wrong");
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
};

const deleteFileFromFirebase = async (
  userId: string,
  key: string,
  onSuccess?: () => void
): Promise<void> => {
  try {
    await deleteDoc(doc(db, "invoices", `${userId}-${key}`));
    alert("File deleted");
    onSuccess && onSuccess();
  } catch (e: unknown) {
    alert("Something went wrong");
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
};

export {
  uploadFileToCloud,
  getFilesKeysFromFirestore,
  downloadFileFromFirebase,
  deleteFileFromFirebase,
};
