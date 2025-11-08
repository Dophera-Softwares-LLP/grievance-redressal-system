"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { TicketsAPI } from "../../services/tickets";
import Lottie from "lottie-react";
import welcomeAnim from "../../public/Welcome.json"; // move your uploaded json into /public
import { api } from "../../lib/http";

export default function DashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState(null); // null = loading
  const [recent, setRecent] = useState(null);
  const [role, setRole] = useState('student'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Try to detect role; fallback to 'student' if endpoint not present
        let meRole = 'student';
        try {
          try {
            const me = await api.get('/users/me').then(r => r.data);
            if (me?.role) meRole = me.role;
          } catch (err) {
            console.warn("Could not fetch /users/me", err);
          }
        } catch (_) {
          // ignore; keep default
        }
        setRole(meRole);

        // Fetch tickets based on role
        if (meRole === 'student') {
          const data = await TicketsAPI.mine();
          setTickets(data || []);
          if (data?.length) setRecent(data[0]); // newest first
        } else {
          const data = await TicketsAPI.assigned();
          setTickets(data || []);
          if (data?.length) setRecent(data[0]);
        }
      } catch (err) {
        console.error(err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // --- Loading / empty state ---
  if (loading || tickets === null) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // --- No tickets yet ---
  if (!tickets.length) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {role === "student" ? "Welcome to Aawaz" : "No Tickets Assigned Yet"}
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {role === "student"
            ? "Bridging voices and solutions"
            : "Once a student raises a ticket under your category, it will appear here."}
        </Typography>
        {role === "student" && (
          <>
            <Box sx={{ maxWidth: 400, mx: "auto", mb: 4 }}>
              <Lottie animationData={welcomeAnim} loop={true} />
            </Box>
            <Button
              variant="contained"
              size="large"
              sx={{ borderRadius: 5, px: 6, fontWeight: 600 }}
              onClick={() => router.push("/tickets/new")}
            >
              Raise New Ticket
            </Button>
          </>
        )}
      </Box>
    );
  }


  // --- User has tickets ---
  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {role === "student" ? "My Tickets" : "Tickets Assigned to Me"}
        </Typography>

        {role === "student" && (
          <Button
            variant="contained"
            size="medium"
            sx={{ borderRadius: 5, px: 4, fontWeight: 600 }}
            onClick={() => router.push("/tickets/new")}
          >
            Raise New Ticket
          </Button>
        )}
      </Stack>

      {/* Recent Ticket Summary */}
      {recent && (
        <Card elevation={4} sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Recent Ticket
            </Typography>

            <Typography sx={{ mb: 1 }}>{recent.title}</Typography>

            {role === "student" ? (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {recent.status === "open"
                  ? `Awaiting response from ${recent.assigneeName || "council"}`
                  : recent.status === "resolved"
                  ? "Resolved successfully"
                  : `Status: ${recent.status}`}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {recent.category_name ? `Category: ${recent.category_name} · ` : ""}
                {recent.student_name
                  ? `Student: ${recent.student_name}`
                  : "Unidentified student"}
              </Typography>
            )}

            {recent.due_at && (
              <Typography variant="caption">
                Due: {new Date(recent.due_at).toLocaleString()}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Button
              variant="outlined"
              onClick={() => router.push(`/tickets/${recent.id}`)}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Past / Assigned Tickets */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {role === "student" ? "Previous Tickets" : "Assigned Tickets"}
      </Typography>

      <Stack spacing={2}>
        {tickets.slice(1).map((t) => (
          <Card
            key={t.id}
            sx={{ p: 2, borderRadius: 2, cursor: "pointer" }}
            onClick={() => router.push(`/tickets/${t.id}`)}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography sx={{ fontWeight: 500 }}>{t.title}</Typography>
              <Chip
                label={t.status}
                color={
                  t.status === "open"
                    ? "warning"
                    : t.status === "resolved"
                    ? "success"
                    : "default"
                }
                size="small"
              />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {/* Category chip */}
              {t.category_name && (
                <Chip label={t.category_name} color="primary" size="small" />
              )}

              {/* Due date chip */}
              {t.due_at && (
                <Chip
                  label={`Due: ${new Date(t.due_at).toLocaleString()}`}
                  color={new Date(t.due_at) < new Date() ? "error" : "secondary"}
                  size="small"
                />
              )}

              {/* Show student chip only for authority view */}
              {role !== "student" && (t.student_name || t.roll_number) && (
                <Chip
                  label={t.student_name ? t.student_name : t.roll_number}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Card>
        ))}
      </Stack>
    </Box>
  );

}
