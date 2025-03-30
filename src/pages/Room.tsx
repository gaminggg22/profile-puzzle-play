
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  joinRoom, 
  leaveRoom, 
  onRoomUpdate, 
  setPlayerReady, 
  startGame,
  makeMove
} from '@/lib/firebase';
import { X, Circle, Copy, Users, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<any>(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { userId, profile } = useAuth();
  const { setCurrentRoom } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!roomId || !userId) return;

    const unsubscribe = onRoomUpdate(roomId, (updatedRoom) => {
      setIsLoading(false);
      
      if (!updatedRoom) {
        toast({
          title: "Room not found",
          description: "This room no longer exists",
        });
        navigate('/rooms');
        return;
      }
      
      setRoom(updatedRoom);
      setCurrentRoom(updatedRoom);
      
      // Check if user is in the room
      const isInRoom = updatedRoom.players && userId in updatedRoom.players;
      setHasJoined(isInRoom);
      
      // Check if user is ready
      if (isInRoom) {
        setIsReady(updatedRoom.players[userId].ready || false);
      }
      
      // Check if room is private and needs password
      if (updatedRoom.isPrivate && !isInRoom && !isPasswordDialogOpen) {
        setIsPasswordDialogOpen(true);
      }
    });

    return () => {
      unsubscribe();
      setCurrentRoom(null);
    };
  }, [roomId, userId]);

  const handleJoinRoom = async () => {
    if (!roomId || !userId) return;
    
    if (room?.isPrivate && !hasJoined) {
      if (!roomPassword.trim()) {
        toast({
          title: "Password required",
          description: "Please enter the room password",
          variant: "destructive",
        });
        return;
      }
      
      if (roomPassword !== room.password) {
        toast({
          title: "Incorrect password",
          description: "The password you entered is incorrect",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      await joinRoom(roomId, userId);
      setHasJoined(true);
      toast({
        title: "Room joined",
        description: "You've successfully joined the room",
      });
      
      if (isPasswordDialogOpen) {
        setIsPasswordDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId || !userId) return;
    
    try {
      await leaveRoom(roomId, userId);
      navigate('/rooms');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleReady = async () => {
    if (!roomId || !userId) return;
    
    try {
      const newReadyState = !isReady;
      await setPlayerReady(roomId, userId, newReadyState);
      setIsReady(newReadyState);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartGame = async () => {
    if (!roomId) return;
    
    try {
      await startGame(roomId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCopyRoomCode = () => {
    if (!room?.code) return;
    
    navigator.clipboard.writeText(room.code);
    toast({
      title: "Room code copied",
      description: `Code ${room.code} copied to clipboard`,
    });
  };

  const handleCellClick = async (index: number) => {
    if (!roomId || !userId || !room?.game) return;
    
    const gameState = room.game;
    
    // Check if it's user's turn and cell is empty
    if (gameState.currentTurn === userId && gameState.board[index] === null) {
      try {
        await makeMove(roomId, userId, index);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else if (gameState.board[index] !== null) {
      // Cell already taken
      toast({
        title: "Invalid move",
        description: "This cell is already taken",
        variant: "destructive",
      });
    } else if (gameState.currentTurn !== userId) {
      // Not user's turn
      toast({
        title: "Not your turn",
        description: "Please wait for your turn",
        variant: "destructive",
      });
    }
  };

  // Render board cell with appropriate mark (X, O, or empty)
  const renderCell = (index: number) => {
    if (!room?.game) return null;
    
    const mark = room.game.board[index];
    const isWinningCell = room.game.status === 'win' && 
                        room.game.winningPattern && 
                        room.game.winningPattern.includes(index);
    
    return (
      <div 
        key={index} 
        className={`aspect-square flex items-center justify-center border border-gray-200 text-4xl font-bold cursor-pointer 
          ${isWinningCell ? 'bg-green-100' : ''} 
          ${mark === null && room.game.status === 'active' ? 'hover:bg-gray-50' : ''}`}
        onClick={() => handleCellClick(index)}
      >
        {mark === 'X' && <X className={`h-10 w-10 ${isWinningCell ? 'text-green-600' : 'text-game-primary'}`} />}
        {mark === 'O' && <Circle className={`h-10 w-10 ${isWinningCell ? 'text-green-600' : 'text-game-secondary'}`} />}
      </div>
    );
  };

  // Get player names for the game
  const getPlayerName = (playerId: string) => {
    if (playerId === userId) return `You (${profile?.username || 'You'})`;
    return 'Opponent';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin">Loading room...</div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-xl font-bold">Room not found</div>
          <div className="text-gray-500 mb-4">This room may have been deleted or never existed.</div>
          <Button onClick={() => navigate('/rooms')}>Back to Rooms</Button>
        </div>
      </Layout>
    );
  }

  const players = room.players ? Object.keys(room.players) : [];
  const allPlayersReady = players.length === 2 && 
    players.every(playerId => room.players[playerId].ready);
  const canStartGame = allPlayersReady && 
    room.status === 'waiting' && 
    players.length === 2;

  return (
    <Layout>
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Private Room</DialogTitle>
            <DialogDescription>
              This is a password-protected room. Please enter the password to join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Enter room password"
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => navigate('/rooms')}>Cancel</Button>
              <Button onClick={handleJoinRoom}>Join Room</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              Room {room.code}
              <Button 
                variant="ghost" 
                className="ml-2 h-8 w-8 p-0" 
                onClick={handleCopyRoomCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </h2>
            <div className="text-sm text-gray-500">
              {room.isPrivate ? 'Private Room' : 'Public Room'} • 
              {room.status === 'waiting' ? ' Waiting for players' : ' Game in progress'}
            </div>
          </div>
          
          {hasJoined && (
            <Button 
              variant="outline" 
              className="mt-2 sm:mt-0" 
              onClick={handleLeaveRoom}
            >
              Leave Room
            </Button>
          )}
        </div>

        {/* Game area or waiting room */}
        {room.status === 'playing' && room.game ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {room.game.status === 'active' ? (
                  <>
                    {room.game.currentTurn === userId ? (
                      <span className="text-green-600">Your turn!</span>
                    ) : (
                      <span>Opponent's turn...</span>  
                    )}
                  </>
                ) : room.game.status === 'win' ? (
                  <span className="text-xl text-game-primary">
                    {room.game.winner === userId ? 'You won! 🎉' : 'You lost! 😢'}
                  </span>
                ) : (
                  <span className="text-xl">Game Drawn! 🤝</span>
                )}
              </CardTitle>
              <CardDescription className="text-center">
                You are playing as{" "}
                {room.game.playerMarks && userId in room.game.playerMarks ? (
                  <span className="font-bold">
                    {room.game.playerMarks[userId] === 'X' ? 'X' : 'O'}
                  </span>
                ) : (
                  'Unknown'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-1 bg-white border border-gray-300 rounded-md overflow-hidden">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => renderCell(index))}
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                {players.map(playerId => {
                  const mark = room.game.playerMarks[playerId];
                  const isCurrentTurn = room.game.currentTurn === playerId;
                  const isWinner = room.game.winner === playerId;
                  
                  return (
                    <div 
                      key={playerId}
                      className={`p-3 rounded-md border ${isCurrentTurn ? 'border-game-primary bg-game-light' : 'border-gray-200'} 
                        ${isWinner ? 'bg-green-100 border-green-400' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {getPlayerName(playerId)} ({mark})
                        </div>
                        {isCurrentTurn && room.game.status === 'active' && (
                          <div className="text-xs bg-game-primary text-white px-2 py-1 rounded">
                            Playing now
                          </div>
                        )}
                        {isWinner && (
                          <div className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Winner!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              {room.game.status !== 'active' && (
                <Button 
                  className="w-full"
                  onClick={() => navigate('/rooms')}
                >
                  Back to Rooms
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Waiting Room</CardTitle>
              <CardDescription>
                Waiting for players to join and ready up ({players.length}/2)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Players */}
                <div className="space-y-2">
                  {players.map((playerId) => (
                    <div 
                      key={playerId} 
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div className="font-medium">
                        {playerId === userId ? profile?.username || 'You' : 'Player'}
                      </div>
                      <div>
                        {room.players[playerId].ready ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, index) => (
                    <div 
                      key={`empty-${index}`}
                      className="flex justify-center items-center p-3 border rounded-md border-dashed border-gray-300 text-gray-400"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      <span>Waiting for player...</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              {!hasJoined ? (
                <Button 
                  className="w-full bg-game-primary hover:bg-game-secondary"
                  onClick={handleJoinRoom}
                >
                  Join Game
                </Button>
              ) : (
                <>
                  <Button 
                    variant={isReady ? "outline" : "default"}
                    className="w-full"
                    onClick={handleToggleReady}
                  >
                    {isReady ? 'Cancel Ready' : 'Ready to Play'}
                  </Button>
                  
                  {canStartGame && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleStartGame}
                    >
                      Start Game
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Room;
