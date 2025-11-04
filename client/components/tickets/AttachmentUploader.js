"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  LinearProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Image from "next/image";
import axios from "axios";
import { api } from "../../lib/http";

export default function AttachmentUploader({ value = [], onChange }) {
  const [items, setItems] = useState(value);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (accepted) => {
      if (!accepted.length) return;

      // Enforce 10 photos + 1 video
      const images = accepted.filter((f) => f.type.startsWith("image/"));
      const videos = accepted.filter((f) => f.type.startsWith("video/"));
      const nextImages = items.filter((i) => i.type.startsWith("image/"));
      const nextVideos = items.filter((i) => i.type.startsWith("video/"));
      if (
        nextImages.length + images.length > 10 ||
        nextVideos.length + videos.length > 1
      ) {
        alert("Max 10 photos and 1 video allowed");
        return;
      }

      setUploading(true);
      const uploaded = [];

      try {
        for (const file of accepted) {
          // 1️⃣ Ask backend for signed URL
          const { data } = await api.post("/files/sign", {
            filename: file.name,
            contentType: file.type,
          });

          // console.log("🚀 [AttachmentUploader] Received signed URL from backend:", data);

          // 2️⃣ Upload directly to Spaces
          await fetch(data.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type, "x-amz-acl": "public-read" },
            body: file,
          });

          uploaded.push({
            fileUrl: data.fileUrl,
            name: file.name,
            size: file.size,
            type: file.type,
          });
        }

        const next = [...items, ...uploaded];
        setItems(next);
        onChange?.(next);
      } finally {
        setUploading(false);
      }
    },
    [items, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    multiple: true,
  });

  const removeAt = (i) => {
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    onChange?.(next);
  };

  return (
    <Stack spacing={2}>
      {/* Drop area */}
      <Box
        {...getRootProps()}
        sx={{
          p: 3,
          border: "2px dashed rgba(255,255,255,0.25)",
          borderRadius: 2,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: "rgba(0,0,0,0.2)",
        }}
      >
        <input {...getInputProps()} />
        <Typography sx={{ fontWeight: 600 }}>
          {isDragActive ? "Drop files here…" : "Drag & drop or click to upload"}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Up to 10 images + 1 video
        </Typography>
      </Box>

      {uploading && <LinearProgress />}

      {/* Previews */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        {items.map((it, i) => (
          <Box
            key={i}
            sx={{
              position: "relative",
              width: 120,
              height: 90,
              borderRadius: 1,
              overflow: "hidden",
              boxShadow: 2,
              mr: 1,
              mb: 1,
            }}
          >
            {it.type.startsWith("image/") ? (
              <Image
                src={it.fileUrl}
                alt={it.name}
                fill
                sizes="(max-width: 600px) 100vw, 120px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <video
                src={it.fileUrl}
                controls
                width="120"
                height="90"
                style={{ objectFit: "cover" }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => removeAt(i)}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: "rgba(0,0,0,0.5)",
              }}
            >
              <DeleteOutlineIcon sx={{ color: "#fff" }} fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
