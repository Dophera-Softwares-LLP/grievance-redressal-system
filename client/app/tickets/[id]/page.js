'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent, Stack, Divider, CircularProgress, Button
} from '@mui/material';
import { TicketsAPI } from '../../../services/tickets';
import Image from 'next/image';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    TicketsAPI.getById(id)
      .then(setTicket)
      .catch(err => {
        console.error('Failed to load ticket', err);
        router.push('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return <Typography align="center">Ticket not found.</Typography>;
  }

  return (
    <Box sx={{ py: 6, px: { xs: 2, md: 6 } }}>
      <Card elevation={6} sx={{ borderRadius: 3, maxWidth: 900, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {ticket.title}
            </Typography>

            <Divider />

            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {ticket.description}
            </Typography>

            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
              <Typography><strong>Status:</strong> {ticket.status}</Typography>
              {ticket.categoryName && <Typography><strong>Category:</strong> {ticket.categoryName}</Typography>}
              {ticket.assigneeName && <Typography><strong>Assignee:</strong> {ticket.assigneeName}</Typography>}
              {ticket.due_at && (
                <Typography><strong>Due:</strong> {new Date(ticket.due_at).toLocaleString()}</Typography>
              )}
            </Stack>

            {ticket.attachmentUrl && (
              <>
                <Divider />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Attachment / Proof</Typography>
                {ticket.attachmentUrl.match(/\.(mp4|webm|mov)$/)
                  ? (
                    <video
                      src={ticket.attachmentUrl}
                      controls
                      style={{ width: '100%', borderRadius: 12, marginTop: 12 }}
                    />
                  )
                  : (
                    <Box sx={{ position: 'relative', width: '100%', height: 400, borderRadius: 2, overflow: 'hidden', mt: 2 }}>
                      <Image
                        src={ticket.attachmentUrl}
                        alt="Attachment"
                        fill
                        sizes="(max-width: 900px) 100vw, 900px"
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  )}
              </>
            )}

            <Divider />
            <Button variant="outlined" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}