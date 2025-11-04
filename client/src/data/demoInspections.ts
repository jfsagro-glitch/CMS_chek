// Демо-данные для осмотров (используются когда реальные данные недоступны)

export interface DemoInspection {
  id: number;
  internal_number: string;
  status: string;
  property_type: string;
  address: string;
  latitude: number;
  longitude: number;
  inspector_name: string;
  inspector_phone: string;
  inspector_email: string;
  recipient_name: string;
  created_at: string;
  sent_at?: string;
  completed_at?: string;
  comment: string;
  created_by_name: string;
  objects: Array<{
    id: number;
    vin?: string;
    registration_number?: string;
    category?: string;
    type?: string;
    make?: string;
    model?: string;
    photos_count: number;
  }>;
  status_history: Array<{
    id: number;
    status: string;
    comment: string;
    created_at: string;
    created_by: string;
  }>;
}

export const DEMO_INSPECTIONS: DemoInspection[] = [
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

export const getDemoInspectionDetail = (inspectionId: string): DemoInspection => {
  const inspection = DEMO_INSPECTIONS.find(ins => ins.id === Number(inspectionId));
  return inspection || DEMO_INSPECTIONS[0];
};

