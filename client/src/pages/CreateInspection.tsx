import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { inspectionsApi } from '../services/api';
import { useInspections } from '../contexts/InspectionsContext';

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
    make: string;
    model: string;
    year?: number;
    color?: string;
  }>;
}

const CreateInspection: React.FC<CreateInspectionProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { updateInspectionsCount, addNewInspection } = useInspections();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Сбрасываем форму при открытии/закрытии модалки
  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsSubmitting(false);
    }
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

    // Проверяем, что есть хотя бы один валидный объект
    const validObjects = data.objects.filter(obj => 
      obj.make && obj.model && (obj.vin || obj.license_plate)
    );
    
    if (validObjects.length === 0) {
      errors.push('Добавьте хотя бы один объект с маркой, моделью и VIN/госномером');
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full max-w-none max-h-none overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Создание осмотра</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Поле типа имущества */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип имущества *
              </label>
              <select
                {...register('property_type', { required: 'Выберите тип имущества' })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Автотранспорт">Автотранспорт</option>
                <option value="Недвижимость">Недвижимость</option>
                <option value="Оборудование">Оборудование</option>
              </select>
              {errors.property_type && (
                <p className="text-red-500 text-sm mt-1">{errors.property_type.message}</p>
              )}
            </div>

            {/* Поле адреса */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес *
              </label>
              <input
                type="text"
                {...register('address', { required: 'Введите адрес' })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите адрес и выберите из списка"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Блок исполнителя */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ФИО исполнителя *
                </label>
                <input
                  type="text"
                  {...register('inspector_name', { required: 'Введите ФИО исполнителя' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  {...register('inspector_phone', { required: 'Введите телефон' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ivanov@example.com"
                />
              </div>
            </div>

            {/* Блок объектов */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Объекты осмотра *
                </label>
                <button
                  type="button"
                  onClick={addObject}
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                >
                  + Добавить объект
                </button>
              </div>

              {(watch('objects') || []).map((_, index) => (
                <div key={index} className="border p-4 rounded-md mb-4 relative">
                  <button
                    type="button"
                    onClick={() => removeObject(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    disabled={(watch('objects') || []).length <= 1}
                  >
                    ×
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">VIN</label>
                      <input
                        type="text"
                        {...register(`objects.${index}.vin`)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="1HGBH41JXMN109186"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Госномер</label>
                      <input
                        type="text"
                        {...register(`objects.${index}.license_plate`)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="А123БВ777"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Марка *</label>
                      <input
                        type="text"
                        {...register(`objects.${index}.make`, { required: 'Введите марку' })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Toyota"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Модель *</label>
                      <input
                        type="text"
                        {...register(`objects.${index}.model`, { required: 'Введите модель' })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Camry"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Год</label>
                      <input
                        type="number"
                        {...register(`objects.${index}.year`)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Цвет</label>
                      <input
                        type="text"
                        {...register(`objects.${index}.color`)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Белый"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Комментарии */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарии
              </label>
              <textarea
                {...register('comments')}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Дополнительная информация для исполнителя..."
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Создание...' : 'Создать осмотр'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInspection;