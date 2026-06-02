import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export function Login({ onBack }: { onBack: () => void }) {
  const { setAuth, checkAuth } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = isRegistering ? '/api/register' : '/api/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await checkAuth(); // Refetch auth state and redirect
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ff] flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#5c4ce5] mb-2">Welcome Back</h2>
            <p className="text-slate-500">Parent Dashboard Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-500 text-sm font-semibold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e0ddf5] bg-[#f8f7ff] focus:outline-none focus:ring-2 focus:ring-[#5c4ce5]" 
                placeholder="parent@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e0ddf5] bg-[#f8f7ff] focus:outline-none focus:ring-2 focus:ring-[#5c4ce5]" 
                placeholder={isRegistering ? "At least 4 characters" : "Required"}
                required
                minLength={isRegistering ? 4 : undefined}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Log In')}
            </Button>
            <div className="text-center mt-4">
               <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-[#5c4ce5] hover:underline font-semibold">
                 {isRegistering ? 'Already have an account? Log In' : 'Need an account? Register'}
               </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
