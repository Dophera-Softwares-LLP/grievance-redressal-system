'use client';
import { useState } from 'react';
import {
  Container, Card, CardContent, Stack, Typography,
  TextField, MenuItem, Button, Divider
} from '@mui/material';
import AttachmentUploader from './AttachmentUploader';

const CATEGORIES = [
  'Academic',
  'Hostel',
  'Mess',
  'Laundry',
  'Harassment',
  'Disciplinary',
  'Transport',
  '(Let council decide)'
];

export default function TicketForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryName: ''
  });
  const [attachments, setAttachments] = useState([]); // images/videos

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // base payload
    const payload = { ...form };

    // omit category if user picked “Let council decide”
    if (payload.categoryName === '(Let council decide)') {
      delete payload.categoryName;
    }

    // MVP: send only first file’s URL as attachmentUrl
    if (attachments.length) {
      payload.attachmentUrl = attachments[0].fileUrl;
    }

    onSubmit(payload);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 3 }}>
        Raise a Ticket
      </Typography>

      <Card elevation={6} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Category */}
              <div>
                <Typography sx={{ mb: 1, fontWeight: 700 }}>Select Category</Typography>
                <TextField
                  select
                  fullWidth
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* Title */}
              <div>
                <Typography sx={{ mb: 1, fontWeight: 700 }}>Title</Typography>
                <TextField
                  name="title"
                  fullWidth
                  required
                  placeholder="Short summary"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div>
                <Typography sx={{ mb: 1, fontWeight: 700 }}>Description</Typography>
                <TextField
                  name="description"
                  fullWidth
                  multiline
                  minRows={4}
                  required
                  placeholder="Describe the issue in detail"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <Divider />

              {/* Attachments / Proof */}
              <div>
                <Typography sx={{ mb: 1, fontWeight: 700 }}>Attachments / Proof</Typography>
                <AttachmentUploader value={attachments} onChange={setAttachments} />
              </div>

              <Divider />

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ alignSelf: 'center', px: 6 }}
              >
                Submit
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}