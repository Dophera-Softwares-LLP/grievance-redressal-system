"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import {
  auth,
  onAuth,
  signInMicrosoft,
  signOutUser,
} from "../../lib/firebase.client";
import { motion } from "framer-motion";

export default function AppHeader() {
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();
  const glowRef = useRef(null);

  // Mouse glow position
  function handleMouseMove(e) {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
    glow.style.opacity = 1;
  }

  useEffect(() => {
    const unsub = onAuth((u) => {
      setUser(u);
      if (!u) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  async function handleLogout() {
    await signOutUser();
    router.push("/login");
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #00235B, #0047A5)", // deep blue
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => glowRef.current.style.opacity = 0}
    >
      {/* MAGIC GLOW EFFECT */}
      <Box
        ref={glowRef}
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)',
          opacity: 0,
          transition: 'opacity 0.25s ease-out',
        }}
      />


      <Toolbar
        component={motion.div}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* HEADER TITLE */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: 0.5,
            background: "linear-gradient(90deg, #4CC9FF, #D0F0FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Aawaz
        </Typography>

        {/* RIGHT BUTTONS */}
        {!user ? (
          <Button color="inherit" onClick={signInMicrosoft}>
            Sign in with Microsoft
          </Button>
        ) : (
          <>
            <Typography sx={{ mr: 2 }}>{user.email}</Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              component={motion.button}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}