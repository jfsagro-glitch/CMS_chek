import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import GoogleMap from './GoogleMap';

interface YandexMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  onLocationChange?: (lat: number, lon: number, address: string) => void;
  height?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap: React.FC<YandexMapProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  height = '300px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);

  useEffect(() => {
    const loadYandexMaps = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => {
          setIsLoaded(true);
          setIsLoading(false);
          initMap();
        });
        return;
      }

      // Проверяем, не загружается ли уже скрипт
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
      if (existingScript) {
        // Если скрипт уже есть, ждем его загрузки
        const checkYmaps = () => {
          if (window.ymaps) {
            window.ymaps.ready(() => {
              setIsLoaded(true);
              setIsLoading(false);
              initMap();
            });
          } else {
            setTimeout(checkYmaps, 100);
          }
        };
        checkYmaps();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=4b209416-2036-4169-90c5-30ee809f0518&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        console.log('Yandex Maps API loaded');
        if (window.ymaps) {
          window.ymaps.ready(() => {
            console.log('Yandex Maps ready');
            setIsLoaded(true);
            setIsLoading(false);
            initMap();
          });
        }
      };
      script.onerror = () => {
        console.error('Failed to load Yandex Maps API, switching to Google Maps');
        setIsLoading(false);
        setUseGoogleMaps(true);
      };
      document.head.appendChild(script);
    };

    loadYandexMaps();
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.ymaps) {
      console.error('Map container or ymaps not available');
      return;
    }

    try {
      // Координаты по умолчанию (Москва)
      const defaultLat = latitude || 55.7558;
      const defaultLon = longitude || 37.6176;

      console.log('Initializing map with coordinates:', defaultLat, defaultLon);

      mapInstance.current = new window.ymaps.Map(mapRef.current, {
        center: [defaultLat, defaultLon],
        zoom: 15,
        controls: ['zoomControl', 'fullscreenControl']
      });

      // Добавляем маркер
      const placemark = new window.ymaps.Placemark(
        [defaultLat, defaultLon],
        {
          balloonContent: address || 'Выбранное место',
          iconCaption: address || 'Место осмотра'
        },
        {
          preset: 'islands#redDotIcon',
          draggable: true
        }
      );

      mapInstance.current.geoObjects.add(placemark);

      // Обработчик перетаскивания маркера
      placemark.events.add('dragend', () => {
        const coords = placemark.geometry.getCoordinates();
        const lat = coords[0];
        const lon = coords[1];

        // Получаем адрес по координатам
        window.ymaps.geocode([lat, lon]).then((res: any) => {
          const firstGeoObject = res.geoObjects.get(0);
          const address = firstGeoObject.getAddressLine();
          
          if (onLocationChange) {
            onLocationChange(lat, lon, address);
          }
        });
      });

      // Обработчик клика по карте
      mapInstance.current.events.add('click', (e: any) => {
        const coords = e.get('coords');
        const lat = coords[0];
        const lon = coords[1];

        // Перемещаем маркер
        placemark.geometry.setCoordinates([lat, lon]);

        // Получаем адрес по координатам
        window.ymaps.geocode([lat, lon]).then((res: any) => {
          const firstGeoObject = res.geoObjects.get(0);
          const address = firstGeoObject.getAddressLine();
          
          if (onLocationChange) {
            onLocationChange(lat, lon, address);
          }
        });
      });

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && mapInstance.current && latitude && longitude) {
      mapInstance.current.setCenter([latitude, longitude]);
      const geoObjects = mapInstance.current.geoObjects;
      geoObjects.removeAll();
      
      const placemark = new window.ymaps.Placemark(
        [latitude, longitude],
        {
          balloonContent: address || 'Выбранное место',
          iconCaption: address || 'Место осмотра'
        },
        {
          preset: 'islands#redDotIcon',
          draggable: true
        }
      );

      mapInstance.current.geoObjects.add(placemark);
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

  if (!isLoaded && !useGoogleMaps) {
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
            // Перезагружаем страницу для повторной попытки загрузки карты
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

  // Если Яндекс карты не загрузились, используем Google Maps
  if (useGoogleMaps) {
    return (
      <GoogleMap
        latitude={latitude}
        longitude={longitude}
        address={address}
        onLocationChange={onLocationChange}
        height={height}
      />
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

export default YandexMap;
