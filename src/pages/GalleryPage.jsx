// src/pages/GalleryPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaDownload, FaTrash, FaArrowLeft, FaArrowRight, FaPlay, FaPause, FaLock } from "react-icons/fa";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GalleryPage = () => {
  const [uploads, setUploads] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const slideshowRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/upload")
      .then(res => setUploads(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/upload/${id}`);
      setUploads(uploads.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openModal = (index) => {
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setCurrentIndex(null);
    setIsPlaying(false);
    clearInterval(slideshowRef.current);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % uploads.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + uploads.length) % uploads.length);
  };

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(slideshowRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      slideshowRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % uploads.length);
      }, 3000);
    }
  };

  return (
    <div className="gallery-container">
      {/* Logout/Lock Button */}
      <div className="gallery-header">
        <h1>Wedding Gallery</h1>
        <button onClick={handleLogout} className="lock-btn">
          <FaLock /> Lock Gallery
        </button>
      </div>
      
      <div className="gallery-grid">
        {uploads.map((upload, index) => (
          <div key={upload._id} className="gallery-item">
            {upload.fileType === "video" ? (
              <video
                src={upload.url}
                onClick={() => openModal(index)}
                className="gallery-media"
                controls
              />
            ) : (
              <img
                src={upload.url}
                alt=""
                onClick={() => openModal(index)}
                className="gallery-media"
              />
            )}
            <p className="uploader-name">{upload.uploaderName || "Anonymous"}</p>
            <div className="gallery-actions">
              <a href={upload.url} download><FaDownload /></a>
              <FaTrash onClick={() => handleDelete(upload._id)} />
            </div>
          </div>
        ))}
      </div>

      {currentIndex !== null && (
        <div className="lightbox">
          <button className="close-btn" onClick={closeModal}>X</button>
          <button className="nav-btn left" onClick={prevSlide}><FaArrowLeft /></button>
          <button className="nav-btn right" onClick={nextSlide}><FaArrowRight /></button>
          {uploads[currentIndex].fileType === "video" ? (
            <video src={uploads[currentIndex].url} controls autoPlay className="lightbox-media" />
          ) : (
            <img src={uploads[currentIndex].url} alt="" className="lightbox-media" />
          )}
          <p className="lightbox-uploader">{uploads[currentIndex].uploaderName || "Anonymous"}</p>
          <button className="play-btn" onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;