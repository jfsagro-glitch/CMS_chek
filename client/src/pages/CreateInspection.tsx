import React, { useState } from 'react';
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
  X,
  AlertCircle
} from 'lucide-react';
import { inspectionsApi } from '../services/api';
import AddressAutocomplete from '../components/AddressAutocomplete';
import toast from 'react-hot-toast';
import { 
  vehicleCategories, 
  vehicleMakes, 
  getTypesByCategory, 
  getModelsByMake,
  validateVehicleData 
} from '../data/vehicleData';
import './CreateInspection.css';

const schema = yup.object({
  propertyType: yup.string().required('Выберите тип имущества'),
  address: yup.string().required('Адрес обязателен'),
  latitude: yup.number().optional(),
  longitude: yup.number().optional(),
  inspectorName: yup.string().required('ФИО исполнителя обязательно'),
  inspectorPhone: yup.string().matches(/^\+7\d{10}$/, 'Неверный формат телефона (+79991234567)').required('Телефон обязателен'),
  inspectorEmail: yup.string().email('Неверный формат email').optional(),
  internalNumber: yup.string().optional(),
  comment: yup.string().optional(),
  objects: yup.array().of(
    yup.object({
      vin: yup.string().optional(),
      registrationNumber: yup.string().optional(),
      category: yup.string().required('Категория обязательна'),
      type: yup.string().required('Тип обязателен'),
      make: yup.string().required('Марка обязательна'),
      model: yup.string().required('Модель обязательна'),
    })
  ).min(1, 'Добавьте хотя бы один объект').max(150, 'Максимум 150 объектов'),
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
  { id: 'auto', name: 'Автотранспорт', icon: Car, color: '#1976D2' },
  { id: 'commercial', name: 'Коммерческая недвижимость', icon: Building, color: '#388E3C' },
  { id: 'residential', name: 'Загородная недвижимость', icon: Home, color: '#F57C00' },
  { id: 'other', name: 'Прочее имущество', icon: Truck, color: '#7B1FA2' },
];

const CreateInspection: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [excelData, setExcelData] = useState('');
  const navigate = useNavigate();

  const { register, control, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      objects: [{ category: '', type: '', make: '', model: '', vin: '', registrationNumber: '' }]
    },
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'objects'
  });

  const watchedObjects = watch('objects');
  const watchedPropertyType = watch('propertyType');
  const watchedAddress = watch('address');
  const watchedLatitude = watch('latitude');
  const watchedInspectorName = watch('inspectorName');
  const watchedInspectorPhone = watch('inspectorPhone');

  // Валидация всех объектов
  const validateAllObjects = (): boolean => {
    if (!watchedObjects || watchedObjects.length === 0) return false;
    
    return watchedObjects.every(obj => {
      if (!obj.category || !obj.type || !obj.make || !obj.model) return false;
      return validateVehicleData(obj.make, obj.model);
    });
  };

  // Проверка, можно ли отправить форму
  const canSubmit = (): boolean => {
    const hasAddress = !!watchedAddress && (!!watchedLatitude || watchedAddress.includes(','));
    const hasInspector = !!watchedInspectorName && !!watchedInspectorPhone;
    const hasValidObjects = validateAllObjects();
    const noErrors = Object.keys(errors).length === 0;
    
    return hasAddress && hasInspector && hasValidObjects && noErrors;
  };

  // Сообщение об ошибке для кнопки отправить
  const getSubmitError = (): string => {
    if (!watchedAddress) return 'Укажите адрес объекта';
    if (!watchedLatitude && !watchedAddress.includes(',')) return 'Выберите адрес из выпадающего списка для установки координат';
    if (!watchedInspectorName) return 'Укажите ФИО исполнителя';
    if (!watchedInspectorPhone) return 'Укажите телефон исполнителя';
    if (errors.inspectorPhone) return 'Неверный формат телефона';
    if (!watchedObjects || watchedObjects.length === 0) return 'Добавьте хотя бы один объект';
    if (watchedObjects.length > 150) return 'Максимум 150 объектов';
    
    const invalidObject = watchedObjects.findIndex(obj => 
      !obj.category || !obj.type || !obj.make || !obj.model || !validateVehicleData(obj.make, obj.model)
    );
    
    if (invalidObject !== -1) {
      return `Объект ${invalidObject + 1}: заполните все поля и проверьте корректность марки и модели`;
    }
    
    return '';
  };

  // Импорт из Excel
  const handleExcelImport = () => {
    if (!excelData.trim()) {
      toast.error('Вставьте данные из Excel');
      return;
    }

    try {
      const lines = excelData.trim().split('\n');
      const imported: any[] = [];

      for (const line of lines) {
        const parts = line.split('\t').map(p => p.trim());
        if (parts.length < 6) continue;

        const [vin, registrationNumber, category, type, make, model] = parts;
        
        // Валидация импортированных данных
        if (!category || !type || !make || !model) {
          toast.error('Каждая строка должна содержать: VIN, Рег.номер, Категория, Тип, Марка, Модель');
          return;
        }

        if (!validateVehicleData(make, model)) {
          toast.error(`Неверная марка или модель: ${make} ${model}`);
          return;
        }

        imported.push({
          vin,
          registrationNumber,
          category,
          type,
          make,
          model
        });
      }

      if (imported.length === 0) {
        toast.error('Не удалось распознать данные');
        return;
      }

      if (imported.length > 150) {
        toast.error('Максимум 150 объектов');
        return;
      }

      // Заменяем текущие объекты на импортированные
      setValue('objects', imported);
      toast.success(`Импортировано объектов: ${imported.length}`);
      setShowExcelImport(false);
      setExcelData('');
    } catch (error) {
      toast.error('Ошибка при импорте данных');
      console.error(error);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await inspectionsApi.createInspection(data);
      toast.success('Осмотр успешно создан!');
      navigate('/inspections');
    } catch (error) {
      toast.error('Ошибка при создании осмотра');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-inspection-page">
      <div className="create-inspection-header">
        <h1>Создание осмотра</h1>
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/inspections')}
        >
          <X size={18} />
          Отмена
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="create-inspection-form">
        {/* Шаг 1: Выбор типа имущества */}
        <div className="form-section">
          <h2>1. Тип имущества</h2>
          <div className="property-types-grid">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`property-type-card ${watchedPropertyType === type.id ? 'active' : ''}`}
                  onClick={() => setValue('propertyType', type.id)}
                  style={{
                    borderColor: watchedPropertyType === type.id ? type.color : undefined,
                    backgroundColor: watchedPropertyType === type.id ? `${type.color}10` : undefined
                  }}
                >
                  <Icon size={32} color={type.color} />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
          {errors.propertyType && (
            <p className="error-message">{errors.propertyType.message}</p>
          )}
        </div>

        {/* Шаг 2: Адрес и координаты */}
        <div className="form-section">
          <h2>2. Адрес объекта</h2>
          <AddressAutocomplete
            value={watchedAddress || ''}
            onChange={(value, lat, lon) => {
              setValue('address', value);
              if (lat && lon) {
                setValue('latitude', lat);
                setValue('longitude', lon);
              }
            }}
            placeholder="Начните вводить адрес..."
            error={errors.address?.message}
          />
          {watchedLatitude && (
            <p className="coordinates-info">
              <MapPin size={14} />
              Координаты: {watchedLatitude.toFixed(6)}, {watch('longitude')?.toFixed(6)}
            </p>
          )}
        </div>

        {/* Шаг 3: Данные исполнителя */}
        <div className="form-section">
          <h2>3. Исполнитель осмотра</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">
                <User size={16} />
                ФИО исполнителя
              </label>
              <input
                type="text"
                className={`form-input ${errors.inspectorName ? 'error' : ''}`}
                placeholder="Иванов Иван Иванович"
                {...register('inspectorName')}
              />
              {errors.inspectorName && (
                <p className="error-message">{errors.inspectorName.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">
                <Phone size={16} />
                Номер телефона
              </label>
              <input
                type="tel"
                className={`form-input ${errors.inspectorPhone ? 'error' : ''}`}
                placeholder="+79991234567"
                {...register('inspectorPhone')}
              />
              {errors.inspectorPhone && (
                <p className="error-message">{errors.inspectorPhone.message}</p>
              )}
              <p className="field-hint">На этот номер будет отправлена СМС со ссылкой для проведения осмотра</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email (необязательно)
              </label>
              <input
                type="email"
                className={`form-input ${errors.inspectorEmail ? 'error' : ''}`}
                placeholder="example@mail.ru"
                {...register('inspectorEmail')}
              />
              {errors.inspectorEmail && (
                <p className="error-message">{errors.inspectorEmail.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Внутренний № (необязательно)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Будет присвоен автоматически"
                {...register('internalNumber')}
              />
            </div>
          </div>
        </div>

        {/* Шаг 4: Объекты осмотра */}
        <div className="form-section">
          <div className="section-header">
            <h2>4. Объекты для осмотра</h2>
            <div className="section-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowExcelImport(!showExcelImport)}
              >
                <Upload size={18} />
                Импорт из Excel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (fields.length >= 150) {
                    toast.error('Максимум 150 объектов');
                    return;
                  }
                  append({ category: '', type: '', make: '', model: '', vin: '', registrationNumber: '' });
                }}
                disabled={fields.length >= 150}
              >
                <Plus size={18} />
                Добавить объект ({fields.length}/150)
              </button>
            </div>
          </div>

          {/* Excel Import Modal */}
          {showExcelImport && (
            <div className="excel-import-modal">
              <div className="modal-header">
                <h3>Импорт из Excel</h3>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowExcelImport(false);
                    setExcelData('');
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p className="import-instruction">
                  Скопируйте данные из Excel (VIN, Рег.номер, Категория, Тип, Марка, Модель) и вставьте ниже:
                </p>
                <textarea
                  className="excel-import-textarea"
                  placeholder="VIN	Рег.номер	Категория	Тип	Марка	Модель&#10;XW8ZZZ5NZKG123456	А123АА777	Легковой автомобиль	Седан	Toyota	Camry"
                  value={excelData}
                  onChange={(e) => setExcelData(e.target.value)}
                  rows={10}
                />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowExcelImport(false);
                      setExcelData('');
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleExcelImport}
                  >
                    Импортировать
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Objects List */}
          <div className="objects-list">
            {fields.map((field, index) => {
              const category = watchedObjects?.[index]?.category || '';
              const make = watchedObjects?.[index]?.make || '';
              const types = getTypesByCategory(category);
              const models = getModelsByMake(make);

              return (
                <div key={field.id} className="object-card">
                  <div className="object-header">
                    <h4>Объект {index + 1}</h4>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => remove(index)}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="object-fields">
                    <div className="form-group">
                      <label className="form-label">VIN/Номер кузова</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="XW8ZZZ5NZKG123456"
                        {...register(`objects.${index}.vin` as const)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Регистрационный номер</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="А123АА777"
                        {...register(`objects.${index}.registrationNumber` as const)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Категория</label>
                      <select
                        className={`form-input ${errors.objects?.[index]?.category ? 'error' : ''}`}
                        {...register(`objects.${index}.category` as const)}
                        onChange={(e) => {
                          setValue(`objects.${index}.category`, e.target.value);
                          setValue(`objects.${index}.type`, ''); // Reset type when category changes
                        }}
                      >
                        <option value="">Выберите категорию</option>
                        {vehicleCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.objects?.[index]?.category && (
                        <p className="error-message">{errors.objects[index]?.category?.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Тип</label>
                      <select
                        className={`form-input ${errors.objects?.[index]?.type ? 'error' : ''}`}
                        {...register(`objects.${index}.type` as const)}
                        disabled={!category}
                      >
                        <option value="">Выберите тип</option>
                        {types.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.objects?.[index]?.type && (
                        <p className="error-message">{errors.objects[index]?.type?.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Марка</label>
                      <select
                        className={`form-input ${errors.objects?.[index]?.make ? 'error' : ''}`}
                        {...register(`objects.${index}.make` as const)}
                        onChange={(e) => {
                          setValue(`objects.${index}.make`, e.target.value);
                          setValue(`objects.${index}.model`, ''); // Reset model when make changes
                        }}
                      >
                        <option value="">Выберите марку</option>
                        {vehicleMakes.map((make) => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </select>
                      {errors.objects?.[index]?.make && (
                        <p className="error-message">{errors.objects[index]?.make?.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Модель</label>
                      <select
                        className={`form-input ${errors.objects?.[index]?.model ? 'error' : ''}`}
                        {...register(`objects.${index}.model` as const)}
                        disabled={!make}
                      >
                        <option value="">Выберите модель</option>
                        {models.map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      {errors.objects?.[index]?.model && (
                        <p className="error-message">{errors.objects[index]?.model?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Шаг 5: Комментарии */}
        <div className="form-section">
          <h2>5. Комментарии к осмотру (необязательно)</h2>
          <textarea
            className="form-textarea"
            placeholder="Дополнительная информация для исполнителя..."
            rows={4}
            {...register('comment')}
          />
          <p className="field-hint">Эти комментарии будут видны исполнителю при проведении осмотра</p>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary btn-large"
            onClick={() => navigate('/inspections')}
          >
            Отмена
          </button>
          
          <div className="submit-button-wrapper">
            <button
              type="submit"
              className="btn-primary btn-large"
              disabled={!canSubmit() || isLoading}
              title={!canSubmit() ? getSubmitError() : ''}
            >
              {isLoading ? 'Отправка...' : 'Отправить'}
            </button>
            {!canSubmit() && (
              <div className="submit-error-tooltip">
                <AlertCircle size={16} />
                {getSubmitError()}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateInspection;

