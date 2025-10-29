'use client';
import { useRouter } from 'next/navigation';
import { TicketsAPI } from '../../../services/tickets';
import TicketForm from '../../../components/tickets/TicketForm';
import { Typography } from '@mui/material';

export default function NewTicketPage() {
  const router = useRouter();
  async function handleSubmit(payload) {
    await TicketsAPI.create(payload);
    router.push('/dashboard');
  }
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>New Ticket</Typography>
      <TicketForm onSubmit={handleSubmit} />
    </>
  );
}