import { useEffect, useState } from 'react';
import {User, onAuthStateChanged} from 'firebase/auth';
import {auth} from "../firebase/index"

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, isLoading };
};

export default useUser;
