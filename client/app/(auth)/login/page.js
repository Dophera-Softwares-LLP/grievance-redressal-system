'use client';
import { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signInMicrosoft, onAuth } from '../../../lib/firebase.client';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔹 Redirect if already logged in
  useEffect(() => {
    const unsub = onAuth((user) => {
      if (user) router.replace('/dashboard');
    });
    return () => unsub();
  }, [router]);

  // 🔹 Actual Microsoft login
  async function handleLogin() {
    if (loading) return;
    setLoading(true);
    try {
      const user = await signInMicrosoft();
      if (user) router.replace('/dashboard');
    } catch (err) {
      console.error('Login failed:', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E3C72, #2A5298)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 🔹 Animated background shapes */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, #00c6ff, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1.1, 0.9, 1.1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, #ff6bcb, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* 🔹 Top-right heading */}
      <Box
        sx={{
          position: 'absolute',
          top: 25,
          right: 40,
          textAlign: 'right',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            lineHeight: 1.2,
          }}
        >
          Aawaz
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            fontStyle: 'italic',
            color: 'rgba(252, 248, 250, 0.8)',
          }}
        >
          Bridging Voices and Solutions
        </Typography>
      </Box>

      {/* 🔹 Main login card */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: '50px 60px',
          borderRadius: '16px',
          boxShadow: '0px 8px 25px rgba(0,0,0,0.3)',
          zIndex: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 'bold',
            letterSpacing: '0.5px',
          }}
        >
          Log-In to Aawaz
        </Typography>

        {/* 🔹 Animated bar under title */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
            marginBottom: '30px',
            borderRadius: '2px',
          }}
        />

        {/* 🔹 Button with animation */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              backgroundColor: '#0a72c2ff',
              color: '#fff',
              fontSize: '1rem',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1478c5ff',
                boxShadow: '0px 0px 10px rgba(255,255,255,0.3)',
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Signing in…
              </>
            ) : (
              'Sign in with Microsoft'
            )}
          </Button>
        </motion.div>
      </motion.div>
    </Box>
  );
}