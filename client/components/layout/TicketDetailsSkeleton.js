"use client";

import { Box, Card, CardContent, Skeleton, Stack, Divider } from "@mui/material";

export default function TicketDetailsSkeleton() {
  return (
    <Box sx={{ py: 6, px: { xs: 2, md: 6 } }}>
      <Card
        elevation={4}
        sx={{
          borderRadius: 3,
          maxWidth: 900,
          mx: "auto",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Title */}
            <Skeleton
              variant="text"
              width="60%"
              height={40}
              sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

            {/* Description */}
            <Stack spacing={1}>
              <Skeleton
                variant="text"
                width="90%"
                height={20}
                sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
              />
              <Skeleton
                variant="text"
                width="85%"
                height={20}
                sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
              />
              <Skeleton
                variant="text"
                width="70%"
                height={20}
                sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
              />
            </Stack>

            {/* Metadata */}
            <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={160}
                  height={28}
                  sx={{ bgcolor: "rgba(255,255,255,0.25)", borderRadius: 1 }}
                />
              ))}
            </Stack>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

            {/* Attachments */}
            <Skeleton
              variant="text"
              width="35%"
              height={30}
              sx={{ bgcolor: "rgba(255,255,255,0.25)" }}
            />

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={180}
                  height={120}
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: 2 }}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
