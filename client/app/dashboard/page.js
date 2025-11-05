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

export default function DashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState(null); // null = loading
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    TicketsAPI.mine()
      .then((data) => {
        setTickets(data || []);
        if (data?.length) setRecent(data[0]); // assuming newest first
      })
      .catch((err) => console.error(err));
  }, []);

  // --- Loading / empty state ---
  if (tickets === null) {
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
          Welcome to Aawaz
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Bridging voices and solutions
        </Typography>
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
      </Box>
    );
  }

  // --- User has tickets ---
  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1000, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Welcome Back
        </Typography>

        <Button
          variant="contained"
          size="medium"
          sx={{ borderRadius: 5, px: 4, fontWeight: 600 }}
          onClick={() => router.push("/tickets/new")}
        >
          Raise New Ticket
        </Button>
      </Stack>

      {/* Recent Ticket Summary */}
      {recent && (
        <Card elevation={4} sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Recent Ticket
            </Typography>
            <Typography sx={{ mb: 1 }}>{recent.title}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {recent.status === "open"
                ? `Awaiting response from ${recent.assigneeName || "council"}`
                : recent.status === "resolved"
                ? "Resolved successfully"
                : `Status: ${recent.status}`}
            </Typography>
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

      {/* Past Tickets */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Previous Tickets
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
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
