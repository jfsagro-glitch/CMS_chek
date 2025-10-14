#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('🗄️  Инициализация базы данных CMS Check...\n');

  // Подключение к PostgreSQL
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Подключаемся к системной БД для создания нашей БД
  });

  try {
    // Проверяем, существует ли база данных
    const dbCheck = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'cms_check']
    );

    if (dbCheck.rows.length === 0) {
      console.log('📝 Создание базы данных...');
      await pool.query(`CREATE DATABASE ${process.env.DB_NAME || 'cms_check'}`);
      console.log('✅ База данных создана');
    } else {
      console.log('✅ База данных уже существует');
    }

    // Подключаемся к нашей базе данных
    const appPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'cms_check',
    });

    // Читаем и выполняем схему
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Выполнение схемы базы данных...');
    await appPool.query(schema);
    console.log('✅ Схема базы данных создана');

    // Создаем первого администратора
    const bcrypt = require('bcryptjs');
    const adminEmail = 'admin@cms.local';
    const adminPassword = 'admin123';
    
    // Проверяем, существует ли администратор
    const adminCheck = await appPool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (adminCheck.rows.length === 0) {
      console.log('👤 Создание администратора по умолчанию...');
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await appPool.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminEmail, passwordHash, 'Администратор системы', 'admin', true]
      );
      
      console.log('✅ Администратор создан');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Пароль: ${adminPassword}`);
      console.log('   ⚠️  Смените пароль после первого входа!');
    } else {
      console.log('✅ Администратор уже существует');
    }

    console.log('\n🎉 Инициализация завершена успешно!');
    console.log('\n📋 Следующие шаги:');
    console.log('   1. Настройте переменные окружения в .env');
    console.log('   2. Запустите приложение: npm run dev');
    console.log('   3. Откройте http://localhost:3000');
    console.log('   4. Войдите как администратор');

  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Запуск инициализации
if (require.main === module) {
  initDatabase().catch(console.error);
}

module.exports = { initDatabase };
