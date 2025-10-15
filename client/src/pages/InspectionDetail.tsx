import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import toast from 'react-hot-toast';
import './InspectionDetail.css';

const InspectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  const { data: inspection, isLoading, error } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => inspectionsApi.getInspection(Number(id)),
    enabled: !!id,
  });

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
    mutationFn: () => inspectionsApi.duplicateInspection(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Осмотр дублирован');
      navigate('/inspections');
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

  const inspectionData = inspection.data.inspection;
  const objects = inspection.data.objects;
  const photos = inspection.data.photos;
  const statusHistory = inspection.data.statusHistory;

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
            {objects.map((object: any) => (
              <div key={object.id} className="object-card">
                <div className="object-header">
                  <h3>{object.make} {object.model}</h3>
                  <span className="object-category">{object.category}</span>
                </div>
                
                <div className="object-details">
                  {object.registration_number && (
                    <div className="detail-item">
                      <label>Рег. номер:</label>
                      <span>{object.registration_number}</span>
                    </div>
                  )}
                  
                  {object.vin && (
                    <div className="detail-item">
                      <label>VIN:</label>
                      <span>{object.vin}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <label>Тип:</label>
                    <span>{object.type}</span>
                  </div>
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
            ))}
          </div>
        </div>

        {/* История статусов */}
        {statusHistory.length > 0 && (
          <div className="status-history">
            <h2>История изменений</h2>
            <div className="timeline">
              {statusHistory.map((entry: any, index: number) => (
                <div key={entry.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="status-change">
                        {entry.old_status ? `${entry.old_status} → ` : ''}{entry.new_status}
                      </span>
                      <span className="timeline-date">{formatDate(entry.created_at)}</span>
                    </div>
                    {entry.changed_by_name && (
                      <p className="timeline-user">Изменено: {entry.changed_by_name}</p>
                    )}
                    {entry.comment && (
                      <p className="timeline-comment">{entry.comment}</p>
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
