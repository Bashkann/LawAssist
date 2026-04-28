const amqp = require('amqplib');
const { sendEmail } = require('./src/utils/sendEmail');
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      console.log('[Consumer] RabbitMQ bağlantısı kuruldu.');
      return connection;
    } catch (err) {
      console.log(`[Consumer] Bağlantı denemesi ${i + 1}/${retries} başarısız, ${delay/1000}sn sonra tekrar...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('RabbitMQ bağlantısı kurulamadı!');
}

async function consumePasswordResets() {
  const connection = await connectWithRetry();
  const channel = await connection.createChannel();
  const queue = 'password_reset_queue';

  await channel.assertQueue(queue, { durable: true });
  channel.prefetch(1); // ← Aynı anda 1 mesaj işle (grafik için güzel görünür)
  console.log(`[*] Consumer çalışıyor. '${queue}' kuyruğu dinleniyor...`);

  channel.consume(queue, (message) => {
    if (message !== null) {
      const data = JSON.parse(message.content.toString());
      console.log(`[Consumer] ${data.to} adresine mail gönderimi başladı...`);

      setTimeout(async () => {
        try {
          await sendEmail({
            to: data.to,
            subject: 'Şifre Sıfırlama Talebi',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Merhaba ${data.firstName},</h2>
                <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                <a href="${data.resetUrl}"
                   style="display:inline-block; padding:12px 24px; background:#1a56db; color:#fff;
                          text-decoration:none; border-radius:6px; margin:16px 0;">
                  Şifremi Sıfırla
                </a>
                <p>Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>
              </div>
            `,
          });

          console.log(`[Başarılı] ${data.to} adresine mail ulaştı.`);
          channel.ack(message);
        } catch (err) {
          console.error('Mail gönderilirken hata oluştu:', err);
          channel.nack(message, false, true); // ← Hata olursa kuyruğa geri at
        }
      }, 5000);
    }
  });
}

consumePasswordResets().catch(console.error);