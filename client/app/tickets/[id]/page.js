'use client';
import { useEffect, useState } from 'react';
import TicketDetailsSkeleton from "../../../components/layout/TicketDetailsSkeleton";
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent, Stack, Divider, CircularProgress, Button
} from '@mui/material';
import { TicketsAPI } from '../../../services/tickets';
import Image from 'next/image';
import AttachmentUploader from '../../../components/tickets/AttachmentUploader';
import { api } from '../../../lib/http';
import { TextField } from '@mui/material';
import { onAuth } from '../../../lib/firebase.client';


export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [acting, setActing] = useState(false);
  const [role, setRole] = useState('student');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Load the current user's role once

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
    let unsub = onAuth(async (fbUser) => {
      if (!fbUser) {
        // user not logged in → redirect to login
        router.push('/login');
        return;
      }

      try {
        // Wait for backend to recognise the firebase user
        const me = await api.get('/users/me').then(r => r.data);
        const myRole = me?.role || 'student';
        setRole(myRole);

        // NOW it is safe to fetch ticket
        const data = await TicketsAPI.getById(id);
        setTicket(data);
      } catch (err) {
        console.error("Error loading ticket:", err);
        router.push('/dashboard');   // fallback only if real error
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [id, router]);

  if (loading) {
    return <TicketDetailsSkeleton />;
  }

  if (!ticket) {
    return <Typography align="center">Ticket not found.</Typography>;
  }

  // Filter only the original ticket attachments (not comment ones)
  const ticketFiles = Array.isArray(ticket.attachments)
    ? ticket.attachments.filter(a => a.kind === 'ticket')
    : [];

  // For comment attachments (we'll combine them temporarily)
  function openViewerForComments(fileIndex, filesArray) {
    // override current list with comment attachments list
    // We temporarily treat them like ticketFiles
    ticketFiles.splice(0, ticketFiles.length, ...filesArray);

    setViewerIndex(fileIndex);
    setViewerOpen(true);
  }
  function openViewer(index) {
    setViewerIndex(index);
    setViewerOpen(true);
  }

  function closeViewer() {
    setViewerOpen(false);
  }

  function showNext() {
    setViewerIndex((prev) => (prev + 1) % ticketFiles.length);
  }

  function showPrev() {
    setViewerIndex((prev) => (prev - 1 + ticketFiles.length) % ticketFiles.length);
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

            {ticketFiles.length > 0 && (
              <>
                <Divider />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Attachments / Proof
                </Typography>

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mt: 2 }}>
                  {ticketFiles.map((file, index) => {
                    const isVideo = file.url.match(/\.(mp4|webm|mov)$/i);

                    return (
                      <Box
                        key={file.id}
                        onClick={() => openViewer(index)}
                        sx={{
                          cursor: 'pointer',
                          position: 'relative',
                          width: isVideo ? 260 : 200,
                          height: isVideo ? 160 : 150,
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: 2,
                        }}
                      >
                        {isVideo ? (
                          <video
                            src={file.url}
                            controls
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Image
                            src={file.url}
                            alt="Attachment"
                            fill
                            sizes="(max-width: 900px) 100vw, 260px"
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </>
            )}
            {/* ACTION HISTORY */}
            {ticket.comments?.length > 0 && (
              <>
                <Divider />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Action History
                </Typography>

                <Stack spacing={3} sx={{ mt: 2 }}>
                  {ticket.comments.map((c, ci) => {
                    const commentFiles = c.attachments || [];
                    const isResolve = c.action_type === "resolved";
                    const isEscalate = c.action_type === "escalated";

                    return (
                      <Box
                        key={c.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: isResolve ? "#e8f5e9" : "#fff3e0",
                          boxShadow: 1,
                        }}
                      >
                        {/* Action header */}
                        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                          {isResolve ? "Resolved" : "Escalated"} by {c.user_name} ({c.role_name})
                        </Typography>

                        {/* Comment text */}
                        <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>
                          {c.comment}
                        </Typography>

                        {/* Comment attachments preview */}
                        {commentFiles.length > 0 && (
                          <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
                            {commentFiles.map((file, fi) => {
                              const isVideo = file.url.match(/\.(mp4|webm|mov)$/i);
                              const previewWidth = isVideo ? 230 : 170;
                              const previewHeight = isVideo ? 140 : 130;

                              return (
                                <Box
                                  key={file.id}
                                  onClick={() => openViewerForComments(fi, commentFiles)}
                                  sx={{
                                    cursor: "pointer",
                                    position: "relative",
                                    width: previewWidth,
                                    height: previewHeight,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    boxShadow: 2,
                                  }}
                                >
                                  {isVideo ? (
                                    <video
                                      src={file.url}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                      muted
                                    />
                                  ) : (
                                    <Image
                                      src={file.url}
                                      alt="Attachment"
                                      fill
                                      sizes="(max-width: 900px) 100vw"
                                      style={{ objectFit: "cover" }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>
                        )}

                        {/* Timestamp */}
                        <Typography sx={{ fontSize: 13, color: "gray", mt: 1 }}>
                          {new Date(c.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
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
      {viewerOpen && (
        <Box
          onClick={closeViewer}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
            }}
          >
            {ticketFiles[viewerIndex].url.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                src={ticketFiles[viewerIndex].url}
                controls
                autoPlay
                style={{
                  maxWidth: '90vw',
                  maxHeight: '85vh',
                  borderRadius: 12,
                }}
              />
            ) : (
              <Image
                src={ticketFiles[viewerIndex].url}
                alt="View Attachment"
                width={900}
                height={600}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: 12,
                }}
              />
            )}

            {/* LEFT ARROW */}
            <Button
              onClick={showPrev}
              sx={{
                position: 'absolute',
                left: -60,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                fontSize: 40,
                minWidth: 0,
              }}
            >
              ‹
            </Button>

            {/* RIGHT ARROW */}
            <Button
              onClick={showNext}
              sx={{
                position: 'absolute',
                right: -60,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                fontSize: 40,
                minWidth: 0,
              }}
            >
              ›
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}