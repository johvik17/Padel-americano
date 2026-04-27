import React, { useEffect } from 'react';
import './TrophyRain.css';

function TrophyRain() {
  useEffect(() => {
    createTrophies();
  }, []);

  const createTrophies = () => {
    const trophyContainer = document.getElementById('trophy-container');
    if (trophyContainer) {
      for (let i = 0; i < 30; i++) {
        const trophy = document.createElement('div');
        trophy.className = 'trophy';
        trophy.textContent = '🏆'; // Setter emoji som innhold
        trophy.style.left = Math.random() * 100 + 'vw';
        trophy.style.animationDelay = Math.random() * 5 + 's';
        trophy.addEventListener('animationend', () => {
          trophy.remove();
        });
        trophyContainer.appendChild(trophy);
      }
    }
  };

  return <div id="trophy-container"></div>;
}

export default TrophyRain;
