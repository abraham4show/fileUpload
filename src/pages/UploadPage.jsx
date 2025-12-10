import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaImages } from "react-icons/fa";

// Import your local images - update these paths to your actual image files
import bg1 from "../img/img1.JPG";
import bg2 from "../img/img2.JPG";
import bg3 from "../img/img3.JPG";
import bg4 from "../img/img4.JPG";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploaderName, setUploaderName] = useState("");
  const [status, setStatus] = useState("");
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const navigate = useNavigate();

  // File size limits
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos

  // Array of imported background images
  const backgroundImages = [bg1, bg2, bg3, bg4];

  // Handle background image transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Validate file before setting state
  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    
    if (!selectedFiles || selectedFiles.length === 0) {
      setFile(null);
      return;
    }

    // Check each file size
    const invalidFiles = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const currentFile = selectedFiles[i];
      const isVideo = currentFile.type.startsWith('video/');
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      
      if (currentFile.size > maxSize) {
        const sizeInMB = (currentFile.size / (1024 * 1024)).toFixed(1);
        const maxSizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
        invalidFiles.push(`${currentFile.name} (${sizeInMB}MB)`);
      }
    }

    if (invalidFiles.length > 0) {
      setFile(null);
      e.target.value = ""; // Clear file input
      setStatus(`❌ Files too large: ${invalidFiles.join(', ')}. Max size: ${invalidFiles[0].includes('.MP4') || invalidFiles[0].includes('.mp4') ? '100MB for videos' : '10MB for images'}`);
      return;
    }

    // All files are valid
    setFile(selectedFiles);
    if (selectedFiles.length === 1) {
      setStatus(`✅ Ready to upload: ${selectedFiles[0].name}`);
    } else {
      setStatus(`✅ Ready to upload ${selectedFiles.length} files`);
    }
  };

  // Handle multiple file uploads
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || file.length === 0) {
      setStatus("❌ Please select at least one file.");
      return;
    }

    // Final validation before upload
    for (let i = 0; i < file.length; i++) {
      const isVideo = file[i].type.startsWith('video/');
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      
      if (file[i].size > maxSize) {
        setStatus(`❌ ${file[i].name} is too large. Max size: ${isVideo ? '100MB for videos' : '10MB for images'}`);
        return;
      }
    }

    const formData = new FormData();
    for (let i = 0; i < file.length; i++) {
      formData.append("files", file[i]);
    }
    formData.append("name", uploaderName || "Anonymous");

    try {
      setStatus("⏳ Uploading... Please wait.");
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 minute timeout for large videos
      });

      if (res.data && res.data.message) {
        setStatus(`✅ Upload successful! ${file.length} file(s) uploaded.`);
        setFile(null);
        setUploaderName("");
        
        // Clear file input
        document.querySelector('.upload-input-file').value = "";
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setStatus("Ready to upload more files!");
        }, 5000);
      }
    } catch (err) {
      console.error("Upload error:", err);
      
      let errorMessage = "❌ Upload failed. Try again.";
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = "❌ Network error. Check your connection.";
      } else if (err.response) {
        // Handle server errors
        if (err.response.status === 400 && err.response.data.error) {
          errorMessage = `❌ ${err.response.data.error}`;
        } else if (err.response.status === 413) {
          errorMessage = "❌ File too large for server.";
        } else if (err.response.data.details) {
          errorMessage = `❌ Upload failed: ${err.response.data.details}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "❌ Upload timeout. Try smaller files.";
      }
      
      setStatus(errorMessage);
    }
  };

  return (
    <div className="upload-page-container">
      {/* Background Slideshow */}
      <div className="bg-slideshow">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`bg-slide ${index === currentBgIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>

      {/* Content Overlay */}
      <div className="upload-overlay">
        <div className="upload-container">
          <h1 className="upload-title">
            Welcome to <span>#MJALWAYS&FOREVER</span>
          </h1>
          <p className="upload-description">Share your wedding photos and videos with us! 📸💍</p>
          
          {/* File size info */}
          <div className="file-size-info">
            <p>📁 Maximum file sizes:</p>
            <ul>
              <li>📸 Images: 10MB (JPG, PNG, GIF)</li>
              <li>🎥 Videos: 100MB (MP4, MOV, AVI)</li>
            </ul>
          </div>
          
          <form onSubmit={handleUpload} className="upload-form">
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              className="upload-input-text"
            />
            <br />
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="upload-input-file"
              id="fileInput"
            />
            <br />
            
            {/* Selected files preview */}
            {file && file.length > 0 && (
              <div className="selected-files">
                <p>Selected files:</p>
                <ul>
                  {Array.from(file).map((f, index) => (
                    <li key={index}>
                      {f.name} ({(f.size / (1024 * 1024)).toFixed(1)}MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button 
              type="submit" 
              className="upload-button"
              disabled={!file || file.length === 0 || status.includes("Uploading")}
            >
              {status.includes("Uploading") ? "⏳ Uploading..." : "📤 Upload"}
            </button>
          </form>
          
          <p className={`upload-status ${status.includes("✅") ? "success" : status.includes("❌") ? "error" : ""}`}>
            {status}
          </p>

          {/* Gallery Navigation Button */}
          <div className="gallery-link" onClick={() => navigate("/access")}>
            <FaImages size={28} />
            <span>View Private Gallery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;