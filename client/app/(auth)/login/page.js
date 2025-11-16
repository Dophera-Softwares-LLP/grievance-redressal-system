'use client';
import { useEffect, useState } from 'react';
import LiquidEther from './LiquidEther';
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
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 🔵 Liquid Ether Background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none", 
        }}
      >
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={1000}
          autoRampDuration={0.6}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        />
      </Box>

      {/* 🔵 UI CONTENT (foreground) */}
        <Box
          sx={{
            position: "relative",
            zIndex: 10,
            pointerEvents: "auto",
            textAlign: "center",

            /* GLASS PANEL */
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.35)",
            padding: "50px 60px",
            color: "#fff",

            // /* PREMIUM GLOW LAYER */
            // "&::before": {
            //   content: '""',
            //   position: "absolute",
            //   top: 0,
            //   left: 0,
            //   right: 0,
            //   height: "45%",
            //   borderRadius: "20px",
            //   background:
            //     "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.15), transparent)",
            //   pointerEvents: "none",
            //   zIndex: -1,
            // },

            /* OPTIONAL Subtle outer glow */
            "&::after": {
              content: '""',
              position: "absolute",
              inset: -4,
              borderRadius: "22px",
              background:
                "radial-gradient(closest-side, rgba(255,255,255,0.18), transparent)",
              zIndex: -2,
              pointerEvents: "none",
            },
          }}
        >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 2,
            background: "linear-gradient(90deg, #00c6ff, #0072ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Log-In to Aawaz
        </Typography>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.2 }}
          style={{
            height: "3px",
            background: "linear-gradient(90deg, #00c6ff, #0072ff)",
            marginBottom: "30px",
            borderRadius: "2px",
          }}
        />

        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              backgroundColor: "#0a72c2ff",
              color: "#fff",
              fontSize: "1rem",
              px: 4,
              py: 1.5,
              borderRadius: "10px",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Signing in…
              </>
            ) : (
              <>
                <img
                  src="/Microsoft-logo.svg"
                  alt="Microsoft Logo"
                  style={{ width: 20, height: 20 }}
                />
                Continue with Microsoft
              </>
            )}
          </Button>
        </motion.div>
      </Box>
    </Box>
  );

}