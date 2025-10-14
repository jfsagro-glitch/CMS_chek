#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Запуск CMS Check...\n');

// Проверяем наличие .env файла
if (!fs.existsSync('.env')) {
  console.log('⚠️  Файл .env не найден. Скопируйте env.example в .env и настройте переменные окружения.');
  console.log('   cp env.example .env\n');
  process.exit(1);
}

// Проверяем наличие node_modules
if (!fs.existsSync('node_modules')) {
  console.log('📦 Установка зависимостей сервера...');
  const installServer = spawn('npm', ['install'], { stdio: 'inherit' });
  
  installServer.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Ошибка установки зависимостей сервера');
      process.exit(1);
    }
    
    checkClientDependencies();
  });
} else {
  checkClientDependencies();
}

function checkClientDependencies() {
  const clientPath = path.join(__dirname, 'client');
  
  if (!fs.existsSync(path.join(clientPath, 'node_modules'))) {
    console.log('📦 Установка зависимостей клиента...');
    const installClient = spawn('npm', ['install'], { 
      cwd: clientPath, 
      stdio: 'inherit' 
    });
    
    installClient.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Ошибка установки зависимостей клиента');
        process.exit(1);
      }
      
      startApplication();
    });
  } else {
    startApplication();
  }
}

function startApplication() {
  console.log('🎯 Запуск приложения...\n');
  
  // Запускаем сервер и клиент одновременно
  const server = spawn('npm', ['run', 'server'], { 
    stdio: 'inherit',
    shell: true
  });
  
  const client = spawn('npm', ['start'], { 
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });
  
  // Обработка завершения процессов
  server.on('close', (code) => {
    console.log(`\n🛑 Сервер завершен с кодом ${code}`);
    client.kill();
  });
  
  client.on('close', (code) => {
    console.log(`\n🛑 Клиент завершен с кодом ${code}`);
    server.kill();
  });
  
  // Обработка сигналов завершения
  process.on('SIGINT', () => {
    console.log('\n🛑 Остановка приложения...');
    server.kill();
    client.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Остановка приложения...');
    server.kill();
    client.kill();
    process.exit(0);
  });
}
