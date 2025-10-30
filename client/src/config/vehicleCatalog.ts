export interface VehicleModel {
  id: string;
  name: string;
  yearFrom?: number;
  yearTo?: number;
  bodyTypes?: string[];
}

export interface VehicleMake {
  id: string;
  name: string;
  country?: string;
  models: VehicleModel[];
}

// Базовый справочник автомобилей
export const VEHICLE_MAKES: VehicleMake[] = [
  // Россия
  {
    id: 'lada',
    name: 'LADA',
    country: 'Россия',
    models: [
      { id: 'granta', name: 'Granta' },
      { id: 'vesta', name: 'Vesta' },
      { id: 'niva', name: 'Niva' }
    ]
  },
  {
    id: 'uaz',
    name: 'УАЗ',
    country: 'Россия',
    models: [
      { id: 'patriot', name: 'Patriot' },
      { id: 'hunter', name: 'Hunter' }
    ]
  },
  {
    id: 'gaz',
    name: 'ГАЗ',
    country: 'Россия',
    models: [
      { id: 'gazelle-next', name: 'ГАЗель NEXT' },
      { id: 'sobol', name: 'Соболь' }
    ]
  },
  {
    id: 'toyota',
    name: 'Toyota',
    country: 'Япония',
    models: [
      { id: 'camry', name: 'Camry', yearFrom: 2018, bodyTypes: ['Седан'] },
      { id: 'rav4', name: 'RAV4', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'corolla', name: 'Corolla', yearFrom: 2019, bodyTypes: ['Седан', 'Хэтчбек'] },
      { id: 'highlander', name: 'Highlander', yearFrom: 2020, bodyTypes: ['Кроссовер'] },
      { id: 'prius', name: 'Prius', yearFrom: 2019, bodyTypes: ['Хэтчбек'] }
    ]
  },
  // Корея
  {
    id: 'genesis',
    name: 'Genesis',
    country: 'Южная Корея',
    models: [
      { id: 'g70', name: 'G70' },
      { id: 'g80', name: 'G80' },
      { id: 'gv70', name: 'GV70' }
    ]
  },
  // Китай
  {
    id: 'chery',
    name: 'Chery',
    country: 'Китай',
    models: [
      { id: 'tiggo-4', name: 'Tiggo 4' },
      { id: 'tiggo-7', name: 'Tiggo 7' },
      { id: 'tiggo-8', name: 'Tiggo 8' }
    ]
  },
  {
    id: 'geely',
    name: 'Geely',
    country: 'Китай',
    models: [
      { id: 'coolray', name: 'Coolray' },
      { id: 'atlas-pro', name: 'Atlas Pro' },
      { id: 'monjaro', name: 'Monjaro' }
    ]
  },
  {
    id: 'haval',
    name: 'Haval',
    country: 'Китай',
    models: [
      { id: 'jolion', name: 'Jolion' },
      { id: 'f7', name: 'F7' },
      { id: 'dargo', name: 'Dargo' }
    ]
  },
  {
    id: 'byd',
    name: 'BYD',
    country: 'Китай',
    models: [
      { id: 'atto-3', name: 'Atto 3' },
      { id: 'tang', name: 'Tang' }
    ]
  },
  {
    id: 'great-wall',
    name: 'Great Wall',
    country: 'Китай',
    models: [
      { id: 'poer', name: 'Poer' }
    ]
  },
  {
    id: 'changan',
    name: 'Changan',
    country: 'Китай',
    models: [
      { id: 'cs35-plus', name: 'CS35 Plus' },
      { id: 'cs55', name: 'CS55' }
    ]
  },
  {
    id: 'exeed',
    name: 'EXEED',
    country: 'Китай',
    models: [
      { id: 'txl', name: 'TXL' },
      { id: 'vx', name: 'VX' }
    ]
  },
  {
    id: 'faw',
    name: 'FAW',
    country: 'Китай',
    models: [
      { id: 'bestune-t77', name: 'Bestune T77' }
    ]
  },
  {
    id: 'jac',
    name: 'JAC',
    country: 'Китай',
    models: [
      { id: 'j7', name: 'J7' },
      { id: 's3', name: 'S3' }
    ]
  },
  {
    id: 'bmw',
    name: 'BMW',
    country: 'Германия',
    models: [
      { id: 'x5', name: 'X5', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'x3', name: 'X3', yearFrom: 2018, bodyTypes: ['Кроссовер'] },
      { id: '3-series', name: '3 Series', yearFrom: 2019, bodyTypes: ['Седан', 'Универсал'] },
      { id: '5-series', name: '5 Series', yearFrom: 2017, bodyTypes: ['Седан'] },
      { id: 'i3', name: 'i3', yearFrom: 2018, bodyTypes: ['Хэтчбек'] }
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    country: 'Германия',
    models: [
      { id: 'c-class', name: 'C-Class', yearFrom: 2021, bodyTypes: ['Седан', 'Универсал'] },
      { id: 'e-class', name: 'E-Class', yearFrom: 2020, bodyTypes: ['Седан', 'Универсал'] },
      { id: 's-class', name: 'S-Class', yearFrom: 2020, bodyTypes: ['Седан'] },
      { id: 'gle', name: 'GLE', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'glc', name: 'GLC', yearFrom: 2019, bodyTypes: ['Кроссовер'] }
    ]
  },
  {
    id: 'audi',
    name: 'Audi',
    country: 'Германия',
    models: [
      { id: 'a4', name: 'A4', yearFrom: 2019, bodyTypes: ['Седан', 'Универсал'] },
      { id: 'a6', name: 'A6', yearFrom: 2018, bodyTypes: ['Седан', 'Универсал'] },
      { id: 'q5', name: 'Q5', yearFrom: 2018, bodyTypes: ['Кроссовер'] },
      { id: 'q7', name: 'Q7', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'e-tron', name: 'e-tron', yearFrom: 2019, bodyTypes: ['Кроссовер'] }
    ]
  },
  {
    id: 'volkswagen',
    name: 'Volkswagen',
    country: 'Германия',
    models: [
      { id: 'golf', name: 'Golf', yearFrom: 2019, bodyTypes: ['Хэтчбек'] },
      { id: 'passat', name: 'Passat', yearFrom: 2019, bodyTypes: ['Седан', 'Универсал'] },
      { id: 'tiguan', name: 'Tiguan', yearFrom: 2018, bodyTypes: ['Кроссовер'] },
      { id: 'touareg', name: 'Touareg', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'id4', name: 'ID.4', yearFrom: 2021, bodyTypes: ['Кроссовер'] }
    ]
  },
  {
    id: 'hyundai',
    name: 'Hyundai',
    country: 'Южная Корея',
    models: [
      { id: 'solaris', name: 'Solaris', yearFrom: 2017, bodyTypes: ['Седан'] },
      { id: 'elantra', name: 'Elantra', yearFrom: 2020, bodyTypes: ['Седан'] },
      { id: 'tucson', name: 'Tucson', yearFrom: 2018, bodyTypes: ['Кроссовер'] },
      { id: 'santa-fe', name: 'Santa Fe', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'kona', name: 'Kona', yearFrom: 2018, bodyTypes: ['Кроссовер'] }
    ]
  },
  {
    id: 'kia',
    name: 'KIA',
    country: 'Южная Корея',
    models: [
      { id: 'rio', name: 'Rio', yearFrom: 2017, bodyTypes: ['Седан', 'Хэтчбек'] },
      { id: 'cerato', name: 'Cerato', yearFrom: 2019, bodyTypes: ['Седан'] },
      { id: 'sportage', name: 'Sportage', yearFrom: 2018, bodyTypes: ['Кроссовер'] },
      { id: 'sorento', name: 'Sorento', yearFrom: 2020, bodyTypes: ['Кроссовер'] },
      { id: 'niro', name: 'Niro', yearFrom: 2019, bodyTypes: ['Кроссовер'] }
    ]
  },
  {
    id: 'nissan',
    name: 'Nissan',
    country: 'Япония',
    models: [
      { id: 'qashqai', name: 'Qashqai', yearFrom: 2018, bodyTypes: ['Кроссовер'] },
      { id: 'x-trail', name: 'X-Trail', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'murano', name: 'Murano', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'leaf', name: 'Leaf', yearFrom: 2018, bodyTypes: ['Хэтчбек'] },
      { id: 'patrol', name: 'Patrol', yearFrom: 2017, bodyTypes: ['Внедорожник'] }
    ]
  },
  {
    id: 'honda',
    name: 'Honda',
    country: 'Япония',
    models: [
      { id: 'civic', name: 'Civic', yearFrom: 2019, bodyTypes: ['Седан', 'Хэтчбек'] },
      { id: 'accord', name: 'Accord', yearFrom: 2018, bodyTypes: ['Седан'] },
      { id: 'cr-v', name: 'CR-V', yearFrom: 2018, bodyTypes: ['Кроссовер'] },
      { id: 'pilot', name: 'Pilot', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'fit', name: 'Fit', yearFrom: 2018, bodyTypes: ['Хэтчбек'] }
    ]
  },
  {
    id: 'mazda',
    name: 'Mazda',
    country: 'Япония',
    models: [
      { id: 'cx-5', name: 'CX-5', yearFrom: 2017, bodyTypes: ['Кроссовер'] },
      { id: 'cx-9', name: 'CX-9', yearFrom: 2019, bodyTypes: ['Кроссовер'] },
      { id: 'mazda3', name: 'Mazda3', yearFrom: 2019, bodyTypes: ['Седан', 'Хэтчбек'] },
      { id: 'mazda6', name: 'Mazda6', yearFrom: 2018, bodyTypes: ['Седан'] },
      { id: 'mx-5', name: 'MX-5', yearFrom: 2016, bodyTypes: ['Кабриолет'] }
    ]
  }
];

// Функции для работы со справочником
export const getVehicleMakes = (): VehicleMake[] => {
  return VEHICLE_MAKES;
};

export const getVehicleMakeById = (id: string): VehicleMake | undefined => {
  return VEHICLE_MAKES.find(make => make.id === id);
};

export const getVehicleModelsByMakeId = (makeId: string): VehicleModel[] => {
  const make = getVehicleMakeById(makeId);
  return make ? make.models : [];
};

export const getVehicleModelById = (makeId: string, modelId: string): VehicleModel | undefined => {
  const make = getVehicleMakeById(makeId);
  if (!make) return undefined;
  return make.models.find(model => model.id === modelId);
};

// Функции для добавления новых марок и моделей
export const addVehicleMake = (make: Omit<VehicleMake, 'id'>): VehicleMake => {
  const newMake: VehicleMake = {
    ...make,
    id: make.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  };
  VEHICLE_MAKES.push(newMake);
  return newMake;
};

export const addVehicleModel = (makeId: string, model: Omit<VehicleModel, 'id'>): VehicleModel | null => {
  const make = getVehicleMakeById(makeId);
  if (!make) return null;
  
  const newModel: VehicleModel = {
    ...model,
    id: model.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  };
  
  make.models.push(newModel);
  return newModel;
};

// Функция для поиска марок и моделей
export const searchVehicleMakes = (query: string): VehicleMake[] => {
  const lowerQuery = query.toLowerCase();
  return VEHICLE_MAKES.filter(make => 
    make.name.toLowerCase().includes(lowerQuery) ||
    make.country?.toLowerCase().includes(lowerQuery)
  );
};

export const searchVehicleModels = (makeId: string, query: string): VehicleModel[] => {
  const models = getVehicleModelsByMakeId(makeId);
  const lowerQuery = query.toLowerCase();
  return models.filter(model => 
    model.name.toLowerCase().includes(lowerQuery)
  );
};

// Типы кузова
export const BODY_TYPES = [
  'Седан',
  'Хэтчбек',
  'Универсал',
  'Кроссовер',
  'Внедорожник',
  'Кабриолет',
  'Купе',
  'Минивэн',
  'Пикап',
  'Фургон'
];
