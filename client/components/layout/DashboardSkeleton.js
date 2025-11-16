"use client";

import { Box, Skeleton, Stack, Card } from "@mui/material";

export default function DashboardSkeleton() {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 6 },
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      {/* HEADER SKELETON */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Skeleton
          variant="text"
          width={220}
          height={38}
          sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
        />
        <Skeleton
          variant="rounded"
          width={160}
          height={42}
          sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
        />
      </Stack>

      {/* FILTER SKELETON */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Skeleton
          variant="rounded"
          width={220}
          height={50}
          sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
        />
        <Skeleton
          variant="rounded"
          width={220}
          height={50}
          sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
        />
      </Stack>

      {/* RECENT TICKET CARD SKELETON */}
      <Card
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Skeleton
          variant="text"
          width={160}
          height={30}
          sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.25)" }}
        />
        <Skeleton
          variant="text"
          width="80%"
          height={28}
          sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.25)" }}
        />
        <Skeleton
          variant="text"
          width="60%"
          height={22}
          sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.25)" }}
        />
        <Skeleton
          variant="rounded"
          width={150}
          height={40}
          sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.25)" }}
        />
      </Card>

      {/* LIST SKELETON (3 ITEMS) */}
      <Stack spacing={3}>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(16px)",
            }}
          >
            <Skeleton
              variant="text"
              width="60%"
              height={26}
              sx={{ mb: 1, bgcolor: "rgba(255,255,255,0.25)" }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={22}
              sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
            />
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
