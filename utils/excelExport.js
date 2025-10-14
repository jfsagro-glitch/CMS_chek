const ExcelJS = require('exceljs');

const exportInspectionsToExcel = async (inspections, filters = {}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Осмотры');

  // Настройка колонок
  worksheet.columns = [
    { header: '№', key: 'id', width: 10 },
    { header: 'Внутренний №', key: 'internal_number', width: 15 },
    { header: 'Статус', key: 'status', width: 15 },
    { header: 'Тип имущества', key: 'property_type', width: 20 },
    { header: 'Адрес', key: 'address', width: 40 },
    { header: 'Исполнитель', key: 'inspector_name', width: 25 },
    { header: 'Телефон', key: 'inspector_phone', width: 15 },
    { header: 'Email', key: 'inspector_email', width: 25 },
    { header: 'Объектов', key: 'objects_count', width: 10 },
    { header: 'Фото', key: 'photos_count', width: 10 },
    { header: 'Создан', key: 'created_at', width: 15 },
    { header: 'Обновлен', key: 'updated_at', width: 15 },
    { header: 'Комментарий', key: 'comment', width: 30 }
  ];

  // Стилизация заголовков
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Добавление данных
  inspections.forEach(inspection => {
    worksheet.addRow({
      id: inspection.id,
      internal_number: inspection.internal_number || '',
      status: inspection.status,
      property_type: inspection.property_type,
      address: inspection.address,
      inspector_name: inspection.inspector_name,
      inspector_phone: inspection.inspector_phone,
      inspector_email: inspection.inspector_email || '',
      objects_count: inspection.objects_count || 0,
      photos_count: inspection.photos_count || 0,
      created_at: new Date(inspection.created_at).toLocaleDateString('ru-RU'),
      updated_at: new Date(inspection.updated_at).toLocaleDateString('ru-RU'),
      comment: inspection.comment || ''
    });
  });

  // Автофильтр
  worksheet.autoFilter = {
    from: 'A1',
    to: 'M1'
  };

  // Заморозка первой строки
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  return workbook;
};

const exportInspectionDetailsToExcel = async (inspection, objects, photos) => {
  const workbook = new ExcelJS.Workbook();
  
  // Лист с основной информацией
  const mainSheet = workbook.addWorksheet('Основная информация');
  
  mainSheet.columns = [
    { header: 'Поле', key: 'field', width: 20 },
    { header: 'Значение', key: 'value', width: 40 }
  ];

  mainSheet.addRow({ field: 'ID осмотра', value: inspection.id });
  mainSheet.addRow({ field: 'Внутренний №', value: inspection.internal_number || '' });
  mainSheet.addRow({ field: 'Статус', value: inspection.status });
  mainSheet.addRow({ field: 'Тип имущества', value: inspection.property_type });
  mainSheet.addRow({ field: 'Адрес', value: inspection.address });
  mainSheet.addRow({ field: 'Исполнитель', value: inspection.inspector_name });
  mainSheet.addRow({ field: 'Телефон', value: inspection.inspector_phone });
  mainSheet.addRow({ field: 'Email', value: inspection.inspector_email || '' });
  mainSheet.addRow({ field: 'Создан', value: new Date(inspection.created_at).toLocaleString('ru-RU') });
  mainSheet.addRow({ field: 'Обновлен', value: new Date(inspection.updated_at).toLocaleString('ru-RU') });
  mainSheet.addRow({ field: 'Комментарий', value: inspection.comment || '' });

  // Лист с объектами
  if (objects.length > 0) {
    const objectsSheet = workbook.addWorksheet('Объекты осмотра');
    
    objectsSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'VIN', key: 'vin', width: 20 },
      { header: 'Рег. номер', key: 'registration_number', width: 15 },
      { header: 'Категория', key: 'category', width: 20 },
      { header: 'Тип', key: 'type', width: 15 },
      { header: 'Марка', key: 'make', width: 15 },
      { header: 'Модель', key: 'model', width: 15 }
    ];

    objects.forEach(object => {
      objectsSheet.addRow({
        id: object.id,
        vin: object.vin || '',
        registration_number: object.registration_number || '',
        category: object.category,
        type: object.type,
        make: object.make,
        model: object.model
      });
    });
  }

  // Лист с фотографиями
  if (photos.length > 0) {
    const photosSheet = workbook.addWorksheet('Фотографии');
    
    photosSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Объект', key: 'object_info', width: 25 },
      { header: 'Файл', key: 'filename', width: 30 },
      { header: 'Размер (KB)', key: 'file_size', width: 15 },
      { header: 'Широта', key: 'latitude', width: 15 },
      { header: 'Долгота', key: 'longitude', width: 15 },
      { header: 'Снято', key: 'taken_at', width: 20 },
      { header: 'Загружено', key: 'uploaded_at', width: 20 }
    ];

    photos.forEach(photo => {
      photosSheet.addRow({
        id: photo.id,
        object_info: `${photo.make || ''} ${photo.model || ''}`.trim() || 'Неизвестно',
        filename: photo.filename,
        file_size: photo.file_size ? Math.round(photo.file_size / 1024) : '',
        latitude: photo.latitude || '',
        longitude: photo.longitude || '',
        taken_at: photo.taken_at ? new Date(photo.taken_at).toLocaleString('ru-RU') : '',
        uploaded_at: photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleString('ru-RU') : ''
      });
    });
  }

  return workbook;
};

module.exports = {
  exportInspectionsToExcel,
  exportInspectionDetailsToExcel
};
