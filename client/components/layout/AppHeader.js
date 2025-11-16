'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { auth, onAuth, signInMicrosoft, signOutUser } from '../../lib/firebase.client';

export default function AppHeader() {
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();
  // Watch auth state
  useEffect(() => {
    const unsub = onAuth((u) => {
      setUser(u);
      
      // If logged out → redirect to login page
      if (!u) {
        router.push('/login');
      }
    });
    return () => unsub();
  }, [router]);

  async function handleLogout() {
    await signOutUser();      // clear firebase auth
    router.push('/login');    // immediate redirect
  }

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }} variant="h6">Aawaz</Typography>
        {!user ? (
          <Button color="inherit" onClick={signInMicrosoft}>
            Sign in with Microsoft
          </Button>
        ) : (
          <>
            <Typography sx={{ mr: 2 }}>{user.email}</Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}