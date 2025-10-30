import React, { useState, useEffect } from 'react';
import { 
  VEHICLE_MAKES, 
  getVehicleModelsByMakeId, 
  addVehicleMake, 
  addVehicleModel,
  searchVehicleMakes,
  searchVehicleModels,
  BODY_TYPES,
  VehicleMake,
  VehicleModel
} from '../config/vehicleCatalog';

interface VehicleSelectorProps {
  selectedMake: string;
  selectedModel: string;
  onMakeChange: (makeId: string) => void;
  onModelChange: (modelId: string) => void;
  onCustomMakeAdd?: (make: string) => void;
  onCustomModelAdd?: (makeId: string, model: string) => void;
  errors?: {
    make?: string;
    model?: string;
  };
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedMake,
  selectedModel,
  onMakeChange,
  onModelChange,
  onCustomMakeAdd,
  onCustomModelAdd,
  errors
}) => {
  const [showAddMake, setShowAddMake] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newMakeName, setNewMakeName] = useState('');
  const [newMakeCountry, setNewMakeCountry] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelBodyTypes, setNewModelBodyTypes] = useState<string[]>([]);
  const [filteredMakes, setFilteredMakes] = useState<VehicleMake[]>(VEHICLE_MAKES);
  const [filteredModels, setFilteredModels] = useState<VehicleModel[]>([]);

  // Фильтрация марок
  useEffect(() => {
    setFilteredMakes(VEHICLE_MAKES);
  }, []);

  // Фильтрация моделей
  useEffect(() => {
    if (selectedMake) {
      setFilteredModels(getVehicleModelsByMakeId(selectedMake));
    } else {
      setFilteredModels([]);
    }
  }, [selectedMake]);

  // Сброс формы добавления при смене марки
  useEffect(() => {
    setShowAddModel(false);
  }, [selectedMake]);

  const handleMakeSelect = (makeId: string) => {
    onMakeChange(makeId);
    setShowAddMake(false);
    setNewMakeName('');
    setNewMakeCountry('');
  };

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setShowAddModel(false);
    setNewModelName('');
    setNewModelBodyTypes([]);
  };

  const handleAddMake = () => {
    if (newMakeName.trim()) {
      const newMake = addVehicleMake({
        name: newMakeName.trim(),
        country: newMakeCountry.trim() || undefined,
        models: []
      });
      onMakeChange(newMake.id);
      setShowAddMake(false);
      setNewMakeName('');
      setNewMakeCountry('');
    }
  };

  const handleAddModel = () => {
    if (newModelName.trim() && selectedMake) {
      const newModel = addVehicleModel(selectedMake, {
        name: newModelName.trim(),
        bodyTypes: newModelBodyTypes.length > 0 ? newModelBodyTypes : undefined
      });
      if (newModel) {
        onModelChange(newModel.id);
        setShowAddModel(false);
        setNewModelName('');
        setNewModelBodyTypes([]);
      }
    }
  };

  const toggleBodyType = (bodyType: string) => {
    setNewModelBodyTypes(prev => 
      prev.includes(bodyType) 
        ? prev.filter(type => type !== bodyType)
        : [...prev, bodyType]
    );
  };

  return (
    <div className="vehicle-selector">
      {/* Выбор марки */}
      <div className="form-group">
        <label className="form-label">
          Марка <span className="required">*</span>
        </label>
        <select
          className={`form-select ${errors?.make ? 'input-error' : ''}`}
          value={selectedMake}
          onChange={(e) => handleMakeSelect(e.target.value)}
        >
          <option value="">Выберите марку</option>
          {filteredMakes.map((make) => (
            <option key={make.id} value={make.id}>
              {make.name}
            </option>
          ))}
        </select>
        {errors?.make && (
          <p className="form-error-inline">{errors.make}</p>
        )}

        {/* Форма добавления новой марки */}
        {showAddMake && (
          <div className="add-form">
            <div className="form-group">
              <label className="form-label">Название марки</label>
              <input
                type="text"
                value={newMakeName}
                onChange={(e) => setNewMakeName(e.target.value)}
                className="form-input"
                placeholder="Введите название марки"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Страна (необязательно)</label>
              <input
                type="text"
                value={newMakeCountry}
                onChange={(e) => setNewMakeCountry(e.target.value)}
                className="form-input"
                placeholder="Введите страну"
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddMake}
                disabled={!newMakeName.trim()}
              >
                Добавить марку
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowAddMake(false);
                  setNewMakeName('');
                  setNewMakeCountry('');
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Выбор модели */}
      {selectedMake && (
        <div className="form-group">
          <label className="form-label">
            Модель <span className="required">*</span>
          </label>
          <select
            className={`form-select ${errors?.model ? 'input-error' : ''}`}
            value={selectedModel}
            onChange={(e) => handleModelSelect(e.target.value)}
            disabled={!selectedMake}
          >
            <option value="">Выберите модель</option>
            {filteredModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          {errors?.model && (
            <p className="form-error-inline">{errors.model}</p>
          )}

          {/* Форма добавления новой модели */}
          {showAddModel && (
            <div className="add-form">
              <div className="form-group">
                <label className="form-label">Название модели</label>
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="form-input"
                  placeholder="Введите название модели"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Типы кузова (необязательно)</label>
                <div className="checkbox-group">
                  {BODY_TYPES.map((bodyType) => (
                    <label key={bodyType} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={newModelBodyTypes.includes(bodyType)}
                        onChange={() => toggleBodyType(bodyType)}
                      />
                      <span className="checkbox-label">{bodyType}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddModel}
                  disabled={!newModelName.trim()}
                >
                  Добавить модель
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowAddModel(false);
                    setNewModelName('');
                    setNewModelBodyTypes([]);
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;
