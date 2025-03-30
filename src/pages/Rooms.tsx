
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { findRoomByCode, getPublicRooms } from '@/lib/firebase';
import { Plus, Search, RefreshCw, Users, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Rooms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const { publicRooms, refreshPublicRooms } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      await refreshPublicRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Room code required",
        description: "Please enter a valid room code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const room = await findRoomByCode(roomCode.toUpperCase());
      if (room) {
        navigate(`/room/${room.roomId}`);
      } else {
        toast({
          title: "Room not found",
          description: "No room exists with this code. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-2xl font-bold">Game Rooms</h2>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={loadRooms}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => navigate('/create-room')}
              className="bg-game-primary hover:bg-game-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join by Room Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter room code (e.g., AB12CD)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1"
              />
              <Button 
                onClick={handleJoinByCode}
                disabled={isLoading || !roomCode}
              >
                <Search className="h-4 w-4 mr-2" />
                Join
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <div>Loading rooms...</div>
              </div>
            ) : publicRooms.length > 0 ? (
              <div className="space-y-2">
                {publicRooms.map((room) => (
                  <div 
                    key={room.roomId} 
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/room/${room.roomId}`)}
                  >
                    <div>
                      <div className="font-medium">Room {room.code}</div>
                      <div className="text-xs text-gray-500">
                        Created {new Date(room.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {Object.keys(room.players || {}).length}/2
                        </span>
                      </div>
                      <Unlock className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-2" />
                <p>No public rooms available</p>
                <p className="text-sm mt-2">Create a new room or try again later.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Rooms;
