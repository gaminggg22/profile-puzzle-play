
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, ref, set, push, onValue, update, get, query, orderByChild, limitToLast } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCx9HGB0QVDRYl_4ttvnJ1HkAr7G-641lA",
  authDomain: "tec-tac-toe-fcc23.firebaseapp.com",
  projectId: "tec-tac-toe-fcc23",
  storageBucket: "tec-tac-toe-fcc23.appspot.com",
  messagingSenderId: "761911099968",
  appId: "1:761911099968:web:1234567890abcdef" // Note: This is a placeholder, you'll need your actual appId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logOut = () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const createUserProfile = (userId: string, profileData: any) => {
  return set(ref(database, `users/${userId}`), {
    ...profileData,
    createdAt: new Date().toISOString(),
    level: 1,
    rank: "Beginner",
    credits: 5,
    wins: 0,
    losses: 0,
    draws: 0
  });
};

export const updateUserProfile = (userId: string, updates: any) => {
  return update(ref(database, `users/${userId}`), updates);
};

export const getUserProfile = async (userId: string) => {
  const snapshot = await get(ref(database, `users/${userId}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const onUserProfileUpdate = (userId: string, callback: (data: any) => void) => {
  return onValue(ref(database, `users/${userId}`), (snapshot) => {
    callback(snapshot.val());
  });
};

export const createRoom = (userId: string, isPrivate: boolean, password?: string) => {
  const roomRef = push(ref(database, 'rooms'));
  const roomId = roomRef.key as string;
  const roomCode = generateRoomCode();
  
  set(roomRef, {
    id: roomId,
    code: roomCode,
    isPrivate,
    password: isPrivate && password ? password : null,
    status: 'waiting',
    createdBy: userId,
    createdAt: new Date().toISOString(),
    players: {
      [userId]: {
        joined: new Date().toISOString(),
        ready: false
      }
    },
    game: null
  });
  
  return { roomId, roomCode };
};

export const joinRoom = (roomId: string, userId: string) => {
  const playerRef = ref(database, `rooms/${roomId}/players/${userId}`);
  return set(playerRef, {
    joined: new Date().toISOString(),
    ready: false
  });
};

export const leaveRoom = (roomId: string, userId: string) => {
  const playerRef = ref(database, `rooms/${roomId}/players/${userId}`);
  return set(playerRef, null);
};

export const setPlayerReady = (roomId: string, userId: string, isReady: boolean) => {
  const playerRef = ref(database, `rooms/${roomId}/players/${userId}/ready`);
  return set(playerRef, isReady);
};

export const onRoomUpdate = (roomId: string, callback: (data: any) => void) => {
  return onValue(ref(database, `rooms/${roomId}`), (snapshot) => {
    callback(snapshot.val());
  });
};

export const findRoomByCode = async (code: string) => {
  const roomsRef = ref(database, 'rooms');
  const snapshot = await get(roomsRef);
  
  if (snapshot.exists()) {
    const rooms = snapshot.val();
    for (const roomId in rooms) {
      if (rooms[roomId].code === code) {
        return { roomId, ...rooms[roomId] };
      }
    }
  }
  
  return null;
};

export const getPublicRooms = async () => {
  const roomsRef = ref(database, 'rooms');
  const snapshot = await get(roomsRef);
  
  const publicRooms: any[] = [];
  if (snapshot.exists()) {
    const rooms = snapshot.val();
    for (const roomId in rooms) {
      if (!rooms[roomId].isPrivate && rooms[roomId].status === 'waiting') {
        publicRooms.push({ roomId, ...rooms[roomId] });
      }
    }
  }
  
  return publicRooms;
};

export const updateUserStatus = (userId: string, isOnline: boolean) => {
  return update(ref(database, `users/${userId}`), {
    isOnline,
    lastActive: new Date().toISOString()
  });
};

export const getOnlineUsers = async () => {
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  const onlineUsers: any[] = [];
  if (snapshot.exists()) {
    const users = snapshot.val();
    for (const userId in users) {
      if (users[userId].isOnline) {
        onlineUsers.push({ userId, ...users[userId] });
      }
    }
  }
  
  return onlineUsers;
};

export const onOnlineUsersUpdate = (callback: (count: number) => void) => {
  return onValue(ref(database, 'users'), (snapshot) => {
    let count = 0;
    if (snapshot.exists()) {
      const users = snapshot.val();
      for (const userId in users) {
        if (users[userId].isOnline) {
          count++;
        }
      }
    }
    callback(count);
  });
};

export const getLeaderboard = async (limit = 10) => {
  const usersRef = query(ref(database, 'users'), orderByChild('wins'), limitToLast(limit));
  const snapshot = await get(usersRef);
  
  const leaders: any[] = [];
  if (snapshot.exists()) {
    const users = snapshot.val();
    for (const userId in users) {
      leaders.push({ userId, ...users[userId] });
    }
  }
  
  // Sort by wins in descending order
  leaders.sort((a, b) => b.wins - a.wins);
  return leaders;
};

export const updateGameState = (roomId: string, gameState: any) => {
  return set(ref(database, `rooms/${roomId}/game`), gameState);
};

export const makeMove = (roomId: string, userId: string, position: number) => {
  return get(ref(database, `rooms/${roomId}/game`)).then((snapshot) => {
    if (snapshot.exists()) {
      const gameState = snapshot.val();
      if (gameState.currentTurn === userId && gameState.board[position] === null) {
        const mark = gameState.playerMarks[userId];
        const newBoard = [...gameState.board];
        newBoard[position] = mark;
        
        const newGameState = {
          ...gameState,
          board: newBoard,
          currentTurn: getNextTurn(gameState, userId),
          lastMove: {
            position,
            player: userId,
            timestamp: new Date().toISOString()
          }
        };
        
        // Check for win or draw
        const result = checkGameResult(newBoard, mark);
        if (result) {
          newGameState.status = result.status;
          if (result.status === 'win') {
            newGameState.winner = userId;
            
            // Update player stats
            const players = Object.keys(gameState.playerMarks);
            players.forEach(playerId => {
              if (playerId === userId) {
                updateUserStats(playerId, 'win');
              } else {
                updateUserStats(playerId, 'loss');
              }
            });
          } else if (result.status === 'draw') {
            const players = Object.keys(gameState.playerMarks);
            players.forEach(playerId => {
              updateUserStats(playerId, 'draw');
            });
          }
        }
        
        return updateGameState(roomId, newGameState);
      }
    }
    return null;
  });
};

const getNextTurn = (gameState: any, currentPlayer: string) => {
  const players = Object.keys(gameState.playerMarks);
  const currentIndex = players.indexOf(currentPlayer);
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex];
};

const updateUserStats = (userId: string, result: 'win' | 'loss' | 'draw') => {
  return get(ref(database, `users/${userId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const user = snapshot.val();
      const updates: any = {};
      
      if (result === 'win') {
        updates.wins = (user.wins || 0) + 1;
        // Award credits for winning
        updates.credits = (user.credits || 0) + 2;
        
        // Level up logic - every 5 wins
        if ((user.wins + 1) % 5 === 0) {
          updates.level = (user.level || 1) + 1;
          // Update rank based on level
          updates.rank = getRankForLevel((user.level || 1) + 1);
        }
      } else if (result === 'loss') {
        updates.losses = (user.losses || 0) + 1;
      } else {
        updates.draws = (user.draws || 0) + 1;
        // Award 1 credit for draws
        updates.credits = (user.credits || 0) + 1;
      }
      
      return updateUserProfile(userId, updates);
    }
    return null;
  });
};

const getRankForLevel = (level: number) => {
  if (level < 5) return 'Beginner';
  if (level < 10) return 'Rookie';
  if (level < 15) return 'Amateur';
  if (level < 20) return 'Semi-Pro';
  if (level < 25) return 'Professional';
  if (level < 30) return 'Expert';
  if (level < 35) return 'Master';
  if (level < 40) return 'Grandmaster';
  return 'Legend';
};

const checkGameResult = (board: (string | null)[], mark: string) => {
  // Winning patterns: rows, columns, diagonals
  const patterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  // Check for win
  for (const pattern of patterns) {
    if (
      board[pattern[0]] === mark && 
      board[pattern[1]] === mark && 
      board[pattern[2]] === mark
    ) {
      return { status: 'win', pattern };
    }
  }
  
  // Check for draw (all cells filled)
  if (!board.includes(null)) {
    return { status: 'draw' };
  }
  
  // Game continues
  return null;
};

export const startGame = (roomId: string) => {
  return get(ref(database, `rooms/${roomId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const room = snapshot.val();
      const players = Object.keys(room.players);
      
      if (players.length !== 2) {
        return null; // Need exactly 2 players
      }
      
      // Randomly assign X and O
      const randomIndex = Math.floor(Math.random() * 2);
      const marks: Record<string, string> = {
        [players[randomIndex]]: 'X',
        [players[randomIndex === 0 ? 1 : 0]]: 'O'
      };
      
      const gameState = {
        status: 'active',
        startedAt: new Date().toISOString(),
        board: Array(9).fill(null),
        playerMarks: marks,
        currentTurn: players[randomIndex], // X goes first
        winner: null,
        lastMove: null
      };
      
      return Promise.all([
        updateGameState(roomId, gameState),
        update(ref(database, `rooms/${roomId}`), { status: 'playing' })
      ]);
    }
    return null;
  });
};

export const awardCreditsFromAd = (userId: string, amount = 1) => {
  return get(ref(database, `users/${userId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const user = snapshot.val();
      const newCredits = (user.credits || 0) + amount;
      return updateUserProfile(userId, { credits: newCredits });
    }
    return null;
  });
};

export const deductCreditsForRoom = (userId: string, amount = 2) => {
  return get(ref(database, `users/${userId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const user = snapshot.val();
      if ((user.credits || 0) >= amount) {
        const newCredits = user.credits - amount;
        return updateUserProfile(userId, { credits: newCredits });
      } else {
        throw new Error('Not enough credits');
      }
    }
    return null;
  });
};

// Helper functions
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
