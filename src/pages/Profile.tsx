
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, Trophy, Minus, Star } from 'lucide-react';

const Profile = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-xl font-bold">Profile not found</div>
          <div className="text-gray-500">Please log in or create a profile.</div>
        </div>
      </Layout>
    );
  }

  // Calculate win rate
  const totalGames = profile.wins + profile.losses + profile.draws;
  const winRate = totalGames > 0 ? Math.round((profile.wins / totalGames) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-1/3">
            <CardHeader>
              <CardTitle className="text-center">Player Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-game-primary text-white flex items-center justify-center rounded-full text-4xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-2xl font-bold">{profile.username}</div>
                <div className="bg-game-secondary text-white rounded-full px-4 py-1">
                  {profile.rank}
                </div>
                <div className="text-sm text-gray-500">
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-bold">{profile.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits</span>
                  <span className="font-bold">{profile.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{profile.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:w-2/3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Game Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="font-bold text-2xl text-green-700">{profile.wins}</div>
                  <div className="text-sm text-green-600">Wins</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center">
                  <div className="font-bold text-2xl text-red-700">{profile.losses}</div>
                  <div className="text-sm text-red-600">Losses</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <div className="font-bold text-2xl text-gray-700">{profile.draws}</div>
                  <div className="text-sm text-gray-600">Draws</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <span>Win Rate</span>
                  <span className="font-bold">{winRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-game-primary h-2.5 rounded-full" 
                    style={{ width: `${winRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Recent Achievements</h3>
                {totalGames > 0 ? (
                  <div className="space-y-2">
                    {profile.wins >= 5 && (
                      <div className="flex items-center p-2 bg-game-light rounded">
                        <Award className="h-5 w-5 mr-2 text-game-primary" />
                        <span>Won 5+ games</span>
                      </div>
                    )}
                    {winRate >= 50 && (
                      <div className="flex items-center p-2 bg-game-light rounded">
                        <Star className="h-5 w-5 mr-2 text-game-primary" />
                        <span>50%+ win rate</span>
                      </div>
                    )}
                    {profile.level >= 5 && (
                      <div className="flex items-center p-2 bg-game-light rounded">
                        <Award className="h-5 w-5 mr-2 text-game-primary" />
                        <span>Reached Level 5</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    Play games to earn achievements!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
