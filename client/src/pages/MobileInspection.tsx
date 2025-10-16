import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import './MobileInspection.css';

interface Photo {
  id: string;
  dataUrl: string;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
}

interface InspectionData {
  id: string;
  address: string;
  propertyType: string;
  objects: Array<{
    category: string;
    type: string;
    make: string;
    model: string;
    vin?: string;
    registrationNumber?: string;
  }>;
  comment?: string;
  inspectorName: string;
}

const MobileInspection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [inspection, setInspection] = useState<InspectionData | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Запрос геолокации при загрузке
  useEffect(() => {
    requestGeolocation();
    loadInspection();

    return () => {
      // Очистка камеры при размонтировании
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id]);

  const loadInspection = async () => {
    // Здесь должна быть загрузка данных осмотра с сервера
    // Для демо используем моковые данные
    setInspection({
      id: id || '1',
      address: 'г. Москва, ул. Тверская, д. 1',
      propertyType: 'auto',
      objects: [
        {
          category: 'Легковой автомобиль',
          type: 'Седан',
          make: 'Toyota',
          model: 'Camry',
          vin: 'XW8ZZZ5NZKG123456',
          registrationNumber: 'А123АА777'
        }
      ],
      comment: 'Требуется провести осмотр и сфотографировать общий вид, салон, документы',
      inspectorName: 'Иванов Иван Иванович'
    });
  };

  const requestGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setLocationPermission(result.state as any);
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationPermission('granted');
          toast.success('Геолокация определена');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
          toast.error('Не удалось определить местоположение');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Геолокация не поддерживается');
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      setStream(mediaStream);
      setCameraPermission('granted');
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraPermission('denied');
      toast.error('Нет доступа к камере');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const photo: Photo = {
          id: Date.now().toString(),
          dataUrl: reader.result as string,
          timestamp: new Date(),
          latitude: currentLocation?.lat,
          longitude: currentLocation?.lon
        };

        setPhotos(prev => [...prev, photo]);
        toast.success('Фото добавлено');
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.9);
  };

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    toast.success('Фото удалено');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    toast.error('Можно использовать только камеру устройства');
    event.target.value = '';
  };

  const submitInspection = async () => {
    if (photos.length === 0) {
      toast.error('Сделайте хотя бы одно фото');
      return;
    }

    if (!currentLocation) {
      toast.error('Геолокация не определена');
      return;
    }

    setIsLoading(true);

    try {
      // Здесь должна быть отправка данных на сервер
      // Для демо просто имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Осмотр отправлен на проверку');
      navigate('/');
    } catch (error) {
      toast.error('Ошибка при отправке осмотра');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!inspection) {
    return (
      <div className="mobile-inspection-loading">
        <p>Загрузка осмотра...</p>
      </div>
    );
  }

  return (
    <div className="mobile-inspection">
      {/* Header */}
      <div className="mobile-header">
        <div>
          <h1>Осмотр №{inspection.id}</h1>
          <p className="mobile-subtitle">{inspection.address}</p>
        </div>
        {currentLocation && (
          <div className="location-badge">
            <MapPin size={16} />
            <span>GPS OK</span>
          </div>
        )}
      </div>

      {/* Geolocation Request */}
      {locationPermission !== 'granted' && (
        <div className="permission-banner">
          <AlertCircle size={20} />
          <div>
            <p><strong>Требуется доступ к геолокации</strong></p>
            <p>Для проведения осмотра необходимо разрешить доступ к местоположению</p>
          </div>
          <button onClick={requestGeolocation} className="btn-primary-sm">
            Разрешить
          </button>
        </div>
      )}

      {/* Inspection Info */}
      <div className="inspection-card">
        <h2>Объекты для осмотра:</h2>
        {inspection.objects.map((obj, index) => (
          <div key={index} className="object-info">
            <p><strong>{obj.make} {obj.model}</strong></p>
            <p>{obj.category} - {obj.type}</p>
            {obj.vin && <p>VIN: {obj.vin}</p>}
            {obj.registrationNumber && <p>Гос. номер: {obj.registrationNumber}</p>}
          </div>
        ))}

        {inspection.comment && (
          <div className="comment-box">
            <h3>Комментарии:</h3>
            <p>{inspection.comment}</p>
          </div>
        )}
      </div>

      {/* Camera Section */}
      <div className="camera-section">
        <h2>Фотосъемка ({photos.length} фото)</h2>
        
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            className="btn-camera-start"
            disabled={locationPermission !== 'granted'}
          >
            <Camera size={24} />
            <span>Открыть камеру</span>
          </button>
        ) : (
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div className="camera-controls">
              <button onClick={stopCamera} className="btn-camera-close">
                <X size={20} />
              </button>
              <button onClick={capturePhoto} className="btn-camera-capture">
                <Camera size={32} />
              </button>
              <div style={{ width: 40 }} /> {/* Spacer */}
            </div>
          </div>
        )}

        {/* Hidden file input (блокируется) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="photos-section">
          <h2>Сделанные фото:</h2>
          <div className="photos-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="photo-card">
                <img src={photo.dataUrl} alt="Фото осмотра" />
                <div className="photo-info">
                  <span className="photo-time">
                    {photo.timestamp.toLocaleTimeString('ru-RU')}
                  </span>
                  {photo.latitude && photo.longitude && (
                    <span className="photo-location">
                      <MapPin size={12} />
                      GPS
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="photo-delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mobile-footer">
        <button
          onClick={submitInspection}
          disabled={photos.length === 0 || !currentLocation || isLoading}
          className="btn-submit"
        >
          {isLoading ? (
            <span>Отправка...</span>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Выполнено ({photos.length} фото)</span>
            </>
          )}
        </button>
        
        {(photos.length === 0 || !currentLocation) && (
          <p className="submit-hint">
            {!currentLocation ? 'Дождитесь определения геолокации' : 'Сделайте хотя бы одно фото'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MobileInspection;

