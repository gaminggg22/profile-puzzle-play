
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Award, Home, User, Crown } from 'lucide-react';
import { logOut } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, isAuthenticated } = useAuth();
  const { onlineUsersCount } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-game-primary shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 
              onClick={() => navigate('/dashboard')}
              className="text-xl font-bold text-white cursor-pointer"
            >
              Tic Tac Toe
            </h1>
            <div className="flex items-center text-white bg-green-500 px-2 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse-light" />
              {onlineUsersCount} online
            </div>
          </div>
          
          {profile && (
            <div className="flex items-center">
              <div className="hidden md:flex items-center mr-4">
                <div className="text-white text-right mr-3">
                  <div className="font-bold">{profile.username}</div>
                  <div className="text-xs">
                    Level {profile.level} | {profile.credits} Credits
                  </div>
                </div>
                <div className="bg-game-secondary text-white rounded-full px-3 py-1 text-xs">
                  {profile.rank}
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-game-secondary" 
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-2 hidden md:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="hidden sm:block w-16 md:w-48 bg-white shadow-md">
          <div className="flex flex-col items-center md:items-start p-2 md:p-4 space-y-6">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-5 w-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">Profile</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/leaderboard')}
            >
              <Crown className="h-5 w-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">Leaderboard</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/rooms')}
            >
              <Users className="h-5 w-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">Game Rooms</span>
            </Button>
          </div>
        </nav>

        <main className="flex-1 p-4">
          {children}
        </main>
      </div>

      <div className="block sm:hidden bg-white shadow-inner p-2 border-t border-gray-200">
        <div className="flex justify-around">
          <Button variant="ghost" className="flex-1" onClick={() => navigate('/dashboard')}>
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => navigate('/profile')}>
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => navigate('/leaderboard')}>
            <Crown className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => navigate('/rooms')}>
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Layout;
