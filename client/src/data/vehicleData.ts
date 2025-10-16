// Справочные данные для транспортных средств

export const vehicleCategories = [
  'Легковой автомобиль',
  'Грузовой автомобиль',
  'Автобус',
  'Мотоцикл',
  'Прицеп',
  'Спецтехника',
  'Другое'
];

export const vehicleTypes = {
  'Легковой автомобиль': ['Седан', 'Хэтчбек', 'Универсал', 'Внедорожник', 'Купе', 'Кабриолет', 'Минивэн'],
  'Грузовой автомобиль': ['Бортовой', 'Фургон', 'Самосвал', 'Тягач', 'Цистерна', 'Рефрижератор'],
  'Автобус': ['Городской', 'Междугородний', 'Туристический', 'Микроавтобус', 'Школьный'],
  'Мотоцикл': ['Спортивный', 'Круизер', 'Туристический', 'Эндуро', 'Чоппер', 'Скутер'],
  'Прицеп': ['Легковой', 'Грузовой', 'Полуприцеп', 'Специальный'],
  'Спецтехника': ['Экскаватор', 'Бульдозер', 'Погрузчик', 'Кран', 'Каток', 'Другая'],
  'Другое': ['Другое']
};

export const vehicleMakes = [
  'Audi',
  'BMW',
  'Chevrolet',
  'Daewoo',
  'Ford',
  'GAZ',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Kia',
  'Lada',
  'Lexus',
  'Mazda',
  'Mercedes-Benz',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Renault',
  'Skoda',
  'Subaru',
  'Suzuki',
  'Toyota',
  'UAZ',
  'Volkswagen',
  'Volvo',
  'ВАЗ',
  'ГАЗ',
  'ЗИЛ',
  'КАМАЗ',
  'МАЗ',
  'УАЗ',
  'Другая'
];

export const vehicleModels: { [key: string]: string[] } = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'Другая'],
  'BMW': ['1 Series', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6', 'X7', 'Z4', 'Другая'],
  'Chevrolet': ['Aveo', 'Captiva', 'Cruze', 'Lacetti', 'Malibu', 'Niva', 'Orlando', 'Spark', 'Другая'],
  'Daewoo': ['Gentra', 'Matiz', 'Nexia', 'Другая'],
  'Ford': ['EcoSport', 'Explorer', 'Fiesta', 'Focus', 'Fusion', 'Kuga', 'Mondeo', 'Mustang', 'Ranger', 'Другая'],
  'GAZ': ['3110 Волга', '31105 Волга', '3302 Газель', '33023', 'Соболь', 'Next', 'Другая'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Fit', 'HR-V', 'Jazz', 'Pilot', 'Другая'],
  'Hyundai': ['Accent', 'Creta', 'Elantra', 'i30', 'Santa Fe', 'Solaris', 'Sonata', 'Tucson', 'Другая'],
  'Infiniti': ['FX', 'G', 'M', 'Q50', 'Q60', 'QX50', 'QX60', 'QX70', 'QX80', 'Другая'],
  'Kia': ['Carnival', 'Ceed', 'Cerato', 'Mohave', 'Optima', 'Picanto', 'Rio', 'Sorento', 'Sportage', 'Soul', 'Другая'],
  'Lada': ['Granta', 'Kalina', 'Largus', 'Niva', 'Priora', 'Vesta', 'XRAY', 'Другая'],
  'Lexus': ['ES', 'GS', 'IS', 'LS', 'LX', 'NX', 'RX', 'UX', 'Другая'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-5', 'CX-7', 'CX-9', 'MX-5', 'Другая'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLC', 'GLE', 'GLS', 'Sprinter', 'Vito', 'Другая'],
  'Mitsubishi': ['ASX', 'Eclipse Cross', 'L200', 'Lancer', 'Outlander', 'Pajero', 'Pajero Sport', 'Другая'],
  'Nissan': ['Almera', 'Juke', 'Murano', 'Navara', 'Note', 'Pathfinder', 'Qashqai', 'Sentra', 'Teana', 'Tiida', 'X-Trail', 'Другая'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Vectra', 'Zafira', 'Другая'],
  'Peugeot': ['206', '207', '208', '301', '308', '408', '508', '2008', '3008', '5008', 'Boxer', 'Partner', 'Другая'],
  'Renault': ['Arkana', 'Captur', 'Duster', 'Fluence', 'Kaptur', 'Koleos', 'Logan', 'Megane', 'Sandero', 'Другая'],
  'Skoda': ['Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Octavia', 'Rapid', 'Superb', 'Yeti', 'Другая'],
  'Subaru': ['Forester', 'Impreza', 'Legacy', 'Outback', 'XV', 'Другая'],
  'Suzuki': ['Grand Vitara', 'SX4', 'Swift', 'Vitara', 'Другая'],
  'Toyota': ['Camry', 'Corolla', 'Highlander', 'Land Cruiser', 'Prado', 'RAV4', 'Fortuner', 'Hilux', 'Prius', 'Yaris', 'Другая'],
  'UAZ': ['Hunter', 'Patriot', 'Pickup', 'Буханка', 'Другая'],
  'Volkswagen': ['Amarok', 'Beetle', 'Golf', 'Jetta', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'Transporter', 'Другая'],
  'Volvo': ['S60', 'S80', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'Другая'],
  'ВАЗ': ['2101', '2103', '2104', '2105', '2106', '2107', '2108', '2109', '21099', '2110', '2111', '2112', '2113', '2114', '2115', 'Другая'],
  'ГАЗ': ['3110 Волга', '31105 Волга', '3302 Газель', '33023', 'Соболь', 'Next', 'Другая'],
  'ЗИЛ': ['130', '131', '133', '157', '4331', 'Другая'],
  'КАМАЗ': ['4310', '5320', '6520', '65115', '65116', 'Другая'],
  'МАЗ': ['5336', '6303', '6422', 'Другая'],
  'УАЗ': ['Hunter', 'Patriot', 'Pickup', 'Буханка', 'Другая'],
  'Другая': ['Другая']
};

// Функция для валидации марки и модели
export const validateVehicleData = (make: string, model: string): boolean => {
  if (!make || !model) return false;
  if (!vehicleMakes.includes(make)) return false;
  if (vehicleModels[make] && !vehicleModels[make].includes(model)) return false;
  return true;
};

// Функция для получения типов по категории
export const getTypesByCategory = (category: string): string[] => {
  return vehicleTypes[category as keyof typeof vehicleTypes] || [];
};

// Функция для получения моделей по марке
export const getModelsByMake = (make: string): string[] => {
  return vehicleModels[make as keyof typeof vehicleModels] || [];
};

