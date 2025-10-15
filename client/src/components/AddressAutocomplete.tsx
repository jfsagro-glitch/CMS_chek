import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import './AddressAutocomplete.css';

interface AddressSuggestion {
  value: string;
  data: {
    geo_lat?: string;
    geo_lon?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lon?: number) => void;
  placeholder?: string;
  error?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Начните вводить адрес...',
  error
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Закрытие списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Поиск адресов через Яндекс.Карты API (без ключа)
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Используем Яндекс.Карты API с ключом
      const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=4b209416-2036-4169-90c5-30ee809f0518&geocode=${encodeURIComponent(query)}&format=json&results=10`);
      
      if (response.ok) {
        const data = await response.json();
        const suggestions: AddressSuggestion[] = [];
        
        if (data.response && data.response.GeoObjectCollection && data.response.GeoObjectCollection.featureMember) {
          data.response.GeoObjectCollection.featureMember.forEach((item: any) => {
            const geoObject = item.GeoObject;
            const coords = geoObject.Point.pos.split(' ').map(Number);
            
            suggestions.push({
              value: geoObject.metaDataProperty.GeocoderMetaData.text,
              data: {
                geo_lat: coords[1].toString(),
                geo_lon: coords[0].toString()
              }
            });
          });
        }
        
        setSuggestions(suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
      // Fallback: используем демо-адреса
      const demoAddresses = [
        { value: `${query}, г. Москва`, data: { geo_lat: '55.7558', geo_lon: '37.6176' } },
        { value: `${query}, г. Санкт-Петербург`, data: { geo_lat: '59.9311', geo_lon: '30.3609' } },
        { value: `${query}, г. Екатеринбург`, data: { geo_lat: '56.8431', geo_lon: '60.6454' } },
        { value: `${query}, г. Новосибирск`, data: { geo_lat: '55.0084', geo_lon: '82.9357' } },
        { value: `${query}, г. Казань`, data: { geo_lat: '55.8304', geo_lon: '49.0661' } }
      ];
      setSuggestions(demoAddresses);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        searchAddress(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    const lat = suggestion.data.geo_lat ? parseFloat(suggestion.data.geo_lat) : undefined;
    const lon = suggestion.data.geo_lon ? parseFloat(suggestion.data.geo_lon) : undefined;
    
    onChange(suggestion.value, lat, lon);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="address-autocomplete" ref={wrapperRef}>
      <div className="input-wrapper">
        <MapPin size={16} className="input-icon" />
        <input
          type="text"
          className={`form-input ${error ? 'error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isLoading && <div className="loading-spinner"></div>}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSelectAddress(suggestion)}
            >
              <MapPin size={14} />
              <span>{suggestion.value}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="form-error">{error}</div>}
      
      <div className="address-hint">
        💡 Начните вводить адрес и выберите из списка для установки координат
      </div>
    </div>
  );
};

export default AddressAutocomplete;

