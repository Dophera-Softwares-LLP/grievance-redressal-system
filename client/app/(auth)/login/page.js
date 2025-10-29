'use client';
import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { signInMicrosoft, onAuth } from '../../../lib/firebase.client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // If already logged in (or once login completes), go to dashboard
  useEffect(() => {
    const unsub = onAuth(user => {
      if (user) router.replace('/dashboard');
    });
    return () => unsub();
  }, [router]);

  async function handleLogin() {
    if (loading) return;
    setLoading(true);
    try {
      const user = await signInMicrosoft();
      if (user) router.replace('/dashboard'); // immediate redirect
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Sign in</Typography>
      <Button variant="contained" onClick={handleLogin} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in with Microsoft'}
      </Button>
    </Box>
  );
}