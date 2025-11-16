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
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import welcomeAnim from "../../public/Welcome.json"; // move your uploaded json into /public
import { api } from "../../lib/http";
import { onAuth } from "../../lib/firebase.client";
import GlowCursor from "../../components/layout/GlowCursor";

export default function DashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState(null); // null = loading
  const [recent, setRecent] = useState(null);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // filter by ticket status
  const [sortBy, setSortBy] = useState("recent"); // sorting preference

  useEffect(() => {
    let unsub = onAuth(async (fbUser) => {
      if (!fbUser) {
        setLoading(false);
        setTickets([]);
        return;
      }
      try {
        // get role from backend AFTER firebase auth is ready
        const me = await api.get("/users/me").then((r) => r.data);
        const role = me?.role || "student";
        setRole(role);

        let data;
        if (role === "student") {
          data = await TicketsAPI.mine();
        } else {
          data = await TicketsAPI.assignedAll();
        }
        setTickets(data || []);
        if (data?.length) setRecent(data[0]);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
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

  const glassMenuProps = {
    PaperProps: {
      sx: {
        background: "rgba(15,23,42,0.85)", // deep glass
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 2,
        mt: 1,
        color: "#f1f5f9",
        boxShadow: "0px 18px 40px rgba(0,0,0,0.4)",
      },
    },

    MenuListProps: {
      sx: {
        paddingY: 0.5,
        "& .MuiMenuItem-root": {
          color: "#e2e8f0",
          fontWeight: 500,
          borderRadius: "8px",
          marginX: "6px",

          "&:hover": {
            background: "rgba(255,255,255,0.12)",
          },

          "&.Mui-selected": {
            background: "rgba(59,130,246,0.35)", // blue highlight
            color: "#fff",
          },
        },
      },
    },
  };

  // --- User has tickets ---
  return (
    <>
      <GlowCursor />

      <Box
        sx={{
          p: { xs: 2, md: 6 },
          maxWidth: 1100,
          mx: "auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* HEADER */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#f9fafb",
            }}
          >
            {role === "student" ? "My Tickets" : "Tickets Assigned to Me"}
          </Typography>

          {role === "student" && (
            <Button
              variant="contained"
              size="medium"
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(90deg, #3b82f6, #0ea5e9)",
                boxShadow: "none", // removed glow completely
                transition: "0.2s ease",

                "&:hover": {
                  background: "linear-gradient(90deg, #2563eb, #0284c7)",
                  boxShadow: "none", // no glow on hover
                  transform: "translateY(-1px)", // subtle lift effect
                },
              }}
              onClick={() => router.push("/tickets/new")}
            >
              Raise New Ticket
            </Button>
          )}
        </Stack>

        {/* FILTER CARD → glass */}
        {role !== "student" && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 4 }}
          >
            {/* STATUS DROPDOWN */}
            <FormControl
              fullWidth
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(10px)",
                  color: "#e5edff",
                },
                "& .MuiSvgIcon-root": {
                  color: "#e5edff",
                },
                "& .MuiInputLabel-root": {
                  color: "#cbd5f5",
                },
                // ❌ kill the white overlay outline
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
              }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={filter}
                label="Status"
                onChange={(e) => setFilter(e.target.value)}
                MenuProps={glassMenuProps}
              >
                <MenuItem value="all">All Tickets</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="escalated">Escalated</MenuItem>
              </Select>
            </FormControl>

            {/* SORT DROPDOWN */}
            <FormControl
              fullWidth
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(10px)",
                  color: "#e5edff",
                },
                "& .MuiSvgIcon-root": {
                  color: "#e5edff",
                },
                "& .MuiInputLabel-root": {
                  color: "#cbd5f5",
                },
                // ❌ kill the white overlay outline
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
              }}
            >
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                MenuProps={glassMenuProps}
              >
                <MenuItem value="recent">Most Recent</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="dueSoon">Due Soon</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}

        {/* RECENT TICKET → glass */}
        {recent && (
          <Card
            elevation={0}
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",

              background:
                "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.9))",
              border: "1px solid rgba(148,163,233,0.45)",
              backdropFilter: "blur(22px)",
              color: "#f1f5f9",
              boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
              transition: "0.25s ease",

              // LEFT ACCENT BAR
              "&:before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "5px",
                background: "linear-gradient(180deg, #38bdf8, #6366f1)",
              },

              // TOP SHINE / REFLECTION
              "&:after": {
                content: '""',
                position: "absolute",
                top: "-35%",
                left: "20%",
                width: "70%",
                height: "70%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.12), transparent 65%)",
                filter: "blur(40px)",
                opacity: 0.5,
              },

              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 32px 70px rgba(0,0,0,0.75)",
                border: "1px solid rgba(191,219,254,0.7)",
              },
            }}
          >
            <CardContent sx={{ position: "relative", zIndex: 10 }}>
              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  mb: 1,
                  color: "#fff",
                  letterSpacing: "0.5px",
                }}
              >
                Recent Ticket
              </Typography>

              {/* Ticket Title */}
              <Typography
                sx={{
                  mb: 1.5,
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "#e0e7ff",
                }}
              >
                {recent.title}
              </Typography>

              {/* Category + Student */}
              <Typography
                sx={{
                  opacity: 0.9,
                  mb: 2,
                  color: "#c7d2fe",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                <strong>Category:</strong> {recent.category_name}
                {role !== "student" && (
                  <>
                    {" "}
                    • <strong>Student:</strong>{" "}
                    {recent.student_name || "Unknown"}
                  </>
                )}
              </Typography>

              {/* Divider */}
              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

              {/* CTA Button */}
              <Button
                variant="contained"
                onClick={() => router.push(`/tickets/${recent.id}`)}
                sx={{
                  borderRadius: "10px",
                  px: 4,
                  py: 1.3,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  color: "#fff",
                  background: "linear-gradient(90deg, #3b82f6, #0ea5e9)",
                  boxShadow: "none",
                  transition: "0.2s ease",

                  "&:hover": {
                    background: "linear-gradient(90deg, #2563eb, #0284c7)",
                    transform: "translateY(-2px)",
                    boxShadow: "none",
                  },
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LIST TITLE */}
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 700, color: "#f1f5f9" }}
        >
          {role === "student" ? "Previous Tickets" : "Assigned Tickets"}
        </Typography>

        {/* TICKET LIST → individual glass cards (enhanced) */}
        <Stack spacing={2.5}>
          {tickets
            .filter((t) => filter === "all" || t.status === filter)
            .sort((a, b) => {
              if (sortBy === "recent")
                return new Date(b.updated_at) - new Date(a.updated_at);
              if (sortBy === "oldest")
                return new Date(a.updated_at) - new Date(b.updated_at);
              if (sortBy === "dueSoon")
                return (
                  new Date(a.due_at || a.updated_at) -
                  new Date(b.due_at || b.updated_at)
                );
              return 0;
            })
            .slice(1)
            .map((t) => (
              <Card
                key={t.id}
                elevation={0}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  p: 2.5,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.9))",
                  border: "1px solid rgba(148,163,233,0.45)",
                  backdropFilter: "blur(16px)",
                  color: "#f1f5f9",
                  cursor: "pointer",
                  transition: "0.25s ease",
                  boxShadow: "0 16px 38px rgba(0,0,0,0.45)",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: "linear-gradient(180deg, #38bdf8, #6366f1)", // accent bar
                  },
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 22px 50px rgba(0,0,0,0.6)",
                    border: "1px solid rgba(191,219,254,0.7)",
                  },
                }}
                onClick={() => router.push(`/tickets/${t.id}`)}
              >
                {/* Top row: Title + status */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                  spacing={2}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.title}
                  </Typography>

                  <Chip
                    label={t.status}
                    color={
                      t.status === "open"
                        ? "warning"
                        : t.status === "resolved"
                        ? "success"
                        : "secondary"
                    }
                    size="small"
                    sx={{
                      fontWeight: 600,
                      textTransform: "capitalize",
                      borderRadius: "6px",
                    }}
                  />
                </Stack>

                {/* Middle row: category + due date */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                  sx={{ mt: 0.5, flexWrap: "wrap" }}
                >
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    {t.category_name && (
                      <Chip
                        label={t.category_name}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: "6px" }}
                      />
                    )}

                    {t.due_at && (
                      <Chip
                        label={`Due: ${new Date(t.due_at).toLocaleString()}`}
                        color={
                          new Date(t.due_at) < new Date()
                            ? "error"
                            : "secondary"
                        }
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: "6px" }}
                      />
                    )}
                  </Stack>

                  {/* Student info – clearer and on the right for authorities */}
                  {role !== "student" && (
                    <Chip
                      label={`Student: ${
                        t.student_name || t.roll_number || "Unknown"
                      }`}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: "rgba(129,140,248,0.8)",
                        color: "#e0e7ff",
                        fontWeight: 500,
                        borderRadius: "6px",
                        backgroundColor: "rgba(15,23,42,0.7)",
                      }}
                    />
                  )}
                </Stack>
              </Card>
            ))}
        </Stack>
      </Box>
    </>
  );
}
