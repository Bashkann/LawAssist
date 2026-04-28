const amqp = require('amqplib');
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

const sendToPasswordResetQueue = async (emailData) => {
  try {
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();
    const queue = 'password_reset_queue';

    await channel.assertQueue(queue, { durable: true });
    
    // Email verilerini kuyruğa bırakıyoruz
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(emailData)));
    console.log(`[Producer] ${emailData.to} için şifre sıfırlama görevi kuyruğa eklendi.`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('RabbitMQ Producer Hatası:', error);
  }
};

module.exports = { sendToPasswordResetQueue };