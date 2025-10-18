import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin } from 'lucide-react';
import './MobileHome.css';

const MobileHome: React.FC = () => {
  const [inspectionId, setInspectionId] = useState('');
  const navigate = useNavigate();

  const handleStartInspection = () => {
    if (inspectionId) {
      navigate(`/inspection/${inspectionId}`);
    }
  };

  return (
    <div className="mobile-home">
      <div className="mobile-home-content">
        <div className="logo-section">
          <div className="logo-icon">
            <Camera size={48} />
          </div>
          <h1>CMS Check</h1>
          <p>Система дистанционных осмотров</p>
        </div>

        <div className="inspection-section">
          <h2>Начать осмотр</h2>
          <p className="instruction">Введите номер осмотра из SMS или Email</p>
          
          <div className="input-group">
            <input
              type="text"
              value={inspectionId}
              onChange={(e) => setInspectionId(e.target.value)}
              placeholder="Номер осмотра"
              className="inspection-input"
            />
          </div>

          <button
            className={`inspection-button ${inspectionId ? 'pulse' : ''}`}
            onClick={handleStartInspection}
            disabled={!inspectionId}
          >
            <Camera size={24} />
            <span>Начать осмотр</span>
          </button>
        </div>

        <div className="info-section">
          <div className="info-card">
            <MapPin size={20} />
            <div>
              <strong>Геолокация</strong>
              <p>Фотографии автоматически отмечаются вашим местоположением</p>
            </div>
          </div>

          <div className="info-card">
            <Camera size={20} />
            <div>
              <strong>Только новые фото</strong>
              <p>Загрузка ранее сделанных фотографий запрещена</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;

