import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Download,
  Car,
  Building,
  Home,
  Wrench,
  Plus,
  Filter,
  X,
  Camera
} from 'lucide-react';
import { inspectionsApi } from '../services/api';
import { exportInspectionsToExcel } from '../utils/excelExport';
import { useInspections } from '../contexts/InspectionsContext';
import { useModal } from '../contexts/ModalContext';
import toast from 'react-hot-toast';
import './Inspections.css';

interface Inspection {
  id: number;
  internal_number?: string;
  status: string;
  address: string;
  inspector_name: string;
  recipient_name: string;
  created_at: string;
  sent_at?: string;
  objects_count: number;
  photos_count: number;
  created_by_name: string;
  property_type: string;
  object_type: string;
  object_description: string;
}

interface Filters {
  status: string;
  address: string;
  inspector: string;
  dateFrom: string;
  dateTo: string;
  internalNumber: string;
}

const Inspections: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    status: '',
    address: '',
    inspector: '',
    dateFrom: '',
    dateTo: '',
    internalNumber: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateInspectionsCount, inspections: contextInspections, refreshInspections } = useInspections();
  const { openCreateModal } = useModal();

  // Функция для получения демо-данных
  const getDemoInspections = (): Inspection[] => {
    return [
      {
        id: 1,
        internal_number: '220525-1626',
        status: 'Готов',
        inspector_name: 'Иванов И.И.',
        recipient_name: 'Петров П.П.',
        created_at: new Date().toISOString(),
        sent_at: '2022-05-25T04:00:00Z',
        property_type: 'Автотранспорт',
        object_type: 'легковой',
        object_description: 'Subaru FORESTER',
        photos_count: 25,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'г. Москва, ул. Ленина, 1'
      },
      {
        id: 2,
        internal_number: '220525-1627',
        status: 'В работе',
        inspector_name: 'Сидоров С.С.',
        recipient_name: 'Козлов К.К.',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 минут назад
        sent_at: '2022-05-25T04:01:00Z',
        property_type: 'Гараж',
        object_type: 'гараж',
        object_description: 'Амурская обл., г. Благовещенск, кв-л 103',
        photos_count: 0,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, кв-л 103'
      },
      {
        id: 3,
        internal_number: '220525-1628',
        status: 'Отменен',
        inspector_name: 'Морозов М.М.',
        recipient_name: 'Новиков Н.Н.',
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 час назад
        property_type: 'Коммерческая',
        object_type: 'здание',
        object_description: 'Амурская обл., г. Благовещенск, кв-л 737',
        photos_count: 0,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, кв-л 737'
      },
      {
        id: 4,
        internal_number: '220525-1629',
        status: 'Доработка',
        inspector_name: 'Волков В.В.',
        recipient_name: 'Зайцев З.З.',
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 часа назад
        sent_at: '2022-05-25T04:02:00Z',
        property_type: 'Коммерческая',
        object_type: 'здание',
        object_description: 'Амурская обл., г. Благовещенск, кв-л 737',
        photos_count: 36,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, кв-л 737'
      },
      {
        id: 5,
        internal_number: '220525-1630',
        status: 'В работе',
        inspector_name: 'Орлов О.О.',
        recipient_name: 'Соколов С.С.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 часа назад
        sent_at: '2022-05-25T04:03:00Z',
        property_type: 'Коммерческая',
        object_type: 'здание',
        object_description: 'Амурская обл., г. Благовещенск, кв-л 737',
        photos_count: 15,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, кв-л 737'
      },
      {
        id: 6,
        internal_number: '220525-1631',
        status: 'Проверка',
        inspector_name: 'Лебедев Л.Л.',
        recipient_name: 'Голубев Г.Г.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 часа назад
        sent_at: '2022-05-25T04:04:00Z',
        property_type: 'Коммерческая',
        object_type: 'здание',
        object_description: 'Амурская обл., г. Благовещенск, ул. Пограничная, д. 80',
        photos_count: 56,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, ул. Пограничная, д. 80'
      },
      {
        id: 7,
        internal_number: '220525-1632',
        status: 'Готов',
        inspector_name: 'Филиппов Ф.Ф.',
        recipient_name: 'Белов Б.Б.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 часа назад
        sent_at: '2022-05-25T04:05:00Z',
        property_type: 'Коммерческая',
        object_type: 'здание',
        object_description: 'Амурская обл., г. Благовещенск, ул. Нагорная, д. 6',
        photos_count: 129,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, ул. Нагорная, д. 6'
      },
      {
        id: 8,
        internal_number: '220525-1633',
        status: 'Проверка',
        inspector_name: 'Комаров К.К.',
        recipient_name: 'Кузнецов К.К.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 часов назад
        sent_at: '2022-05-25T04:06:00Z',
        property_type: 'Коммерческая',
        object_type: 'спецтехника',
        object_description: 'SUMITOMO SH135X-3B',
        photos_count: 22,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'г. Москва, ул. Строительная, 15'
      },
      {
        id: 9,
        internal_number: '220525-1634',
        status: 'В работе',
        inspector_name: 'Дмитриев Д.Д.',
        recipient_name: 'Егоров Е.Е.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 часов назад
        sent_at: '2022-05-25T04:07:00Z',
        property_type: 'Автотранспорт',
        object_type: 'коммерческий',
        object_description: 'УСТ 5453РН',
        photos_count: 8,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'г. Москва, ул. Транспортная, 8'
      },
      {
        id: 10,
        internal_number: '220525-1635',
        status: 'Доработка',
        inspector_name: 'Жуков Ж.Ж.',
        recipient_name: 'Романов Р.Р.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), // 7 часов назад
        sent_at: '2022-05-25T04:08:00Z',
        property_type: 'Автотранспорт',
        object_type: 'коммерческий',
        object_description: 'УСТ 5453РН',
        photos_count: 22,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'г. Москва, ул. Транспортная, 8'
      }
    ];
  };

  // Мемоизированная фильтрация демо-данных
  const getFilteredInspections = useMemo(() => {
    // Объединяем демо-данные с новыми осмотрами из контекста
    let allInspections = [...getDemoInspections()];
    
    // Добавляем новые осмотры из контекста в начало списка
    if (contextInspections.length > 0) {
      allInspections = [...contextInspections, ...allInspections];
    }
    
    let filtered = allInspections;

    if (filters.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    if (filters.address) {
      filtered = filtered.filter(i => 
        i.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    if (filters.inspector) {
      filtered = filtered.filter(i => 
        i.inspector_name.toLowerCase().includes(filters.inspector.toLowerCase())
      );
    }
    if (filters.internalNumber) {
      filtered = filtered.filter(i => 
        i.internal_number?.includes(filters.internalNumber)
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(i => 
        new Date(i.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(i => 
        new Date(i.created_at) <= new Date(filters.dateTo)
      );
    }

    return filtered;
  }, [filters, contextInspections]);

  // Проверяем, работаем ли мы на GitHub Pages
  const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inspections', filters, page],
    queryFn: () => inspectionsApi.getInspections({ ...filters, page, limit: 20 }),
    retry: false, // Не повторять запрос при ошибке
    refetchOnWindowFocus: false, // Не обновлять при фокусе окна
    enabled: !IS_GITHUB_PAGES, // Отключаем запросы на GitHub Pages
  });

  // Обрабатываем обновление после создания нового осмотра
  useEffect(() => {
    const state = location.state as { refresh?: boolean; newInspection?: string } | null;
    if (state?.refresh) {
      // Показываем уведомление о новом осмотре
      if (state.newInspection) {
        toast.success(`Осмотр №${state.newInspection} добавлен в реестр`, {
          duration: 4000,
          icon: '✅'
        });
      }
      // Очищаем state чтобы не показывать уведомление повторно
      window.history.replaceState({}, document.title);
      // Обновляем данные и счетчик (только если не на GitHub Pages)
      if (!IS_GITHUB_PAGES) {
        refetch();
      }
      updateInspectionsCount();
    }
  }, [location.state, refetch, updateInspectionsCount, IS_GITHUB_PAGES]);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = () => {
    setFilters({
      status: '',
      address: '',
      inspector: '',
      dateFrom: '',
      dateTo: '',
      internalNumber: '',
    });
    setPage(1);
  };


  const handleExport = async () => {
    const dataToExport = getFilteredInspections;
    if (dataToExport.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }
    
    if (!window.confirm(`Экспортировать ${dataToExport.length} осмотров в Excel?`)) {
      return;
    }
    
    try {
      exportInspectionsToExcel(dataToExport, 'Реестр_осмотров');
      toast.success(`Экспортировано осмотров: ${dataToExport.length}`);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      toast.error('Ошибка экспорта');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Готов': return 'status-ready';
      case 'В работе': return 'status-in-progress';
      case 'Проверка': return 'status-checking';
      case 'Доработка': return 'status-revision';
      case 'Отменен': return 'status-cancelled';
      default: return 'status';
    }
  };


  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Неверная дата';
      }
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Ошибка даты';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Ошибка форматирования времени:', error);
      return '--:--';
    }
  };


  const normalizePropertyType = (type: string) => {
    switch (type) {
      case 'vehicle':
        return 'Автотранспорт';
      case 'real_estate':
        return 'Недвижимость';
      case 'equipment':
        return 'Оборудование';
      case 'other':
        return 'Прочее';
      default:
        return type;
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    const t = normalizePropertyType(type);
    switch (t) {
      case 'Автотранспорт':
        return <Car size={16} />;
      case 'Коммерческая':
        return <Building size={16} />;
      case 'Гараж':
        return <Home size={16} />;
      case 'Недвижимость':
        return <Building size={16} />;
      case 'Оборудование':
        return <Wrench size={16} />;
      default:
        return <Wrench size={16} />;
    }
  };


  if (error) {
    return (
      <div className="error-state">
        <h3>Ошибка загрузки данных</h3>
        <p>Попробуйте обновить страницу</p>
        <button 
          className="btn btn-primary" 
          onClick={() => !IS_GITHUB_PAGES && refetch()}
          disabled={IS_GITHUB_PAGES}
        >
          Обновить
        </button>
      </div>
    );
  }

  return (
    <div className="inspections-page">
      <div className="inspections-content">
        <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Осмотры</h1>
          <div className="total-count">{getFilteredInspections.length}</div>
        </div>
        
        <div className="header-right">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Фильтры
          </button>
          
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            <Download size={16} />
            Экспорт
          </button>
          
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Новый осмотр
          </button>
        </div>
      </div>

      {/* Раскрывающаяся панель фильтров */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Внутренний номер</label>
              <input
                type="text"
                className="form-input"
                placeholder="Введите номер"
                value={filters.internalNumber}
                onChange={(e) => handleFilterChange('internalNumber', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Адрес объекта</label>
              <input
                type="text"
                className="form-input"
                placeholder="Введите адрес"
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Исполнитель</label>
              <input
                type="text"
                className="form-input"
                placeholder="ФИО исполнителя"
                value={filters.inspector}
                onChange={(e) => handleFilterChange('inspector', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Статус</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="В работе">В работе</option>
                <option value="Проверка">Проверка</option>
                <option value="Готов">Готов</option>
                <option value="Доработка">Доработка</option>
                <option value="Отменен">Отменен</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Дата создания (от)</label>
              <input
                type="date"
                className="form-input"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Дата создания (до)</label>
              <input
                type="date"
                className="form-input"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="filters-actions">
            <button 
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              <X size={16} />
              Очистить фильтры
            </button>
          </div>
        </div>
      )}


      {/* Таблица осмотров */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            Загрузка осмотров...
          </div>
        ) : (
          <>
            <table className="inspections-table">
              <thead>
                <tr>
                  <th>Дата создания</th>
                  <th>Номер</th>
                  <th>Исполнитель</th>
                  <th>Адрес</th>
                  <th>Статус</th>
                  <th>Тип имущества</th>
                  <th>Фото</th>
                </tr>
              </thead>
              <tbody>
                      {(error ? getFilteredInspections : (data?.data?.inspections || getFilteredInspections)).map((inspection: Inspection) => (
                  <tr 
                    key={inspection.id}
                    onClick={() => navigate(`/inspections/${inspection.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="date-time">
                        <div className="date">{formatDate(inspection.created_at)}</div>
                        <div className="time">{formatTime(inspection.created_at)}</div>
                      </div>
                    </td>
                    <td>
                      <span className="inspection-number">
                        {inspection.internal_number || `INS-${String(inspection.id).padStart(3, '0')}`}
                      </span>
                    </td>
                    <td>
                      <span className="inspector-name">{inspection.inspector_name}</span>
                    </td>
                    <td>
                      <span className="address-text">{inspection.address || 'Адрес не указан'}</span>
                    </td>
                    <td>
                      <span className={`status ${getStatusClass(inspection.status)}`}>
                        {inspection.status}
                      </span>
                    </td>
                    <td>
                      <div className="property-type">
                        <span className="property-type-icon">
                          {getPropertyTypeIcon(inspection.property_type)}
                        </span>
                        <span className="property-type-text">{normalizePropertyType(inspection.property_type)}</span>
                      </div>
                    </td>
                    <td>
                      {inspection.photos_count > 0 ? (
                        <div className="photo-indicator">
                          <Camera size={16} />
                          <span className="photo-count">{inspection.photos_count}</span>
                        </div>
                      ) : (
                        <div className="no-photo">
                          <X size={16} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(error ? getFilteredInspections : (data?.data?.inspections || getFilteredInspections)).length === 0 && (
              <div className="empty-state">
                <h3>Осмотры не найдены</h3>
                <p>Попробуйте изменить фильтры или создать новый осмотр</p>
                <button 
                  className="btn btn-primary"
                  onClick={openCreateModal}
                >
                  Создать осмотр
                </button>
              </div>
            )}

            {/* Пагинация */}
            {!error && data?.data.pagination && data.data.pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Назад
                </button>
                <span className="pagination-info">
                  Страница {page} из {data.data.pagination.pages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={page === data.data.pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </div>
      </div>

    </div>
  );
};

export default Inspections;
