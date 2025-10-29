import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { inspectionsApi } from '../services/api';
import { useInspections } from '../contexts/InspectionsContext';
import { PROPERTY_TYPES, getPropertyTypeAttributes, PropertyAttribute } from '../config/propertyTypes';
import VehicleSelector from '../components/VehicleSelector';
import './CreateInspection.css';

interface CreateInspectionProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InspectionFormData {
  property_type: string;
  address: string;
  coordinates: { lat: number; lng: number };
  inspector_name: string;
  inspector_phone: string;
  inspector_email: string;
  internal_number?: string;
  comments?: string;
  objects: Array<{
    vin?: string;
    license_plate?: string;
    make_id?: string;
    model_id?: string;
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    name?: string;
    // Динамические атрибуты
    [key: string]: any;
  }>;
}

const CreateInspection: React.FC<CreateInspectionProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { updateInspectionsCount, addNewInspection } = useInspections();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [propertyAttributes, setPropertyAttributes] = useState<PropertyAttribute[]>([]);
  
  console.log('CreateInspection rendered, isOpen:', isOpen);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<InspectionFormData>({
    defaultValues: {
      property_type: 'Автотранспорт',
      objects: [{ make: '', model: '' }],
    },
  });

  // Обработчик изменения типа имущества
  const handlePropertyTypeChange = (typeId: string) => {
    setSelectedPropertyType(typeId);
    const attributes = getPropertyTypeAttributes(typeId);
    setPropertyAttributes(attributes);
    
    // Очищаем объекты при смене типа имущества
    setValue('objects', []);
  };

  // Сбрасываем форму при открытии/закрытии модалки и блокируем скролл
  useEffect(() => {
    if (isOpen) {
      // Блокируем скролл body при открытии модального окна
      document.body.style.overflow = 'hidden';
    } else {
      // Разблокируем скролл при закрытии
      document.body.style.overflow = '';
      reset();
      setIsSubmitting(false);
    }
    
    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, reset]);

  // Проверка валидности формы
  const validateForm = (data: InspectionFormData) => {
    const errors: string[] = [];

    if (!data.address) {
      errors.push('Адрес обязателен для заполнения');
    }

    if (!data.inspector_name) {
      errors.push('ФИО исполнителя обязательно');
    }

    if (!data.inspector_phone) {
      errors.push('Телефон исполнителя обязателен');
    }

    if (!data.inspector_email) {
      errors.push('Email исполнителя обязателен');
    }

    // Проверяем, что есть хотя бы один валидный объект в зависимости от типа имущества
    let validObjects: any[] = [];
    
    if (data.property_type === 'vehicle') {
      // Для транспортных средств проверяем марку, модель и VIN/госномер
      validObjects = data.objects.filter(obj => 
        (obj.make_id || obj.make) && (obj.model_id || obj.model) && (obj.vin || obj.license_plate)
      );
      if (validObjects.length === 0) {
        errors.push('Добавьте хотя бы один объект с маркой, моделью и VIN/госномером');
      }
    } else {
      // Для других типов имущества проверяем наименование и обязательные атрибуты
      validObjects = data.objects.filter(obj => {
        if (!obj.name) return false;
        
        // Проверяем обязательные атрибуты для выбранного типа имущества
        const requiredAttributes = propertyAttributes.filter(attr => attr.required);
        return requiredAttributes.every(attr => obj[attr.key]);
      });
      
      if (validObjects.length === 0) {
        errors.push('Добавьте хотя бы один объект с заполненными обязательными характеристиками');
      }
    }

    return errors;
  };

  const onSubmit = async (data: InspectionFormData) => {
    if (isSubmitting) return;
    
    console.log('Начинаем создание осмотра:', data);
    setIsSubmitting(true);

    // Проверяем валидность формы
    const formErrors = validateForm(data);
    if (formErrors.length > 0) {
      formErrors.forEach(error => toast.error(error));
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Отправляем запрос на создание осмотра...');
      
      // Фильтруем пустые объекты
      const filteredObjects = data.objects.filter(obj => 
        obj.make && obj.model && (obj.vin || obj.license_plate)
      );

      const submissionData = {
        ...data,
        objects: filteredObjects,
        status: 'В работе'
      };

      const response = await inspectionsApi.createInspection(submissionData) as any;
      console.log('Ответ от сервера:', response);

      if (response.data) {
        toast.success(response.data.message || 'Осмотр успешно создан!');
        
        // Добавляем новый осмотр в контекст
        addNewInspection(response.data.inspection);
        
        // Обновляем счетчик осмотров
        updateInspectionsCount();
        
        // Закрываем модальное окно
        onClose();
        
        // Перенаправляем на детальную страницу осмотра (опционально)
        if (response.data.inspection?.id) {
          setTimeout(() => {
            navigate(`/inspections/${response.data.inspection.id}`);
          }, 1000);
        } else {
          // Если нет ID, переходим на список осмотров
          setTimeout(() => {
            navigate('/inspections');
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Ошибка при создании осмотра:', error);
      toast.error(error.response?.data?.message || 'Не удалось создать осмотр');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Добавление нового объекта
  const addObject = () => {
    const currentObjects = watch('objects') || [];
    if (currentObjects.length < 150) {
      setValue('objects', [...currentObjects, { make: '', model: '' }]);
    } else {
      toast.error('Достигнуто максимальное количество объектов (150)');
    }
  };

  // Удаление объекта
  const removeObject = (index: number) => {
    const currentObjects = watch('objects') || [];
    if (currentObjects.length > 1) {
      const newObjects = currentObjects.filter((_, i) => i !== index);
      setValue('objects', newObjects);
    }
  };

  // Если модалка закрыта, не рендерим ничего
  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }
  
  console.log('Modal is open, rendering with Portal');

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const portalRoot = document.body;
  if (!portalRoot) {
    console.error('Portal root not found!');
    return null;
  }

  return createPortal(
    <div 
      className="create-inspection-page"
      onClick={handleBackdropClick}
    >
      <div className="create-inspection-content" onClick={(e) => e.stopPropagation()}>
        <div className="page-header">
          <h1 className="page-title">Создание осмотра</h1>
          <div className="header-actions">
            <button
              onClick={onClose}
              className="btn-close"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        <div className="step-content">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Поле типа имущества */}
            <div className="form-group">
              <label className="form-label">
                Тип имущества <span className="required">*</span>
              </label>
              <select
                {...register('property_type', { 
                  required: 'Выберите тип имущества',
                  onChange: (e) => handlePropertyTypeChange(e.target.value)
                })}
                className={`form-select ${errors.property_type ? 'input-error' : ''}`}
              >
                <option value="">Выберите тип имущества</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.property_type && (
                <p className="form-error-inline">{errors.property_type.message}</p>
              )}
            </div>

            {/* Поле адреса */}
            <div className="form-group">
              <label className="form-label">
                Адрес <span className="required">*</span>
              </label>
              <input
                type="text"
                {...register('address', { required: 'Введите адрес' })}
                className={`form-input ${errors.address ? 'input-error' : ''}`}
                placeholder="Введите адрес и выберите из списка"
              />
              {errors.address && (
                <p className="form-error-inline">{errors.address.message}</p>
              )}
            </div>

            {/* Блок исполнителя */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  ФИО исполнителя <span className="required">*</span>
                </label>
                <input
                  type="text"
                  {...register('inspector_name', { required: 'Введите ФИО исполнителя' })}
                  className={`form-input ${errors.inspector_name ? 'input-error' : ''}`}
                  placeholder="Иванов Иван Иванович"
                />
                {errors.inspector_name && (
                  <p className="form-error-inline">{errors.inspector_name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">
                  Телефон <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  {...register('inspector_phone', { required: 'Введите телефон' })}
                  className={`form-input ${errors.inspector_phone ? 'input-error' : ''}`}
                  placeholder="+7 (999) 123-45-67"
                />
                {errors.inspector_phone && (
                  <p className="form-error-inline">{errors.inspector_phone.message}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  {...register('inspector_email', { 
                    required: 'Введите email',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Введите корректный email'
                    }
                  })}
                  className={`form-input ${errors.inspector_email ? 'input-error' : ''}`}
                  placeholder="ivanov@example.com"
                />
                {errors.inspector_email && (
                  <p className="form-error-inline">{errors.inspector_email.message}</p>
                )}
              </div>
            </div>

            {/* Блок объектов */}
            <div className="objects-section">
              <div className="objects-header">
                <h3>Объекты осмотра <span className="required">*</span></h3>
                <div className="objects-actions">
                  <button
                    type="button"
                    onClick={addObject}
                    className="btn btn-success btn-sm"
                  >
                    + Добавить объект
                  </button>
                </div>
              </div>

              <div className="objects-list">
                {(watch('objects') || []).map((_, index) => (
                  <div key={index} className="object-card">
                    <div className="object-header">
                      <h4>Объект {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeObject(index)}
                        className="btn btn-danger btn-sm"
                        disabled={(watch('objects') || []).length <= 1}
                      >
                        × Удалить
                      </button>
                    </div>
                    
                    <div className="object-characteristics">
                      {/* Поля для транспортных средств */}
                      {selectedPropertyType === 'vehicle' && (
                        <>
                          {/* VIN и госномер */}
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">VIN</label>
                              <input
                                type="text"
                                {...register(`objects.${index}.vin`)}
                                className="form-input"
                                placeholder="1HGBH41JXMN109186"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Госномер</label>
                              <input
                                type="text"
                                {...register(`objects.${index}.license_plate`)}
                                className="form-input"
                                placeholder="А123БВ777"
                              />
                            </div>
                          </div>

                          {/* Выбор марки и модели */}
                          <VehicleSelector
                            selectedMake={watch(`objects.${index}.make_id`) || ''}
                            selectedModel={watch(`objects.${index}.model_id`) || ''}
                            onMakeChange={(makeId) => {
                              setValue(`objects.${index}.make_id`, makeId);
                              setValue(`objects.${index}.model_id`, '');
                            }}
                            onModelChange={(modelId) => {
                              setValue(`objects.${index}.model_id`, modelId);
                            }}
                            errors={{
                              make: errors.objects?.[index]?.make_id?.message as string,
                              model: errors.objects?.[index]?.model_id?.message as string
                            }}
                          />

                          {/* Дополнительные поля для ТС */}
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Год</label>
                              <input
                                type="number"
                                {...register(`objects.${index}.year`)}
                                className="form-input"
                                placeholder="2020"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Цвет</label>
                              <input
                                type="text"
                                {...register(`objects.${index}.color`)}
                                className="form-input"
                                placeholder="Белый"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Поля для других типов имущества */}
                      {selectedPropertyType && selectedPropertyType !== 'vehicle' && (
                        <div className="form-group">
                          <label className="form-label">
                            Наименование объекта <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            {...register(`objects.${index}.name`, { required: 'Введите наименование объекта' })}
                            className={`form-input ${errors.objects?.[index]?.name ? 'input-error' : ''}`}
                            placeholder="Введите наименование объекта"
                          />
                          {errors.objects?.[index]?.name && (
                            <p className="form-error-inline">{errors.objects[index]?.name?.message as string}</p>
                          )}
                        </div>
                      )}

                      {/* Динамические атрибуты в зависимости от типа имущества */}
                      {selectedPropertyType && propertyAttributes.length > 0 && (
                        <div className="dynamic-attributes">
                          <h5 className="attributes-title">Характеристики объекта</h5>
                          <div className="attributes-grid">
                            {propertyAttributes.map((attr) => (
                              <div key={attr.key} className="form-group">
                                <label className="form-label">
                                  {attr.label}
                                  {attr.required && <span className="required">*</span>}
                                </label>
                                
                                {attr.type === 'text' && (
                                  <input
                                    type="text"
                                    {...register(`objects.${index}.${attr.key}`, {
                                      required: attr.required ? `${attr.label} обязательно` : false,
                                      pattern: attr.validation?.pattern ? {
                                        value: new RegExp(attr.validation.pattern),
                                        message: attr.validation.message || 'Неверный формат'
                                      } : undefined
                                    })}
                                    className={`form-input ${errors.objects?.[index]?.[attr.key] ? 'input-error' : ''}`}
                                    placeholder={attr.placeholder}
                                  />
                                )}
                                
                                {attr.type === 'number' && (
                                  <input
                                    type="number"
                                    {...register(`objects.${index}.${attr.key}`, {
                                      required: attr.required ? `${attr.label} обязательно` : false,
                                      min: attr.validation?.min ? {
                                        value: attr.validation.min,
                                        message: attr.validation.message || `Минимальное значение: ${attr.validation.min}`
                                      } : undefined,
                                      max: attr.validation?.max ? {
                                        value: attr.validation.max,
                                        message: attr.validation.message || `Максимальное значение: ${attr.validation.max}`
                                      } : undefined
                                    })}
                                    className={`form-input ${errors.objects?.[index]?.[attr.key] ? 'input-error' : ''}`}
                                    placeholder={attr.placeholder}
                                  />
                                )}
                                
                                {attr.type === 'date' && (
                                  <input
                                    type="date"
                                    {...register(`objects.${index}.${attr.key}`, {
                                      required: attr.required ? `${attr.label} обязательно` : false
                                    })}
                                    className={`form-input ${errors.objects?.[index]?.[attr.key] ? 'input-error' : ''}`}
                                  />
                                )}
                                
                                {attr.type === 'select' && (
                                  <select
                                    {...register(`objects.${index}.${attr.key}`, {
                                      required: attr.required ? `${attr.label} обязательно` : false
                                    })}
                                    className={`form-select ${errors.objects?.[index]?.[attr.key] ? 'input-error' : ''}`}
                                  >
                                    <option value="">Выберите {attr.label.toLowerCase()}</option>
                                    {attr.options?.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                
                                {errors.objects?.[index]?.[attr.key] && (
                                  <p className="form-error-inline">
                                    {errors.objects[index]?.[attr.key]?.message as string}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Комментарии */}
            <div className="form-group full-width">
              <label className="form-label">Комментарии</label>
              <textarea
                {...register('comments')}
                rows={3}
                className="form-input"
                placeholder="Дополнительная информация для исполнителя..."
              />
            </div>

            {/* Кнопки */}
            <div className="step-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-primary ${isSubmitting ? 'btn-disabled' : ''}`}
              >
                {isSubmitting ? 'Создание...' : 'Создать осмотр'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateInspection;