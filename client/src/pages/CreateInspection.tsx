import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Building, 
  Home, 
  Truck, 
  Plus, 
  Trash2, 
  Upload,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle
} from 'lucide-react';
import { inspectionsApi } from '../services/api';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { vehicleCategories, vehicleTypes, vehicleMakes, getModelsByMake } from '../data/vehicleData';
import { getCharacteristicsForPropertyType } from '../data/objectCharacteristics';
import toast from 'react-hot-toast';
import './CreateInspection.css';

const schema = yup.object({
  propertyType: yup.string().required('Выберите тип имущества'),
  address: yup.string().required('Адрес обязателен'),
  latitude: yup.number().optional(),
  longitude: yup.number().optional(),
  inspectorName: yup.string().required('ФИО исполнителя обязательно'),
  inspectorPhone: yup.string().matches(/^\+7\d{10}$/, 'Неверный формат телефона').required('Телефон обязателен'),
  inspectorEmail: yup.string().email('Неверный формат email').optional(),
  internalNumber: yup.string().optional(),
  comment: yup.string().optional(),
  objects: yup.array().of(
    yup.object().shape({})
  ).min(1, 'Добавьте хотя бы один объект'),
});

interface InspectionFormData {
  propertyType: string;
  address: string;
  latitude?: number;
  longitude?: number;
  inspectorName: string;
  inspectorPhone: string;
  inspectorEmail?: string;
  internalNumber?: string;
  comment?: string;
  objects: Array<{
    vin?: string;
    registrationNumber?: string;
    category: string;
    type: string;
    make: string;
    model: string;
  }>;
}

const propertyTypes = [
  { id: 'Автотранспорт', name: 'Автотранспорт', icon: Car, color: '#1976D2' },
  { id: 'Недвижимость', name: 'Недвижимость', icon: Building, color: '#388E3C' },
  { id: 'Оборудование', name: 'Оборудование', icon: Home, color: '#F57C00' },
];

const CreateInspection: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange', // Валидация в реальном времени
    defaultValues: {
      objects: [{ category: '', type: '', make: '', model: '', vin: '', registrationNumber: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'objects'
  });

  const selectedPropertyType = watch('propertyType');
  const formValues = watch();

  // Проверка валидности формы
  useEffect(() => {
    const errors: string[] = [];
    
    if (!formValues.address) {
      errors.push('Адрес не указан');
    }
    if (!formValues.latitude || !formValues.longitude) {
      errors.push('Координаты не установлены. Выберите адрес из списка');
    }
    if (!formValues.inspectorName) {
      errors.push('ФИО исполнителя не указано');
    }
    if (!formValues.inspectorPhone) {
      errors.push('Телефон исполнителя не указан');
    }
    if (!formValues.objects || formValues.objects.length === 0) {
      errors.push('Необходимо добавить хотя бы один объект');
    } else {
      // Получаем характеристики для выбранного типа имущества
      const characteristics = getCharacteristicsForPropertyType(formValues.propertyType || '');
      
      formValues.objects.forEach((obj: any, index: number) => {
        // Проверяем только обязательные характеристики
        characteristics.forEach((char) => {
          if (char.required && !obj[char.id]) {
            errors.push(`Объект ${index + 1}: не указан ${char.name.toLowerCase()}`);
          }
        });
      });
    }
    
    setValidationErrors(errors);
  }, [formValues]);

  const onSubmit = async (data: any) => {
    console.log('Начинаем создание осмотра:', data);
    setIsLoading(true);
    setValidationErrors([]); // Очищаем ошибки валидации
    
    try {
      console.log('Отправляем запрос на создание осмотра...');
      const response = await inspectionsApi.createInspection(data);
      console.log('Ответ от сервера:', response);
      
      const inspectionNumber = response.data?.inspection?.internal_number || '';
      
      toast.success(`Осмотр №${inspectionNumber} успешно создан и отправлен исполнителю`, {
        duration: 3000
      });
      
      // Сбрасываем состояние загрузки
      setIsLoading(false);
      
      // Небольшая задержка для показа уведомления
      setTimeout(() => {
        // Переходим на список осмотров
        // Используем state для передачи информации о необходимости обновления
        navigate('/inspections', { 
          replace: true,
          state: { refresh: true, newInspection: inspectionNumber }
        });
      }, 1000);
    } catch (error: any) {
      console.error('Ошибка создания осмотра:', error);
      
      // Более детальная обработка ошибок
      let errorMessage = 'Ошибка создания осмотра';
      if (error.response) {
        errorMessage = error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Сервер недоступен. Проверьте подключение к интернету';
      } else {
        errorMessage = error.message || 'Неизвестная ошибка';
      }
      
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleImportFromExcel = async () => {
    try {
      // Читаем данные из буфера обмена
      const text = await navigator.clipboard.readText();
      
      if (!text) {
        toast.error('Буфер обмена пуст');
        return;
      }

      // Парсим данные из Excel (разделенные табуляцией)
      const rows = text.trim().split('\n');
      const importedObjects = rows.map(row => {
        const cols = row.split('\t');
        return {
          vin: cols[0]?.trim() || '',
          registrationNumber: cols[1]?.trim() || '',
          category: cols[2]?.trim() || '',
          type: cols[3]?.trim() || '',
          make: cols[4]?.trim() || '',
          model: cols[5]?.trim() || ''
        };
      }).filter(obj => obj.make || obj.model); // Фильтруем пустые строки

      if (importedObjects.length === 0) {
        toast.error('Не удалось распознать данные. Скопируйте ячейки из Excel');
        return;
      }

      if (importedObjects.length > 150) {
        toast.error('Максимальное количество объектов - 150');
        return;
      }

      // Заменяем текущие объекты импортированными
      setValue('objects', importedObjects);
      toast.success(`Импортировано объектов: ${importedObjects.length}`);
    } catch (error) {
      toast.error('Ошибка импорта. Убедитесь, что данные скопированы в буфер обмена');
    }
  };


  return (
    <div className="create-inspection-page">
      <div className="create-inspection-content">
        <div className="page-header">
          <h1 className="page-title">Создание осмотра</h1>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/inspections')}
            >
              Отмена
            </button>
            <button 
              className="btn btn-close"
              onClick={() => navigate('/inspections')}
              title="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

      <form onSubmit={handleSubmit(onSubmit)} className="inspection-form">
        {/* Шаг 1: Выбор типа имущества */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Выберите тип имущества</h2>
              <p>Выберите категорию имущества для осмотра</p>
            </div>

            <div className="property-types">
              {propertyTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    className={`property-type-card ${selectedPropertyType === type.id ? 'selected' : ''}`}
                    onClick={() => {
                      setValue('propertyType', type.id);
                      // Автоматически переходим к следующему шагу
                      setTimeout(() => setStep(2), 300);
                    }}
                  >
                    <div className="property-type-icon" style={{ backgroundColor: type.color }}>
                      <IconComponent size={32} />
                    </div>
                    <span className="property-type-name">{type.name}</span>
                  </button>
                );
              })}
            </div>

            {errors.propertyType && (
              <div className="form-error">{errors.propertyType.message}</div>
            )}
          </div>
        )}

        {/* Шаг 2: Основная информация */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Информация об осмотре</h2>
              <p>Заполните основную информацию об осмотре</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">
                  <MapPin size={16} />
                  Адрес
                </label>
                <AddressAutocomplete
                  value={watch('address') || ''}
                  onChange={(address, lat, lon) => {
                    setValue('address', address);
                    if (lat && lon) {
                      setValue('latitude', lat);
                      setValue('longitude', lon);
                      toast.success('Координаты установлены');
                    }
                  }}
                  placeholder="Начните вводить адрес и выберите из списка"
                  error={errors.address?.message}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FileText size={16} />
                  Внутренний номер
                </label>
                <input
                  type="text"
                  className="form-input"
                  {...register('internalNumber')}
                  placeholder="Введите внутренний номер"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">
                  <User size={16} />
                  ФИО исполнителя
                </label>
                <input
                  type="text"
                  className="form-input"
                  {...register('inspectorName')}
                  placeholder="Введите ФИО полностью"
                />
                {errors.inspectorName && (
                  <div className="form-error">{errors.inspectorName.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">
                  <Phone size={16} />
                  Телефон исполнителя
                </label>
                <input
                  type="tel"
                  className="form-input"
                  {...register('inspectorPhone')}
                  placeholder="+7 (999) 123-45-67"
                />
                {errors.inspectorPhone && (
                  <div className="form-error">{errors.inspectorPhone.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email исполнителя
                </label>
                <input
                  type="email"
                  className="form-input"
                  {...register('inspectorEmail')}
                  placeholder="email@example.com"
                />
                {errors.inspectorEmail && (
                  <div className="form-error">{errors.inspectorEmail.message}</div>
                )}
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Комментарии
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  {...register('comment')}
                  placeholder="Дополнительная информация об осмотре"
                />
              </div>
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Назад
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(3)}
              >
                Продолжить
              </button>
            </div>
          </div>
        )}

        {/* Шаг 3: Объекты осмотра */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Объекты осмотра</h2>
              <p>Добавьте объекты для осмотра</p>
            </div>

            <div className="objects-section">
              <div className="objects-header">
                <h3>Список объектов</h3>
                <div className="objects-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleImportFromExcel}
                  >
                    <Upload size={16} />
                    Импорт из Excel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (fields.length >= 150) {
                        toast.error('Максимальное количество объектов - 150');
                        return;
                      }
                      append({ category: '', type: '', make: '', model: '', vin: '', registrationNumber: '' });
                    }}
                    disabled={fields.length >= 150}
                  >
                    <Plus size={16} />
                    Добавить объект ({fields.length}/150)
                  </button>
                </div>
              </div>

              <div className="objects-list">
                {fields.map((field, index) => {
                  const characteristics = getCharacteristicsForPropertyType(selectedPropertyType || '');
                  
                  return (
                    <div key={field.id} className="object-card">
                      <div className="object-header">
                        <h4>Объект #{index + 1}</h4>
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="object-characteristics">
                        {characteristics.map((char) => (
                          <div key={char.id} className="form-group">
                            <label className="form-label">
                              {char.name}
                              {char.required && <span className="required">*</span>}
                            </label>
                            
                            {char.type === 'select' ? (
                              <select
                                className={`form-select ${(errors.objects as any)?.[index]?.[char.id] ? 'input-error' : ''}`}
                                {...register(`objects.${index}.${char.id}` as any)}
                              >
                                <option value="">Выберите {char.name.toLowerCase()}</option>
                                {char.options?.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={char.type}
                                className={`form-input ${(errors.objects as any)?.[index]?.[char.id] ? 'input-error' : ''}`}
                                {...register(`objects.${index}.${char.id}` as any)}
                                placeholder={char.placeholder}
                              />
                            )}
                            
                            {(errors.objects as any)?.[index]?.[char.id] && (
                              <div className="form-error-inline">{(errors.objects as any)[index]?.[char.id]?.message}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.objects && (
                <div className="form-error">{errors.objects.message}</div>
              )}
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Назад
              </button>
              <div className="submit-button-wrapper">
                <button
                  type="submit"
                  className={`btn btn-primary ${validationErrors.length > 0 ? 'btn-disabled' : ''}`}
                  disabled={isLoading || validationErrors.length > 0}
                  title={validationErrors.length > 0 ? validationErrors.join('\n') : 'Отправить осмотр'}
                >
                  {isLoading ? 'Создание...' : 'Отправить'}
                </button>
                {validationErrors.length > 0 && (
                  <div className="validation-tooltip">
                    <AlertCircle size={16} />
                    <div className="tooltip-content">
                      <strong>Исправьте ошибки:</strong>
                      <ul>
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
      </div>
    </div>
  );
};

export default CreateInspection;
