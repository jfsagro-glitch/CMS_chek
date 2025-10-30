export interface PropertyAttribute {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface PropertyType {
  id: string;
  name: string;
  attributes: PropertyAttribute[];
}

export const PROPERTY_TYPES: PropertyType[] = [
  {
    id: 'real_estate',
    name: 'Недвижимость',
    attributes: [
      {
        key: 'cadastral_number',
        label: 'Кадастровый номер',
        type: 'text',
        required: true,
        placeholder: '77:01:0001001:1001',
        validation: {
          pattern: '^[0-9]{2}:[0-9]{2}:[0-9]{4}:[0-9]{4}$',
          message: 'Формат: XX:XX:XXXX:XXXX'
        }
      },
      {
        key: 'area',
        label: 'Площадь (м²)',
        type: 'number',
        required: true,
        placeholder: '100',
        validation: {
          min: 1,
          max: 100000,
          message: 'Площадь должна быть от 1 до 100000 м²'
        }
      },
      {
        key: 'floor',
        label: 'Этаж',
        type: 'number',
        required: false,
        placeholder: '5',
        validation: {
          min: -10,
          max: 200,
          message: 'Этаж должен быть от -10 до 200'
        }
      },
      {
        key: 'building_type',
        label: 'Тип здания',
        type: 'select',
        required: true,
        options: ['Жилой дом', 'Квартира', 'Офисное здание', 'Склад', 'Производственное здание', 'Торговое здание', 'Другое']
      },
      {
        key: 'construction_year',
        label: 'Год постройки',
        type: 'number',
        required: false,
        placeholder: '2020',
        validation: {
          min: 1800,
          max: new Date().getFullYear(),
          message: `Год должен быть от 1800 до ${new Date().getFullYear()}`
        }
      }
    ]
  },
  {
    id: 'vehicle',
    name: 'Транспортное средство',
    attributes: [
      {
        key: 'vin_number',
        label: 'VIN номер',
        type: 'text',
        required: true,
        placeholder: '1HGBH41JXMN109186',
        validation: {
          pattern: '^[A-HJ-NPR-Z0-9]{17}$',
          message: 'VIN должен содержать 17 символов'
        }
      },
      {
        key: 'license_plate',
        label: 'Госномер',
        type: 'text',
        required: true,
        placeholder: 'А123БВ77',
        validation: {
          pattern: '^[АВЕКМНОРСТУХ][0-9]{3}[АВЕКМНОРСТУХ]{2}[0-9]{2,3}$',
          message: 'Формат: А123БВ77'
        }
      },
      {
        key: 'year',
        label: 'Год выпуска',
        type: 'number',
        required: true,
        placeholder: '2020',
        validation: {
          min: 1900,
          max: new Date().getFullYear() + 1,
          message: `Год должен быть от 1900 до ${new Date().getFullYear() + 1}`
        }
      },
      {
        key: 'engine_volume',
        label: 'Объем двигателя (л)',
        type: 'number',
        required: false,
        placeholder: '2.0',
        validation: {
          min: 0.1,
          max: 20,
          message: 'Объем двигателя должен быть от 0.1 до 20 л'
        }
      },
      {
        key: 'vehicle_type',
        label: 'Тип ТС',
        type: 'select',
        required: true,
        options: ['Легковой автомобиль', 'Грузовой автомобиль', 'Автобус', 'Мотоцикл', 'Прицеп', 'Спецтехника', 'Другое']
      }
    ]
  },
  {
    id: 'equipment',
    name: 'Оборудование',
    attributes: [
      {
        key: 'serial_number',
        label: 'Серийный номер',
        type: 'text',
        required: true,
        placeholder: 'SN123456789',
        validation: {
          pattern: '^[A-Z0-9]{5,20}$',
          message: 'Серийный номер должен содержать 5-20 символов'
        }
      },
      {
        key: 'model',
        label: 'Модель',
        type: 'text',
        required: true,
        placeholder: 'iPhone 14 Pro',
        validation: {
          pattern: '^.{2,50}$',
          message: 'Модель должна содержать 2-50 символов'
        }
      },
      {
        key: 'manufacturer',
        label: 'Производитель',
        type: 'text',
        required: true,
        placeholder: 'Apple',
        validation: {
          pattern: '^.{2,30}$',
          message: 'Производитель должен содержать 2-30 символов'
        }
      },
      {
        key: 'purchase_date',
        label: 'Дата покупки',
        type: 'date',
        required: false
      },
      {
        key: 'warranty_until',
        label: 'Гарантия до',
        type: 'date',
        required: false
      },
      {
        key: 'equipment_type',
        label: 'Тип оборудования',
        type: 'select',
        required: true,
        options: ['Компьютерная техника', 'Офисная техника', 'Производственное оборудование', 'Медицинское оборудование', 'Строительное оборудование', 'Другое']
      }
    ]
  },
  {
    id: 'other',
    name: 'Прочее',
    attributes: [
      {
        key: 'description',
        label: 'Описание',
        type: 'text',
        required: true,
        placeholder: 'Подробное описание объекта',
        validation: {
          pattern: '^.{10,500}$',
          message: 'Описание должно содержать 10-500 символов'
        }
      },
      {
        key: 'condition',
        label: 'Состояние',
        type: 'select',
        required: true,
        options: ['Отличное', 'Хорошее', 'Удовлетворительное', 'Требует ремонта', 'Неисправное']
      },
      {
        key: 'estimated_value',
        label: 'Оценочная стоимость (руб.)',
        type: 'number',
        required: false,
        placeholder: '100000',
        validation: {
          min: 1,
          max: 1000000000,
          message: 'Стоимость должна быть от 1 до 1,000,000,000 руб.'
        }
      }
    ]
  }
];

export const getPropertyTypeById = (id: string): PropertyType | undefined => {
  return PROPERTY_TYPES.find(type => type.id === id);
};

export const getPropertyTypeAttributes = (typeId: string): PropertyAttribute[] => {
  const propertyType = getPropertyTypeById(typeId);
  return propertyType ? propertyType.attributes : [];
};
