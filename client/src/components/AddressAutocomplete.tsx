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

  // Поиск адресов через Dadata API (бесплатный для РФ)
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Используем публичный API Dadata (для демо)
      // В продакшене нужен API ключ
      const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Для продакшена добавьте свой API ключ:
          // 'Authorization': 'Token YOUR_DADATA_API_KEY'
        },
        body: JSON.stringify({ query, count: 10 })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
      // Если API недоступен, показываем простой список
      setSuggestions([]);
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

