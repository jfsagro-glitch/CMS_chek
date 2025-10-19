// Характеристики объектов по типам имущества

export interface ObjectCharacteristic {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export const objectCharacteristics: Record<string, ObjectCharacteristic[]> = {
  'Недвижимость': [
    {
      id: 'cadastral_number',
      name: 'Кадастровый номер',
      type: 'text',
      required: true,
      placeholder: '77:01:0001001:1001'
    },
    {
      id: 'object_type',
      name: 'Тип объекта',
      type: 'select',
      required: true,
      options: ['Жилой дом', 'Квартира', 'Коммерческое помещение', 'Земельный участок', 'Гараж']
    },
    {
      id: 'purpose',
      name: 'Назначение',
      type: 'select',
      required: true,
      options: ['Жилое', 'Коммерческое', 'Производственное', 'Складское', 'Офисное']
    },
    {
      id: 'area',
      name: 'Площадь (м²)',
      type: 'number',
      required: true,
      placeholder: '50'
    },
    {
      id: 'floors',
      name: 'Этажность',
      type: 'number',
      required: false,
      placeholder: '2'
    }
  ],
  'Автотранспорт': [
    {
      id: 'vin',
      name: 'VIN номер',
      type: 'text',
      required: true,
      placeholder: '1HGBH41JXMN109186'
    },
    {
      id: 'registration_number',
      name: 'Гос. номер',
      type: 'text',
      required: true,
      placeholder: 'А123БВ77'
    },
    {
      id: 'year',
      name: 'Год выпуска',
      type: 'number',
      required: true,
      placeholder: '2020'
    },
    {
      id: 'engine_volume',
      name: 'Объем двигателя (л)',
      type: 'number',
      required: false,
      placeholder: '2.0'
    },
    {
      id: 'mileage',
      name: 'Пробег (км)',
      type: 'number',
      required: false,
      placeholder: '50000'
    }
  ],
  'Оборудование': [
    {
      id: 'serial_number',
      name: 'Серийный номер',
      type: 'text',
      required: true,
      placeholder: 'SN123456789'
    },
    {
      id: 'model',
      name: 'Модель',
      type: 'text',
      required: true,
      placeholder: 'Модель оборудования'
    },
    {
      id: 'manufacturer',
      name: 'Производитель',
      type: 'text',
      required: true,
      placeholder: 'Название производителя'
    },
    {
      id: 'year_manufactured',
      name: 'Год производства',
      type: 'number',
      required: false,
      placeholder: '2020'
    },
    {
      id: 'condition',
      name: 'Состояние',
      type: 'select',
      required: true,
      options: ['Отличное', 'Хорошее', 'Удовлетворительное', 'Требует ремонта', 'Неисправное']
    }
  ],
  'Ценные бумаги': [
    {
      id: 'security_type',
      name: 'Тип ценной бумаги',
      type: 'select',
      required: true,
      options: ['Акция', 'Облигация', 'Вексель', 'Сертификат', 'Депозитарная расписка']
    },
    {
      id: 'issuer',
      name: 'Эмитент',
      type: 'text',
      required: true,
      placeholder: 'Название эмитента'
    },
    {
      id: 'nominal_value',
      name: 'Номинальная стоимость',
      type: 'number',
      required: true,
      placeholder: '1000'
    },
    {
      id: 'quantity',
      name: 'Количество',
      type: 'number',
      required: true,
      placeholder: '100'
    },
    {
      id: 'issue_date',
      name: 'Дата выпуска',
      type: 'text',
      required: false,
      placeholder: '2020-01-01'
    }
  ]
};

export const getCharacteristicsForPropertyType = (propertyType: string): ObjectCharacteristic[] => {
  return objectCharacteristics[propertyType] || [];
};
