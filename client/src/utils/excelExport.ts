import * as XLSX from 'xlsx';

interface InspectionForExport {
  id: number;
  internal_number?: string;
  status: string;
  address: string;
  inspector_name: string;
  recipient_name: string;
  created_at: string;
  sent_at?: string;
  property_type: string;
  object_type: string;
  object_description: string;
  photos_count: number;
  objects_count: number;
}

export const exportInspectionsToExcel = (inspections: InspectionForExport[], filename: string = 'Осмотры') => {
  // Подготовка данных для экспорта
  const data = inspections.map(inspection => ({
    '№': inspection.internal_number || inspection.id,
    'Статус': inspection.status,
    'Создан': new Date(inspection.created_at).toLocaleString('ru-RU'),
    'Отправлен': inspection.sent_at ? new Date(inspection.sent_at).toLocaleString('ru-RU') : '-',
    'Исполнитель': inspection.inspector_name,
    'Получатель': inspection.recipient_name,
    'Тип имущества': inspection.property_type,
    'Тип объекта': inspection.object_type,
    'Описание': inspection.object_description,
    'Адрес': inspection.address,
    'Кол-во объектов': inspection.objects_count,
    'Кол-во фото': inspection.photos_count,
  }));

  // Создание рабочей книги
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Осмотры');

  // Настройка ширины колонок
  const columnWidths = [
    { wch: 15 }, // №
    { wch: 12 }, // Статус
    { wch: 18 }, // Создан
    { wch: 18 }, // Отправлен
    { wch: 25 }, // Исполнитель
    { wch: 25 }, // Получатель
    { wch: 20 }, // Тип имущества
    { wch: 15 }, // Тип объекта
    { wch: 30 }, // Описание
    { wch: 40 }, // Адрес
    { wch: 12 }, // Кол-во объектов
    { wch: 12 }, // Кол-во фото
  ];
  worksheet['!cols'] = columnWidths;

  // Генерация файла
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
};

