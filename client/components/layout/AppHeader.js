'use client';
import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { auth, onAuth, signInMicrosoft, signOutUser } from '../../lib/firebase.client';

export default function AppHeader() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = onAuth(setUser);
    return () => unsub();
  }, []);

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }} variant="h6">Grievance</Typography>
        {!user ? (
          <Button color="inherit" onClick={signInMicrosoft}>Sign in with Microsoft</Button>
        ) : (
          <>
            <Typography sx={{ mr: 2 }}>{user.email}</Typography>
            <Button color="inherit" onClick={signOutUser}>Logout</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}