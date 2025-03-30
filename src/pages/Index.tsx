
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { onOnlineUsersUpdate } from '@/lib/firebase';
import { LogIn, UserPlus, Users } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = React.useState(0);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }

    const unsubscribe = onOnlineUsersUpdate((count) => {
      setOnlineUsers(count);
    });

    return () => unsubscribe();
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      {/* Header */}
      <header className="bg-game-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">Tic Tac Toe</div>
          <div className="flex space-x-2">
            <Link to="/login">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-white text-game-primary hover:bg-gray-100">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex-1 flex flex-col md:flex-row items-center justify-center py-12 px-4">
        <div className="md:w-1/2 text-center md:text-left md:pr-12">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
              {onlineUsers} players online
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-game-primary mb-4">
            Play Tic Tac Toe with Friends!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create your profile, challenge players from around the world, and climb the leaderboard!
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-game-primary hover:bg-game-secondary">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                I Already Have an Account
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="md:w-1/2 mt-12 md:mt-0">
          <div className="w-80 h-80 mx-auto relative">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 bg-white shadow-lg rounded-xl p-4">
              {Array(9).fill(null).map((_, i) => (
                <div key={i} className="aspect-square rounded-md border-2 border-gray-200 flex items-center justify-center">
                  {i % 3 === 0 && <div className="text-4xl text-game-primary font-bold">X</div>}
                  {i % 3 === 1 && <div className="text-4xl text-game-secondary font-bold">O</div>}
                </div>
              ))}
            </div>
            <div className="absolute -top-6 -right-6 bg-game-accent text-game-primary rounded-full w-16 h-16 flex items-center justify-center text-lg font-bold transform rotate-12 animate-wiggle shadow">
              Play!
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-game-primary mb-10">Game Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-game-light text-game-primary rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Player Profiles</h3>
              <p className="text-gray-600">
                Create your unique profile, level up, and earn ranks as you win games.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-game-light text-game-primary rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Public & Private Rooms</h3>
              <p className="text-gray-600">
                Join public matches or create private rooms to play with friends.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-game-light text-game-primary rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
              <p className="text-gray-600">
                Compete to reach the top of the global leaderboard and earn bragging rights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-game-light py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-game-primary mb-6">Ready to Play?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Create an account now to join the fun and start playing Tic Tac Toe with players around the world!
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-game-primary hover:bg-game-secondary">
                Create an Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-game-dark text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">Tic Tac Toe Multiplayer Game</p>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Tic Tac Toe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
