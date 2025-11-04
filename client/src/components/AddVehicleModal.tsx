import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { addVehicleMake, addVehicleModel } from '../config/vehicleCatalog';
import './AddVehicleModal.css';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (makeId: string, makeName: string, modelId: string, modelName: string) => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [makeName, setMakeName] = useState('');
  const [makeCountry, setMakeCountry] = useState('');
  const [modelName, setModelName] = useState('');
  const [step, setStep] = useState<'make' | 'model'>('make'); // Сначала добавляем марку, потом модель
  const [createdMakeId, setCreatedMakeId] = useState<string>(''); // Сохраняем ID созданной марки

  const handleClose = useCallback(() => {
    setMakeName('');
    setMakeCountry('');
    setModelName('');
    setStep('make');
    setCreatedMakeId('');
    onClose();
  }, [onClose]);

  const handleAddMake = useCallback(() => {
    if (!makeName.trim()) {
      return;
    }

    const newMake = addVehicleMake({
      name: makeName.trim(),
      country: makeCountry.trim() || undefined,
      models: []
    });

    // Сохраняем ID созданной марки
    setCreatedMakeId(newMake.id);

    // Переходим к добавлению модели
    setStep('model');
  }, [makeName, makeCountry]);

  const handleAddModel = useCallback(() => {
    if (!modelName.trim() || !createdMakeId) {
      return;
    }

    const newModel = addVehicleModel(createdMakeId, {
      name: modelName.trim(),
      bodyTypes: undefined
    });

    if (newModel) {
      // Вызываем callback с данными
      onAdd(createdMakeId, makeName.trim(), newModel.id, newModel.name);
      handleClose();
    }
  }, [modelName, createdMakeId, makeName, onAdd, handleClose]);

  if (!isOpen) return null;

  const portalRoot = document.body;
  if (!portalRoot) return null;

  return createPortal(
    <div className="add-vehicle-modal-overlay" onClick={handleClose}>
      <div className="add-vehicle-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-vehicle-modal-header">
          <h3>Добавить марку и модель</h3>
          <button className="btn-close" onClick={handleClose}>×</button>
        </div>

        <div className="add-vehicle-modal-body">
          {step === 'make' ? (
            <>
              <div className="form-group">
                <label className="form-label">
                  Название марки <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={makeName}
                  onChange={(e) => setMakeName(e.target.value)}
                  className="form-input"
                  placeholder="Введите название марки"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Страна (необязательно)</label>
                <input
                  type="text"
                  value={makeCountry}
                  onChange={(e) => setMakeCountry(e.target.value)}
                  className="form-input"
                  placeholder="Введите страну"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddMake}
                  disabled={!makeName.trim()}
                >
                  Далее
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Марка</label>
                <input
                  type="text"
                  value={makeName}
                  className="form-input"
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Название модели <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="form-input"
                  placeholder="Введите название модели"
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep('make')}
                >
                  Назад
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddModel}
                  disabled={!modelName.trim()}
                >
                  Добавить
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default AddVehicleModal;

