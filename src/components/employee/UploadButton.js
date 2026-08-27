import React, { useState } from 'react';
import { Button, Box, Typography, Grid } from '@mui/material';

const UploadButton = () => {
  const [selectedImages, setSelectedImages] = useState([]);

  // ฟังก์ชันเมื่อผู้ใช้เลือกไฟล์
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.slice(0, 3 - selectedImages.length).map((file) => URL.createObjectURL(file));

    // เพิ่มรูปภาพใหม่เข้ากับรูปภาพเดิม (สูงสุด 3 รูป)
    setSelectedImages((prevImages) => [...prevImages, ...newImages].slice(0, 3));
  };

  return (
    <Box sx={{ textAlign: 'center', marginTop: 4 }}>
      <input
        accept="image/*"
        id="upload-image"
        type="file"
        style={{ display: 'none' }}
        multiple
        onChange={handleImageChange}
      />
      <label htmlFor="upload-image">
        <Button
          variant="contained"
          color="primary"
          component="span"
          disabled={selectedImages.length >= 3}
        >
          เพิ่มใบอนุญาตการขับขี่รถ (สูงสุด 3 รูป)
        </Button>
      </label>

      <Box sx={{ marginTop: 1 }}>
        <Typography variant="h6">ตัวอย่างรูปภาพใบอนุญาตการขับขี่รถ:</Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ marginTop: 1 }}>
          {selectedImages.map((image, index) => (
            <Grid item key={index}>
              <img
                src={image}
                alt={`Selected ${index + 1}`}
                style={{ maxWidth: 100, height: 'auto', borderRadius: 8 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default UploadButton;
