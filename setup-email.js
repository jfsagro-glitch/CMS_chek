const fs = require('fs');
const path = require('path');

console.log('📧 Настройка email для отправки уведомлений с cmsauto@bk.ru\n');

// Читаем существующий .env если есть
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Файл .env найден, обновляю настройки email...\n');
} else {
  console.log('📝 Создаю новый файл .env...\n');
}

// Настройки для cmsauto@bk.ru
// Пароль берется из User Secrets (секрет "bk") или из EMAIL_PASS
const emailSettings = {
  'EMAIL_HOST': 'smtp.mail.ru',
  'EMAIL_PORT': '465',
  'EMAIL_USER': 'cmsauto@bk.ru',
  'EMAIL_PASS': process.env.bk || process.env.EMAIL_PASS || '',
  'CLIENT_URL': 'https://jfsagro-glitch.github.io/CMS_chek'
};

// Функция для обновления или добавления переменной
function updateEnvVar(key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `${key}=${value}\n`;
  }
}

// Обновляем настройки email
console.log('Настраиваю переменные окружения для email:\n');
const passwordValue = emailSettings['EMAIL_PASS'];
const hasPassword = passwordValue && passwordValue.length > 0;

for (const [key, value] of Object.entries(emailSettings)) {
  if (key === 'EMAIL_PASS' && !hasPassword) {
    // Если пароль не найден в секретах, оставляем комментарий о использовании секрета bk
    updateEnvVar(key, '');
    // Добавляем комментарий вместо пароля
    if (!envContent.includes('# Пароль берется из User Secrets')) {
      envContent = envContent.replace(/^EMAIL_PASS=.*$/m, '# Пароль берется из User Secrets (секрет "bk")\n# EMAIL_PASS=\n# Или используйте секрет напрямую: bk=<пароль>');
    }
    console.log(`  ✓ ${key}=***[ИСПОЛЬЗУЕТСЯ ИЗ СЕКРЕТА "bk"]***`);
  } else {
    updateEnvVar(key, value);
    if (key === 'EMAIL_PASS') {
      console.log(`  ✓ ${key}=***[НАЙДЕН В СЕКРЕТАХ]***`);
    } else {
      console.log(`  ✓ ${key}=${value}`);
    }
  }
}

// Добавляем базовые настройки если файл новый
if (!fs.existsSync(envPath)) {
  envContent = `# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_check
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_this
JWT_EXPIRES_IN=24h

# Email (Nodemailer) - Mail.ru (bk.ru)
# ВАЖНО: Замените YOUR_PASSWORD_HERE на реальный пароль от почты cmsauto@bk.ru
# Для получения пароля: https://e.mail.ru/settings/security -> Пароли для внешних приложений
EMAIL_HOST=smtp.mail.ru
EMAIL_PORT=465
EMAIL_USER=cmsauto@bk.ru
EMAIL_PASS=YOUR_PASSWORD_HERE

# Альтернативно: для Azure User Secrets используйте:
# bk=YOUR_PASSWORD_HERE
# (система автоматически использует секрет "bk" если EMAIL_PASS не задан)

# SMS (Twilio) - опционально
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Client URL (для ссылок в письмах)
CLIENT_URL=https://jfsagro-glitch.github.io/CMS_chek

# Node Environment
NODE_ENV=development
`;
}

// Записываем обновленный файл
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('\n✅ Файл .env настроен!\n');

if (!hasPassword) {
  console.log('ℹ️  Пароль будет использоваться из User Secrets (секрет "bk")');
  console.log('   Если секрет "bk" не настроен, настройте его в Azure/Railway/Render\n');
} else {
  console.log('✅ Пароль найден и настроен!\n');
}

console.log('📖 Подробная инструкция: см. MAILRU_SETUP.md\n');

