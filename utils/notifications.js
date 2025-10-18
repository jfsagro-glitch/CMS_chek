const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Настройка email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Настройка SMS
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.log('Twilio не настроен:', error.message);
  }
}

// Отправка SMS
const sendSMS = async (phone, message) => {
  try {
    if (!twilioClient || !process.env.TWILIO_ACCOUNT_SID) {
      console.log('SMS не настроен. Сообщение:', message);
      return;
    }

    // Добавляем timeout чтобы не зависать
    const sendPromise = twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    await Promise.race([
      sendPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMS timeout')), 5000))
    ]);

    console.log('SMS отправлено на номер:', phone);
  } catch (error) {
    console.error('Ошибка отправки SMS:', error.message);
    // НЕ бросаем ошибку дальше, чтобы не блокировать создание осмотра
  }
};

// Отправка email
const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log('Email не настроен. Сообщение:', text);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    };

    // Добавляем timeout чтобы не зависать
    const sendPromise = transporter.sendMail(mailOptions);
    
    await Promise.race([
      sendPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 5000))
    ]);

    console.log('Email отправлен на:', to);
  } catch (error) {
    console.error('Ошибка отправки email:', error.message);
    // НЕ бросаем ошибку дальше, чтобы не блокировать создание осмотра
  }
};

// Отправка уведомления о новом осмотре
const sendInspectionNotification = async (inspection) => {
  const { inspector_phone, inspector_email, id, address } = inspection;
  
  const message = `Новый осмотр #${id} назначен на адрес: ${address}. Ссылка для доступа: ${process.env.CLIENT_URL}/inspection/${id}`;
  
  // Отправляем SMS
  if (inspector_phone) {
    await sendSMS(inspector_phone, message);
  }
  
  // Отправляем email
  if (inspector_email) {
    const html = `
      <h2>Новый осмотр назначен</h2>
      <p><strong>Номер осмотра:</strong> #${id}</p>
      <p><strong>Адрес:</strong> ${address}</p>
      <p><strong>Ссылка для доступа:</strong> <a href="${process.env.CLIENT_URL}/inspection/${id}">Перейти к осмотру</a></p>
    `;
    
    await sendEmail(inspector_email, 'Новый осмотр назначен', message, html);
  }
};

// Отправка уведомления о смене статуса
const sendStatusChangeNotification = async (inspection, newStatus, comment = null) => {
  const { inspector_phone, inspector_email, id } = inspection;
  
  let message = '';
  let subject = '';
  
  switch (newStatus) {
    case 'Проверка':
      message = `Осмотр #${id} готов к проверке.`;
      subject = 'Осмотр готов к проверке';
      break;
    case 'Готов':
      message = `Осмотр #${id} принят и завершен.`;
      subject = 'Осмотр принят';
      break;
    case 'Доработка':
      message = `Осмотр #${id} возвращен на доработку. ${comment ? 'Комментарий: ' + comment : ''}`;
      subject = 'Осмотр возвращен на доработку';
      break;
  }
  
  if (inspector_phone) {
    await sendSMS(inspector_phone, message);
  }
  
  if (inspector_email) {
    const html = `
      <h2>${subject}</h2>
      <p><strong>Номер осмотра:</strong> #${id}</p>
      <p><strong>Статус:</strong> ${newStatus}</p>
      ${comment ? `<p><strong>Комментарий:</strong> ${comment}</p>` : ''}
    `;
    
    await sendEmail(inspector_email, subject, message, html);
  }
};

module.exports = {
  sendSMS,
  sendEmail,
  sendInspectionNotification,
  sendStatusChangeNotification
};
