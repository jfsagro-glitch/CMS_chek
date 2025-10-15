import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Eye, 
  Copy, 
  RefreshCw,
  Car,
  Building,
  Home,
  Wrench,
  ChevronDown,
  Plus
} from 'lucide-react';
import { inspectionsApi } from '../services/api';
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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inspections', filters, page],
    queryFn: () => inspectionsApi.getInspections({ ...filters, page, limit: 20 }),
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

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
    try {
      await inspectionsApi.exportToExcel(filters);
      toast.success('Экспорт запущен');
    } catch (error) {
      toast.error('Ошибка экспорта');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'готово': return 'status-ready';
      case 'отменён': return 'status-cancelled';
      case 'на доработке': return 'status-revision';
      case 'проверка': return 'status-checking';
      default: return 'status';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }) + ' ' + date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'Автотранспорт':
        return <Car size={16} />;
      case 'Коммерческая':
        return <Building size={16} />;
      case 'Гараж':
        return <Home size={16} />;
      default:
        return <Wrench size={16} />;
    }
  };

  const getDemoInspections = (): Inspection[] => {
    return [
      {
        id: 1,
        internal_number: '220525-1626',
        status: 'готово',
        inspector_name: 'Иванов И.И.',
        recipient_name: 'Петров П.П.',
        created_at: '2022-05-25T03:37:00Z',
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
        status: 'готово',
        inspector_name: 'Сидоров С.С.',
        recipient_name: 'Козлов К.К.',
        created_at: '2022-05-25T03:38:00Z',
        sent_at: '2022-05-25T04:01:00Z',
        property_type: 'Гараж',
        object_type: 'гараж',
        object_description: 'Амурская обл., г. Благовещенск, кв-л 103',
        photos_count: 33,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, кв-л 103'
      },
      {
        id: 3,
        internal_number: '220525-1628',
        status: 'отменён',
        inspector_name: 'Морозов М.М.',
        recipient_name: 'Новиков Н.Н.',
        created_at: '2022-05-25T03:39:00Z',
        property_type: 'Коммерческая',
        object_type: 'здание',
        object_description: 'Амурская обл., г. Благовещенск, кв-л 737',
        photos_count: 38,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, кв-л 737'
      },
      {
        id: 4,
        internal_number: '220525-1629',
        status: 'на доработке',
        inspector_name: 'Волков В.В.',
        recipient_name: 'Зайцев З.З.',
        created_at: '2022-05-25T03:40:00Z',
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
        status: 'на доработке',
        inspector_name: 'Орлов О.О.',
        recipient_name: 'Соколов С.С.',
        created_at: '2022-05-25T03:41:00Z',
        sent_at: '2022-05-25T04:03:00Z',
        property_type: 'Коммерческая',
        object_type: 'здание',
        object_description: 'Амурская обл., г. Благовещенск, кв-л 737',
        photos_count: 35,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'Амурская обл., г. Благовещенск, кв-л 737'
      },
      {
        id: 6,
        internal_number: '220525-1631',
        status: 'проверка',
        inspector_name: 'Лебедев Л.Л.',
        recipient_name: 'Голубев Г.Г.',
        created_at: '2022-05-25T03:42:00Z',
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
        status: 'готово',
        inspector_name: 'Филиппов Ф.Ф.',
        recipient_name: 'Белов Б.Б.',
        created_at: '2022-05-25T03:43:00Z',
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
        status: 'готово',
        inspector_name: 'Комаров К.К.',
        recipient_name: 'Кузнецов К.К.',
        created_at: '2022-05-25T03:44:00Z',
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
        status: 'готово',
        inspector_name: 'Дмитриев Д.Д.',
        recipient_name: 'Егоров Е.Е.',
        created_at: '2022-05-25T03:45:00Z',
        sent_at: '2022-05-25T04:07:00Z',
        property_type: 'Автотранспорт',
        object_type: 'коммерческий',
        object_description: 'УСТ 5453РН',
        photos_count: 22,
        objects_count: 1,
        created_by_name: 'Администратор',
        address: 'г. Москва, ул. Транспортная, 8'
      },
      {
        id: 10,
        internal_number: '220525-1635',
        status: 'на доработке',
        inspector_name: 'Жуков Ж.Ж.',
        recipient_name: 'Романов Р.Р.',
        created_at: '2022-05-25T03:46:00Z',
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

  const handleDuplicate = async (id: number) => {
    try {
      await inspectionsApi.duplicateInspection(id);
      toast.success('Осмотр дублирован');
      refetch();
    } catch (error) {
      toast.error('Ошибка дублирования');
    }
  };

  if (error) {
    return (
      <div className="error-state">
        <h3>Ошибка загрузки данных</h3>
        <p>Попробуйте обновить страницу</p>
        <button className="btn btn-primary" onClick={() => refetch()}>
          Обновить
        </button>
      </div>
    );
  }

  return (
    <div className="inspections-page">
      <div className="page-header">
        <h1 className="page-title">Осмотры</h1>
        <div className="page-controls">
          <div className="status-filter">
            <label>Статус:</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">любой</option>
              <option value="готово">готово</option>
              <option value="отменён">отменён</option>
              <option value="на доработке">на доработке</option>
              <option value="проверка">проверка</option>
            </select>
          </div>
          
          <div className="search-bar">
            <label>Поиск:</label>
            <div className="search-input">
              <input 
                type="text" 
                placeholder="тел., адрес, кад.М"
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
              />
            </div>
          </div>
          
          <button className="btn btn-secondary" onClick={() => refetch()}>
            <RefreshCw size={16} />
            Обновить
          </button>
        </div>
        
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} />
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/inspections/create')}>
            <Plus size={16} />
            Новый осмотр
            <ChevronDown size={16} />
          </button>
          <div className="total-count">146</div>
        </div>
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Номер осмотра</label>
              <input
                type="text"
                className="form-input"
                value={filters.internalNumber}
                onChange={(e) => handleFilterChange('internalNumber', e.target.value)}
                placeholder="Введите номер"
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
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Адрес</label>
              <input
                type="text"
                className="form-input"
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
                placeholder="Введите адрес"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Исполнитель</label>
              <input
                type="text"
                className="form-input"
                value={filters.inspector}
                onChange={(e) => handleFilterChange('inspector', e.target.value)}
                placeholder="Введите ФИО"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Дата с</label>
              <input
                type="date"
                className="form-input"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Дата по</label>
              <input
                type="date"
                className="form-input"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="filters-actions">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Очистить
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowFilters(false)}
            >
              Применить
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
                  <th>Создан</th>
                  <th>Отправлен</th>
                  <th>№</th>
                  <th>Исполнитель</th>
                  <th>Получатель</th>
                  <th>Статус</th>
                  <th>Тип</th>
                  <th>Объект</th>
                  <th>Фото</th>
                </tr>
              </thead>
              <tbody>
                {getDemoInspections().map((inspection: Inspection) => (
                  <tr key={inspection.id}>
                    <td className="date-cell">
                      {formatDateTime(inspection.created_at)}
                    </td>
                    <td className="date-cell">
                      {inspection.sent_at ? formatDateTime(inspection.sent_at) : '-'}
                    </td>
                    <td>
                      <div className="inspection-number">
                        {inspection.internal_number}
                      </div>
                    </td>
                    <td className="blurred">
                      <div className="user-cell">
                        <div className="user-avatar">
                          {inspection.inspector_name.charAt(0)}
                        </div>
                        <span>{inspection.inspector_name}</span>
                      </div>
                    </td>
                    <td className="blurred">
                      <div className="user-cell">
                        <div className="user-avatar">
                          {inspection.recipient_name.charAt(0)}
                        </div>
                        <span>{inspection.recipient_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status ${getStatusClass(inspection.status)}`}>
                        {inspection.status}
                      </span>
                    </td>
                    <td>
                      <div className="property-type">
                        {getPropertyTypeIcon(inspection.property_type)}
                        <span>{inspection.property_type}</span>
                      </div>
                    </td>
                    <td>
                      <div className="object-info">
                        <div className="object-type">
                          <span className="object-category">{inspection.object_type}</span>
                          <span className="object-description">{inspection.object_description}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="photo-count">
                        {inspection.photos_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data?.data.inspections.length === 0 && (
              <div className="empty-state">
                <h3>Осмотры не найдены</h3>
                <p>Попробуйте изменить фильтры или создать новый осмотр</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/inspections/create')}
                >
                  Создать осмотр
                </button>
              </div>
            )}

            {/* Пагинация */}
            {data?.data.pagination && data.data.pagination.pages > 1 && (
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
  );
};

export default Inspections;
