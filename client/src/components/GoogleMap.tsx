import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  onLocationChange?: (lat: number, lon: number, address: string) => void;
  height?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  height = '300px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        setIsLoading(false);
        initMap();
        return;
      }

      // Проверяем, не загружается ли уже скрипт
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkGoogle = () => {
          if (window.google && window.google.maps) {
            setIsLoaded(true);
            setIsLoading(false);
            initMap();
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places&language=ru&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps API loaded');
        // Небольшая задержка для полной инициализации API
        setTimeout(() => {
          if (window.google && window.google.maps) {
            setIsLoaded(true);
            setIsLoading(false);
            initMap();
          }
        }, 100);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.error('Map container or Google Maps not available');
      return;
    }

    // Проверяем, что контейнер карты видим
    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      console.log('Map container not ready, retrying...');
      setTimeout(initMap, 200);
      return;
    }

    try {
      // Координаты по умолчанию (Москва)
      const defaultLat = latitude || 55.7558;
      const defaultLon = longitude || 37.6176;

      console.log('Initializing Google Map with coordinates:', defaultLat, defaultLon);

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: defaultLat, lng: defaultLon },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });

      // Добавляем маркер
      markerInstance.current = new window.google.maps.Marker({
        position: { lat: defaultLat, lng: defaultLon },
        map: mapInstance.current,
        draggable: true,
        title: address || 'Выбранное место'
      });

      // Обработчик перетаскивания маркера
      markerInstance.current.addListener('dragend', () => {
        const position = markerInstance.current.getPosition();
        const lat = position.lat();
        const lng = position.lng();

        // Получаем адрес по координатам
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            if (onLocationChange) {
              onLocationChange(lat, lng, address);
            }
          }
        });
      });

      // Обработчик клика по карте
      mapInstance.current.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Перемещаем маркер
        markerInstance.current.setPosition({ lat, lng });

        // Получаем адрес по координатам
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            if (onLocationChange) {
              onLocationChange(lat, lng, address);
            }
          }
        });
      });

      console.log('Google Map initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Map:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && mapInstance.current && markerInstance.current && latitude && longitude) {
      const newPosition = { lat: latitude, lng: longitude };
      mapInstance.current.setCenter(newPosition);
      markerInstance.current.setPosition(newPosition);
    }
  }, [latitude, longitude, address, isLoaded]);

  if (isLoading) {
    return (
      <div 
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #d9d9d9'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color="#666" />
          <span>Загрузка карты...</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #d9d9d9',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <MapPin size={24} color="#999" />
        <span style={{ color: '#666', fontSize: '14px' }}>Карта недоступна</span>
        <button 
          onClick={() => {
            setIsLoading(true);
            window.location.reload();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #d9d9d9',
        overflow: 'hidden'
      }} 
    />
  );
};

export default GoogleMap;
