// Данные для автомобилей

export const vehicleCategories = [
  'Легковой автомобиль',
  'Грузовой автомобиль',
  'Автобус',
  'Мотоцикл',
  'Прицеп',
  'Спецтехника'
];

export const vehicleTypes = [
  'Седан',
  'Хэтчбек',
  'Универсал',
  'Кроссовер',
  'Внедорожник',
  'Пикап',
  'Фургон',
  'Микроавтобус',
  'Минивэн',
  'Купе',
  'Кабриолет',
  'Лифтбек'
];

// Популярные марки автомобилей
export const vehicleMakes = [
  'Audi',
  'BMW',
  'Chevrolet',
  'Chery',
  'Citroen',
  'Daewoo',
  'Datsun',
  'Fiat',
  'Ford',
  'Geely',
  'Haval',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Kia',
  'Lada (ВАЗ)',
  'Land Rover',
  'Lexus',
  'Lifan',
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
  'Volkswagen',
  'Volvo',
  'ГАЗ',
  'УАЗ',
  'ЗАЗ',
  'Москвич'
];

// Модели для каждой марки (основные популярные модели)
export const vehicleModels: Record<string, string[]> = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4'],
  'Chevrolet': ['Aveo', 'Cruze', 'Lacetti', 'Malibu', 'Spark', 'Tahoe', 'Traverse', 'Trailblazer', 'Camaro', 'Corvette'],
  'Chery': ['Tiggo 2', 'Tiggo 3', 'Tiggo 4', 'Tiggo 5', 'Tiggo 7', 'Tiggo 8', 'Arrizo 6', 'Arrizo 7'],
  'Citroen': ['C3', 'C4', 'C5', 'C-Elysee', 'Berlingo', 'Jumper'],
  'Daewoo': ['Nexia', 'Matiz', 'Gentra', 'Lacetti'],
  'Datsun': ['on-DO', 'mi-DO'],
  'Fiat': ['500', 'Albea', 'Doblo', 'Ducato', 'Punto', 'Tipo'],
  'Ford': ['Fiesta', 'Focus', 'Fusion', 'Mondeo', 'Mustang', 'EcoSport', 'Kuga', 'Explorer', 'Transit'],
  'Geely': ['Atlas', 'Coolray', 'Emgrand', 'Monjaro', 'Tugella'],
  'Haval': ['F7', 'F7x', 'Jolion', 'H6', 'H9', 'Dargo'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'HR-V', 'Jazz', 'Pilot'],
  'Hyundai': ['Accent', 'Creta', 'Elantra', 'i30', 'Solaris', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade'],
  'Infiniti': ['Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX80'],
  'Kia': ['Rio', 'Ceed', 'Cerato', 'K5', 'Soul', 'Seltos', 'Sportage', 'Sorento'],
  'Lada (ВАЗ)': ['Granta', 'Vesta', 'Largus', 'Niva', 'Niva Travel', 'Niva Legend', 'XRAY'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  'Lexus': ['ES', 'IS', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX'],
  'Lifan': ['Solano', 'X50', 'X60', 'X70'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-9'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'CLA', 'CLS'],
  'Mitsubishi': ['Lancer', 'Outlander', 'Pajero', 'Pajero Sport', 'ASX', 'Eclipse Cross', 'L200'],
  'Nissan': ['Almera', 'Juke', 'Qashqai', 'X-Trail', 'Murano', 'Pathfinder', 'Terrano', 'Note', 'Sentra'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Zafira'],
  'Peugeot': ['206', '207', '208', '301', '308', '408', '508', '2008', '3008', '5008'],
  'Renault': ['Duster', 'Kaptur', 'Logan', 'Sandero', 'Arkana', 'Megane', 'Fluence', 'Koleos'],
  'Skoda': ['Fabia', 'Rapid', 'Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Kamiq'],
  'Subaru': ['Forester', 'Outback', 'XV', 'Impreza', 'Legacy', 'Ascent'],
  'Suzuki': ['Swift', 'SX4', 'Grand Vitara', 'Jimny', 'Vitara'],
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Highlander', 'Prius', 'Yaris', 'Fortuner', 'Hilux', 'C-HR'],
  'Volkswagen': ['Polo', 'Golf', 'Jetta', 'Passat', 'Tiguan', 'Touareg', 'Teramont', 'Arteon', 'T-Roc'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
  'ГАЗ': ['Волга', 'Соболь', 'Газель', 'Газель Next', 'Валдай'],
  'УАЗ': ['Патриот', 'Хантер', 'Пикап', 'Профи', 'Буханка'],
  'ЗАЗ': ['Chance', 'Forza', 'Vida'],
  'Москвич': ['3', '6', '412', '2141']
};

// Функция для получения моделей по марке
export const getModelsByMake = (make: string): string[] => {
  return vehicleModels[make] || [];
};

