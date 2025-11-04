'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Snackbar } from '@mui/material';
import { TicketsAPI } from '../../../services/tickets';
import TicketForm from '../../../components/tickets/TicketForm';

export default function NewTicketPage() {
  const router = useRouter();
  const [snack, setSnack] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(payload) {
    if (loading) return;
    setLoading(true);
    try {
      await TicketsAPI.create(payload);
      setSnack(true);
      // Small delay to show success message
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err) {
      console.error('Ticket creation failed:', err);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TicketForm onSubmit={handleSubmit} />
      <Snackbar
        open={snack}
        autoHideDuration={2500}
        onClose={() => setSnack(false)}
        message="✅ Ticket created successfully!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}