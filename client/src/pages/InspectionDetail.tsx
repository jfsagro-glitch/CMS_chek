import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Copy, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { inspectionsApi } from '../services/api';
import { useInspections } from '../contexts/InspectionsContext';
import { getPropertyTypeAttributes } from '../config/propertyTypes';
import toast from 'react-hot-toast';
import './InspectionDetail.css';

const InspectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { inspections: contextInspections } = useInspections();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  // Демо-данные для детального осмотра
  const getDemoInspectionDetail = (inspectionId: string) => {
    const demoInspections = [
      {
        id: 1,
        internal_number: '220525-1626',
        status: 'Готов',
        property_type: 'Автотранспорт',
        address: 'г. Москва, ул. Ленина, 1',
        latitude: 55.751244,
        longitude: 37.618423,
        inspector_name: 'Иванов И.И.',
        inspector_phone: '+79991234567',
        inspector_email: 'ivanov@example.com',
        recipient_name: 'Петров П.П.',
        created_at: '2022-05-25T03:37:00Z',
        sent_at: '2022-05-25T04:00:00Z',
        completed_at: '2022-05-25T10:30:00Z',
        comment: 'Провести полный осмотр технического состояния',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 1,
            vin: 'JF1SH58F77G123456',
            registration_number: 'А123БВ777',
            category: 'Легковой автомобиль',
            type: 'легковой',
            make: 'Subaru',
            model: 'FORESTER',
            photos_count: 25
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:37:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:00:00Z',
            created_by: 'Система'
          },
          {
            id: 3,
            status: 'Проверка',
            comment: 'Осмотр выполнен, отправлен на проверку',
            created_at: '2022-05-25T09:15:00Z',
            created_by: 'Иванов И.И.'
          },
          {
            id: 4,
            status: 'Готов',
            comment: 'Осмотр принят',
            created_at: '2022-05-25T10:30:00Z',
            created_by: 'Администратор'
          }
        ]
      },
      {
        id: 2,
        internal_number: '220525-1627',
        status: 'В работе',
        property_type: 'Гараж',
        address: 'Амурская обл., г. Благовещенск, кв-л 103',
        latitude: 50.2907,
        longitude: 127.5272,
        inspector_name: 'Сидоров С.С.',
        inspector_phone: '+79991234568',
        inspector_email: 'sidorov@example.com',
        recipient_name: 'Козлов К.К.',
        created_at: '2022-05-25T03:38:00Z',
        sent_at: '2022-05-25T04:01:00Z',
        comment: 'Осмотр гаража на предмет технического состояния',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 2,
            category: 'Гараж',
            type: 'гараж',
            make: '',
            model: '',
            photos_count: 0
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:38:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:01:00Z',
            created_by: 'Система'
          }
        ]
      },
      {
        id: 3,
        internal_number: '220525-1628',
        status: 'Отменен',
        property_type: 'Коммерческая',
        address: 'Амурская обл., г. Благовещенск, кв-л 737',
        latitude: 50.2907,
        longitude: 127.5272,
        inspector_name: 'Морозов М.М.',
        inspector_phone: '+79991234569',
        inspector_email: 'morozov@example.com',
        recipient_name: 'Новиков Н.Н.',
        created_at: '2022-05-25T03:39:00Z',
        comment: 'Осмотр коммерческого здания',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 3,
            category: 'Коммерческое здание',
            type: 'здание',
            make: '',
            model: '',
            photos_count: 0
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:39:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'Отменен',
            comment: 'Осмотр отменен по просьбе заказчика',
            created_at: '2022-05-25T05:00:00Z',
            created_by: 'Администратор'
          }
        ]
      },
      {
        id: 4,
        internal_number: '220525-1629',
        status: 'Доработка',
        property_type: 'Коммерческая',
        address: 'Амурская обл., г. Благовещенск, кв-л 737',
        latitude: 50.2907,
        longitude: 127.5272,
        inspector_name: 'Волков В.В.',
        inspector_phone: '+79991234570',
        inspector_email: 'volkov@example.com',
        recipient_name: 'Зайцев З.З.',
        created_at: '2022-05-25T03:40:00Z',
        sent_at: '2022-05-25T04:02:00Z',
        comment: 'Осмотр коммерческого здания',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 4,
            category: 'Коммерческое здание',
            type: 'здание',
            make: '',
            model: '',
            photos_count: 36
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:40:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:02:00Z',
            created_by: 'Система'
          },
          {
            id: 3,
            status: 'Проверка',
            comment: 'Осмотр выполнен, отправлен на проверку',
            created_at: '2022-05-25T09:30:00Z',
            created_by: 'Волков В.В.'
          },
          {
            id: 4,
            status: 'Доработка',
            comment: 'Требуется доработка фотографий',
            created_at: '2022-05-25T11:00:00Z',
            created_by: 'Администратор'
          }
        ]
      },
      {
        id: 5,
        internal_number: '220525-1630',
        status: 'В работе',
        property_type: 'Коммерческая',
        address: 'Амурская обл., г. Благовещенск, кв-л 737',
        latitude: 50.2907,
        longitude: 127.5272,
        inspector_name: 'Орлов О.О.',
        inspector_phone: '+79991234571',
        inspector_email: 'orlov@example.com',
        recipient_name: 'Соколов С.С.',
        created_at: '2022-05-25T03:41:00Z',
        sent_at: '2022-05-25T04:03:00Z',
        comment: 'Осмотр коммерческого здания',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 5,
            category: 'Коммерческое здание',
            type: 'здание',
            make: '',
            model: '',
            photos_count: 15
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:41:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:03:00Z',
            created_by: 'Система'
          }
        ]
      },
      {
        id: 6,
        internal_number: '220525-1631',
        status: 'Проверка',
        property_type: 'Коммерческая',
        address: 'Амурская обл., г. Благовещенск, ул. Пограничная, д. 80',
        latitude: 50.2907,
        longitude: 127.5272,
        inspector_name: 'Лебедев Л.Л.',
        inspector_phone: '+79991234572',
        inspector_email: 'lebedev@example.com',
        recipient_name: 'Голубев Г.Г.',
        created_at: '2022-05-25T03:42:00Z',
        sent_at: '2022-05-25T04:04:00Z',
        comment: 'Осмотр коммерческого здания',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 6,
            category: 'Коммерческое здание',
            type: 'здание',
            make: '',
            model: '',
            photos_count: 56
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:42:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:04:00Z',
            created_by: 'Система'
          },
          {
            id: 3,
            status: 'Проверка',
            comment: 'Осмотр выполнен, отправлен на проверку',
            created_at: '2022-05-25T10:00:00Z',
            created_by: 'Лебедев Л.Л.'
          }
        ]
      },
      {
        id: 7,
        internal_number: '220525-1632',
        status: 'Готов',
        property_type: 'Коммерческая',
        address: 'Амурская обл., г. Благовещенск, ул. Нагорная, д. 6',
        latitude: 50.2907,
        longitude: 127.5272,
        inspector_name: 'Филиппов Ф.Ф.',
        inspector_phone: '+79991234573',
        inspector_email: 'filippov@example.com',
        recipient_name: 'Белов Б.Б.',
        created_at: '2022-05-25T03:43:00Z',
        sent_at: '2022-05-25T04:05:00Z',
        completed_at: '2022-05-25T12:00:00Z',
        comment: 'Осмотр коммерческого здания',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 7,
            category: 'Коммерческое здание',
            type: 'здание',
            make: '',
            model: '',
            photos_count: 129
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:43:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:05:00Z',
            created_by: 'Система'
          },
          {
            id: 3,
            status: 'Проверка',
            comment: 'Осмотр выполнен, отправлен на проверку',
            created_at: '2022-05-25T10:30:00Z',
            created_by: 'Филиппов Ф.Ф.'
          },
          {
            id: 4,
            status: 'Готов',
            comment: 'Осмотр принят',
            created_at: '2022-05-25T12:00:00Z',
            created_by: 'Администратор'
          }
        ]
      },
      {
        id: 8,
        internal_number: '220525-1633',
        status: 'Проверка',
        property_type: 'Коммерческая',
        address: 'г. Москва, ул. Строительная, 15',
        latitude: 55.751244,
        longitude: 37.618423,
        inspector_name: 'Комаров К.К.',
        inspector_phone: '+79991234574',
        inspector_email: 'komarov@example.com',
        recipient_name: 'Кузнецов К.К.',
        created_at: '2022-05-25T03:44:00Z',
        sent_at: '2022-05-25T04:06:00Z',
        comment: 'Осмотр спецтехники',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 8,
            category: 'Спецтехника',
            type: 'спецтехника',
            make: 'SUMITOMO',
            model: 'SH135X-3B',
            photos_count: 22
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:44:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:06:00Z',
            created_by: 'Система'
          },
          {
            id: 3,
            status: 'Проверка',
            comment: 'Осмотр выполнен, отправлен на проверку',
            created_at: '2022-05-25T11:15:00Z',
            created_by: 'Комаров К.К.'
          }
        ]
      },
      {
        id: 9,
        internal_number: '220525-1634',
        status: 'В работе',
        property_type: 'Автотранспорт',
        address: 'г. Москва, ул. Транспортная, 8',
        latitude: 55.751244,
        longitude: 37.618423,
        inspector_name: 'Дмитриев Д.Д.',
        inspector_phone: '+79991234575',
        inspector_email: 'dmitriev@example.com',
        recipient_name: 'Егоров Е.Е.',
        created_at: '2022-05-25T03:45:00Z',
        sent_at: '2022-05-25T04:07:00Z',
        comment: 'Осмотр коммерческого транспорта',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 9,
            category: 'Коммерческий транспорт',
            type: 'коммерческий',
            make: 'УСТ',
            model: '5453РН',
            photos_count: 8
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:45:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:07:00Z',
            created_by: 'Система'
          }
        ]
      },
      {
        id: 10,
        internal_number: '220525-1635',
        status: 'Доработка',
        property_type: 'Автотранспорт',
        address: 'г. Москва, ул. Транспортная, 8',
        latitude: 55.751244,
        longitude: 37.618423,
        inspector_name: 'Жуков Ж.Ж.',
        inspector_phone: '+79991234576',
        inspector_email: 'zhukov@example.com',
        recipient_name: 'Романов Р.Р.',
        created_at: '2022-05-25T03:46:00Z',
        sent_at: '2022-05-25T04:08:00Z',
        comment: 'Осмотр коммерческого транспорта',
        created_by_name: 'Администратор',
        objects: [
          {
            id: 10,
            category: 'Коммерческий транспорт',
            type: 'коммерческий',
            make: 'УСТ',
            model: '5453РН',
            photos_count: 22
          }
        ],
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: '2022-05-25T03:46:00Z',
            created_by: 'Администратор'
          },
          {
            id: 2,
            status: 'В работе',
            comment: 'Отправлено СМС исполнителю',
            created_at: '2022-05-25T04:08:00Z',
            created_by: 'Система'
          },
          {
            id: 3,
            status: 'Проверка',
            comment: 'Осмотр выполнен, отправлен на проверку',
            created_at: '2022-05-25T11:45:00Z',
            created_by: 'Жуков Ж.Ж.'
          },
          {
            id: 4,
            status: 'Доработка',
            comment: 'Требуется дополнительная информация',
            created_at: '2022-05-25T13:00:00Z',
            created_by: 'Администратор'
          }
        ]
      }
    ];

    // Находим осмотр по ID
    const inspection = demoInspections.find(ins => ins.id === Number(inspectionId));
    
    // Если осмотр не найден, возвращаем первый осмотр как fallback
    return inspection || demoInspections[0];
  };

  // Получаем данные осмотра
  const getInspectionData = () => {
    const inspectionId = Number(id);
    
    // Сначала проверяем новые осмотры из контекста
    const contextInspection = contextInspections.find(ins => ins.id === inspectionId);
    if (contextInspection) {
      // Преобразуем данные из контекста в формат детального осмотра
      // Сохраняем все объекты осмотра с их полными характеристиками
      const inspectionObjects = contextInspection.objects || [];
      
      return {
        ...contextInspection,
        inspector_phone: contextInspection.inspector_phone || '+79991234567',
        inspector_email: contextInspection.inspector_email || 'inspector@example.com',
        recipient_name: contextInspection.recipient_name || 'Получатель не указан',
        latitude: contextInspection.coordinates?.lat || 55.751244,
        longitude: contextInspection.coordinates?.lng || 37.618423,
        completed_at: contextInspection.status === 'Готов' ? contextInspection.created_at : undefined,
        comment: contextInspection.comments || contextInspection.comment || 'Осмотр создан через систему',
        objects: inspectionObjects.map((obj: any, index: number) => ({
          id: obj.id || index + 1,
          ...obj, // Сохраняем все поля объекта
          category: contextInspection.property_type,
          photos_count: obj.photos_count || 0
        })),
        status_history: [
          {
            id: 1,
            status: 'создан',
            comment: 'Осмотр создан',
            created_at: contextInspection.created_at,
            created_by: contextInspection.created_by_name || 'Система'
          },
          ...(contextInspection.status !== 'создан' ? [{
            id: 2,
            status: contextInspection.status,
            comment: `Статус изменен на ${contextInspection.status}`,
            created_at: contextInspection.created_at,
            created_by: contextInspection.inspector_name || 'Система'
          }] : [])
        ]
      };
    }
    
    // Если не найден в контексте, используем демо-данные
    return getDemoInspectionDetail(id || '1');
  };

  const inspection = getInspectionData();
  const isLoading = false;
  const error = null;

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, comment }: { status: string; comment?: string }) =>
      inspectionsApi.updateStatus(Number(id), status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection', id] });
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      setShowStatusModal(false);
      setNewStatus('');
      setStatusComment('');
      toast.success('Статус обновлен');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка обновления статуса');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => {
      // Демо-режим: просто показываем успех
      return Promise.resolve({ data: { message: 'Осмотр дублирован' } });
    },
    onSuccess: () => {
      toast.success('Осмотр дублирован (демо)');
      setTimeout(() => navigate('/inspections'), 1000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка дублирования');
    },
  });

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error('Выберите новый статус');
      return;
    }
    updateStatusMutation.mutate({ status: newStatus, comment: statusComment });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'В работе': return 'status working';
      case 'Проверка': return 'status checking';
      case 'Готов': return 'status ready';
      case 'Доработка': return 'status revision';
      default: return 'status';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Загрузка осмотра...
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="error-state">
        <AlertCircle size={48} />
        <h3>Ошибка загрузки</h3>
        <p>Не удалось загрузить данные осмотра</p>
        <button className="btn btn-primary" onClick={() => navigate('/inspections')}>
          К списку осмотров
        </button>
      </div>
    );
  }

  const inspectionData = inspection;
  const objects = inspection.objects || [];
  const photos: any[] = [];
  const statusHistory = inspection.status_history || [];
  // Определяем ID типа имущества из различных возможных значений
  const propertyTypeId = inspectionData.property_type === 'Транспортное средство' || 
                          inspectionData.property_type === 'vehicle' ||
                          inspectionData.property_type === 'Автотранспорт' ? 'vehicle' : 
                          inspectionData.property_type === 'Недвижимость' || 
                          inspectionData.property_type === 'real_estate' ? 'real_estate' :
                          inspectionData.property_type === 'Оборудование' || 
                          inspectionData.property_type === 'equipment' ? 'equipment' : 'other';
  
  // Получаем атрибуты для типа имущества
  const propertyAttributes = getPropertyTypeAttributes(propertyTypeId);
  
  // Функция для получения метки атрибута
  const getAttributeLabel = (key: string): string => {
    const attr = propertyAttributes.find(a => a.key === key);
    if (attr) return attr.label;
    
    // Стандартные метки для транспорта
    const labels: { [key: string]: string } = {
      make: 'Марка',
      model: 'Модель',
      year: 'Год',
      color: 'Цвет',
      vin: 'VIN',
      license_plate: 'Госномер',
      name: 'Наименование'
    };
    return labels[key] || key;
  };
  
  // Функция для отображения значения
  const formatAttributeValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
    return String(value);
  };

  return (
    <div className="inspection-detail">
      {/* Шапка */}
      <div className="detail-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/inspections')}
        >
          <ArrowLeft size={20} />
          Назад
        </button>
        
        <div className="header-info">
          <h1>Осмотр #{inspectionData.internal_number || inspectionData.id}</h1>
          <div className="header-meta">
            <span className={getStatusClass(inspectionData.status)}>
              {inspectionData.status}
            </span>
            <span className="created-date">
              Создан: {formatDate(inspectionData.created_at)}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowStatusModal(true)}
          >
            Изменить статус
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => duplicateMutation.mutate()}
            disabled={duplicateMutation.isPending}
          >
            <Copy size={16} />
            Дублировать
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Основная информация */}
        <div className="info-section">
          <h2>Основная информация</h2>
          <div className="info-grid">
            <div className="info-item">
              <MapPin size={16} />
              <div>
                <label>Адрес</label>
                <span>{inspectionData.address}</span>
              </div>
            </div>

            <div className="info-item">
              <User size={16} />
              <div>
                <label>Исполнитель</label>
                <span>{inspectionData.inspector_name}</span>
              </div>
            </div>

            <div className="info-item">
              <Phone size={16} />
              <div>
                <label>Телефон</label>
                <span>{inspectionData.inspector_phone}</span>
              </div>
            </div>

            {inspectionData.inspector_email && (
              <div className="info-item">
                <Mail size={16} />
                <div>
                  <label>Email</label>
                  <span>{inspectionData.inspector_email}</span>
                </div>
              </div>
            )}

            <div className="info-item">
              <Calendar size={16} />
              <div>
                <label>Тип имущества</label>
                <span>{inspectionData.property_type}</span>
              </div>
            </div>

            {inspectionData.comment && (
              <div className="info-item full-width">
                <FileText size={16} />
                <div>
                  <label>Комментарий</label>
                  <span>{inspectionData.comment}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Объекты осмотра */}
        <div className="objects-section">
          <h2>Объекты осмотра ({objects.length})</h2>
          <div className="objects-list">
            {objects.map((object: any, objIndex: number) => {
              // Определяем название объекта
              const objectTitle = propertyTypeId === 'vehicle' 
                ? `${object.make || ''} ${object.model || ''}`.trim() || 'Транспортное средство'
                : object.name || 'Объект осмотра';
              
              // Получаем все поля объекта, исключая служебные
              const excludeKeys = ['id', 'photos_count', 'inspection_id', 'category'];
              const objectAttributes = Object.keys(object)
                .filter(key => !excludeKeys.includes(key) && object[key] !== null && object[key] !== undefined && object[key] !== '')
                .sort(); // Сортируем для единообразного отображения
              
              return (
              <div key={object.id || objIndex} className="object-card">
                <div className="object-header">
                  <h3>{objectTitle}</h3>
                  <span className="object-category">{object.category || inspectionData.property_type}</span>
                </div>
                
                <div className="object-details">
                  <h4 className="characteristics-title">Характеристики объекта</h4>
                  <div className="characteristics-grid">
                    {objectAttributes.map((key) => {
                      const value = object[key];
                      const label = getAttributeLabel(key);
                      const formattedValue = formatAttributeValue(value);
                      
                      if (!formattedValue) return null;
                      
                      return (
                        <div key={key} className="characteristic-item">
                          <label className="characteristic-label">{label}:</label>
                          <span className="characteristic-value">{formattedValue}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {objectAttributes.length === 0 && (
                    <p className="no-characteristics">Характеристики не указаны</p>
                  )}
                </div>

                {/* Фотографии объекта */}
                <div className="object-photos">
                  <h4>Фотографии</h4>
                  {photos.filter((photo: any) => photo.object_id === object.id).length > 0 ? (
                    <div className="photos-grid">
                      {photos
                        .filter((photo: any) => photo.object_id === object.id)
                        .map((photo: any) => (
                          <div key={photo.id} className="photo-item">
                            <img src={`/api/uploads/${photo.file_path}`} alt="Фото объекта" />
                            <div className="photo-meta">
                              <span>{formatDate(photo.taken_at)}</span>
                              {photo.latitude && photo.longitude && (
                                <span>📍 {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="no-photos">Фотографии не загружены</p>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </div>

        {/* История статусов */}
        {statusHistory.length > 0 && (
          <div className="status-history">
            <h2>История изменений</h2>
            <div className="timeline">
              {statusHistory.map((entry: any) => (
                <div key={entry.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className={`status-badge ${getStatusClass(entry.status)}`}>
                        {entry.status}
                      </span>
                      <span className="timeline-date">{formatDate(entry.created_at)}</span>
                    </div>
                    {entry.created_by && (
                      <p className="timeline-user">
                        <User size={14} />
                        {entry.created_by}
                      </p>
                    )}
                    {entry.comment && (
                      <p className="timeline-comment">
                        <FileText size={14} />
                        {entry.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно изменения статуса */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Изменить статус</h3>
            
            <div className="form-group">
              <label className="form-label">Новый статус</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Выберите статус</option>
                <option value="В работе">В работе</option>
                <option value="Проверка">Проверка</option>
                <option value="Готов">Готов</option>
                <option value="Доработка">Доработка</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Комментарий (необязательно)</label>
              <textarea
                className="form-input"
                rows={3}
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Добавьте комментарий к изменению статуса"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Обновление...' : 'Обновить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDetail;
