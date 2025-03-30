
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getLeaderboard } from '@/lib/firebase';
import { Crown, Trophy, Medal, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const leaderboardData = await getLeaderboard(10);
      setLeaders(leaderboardData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Return appropriate icon based on rank
  const getRankIcon = (index: number) => {
    switch(index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Crown className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Crown className="h-5 w-5 text-amber-700" />;
      default:
        return <Trophy className="h-5 w-5 text-game-primary" />;
    }
  };

  // Calculate win rate
  const calculateWinRate = (wins: number, losses: number, draws: number) => {
    const totalGames = wins + losses + draws;
    if (totalGames === 0) return 0;
    return Math.round((wins / totalGames) * 100);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Trophy className="h-6 w-6 mr-2 text-game-primary" />
          Leaderboard
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Players</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse">Loading leaderboard...</div>
              </div>
            ) : leaders.length > 0 ? (
              <div className="space-y-4">
                {/* Top 3 players with special styling */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {leaders.slice(0, 3).map((leader, index) => (
                    <Card 
                      key={leader.userId}
                      className={`${index === 0 ? 'bg-yellow-50 border-yellow-200' : 
                                  index === 1 ? 'bg-gray-50 border-gray-200' : 
                                  'bg-amber-50 border-amber-200'} 
                                  ${leader.userId === userId ? 'ring-2 ring-game-primary' : ''}`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-game-primary text-white flex items-center justify-center mb-2">
                            {index === 0 && <Crown className="h-6 w-6 text-yellow-300" />}
                            {index === 1 && <Medal className="h-6 w-6 text-gray-300" />}
                            {index === 2 && <Medal className="h-6 w-6 text-amber-700" />}
                          </div>
                          <div className="font-bold text-lg">{leader.username}</div>
                          <div className="text-sm text-gray-600">{leader.rank}</div>
                          <div className="mt-2 font-semibold">Level {leader.level}</div>
                          <div className="grid grid-cols-3 gap-2 w-full mt-3 text-sm">
                            <div className="text-green-600 font-medium">{leader.wins} W</div>
                            <div className="text-red-600 font-medium">{leader.losses} L</div>
                            <div className="text-gray-600 font-medium">{leader.draws} D</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Remaining players in a list */}
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left">Rank</th>
                        <th className="py-3 px-4 text-left">Player</th>
                        <th className="py-3 px-4 text-left">Level</th>
                        <th className="py-3 px-4 text-right hidden sm:table-cell">Win Rate</th>
                        <th className="py-3 px-4 text-right">W/L/D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaders.slice(3).map((leader, index) => (
                        <tr 
                          key={leader.userId}
                          className={`border-b ${leader.userId === userId ? 'bg-game-light' : ''} 
                                      hover:bg-gray-50 transition-colors`}
                        >
                          <td className="py-3 px-4 flex items-center">
                            <div className="mr-2">{index + 4}</div>
                            {leader.userId === userId && (
                              <Star className="h-4 w-4 text-game-primary" />
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium">{leader.username}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="mr-2">{leader.level}</div>
                              <div className="text-xs text-gray-500">{leader.rank}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right hidden sm:table-cell">
                            {calculateWinRate(leader.wins, leader.losses, leader.draws)}%
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-green-600">{leader.wins}</span>/
                            <span className="text-red-600">{leader.losses}</span>/
                            <span className="text-gray-600">{leader.draws}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No leaderboard data available. Start playing games!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Leaderboard;
