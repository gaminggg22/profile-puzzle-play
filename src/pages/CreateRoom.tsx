
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createRoom, deductCreditsForRoom } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Unlock } from 'lucide-react';

const CreateRoom = () => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userId, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a room",
        variant: "destructive",
      });
      return;
    }
    
    if (isPrivate && !password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a password for the private room",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // If creating a private room, check if user has enough credits
      if (isPrivate) {
        const requiredCredits = 2;
        if ((profile?.credits || 0) < requiredCredits) {
          toast({
            title: "Not enough credits",
            description: `You need ${requiredCredits} credits to create a private room. Watch ads to earn more!`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Deduct credits
        await deductCreditsForRoom(userId, requiredCredits);
      }
      
      // Create the room
      const { roomId } = await createRoom(userId, isPrivate, password);
      
      toast({
        title: "Room created!",
        description: isPrivate ? "Your private room is ready" : "Your public room is ready",
      });
      
      // Navigate to the new room
      navigate(`/room/${roomId}`);
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
      <div className="max-w-lg mx-auto">
        <Card className="border-2 border-game-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-xl">Create a Game Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Room Type</div>
                <div className="text-sm text-gray-500">Choose public or private</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {isPrivate ? (
                    <Lock className="h-4 w-4 text-game-primary mr-2" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-600 mr-2" />
                  )}
                  <span>{isPrivate ? 'Private' : 'Public'}</span>
                </div>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>
            </div>
            
            {isPrivate && (
              <div className="space-y-2">
                <Label htmlFor="password">Room Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Required for private rooms</span>
                  <span>Cost: 2 credits</span>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm font-medium mb-1">Your Credits</div>
              <div className="text-2xl font-bold">{profile?.credits || 0}</div>
              {isPrivate && (
                <div className="text-xs text-gray-500 mt-1">
                  {(profile?.credits || 0) >= 2 
                    ? "You have enough credits" 
                    : "You need more credits for a private room"}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-game-primary hover:bg-game-secondary"
              onClick={handleCreateRoom}
              disabled={isLoading || (isPrivate && (profile?.credits || 0) < 2)}
            >
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateRoom;
