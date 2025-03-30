
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  Users, 
  Trophy, 
  PlusSquare, 
  ExternalLink, 
  Clock,
  X
} from 'lucide-react';
import { awardCreditsFromAd } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { userId, profile } = useAuth();
  const { publicRooms, refreshPublicRooms, setFindingGame, findingGame } = useGame();
  const [searchTime, setSearchTime] = useState(0);
  const [searchInterval, setSearchInterval] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Start game search
  const handleFindGame = () => {
    setFindingGame(true);
    setSearchTime(0);
    
    // Start timer
    const interval = setInterval(() => {
      setSearchTime(prev => {
        // If we've been searching for more than 15 seconds, show available rooms
        if (prev >= 15) {
          clearInterval(interval);
          setFindingGame(false);
          navigate('/rooms');
          
          toast({
            title: "No quick match found",
            description: "Check out available game rooms instead",
          });
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    
    setSearchInterval(interval);
    
    // Try to find a room
    refreshPublicRooms().then(() => {
      // If there's an available public room, join it
      if (publicRooms.length > 0) {
        clearInterval(interval);
        setFindingGame(false);
        navigate(`/room/${publicRooms[0].roomId}`);
      }
    });
  };
  
  // Cancel game search
  const handleCancelSearch = () => {
    if (searchInterval) {
      clearInterval(searchInterval);
      setSearchInterval(null);
    }
    setFindingGame(false);
    setSearchTime(0);
  };

  // Watch ad for credits
  const handleWatchAd = async () => {
    if (!userId) return;
    
    // Simulating watching an ad
    toast({
      title: "Watching Ad",
      description: "Please wait while the ad plays...",
    });
    
    // Wait 3 seconds to simulate ad
    setTimeout(async () => {
      try {
        await awardCreditsFromAd(userId);
        toast({
          title: "Credits Awarded!",
          description: "You've earned 1 credit for watching the ad.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }, 3000);
  };

  // Calculate next level progress
  const calculateLevelProgress = () => {
    if (!profile) return 0;
    const winsForNextLevel = profile.level * 5;
    const currentWins = profile.wins % 5;
    return (currentWins / 5) * 100;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Welcome, {profile?.username || 'Player'}</h2>
        
        {/* Game Finder */}
        <Card className="bg-gradient-to-r from-game-primary to-game-secondary text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              {!findingGame ? (
                <>
                  <PlayCircle className="h-16 w-16 animate-pulse-light" />
                  <div className="text-xl font-bold">Ready to play?</div>
                  <Button 
                    onClick={handleFindGame}
                    className="bg-white text-game-primary hover:bg-gray-200"
                    size="lg"
                  >
                    Find Game
                  </Button>
                </>
              ) : (
                <>
                  <Clock className="h-16 w-16 animate-spin-slow" />
                  <div className="text-xl font-bold">Finding a game for you...</div>
                  <div className="text-sm mb-2">Searching for {searchTime} seconds</div>
                  <Progress value={searchTime / 15 * 100} className="w-full" />
                  <Button 
                    onClick={handleCancelSearch}
                    variant="outline"
                    className="bg-transparent border-white text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Search
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Stats & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Player Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Level</span>
                  <span className="font-bold">{profile?.level || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rank</span>
                  <span className="font-bold">{profile?.rank || 'Beginner'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Level</span>
                  <span className="font-bold">{5 - (profile?.wins || 0) % 5} wins needed</span>
                </div>
                <Progress value={calculateLevelProgress()} className="mt-1" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div>
                  <div className="font-bold text-green-600">{profile?.wins || 0}</div>
                  <div className="text-xs">Wins</div>
                </div>
                <div>
                  <div className="font-bold text-red-600">{profile?.losses || 0}</div>
                  <div className="text-xs">Losses</div>
                </div>
                <div>
                  <div className="font-bold">{profile?.draws || 0}</div>
                  <div className="text-xs">Draws</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/profile')}
                variant="outline"
                className="w-full"
              >
                View Full Profile
              </Button>
            </CardFooter>
          </Card>
          
          {/* Room Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Game Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Public Rooms</span>
                <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                  {publicRooms.length} Available
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Your Credits</span>
                <span className="font-bold">{profile?.credits || 0}</span>
              </div>
              <div className="text-xs text-gray-500">
                Creating a private room costs 2 credits
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={() => navigate('/rooms')}
                variant="outline"
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Join Room
              </Button>
              <Button 
                onClick={() => navigate('/create-room')}
                className="flex-1 bg-game-primary hover:bg-game-secondary"
              >
                <PlusSquare className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </CardFooter>
          </Card>
          
          {/* Credits & Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Credits & Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Need more credits?</div>
                <Button 
                  onClick={handleWatchAd}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Ad (+1 credit)
                </Button>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <div className="text-sm font-semibold mb-1">See how you rank!</div>
                <div className="text-xs text-gray-500 mb-2">
                  Check the leaderboard to see top players
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/leaderboard')}
                className="w-full bg-game-primary hover:bg-game-secondary"
              >
                View Leaderboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
