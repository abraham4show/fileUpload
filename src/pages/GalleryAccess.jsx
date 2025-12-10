// src/pages/GalleryAccess.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GalleryAccess = () => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // The secret question - you can customize this
  const secretQuestion = "What's the secret code from the wedding invitation?";
  const correctAnswer = "MJALWAYS"; // Case-insensitive

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userAnswer = answer.trim().toLowerCase();
    
    if (userAnswer === correctAnswer.toLowerCase()) {
      login();
      setError('');
      navigate('/gallery');
    } else {
      setError('Incorrect answer. Please try again!');
      setAnswer('');
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <h1 className="access-title">🔒 Private Gallery</h1>
        <p className="access-description">
          This gallery is only for invited guests. Please answer the security question to continue.
        </p>
        
        <div className="access-question">
          <h3>Security Question:</h3>
          <p><strong>{secretQuestion}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="access-form">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter answer here..."
            className="access-input"
            required
          />
          
          {error && <p className="access-error">{error}</p>}
          
          <div className="access-buttons">
            <button 
              type="button" 
              onClick={goBack}
              className="access-btn back-btn"
            >
              ← Back to Upload
            </button>
            <button type="submit" className="access-btn submit-btn">
              Unlock Gallery
            </button>
          </div>
        </form>
        
        <div className="access-hint">
          <p>💡 Hint: Check your wedding invitation for the secret code!</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryAccess;