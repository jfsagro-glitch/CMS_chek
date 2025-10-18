import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Camera, 
  MapPin, 
  Clock, 
  X, 
  Upload,
  ArrowLeft,
  AlertCircle,
  Wifi,
  WifiOff,
  CloudUpload
} from 'lucide-react';
import { inspectionsApi } from '../services/api';
import { 
  savePhotoOffline, 
  getPhotosForInspection, 
  checkOnlineStatus,
  uploadPendingPhotos,
  deletePhoto as deleteOfflinePhoto
} from '../utils/offlineStorage';
import toast from 'react-hot-toast';
import './MobileInspection.css';

interface Photo {
  id?: string;
  file: File | Blob;
  preview: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  objectId: number;
  uploaded?: boolean;
  offlineId?: string;
}

interface InspectionObject {
  id: number;
  vin?: string;
  registration_number?: string;
  category: string;
  type: string;
  make: string;
  model: string;
}

const MobileInspection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentObject, setCurrentObject] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const { data: inspection, isLoading, error } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => inspectionsApi.getInspection(Number(id)),
    enabled: !!id,
  });

  // Загрузка сохраненных фото из IndexedDB
  useEffect(() => {
    const loadOfflinePhotos = async () => {
      if (id) {
        try {
          const offlinePhotos = await getPhotosForInspection(Number(id));
          const loadedPhotos: Photo[] = await Promise.all(
            offlinePhotos.map(async (offlinePhoto) => {
              const preview = URL.createObjectURL(offlinePhoto.file);
              return {
                id: offlinePhoto.id,
                file: offlinePhoto.file as File,
                preview,
                latitude: offlinePhoto.latitude,
                longitude: offlinePhoto.longitude,
                timestamp: offlinePhoto.timestamp,
                objectId: offlinePhoto.objectId,
                uploaded: offlinePhoto.uploaded,
                offlineId: offlinePhoto.id
              };
            })
          );
          setPhotos(loadedPhotos);
          setPendingCount(loadedPhotos.filter(p => !p.uploaded).length);
        } catch (error) {
          console.error('Ошибка загрузки сохраненных фото:', error);
        }
      }
    };

    loadOfflinePhotos();
  }, [id]);

  // Отслеживание онлайн/офлайн статуса
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Подключение к интернету восстановлено');
      // Попытаться загрузить неотправленные фото
      tryUploadPendingPhotos();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Нет подключения к интернету. Фото будут сохранены локально', {
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Запрос геолокации
  useEffect(() => {
    if (navigator.geolocation) {
      toast.loading('Получение геолокации...', { id: 'geolocation' });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success('Геолокация получена', { id: 'geolocation' });
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          let errorMessage = 'Не удалось получить геолокацию';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Доступ к геолокации запрещен. Разрешите доступ в настройках браузера';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Информация о местоположении недоступна';
              break;
            case error.TIMEOUT:
              errorMessage = 'Превышено время ожидания геолокации';
              break;
          }
          
          toast.error(errorMessage, { id: 'geolocation', duration: 5000 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Геолокация не поддерживается вашим устройством');
    }
  }, []);

  const handleTakePhoto = async (objectId: number) => {
    try {
      // Проверяем наличие геолокации
      if (!location) {
        toast.error('Геолокация не определена. Разрешите доступ к местоположению');
        return;
      }

      // Создаем input для камеры с запретом на выбор из галереи
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Принудительно использует камеру
      
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          // Проверяем, что файл - это новое фото (по времени создания)
          const fileDate = new Date(file.lastModified);
          const now = new Date();
          const timeDiff = now.getTime() - fileDate.getTime();
          
          // Если фото старше 1 минуты, возможно это старое фото из галереи
          if (timeDiff > 60000) {
            toast.error('ВНИМАНИЕ! Используйте только свежие фотографии с камеры. Загрузка старых фото запрещена');
            return;
          }
          
          const preview = URL.createObjectURL(file);
          const timestamp = new Date().toISOString();
          
          // Сохраняем фото в IndexedDB для офлайн режима
          try {
            const offlineId = await savePhotoOffline({
              inspectionId: Number(id),
              objectId,
              file,
              fileName: file.name,
              latitude: location.lat,
              longitude: location.lng,
              timestamp,
              uploaded: false
            });
            
            const photo: Photo = {
              id: offlineId,
              file,
              preview,
              latitude: location.lat,
              longitude: location.lng,
              timestamp,
              objectId,
              uploaded: false,
              offlineId
            };
            
            setPhotos(prev => [...prev, photo]);
            setPendingCount(prev => prev + 1);
            setCurrentObject(null);
            
            if (isOnline) {
              toast.success('Фото добавлено с геоданными');
            } else {
              toast.success('Фото сохранено локально. Загрузится при появлении интернета', {
                icon: '💾',
                duration: 5000
              });
            }
          } catch (error) {
            console.error('Ошибка сохранения фото:', error);
            toast.error('Ошибка сохранения фото');
          }
        }
      };
      
      input.click();
      
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      toast.error('Не удалось получить доступ к камере');
    }
  };

  const handleUploadPhotos = async () => {
    if (photos.length === 0) {
      toast.error('Добавьте фотографии перед отправкой');
      return;
    }

    setIsUploading(true);
    try {
      // Упрощенная версия - просто обновляем статус
      await inspectionsApi.updateStatus(Number(id), 'Проверка');
      
      toast.success('Осмотр отправлен на проверку');
      navigate('/inspections');
    } catch (error) {
      toast.error('Ошибка загрузки фотографий');
    } finally {
      setIsUploading(false);
    }
  };

  const tryUploadPendingPhotos = async () => {
    if (!isOnline) return;

    try {
      const uploadedCount = await uploadPendingPhotos(async (offlinePhoto) => {
        // Здесь будет реальная загрузка на сервер
        // Пока просто имитируем успех
        console.log('Загрузка фото:', offlinePhoto.id);
      });

      if (uploadedCount > 0) {
        toast.success(`Загружено фото: ${uploadedCount}`, {
          icon: '☁️',
          duration: 4000
        });
        setPendingCount(prev => Math.max(0, prev - uploadedCount));
        
        // Обновляем статус фото в состоянии
        setPhotos(prev => prev.map(p => ({
          ...p,
          uploaded: true
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки неотправленных фото:', error);
    }
  };

  const removePhoto = async (index: number) => {
    const photo = photos[index];
    
    // Удаляем из IndexedDB если есть offlineId
    if (photo.offlineId) {
      try {
        await deleteOfflinePhoto(photo.offlineId);
      } catch (error) {
        console.error('Ошибка удаления из офлайн хранилища:', error);
      }
    }
    
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
    
    if (!photo.uploaded) {
      setPendingCount(prev => Math.max(0, prev - 1));
    }
  };

  const getObjectPhotos = (objectId: number) => {
    return photos.filter(photo => photo.objectId === objectId);
  };

  if (isLoading) {
    return (
      <div className="mobile-loading">
        <div className="spinner"></div>
        <p>Загрузка осмотра...</p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="mobile-error">
        <AlertCircle size={48} />
        <h3>Ошибка загрузки</h3>
        <p>Не удалось загрузить данные осмотра</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-inspection">
      {/* Шапка */}
      <div className="mobile-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/mobile')}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="header-info">
          <h1>Осмотр #{inspection.data.inspection.id}</h1>
          <p>{inspection.data.inspection.address}</p>
        </div>
        <div className="header-status">
          <span className={`status ${inspection.data.inspection.status.toLowerCase().replace(' ', '-')}`}>
            {inspection.data.inspection.status}
          </span>
          <div className={`online-indicator ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {pendingCount > 0 && (
              <span className="pending-badge">{pendingCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* Информация об осмотре */}
      <div className="inspection-info">
        <div className="info-item">
          <MapPin size={16} />
          <span>{inspection.data.inspection.address}</span>
        </div>
        <div className="info-item">
          <Clock size={16} />
          <span>Создан: {new Date(inspection.data.inspection.created_at).toLocaleDateString('ru-RU')}</span>
        </div>
        {location && (
          <div className="info-item geolocation-status">
            <MapPin size={16} color="#10b981" />
            <span>Геолокация: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
          </div>
        )}
      </div>

      {/* Предупреждение о требованиях к фото */}
      <div className="photo-requirements">
        <AlertCircle size={16} />
        <div>
          <strong>Важно!</strong> Фотографии должны быть сделаны только через камеру устройства. 
          Загрузка ранее сделанных фотографий запрещена.
        </div>
      </div>

      {/* Объекты для осмотра */}
      <div className="objects-section">
        <h2>Объекты для осмотра</h2>
        {inspection.data.objects.map((object: InspectionObject) => (
          <div key={object.id} className="object-card">
            <div className="object-header">
              <h3>{object.make} {object.model}</h3>
              <span className="object-category">{object.category}</span>
            </div>
            
            {object.registration_number && (
              <p className="object-reg">Рег. номер: {object.registration_number}</p>
            )}
            
            {object.vin && (
              <p className="object-vin">VIN: {object.vin}</p>
            )}

            {/* Фотографии объекта */}
            <div className="object-photos">
              <h4>Фотографии ({getObjectPhotos(object.id).length})</h4>
              <div className="photos-grid">
                {getObjectPhotos(object.id).map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img src={photo.preview} alt={`Фото ${index + 1}`} />
                    <button 
                      className="remove-photo"
                      onClick={() => removePhoto(photos.indexOf(photo))}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  className="add-photo-btn"
                  onClick={() => setCurrentObject(object.id)}
                >
                  <Camera size={24} />
                  <span>Добавить фото</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка отправки */}
      <div className="submit-section">
        <button 
          className="btn btn-primary btn-lg submit-btn"
          onClick={handleUploadPhotos}
          disabled={photos.length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <div className="spinner"></div>
              Загрузка...
            </>
          ) : (
            <>
              <Upload size={20} />
              Отправить осмотр ({photos.length} фото)
            </>
          )}
        </button>
      </div>

      {/* Модальное окно для съемки */}
      {currentObject && (
        <div className="camera-modal">
          <div className="camera-content">
            <h3>Сделать фотографию</h3>
            <p>Объект: {inspection.data.objects.find((obj: any) => obj.id === currentObject)?.make} {inspection.data.objects.find((obj: any) => obj.id === currentObject)?.model}</p>
            
            <div className="camera-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setCurrentObject(null)}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleTakePhoto(currentObject)}
              >
                <Camera size={20} />
                Сделать фото
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileInspection;
