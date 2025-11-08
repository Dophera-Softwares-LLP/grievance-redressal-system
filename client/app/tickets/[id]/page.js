'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent, Stack, Divider, CircularProgress, Button
} from '@mui/material';
import { TicketsAPI } from '../../../services/tickets';
import Image from 'next/image';
import AttachmentUploader from '../../../components/tickets/AttachmentUploader';
import { api } from '../../../lib/http';
import { TextField } from '@mui/material';


export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [acting, setActing] = useState(false);
  const [role, setRole] = useState('student');

  // Load the current user's role once
  useEffect(() => {
    api.get('/users/me')
      .then(res => setRole(res.data?.role || 'student'))
      .catch(() => setRole('student'));
  }, []);

  async function handleResolve() {
    if (!comment.trim()) return alert('Please add a comment before resolving.');
    setActing(true);
    try {
      await api.put(`/tickets/${id}/resolve`, {
        comment,
        attachments: attachments.map(a => a.fileUrl || a.url),
      });
      alert('Ticket resolved successfully!');
      router.push('/dashboard');
    } finally {
      setActing(false);
    }
  }

  async function handleEscalate() {
    if (!comment.trim()) return alert('Please add a reason for escalation.');
    setActing(true);
    try {
      await api.put(`/tickets/${id}/escalate`, {
        comment,
        attachments: attachments.map(a => a.fileUrl || a.url),
      });
      alert('Ticket escalated successfully!');
      router.push('/dashboard');
    } finally {
      setActing(false);
    }
  }



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
            {/* 👇 Show only for authority users */}
            {role !== 'student' && ticket.status !== 'resolved' && (
              <>
                <Divider />

                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Add Comment / Attachments
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    label="Comment"
                    multiline
                    minRows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <AttachmentUploader value={attachments} onChange={setAttachments} />

                  <Stack direction="row" spacing={2}>
                    <Button
                      onClick={handleEscalate}
                      variant="outlined"
                      color="warning"
                      disabled={acting}
                    >
                      Escalate
                    </Button>
                    <Button
                      onClick={handleResolve}
                      variant="contained"
                      color="success"
                      disabled={acting}
                    >
                      Resolve
                    </Button>
                  </Stack>
                </Stack>
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