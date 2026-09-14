import React, { useState } from "react";
import { Button, Box, Typography, Grid } from "@mui/material";

const FilePreview = ({ file }) => {
  if (!file || file === "ไม่แนบไฟล์") return null;

  const isRealFile = file instanceof File;
  const isCustomObject = typeof file === "object" && file.url;
  const isStringPath = typeof file === "string";

  const fileName = isRealFile
    ? file.name
    : isCustomObject
      ? file.name
      : isStringPath
        ? file.split("/").pop()
        : "";

  const fileType = isRealFile ? file.type : isCustomObject ? file.type : "";

  const isImage =
    fileType?.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(fileName);

  const isPdf = fileType === "application/pdf" || /\.pdf$/i.test(fileName);

  const src = isRealFile
    ? URL.createObjectURL(file)
    : isCustomObject
      ? file.url
      : isStringPath
        ? file.startsWith("http")
          ? file
          : `https://${file}`
        : null;

  return (
    <Box
      sx={{
        width: 200,
        height: 200,
        border: "1px solid #ccc",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#fafafa",
      }}
    >
      {isImage && src && (
        <img
          src={src}
          alt="preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {isPdf && (
        <Typography
          sx={{
            fontSize: 40,
            fontWeight: "bold",
            color: "error.main",
          }}
        >
          PDF
        </Typography>
      )}

      {!isImage && !isPdf && (
        <Typography fontSize={12} color="text.secondary">
          FILE
        </Typography>
      )}
    </Box>
  );
};

export default FilePreview;
