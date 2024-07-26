import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [clickPosition, setClickPosition] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [found, setFound] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [name, setName] = useState('');
  const [scoreboard, setScoreboard] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetchPhoto();
    fetchScoreboard();
  }, []);

  useEffect(() => {
    if (found) {
      setShowPopup(true);
    }
  }, [found]);

  const fetchPhoto = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/photo');
      setPhotoUrl(data.photoUrl);
      setStartTime(Date.now());
      setFound(false);
      setClickPosition(null);
      setShowPopup(false);
      setGameOver(false);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const fetchScoreboard = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/scoreboard');
      setScoreboard(data);
    } catch (error) {
      console.error("Error fetching scoreboard", error);
    }
  };

  const handleClick = (e) => {
    if (found || gameOver) return; // Prevent clicks if game is over or Waldo is found

    const imgElement = e.target;
    const rect = imgElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickPosition({ x, y });
  };

  const normalizeCoordinates = (clickPosition) => {
    const imgElement = document.querySelector('img');
    const rect = imgElement.getBoundingClientRect();
    
    const xRatio = imgElement.naturalWidth / rect.width;
    const yRatio = imgElement.naturalHeight / rect.height;
    
    const normalizedX = clickPosition.x * xRatio;
    const normalizedY = clickPosition.y * yRatio;

    return { x: normalizedX, y: normalizedY };
  };

  const handleValidation = async () => {
    if (!clickPosition) return;

    const normalizedPosition = normalizeCoordinates(clickPosition);
    const response = await axios.post('http://localhost:3001/validate', {
      x: normalizedPosition.x,
      y: normalizedPosition.y
    });
    if (response.data.success) {
      setFound(true);
    } else {
      alert('Wrong position!');
    }
    setClickPosition(null);
  };

  const handleSubmit = async () => {
    const timeTaken = Date.now() - startTime;
    await axios.post('http://localhost:3001/score', { name, time: timeTaken });
    fetchScoreboard();
    setShowPopup(false);
    setGameOver(true);
  };

  const handlePlayAgain = () => {
    fetchPhoto();
  };

  return (
    <div className="App">
      <h1>Where's Waldo?</h1>
      {photoUrl && !gameOver && (
        <img
          src={photoUrl}
          alt="Game"
          onClick={handleClick}
          style={{ maxWidth: '100%', cursor: 'pointer' }}
        />
      )}
      {clickPosition && !found && !gameOver && (
        <div
          style={{
            position: 'absolute',
            left: clickPosition.x,
            top: clickPosition.y,
            border: '1px solid red',
            backgroundColor: 'white',
            zIndex: 1,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <button onClick={handleValidation}>Check for Waldo</button>
        </div>
      )}
      {showPopup && (
        <div className="popup">
          <p>Enter your name:</p>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
      {gameOver && (
        <div className="game-over">
          <button onClick={handlePlayAgain}>Play Again</button>
          <h2>Scoreboard</h2>
          <ul>
            {scoreboard.map((entry, index) => (
              <li key={index}>
                {entry.name}: {entry.time} ms
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
