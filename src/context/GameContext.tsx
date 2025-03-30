
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onRoomUpdate, getOnlineUsers, onOnlineUsersUpdate, getPublicRooms } from '@/lib/firebase';
import { useAuth } from './AuthContext';

type GameContextType = {
  currentRoom: any | null;
  onlineUsersCount: number;
  publicRooms: any[];
  findingGame: boolean;
  setCurrentRoom: (room: any | null) => void;
  setFindingGame: (finding: boolean) => void;
  refreshPublicRooms: () => Promise<void>;
};

const GameContext = createContext<GameContextType>({
  currentRoom: null,
  onlineUsersCount: 0,
  publicRooms: [],
  findingGame: false,
  setCurrentRoom: () => {},
  setFindingGame: () => {},
  refreshPublicRooms: async () => {},
});

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<any | null>(null);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [findingGame, setFindingGame] = useState(false);
  const { userId } = useAuth();

  // Listen for online users count
  useEffect(() => {
    const unsubscribeOnlineUsers = onOnlineUsersUpdate((count) => {
      setOnlineUsersCount(count);
    });

    return () => {
      unsubscribeOnlineUsers();
    };
  }, []);

  // Listen for room updates when in a room
  useEffect(() => {
    let unsubscribeRoom: (() => void) | null = null;

    if (currentRoom?.id) {
      unsubscribeRoom = onRoomUpdate(currentRoom.id, (roomData) => {
        if (roomData) {
          setCurrentRoom({ ...roomData, id: currentRoom.id });
        } else {
          // Room was deleted
          setCurrentRoom(null);
        }
      });
    }

    return () => {
      if (unsubscribeRoom) {
        unsubscribeRoom();
      }
    };
  }, [currentRoom?.id]);

  // Load public rooms on initial load
  useEffect(() => {
    refreshPublicRooms();
  }, []);

  const refreshPublicRooms = async () => {
    try {
      const rooms = await getPublicRooms();
      setPublicRooms(rooms);
    } catch (error) {
      console.error("Error fetching public rooms:", error);
    }
  };

  const value = {
    currentRoom,
    onlineUsersCount,
    publicRooms,
    findingGame,
    setCurrentRoom,
    setFindingGame,
    refreshPublicRooms,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
