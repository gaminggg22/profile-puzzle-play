
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, updateUserStatus, getUserProfile, onUserProfileUpdate } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

type UserProfile = {
  username: string;
  email: string;
  level: number;
  rank: string;
  credits: number;
  wins: number;
  losses: number;
  draws: number;
  isOnline: boolean;
  createdAt: string;
  [key: string]: any;
};

type AuthContextType = {
  user: any;
  userId: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setUserId(firebaseUser?.uid || null);
      setIsLoading(false);

      if (firebaseUser) {
        // Set user online status when logged in
        updateUserStatus(firebaseUser.uid, true);

        // Set up listener for profile updates
        getUserProfile(firebaseUser.uid).then((userProfile) => {
          if (userProfile) {
            setProfile(userProfile);
          } else {
            // If no profile, redirect to profile creation
            navigate('/create-profile');
          }
        });

        const unsubscribeProfile = onUserProfileUpdate(firebaseUser.uid, (updatedProfile) => {
          setProfile(updatedProfile);
        });

        // Set user offline status when the window is closed
        window.addEventListener('beforeunload', () => {
          updateUserStatus(firebaseUser.uid, false);
        });

        return () => {
          unsubscribeProfile();
          updateUserStatus(firebaseUser.uid, false);
        };
      } else {
        setProfile(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [navigate]);

  const value = {
    user,
    userId,
    profile,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
