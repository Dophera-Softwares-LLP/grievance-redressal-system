'use client';
import { useState } from 'react';
import { TextField, Button, MenuItem, Stack } from '@mui/material';

const CATEGORIES = ['Academic','Hostel','Mess','Laundry','Harassment','Disciplinary','Transport','(Let council decide)'];

export default function TicketForm({ onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', categoryName: '' });

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.categoryName === '(Let council decide)') delete payload.categoryName;
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <TextField label="Title" required value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} />
        <TextField label="Description" multiline minRows={4}
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <TextField select label="Category" value={form.categoryName}
          onChange={e => setForm({ ...form, categoryName: e.target.value })}>
          {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <Button variant="contained" type="submit">Create</Button>
      </Stack>
    </form>
  );
}