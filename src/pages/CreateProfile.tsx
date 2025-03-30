
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserProfile } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const CreateProfile = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create a profile",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (username.trim().length < 3) {
      toast({
        title: "Invalid username",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createUserProfile(user.uid, {
        username,
        email: user.email,
        isOnline: true,
      });
      
      toast({
        title: "Profile created",
        description: "Your profile has been created successfully!",
      });
      navigate('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-game-primary">Tic Tac Toe</h1>
          <p className="text-gray-600">Complete your profile</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Choose a Username</Label>
                <Input
                  id="username"
                  placeholder="CoolPlayer123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                />
                <p className="text-xs text-gray-500">
                  This is how other players will see you
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-game-primary hover:bg-game-secondary"
                disabled={isLoading}
              >
                {isLoading ? "Creating profile..." : "Create profile"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              By creating a profile, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CreateProfile;
