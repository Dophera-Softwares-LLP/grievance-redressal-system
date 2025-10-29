'use client';
import { useEffect, useState } from 'react';
import { TicketsAPI } from '../../services/tickets';
import { Card, CardContent, Typography, Chip, Stack, Button } from '@mui/material';
import Link from 'next/link';
import { auth } from '../../lib/firebase.client';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen for Firebase auth changes
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace('/login'); // not logged in → redirect
        return;
      }

      try {
        // Ensure token is ready before hitting backend
        const token = await user.getIdToken();
        console.log('✅ Got Firebase token:', token.slice(0, 10) + '...');
        const result = await TicketsAPI.mine();
        setTickets(result);
      } catch (err) {
        console.error('❌ Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">My Tickets</Typography>
        <Button component={Link} href="/tickets/new" variant="contained">
          New Ticket
        </Button>
      </Stack>

      <Stack spacing={2}>
        {tickets.map(t => (
          <Card key={t.id}>
            <CardContent>
              <Typography variant="h6">{t.title}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={t.status} />
                {t.due_at && <Chip label={`Due: ${new Date(t.due_at).toLocaleString()}`} />}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}