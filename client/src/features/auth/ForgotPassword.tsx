import React, { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Toaster, toast } from 'sonner';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post(ENDPOINTS.AUTH.REQUEST_RESET, { email });
      toast.success('If this email exists, a reset link has been sent.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <p className="mb-6 text-center text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
