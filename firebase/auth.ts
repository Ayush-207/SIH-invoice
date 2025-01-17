import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
  } from "firebase/auth";
  import { auth } from "./index";
  
  const signUpWithEmailAndPassword = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      return user;
    } catch (error: unknown) {
      if(error instanceof Error) {
        const errorMessage = error.message;
        alert(errorMessage);
        console.error(`${errorMessage}`);
      }
    }
  };
  
  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      return user;
    } catch (error: unknown) {
      if(error instanceof Error) {
        const errorMessage = error.message;
        alert(errorMessage);
        console.error(`${errorMessage}`);
      }
    }
  };
  
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      if(error instanceof Error) {
        const errorMessage = error.message;
        alert(errorMessage);
        console.error(`${errorMessage}`);
      }
    }
  };
  export { signUpWithEmailAndPassword, logOut, loginWithEmailPassword };
  