const IS_PROD = process.env.NODE_ENV === 'production';

export const sendOrderConfirmationEmail = async (order) => {
  if (!order.email) return;
  if (!IS_PROD)     return;

  await fetch('/api/send-email.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(order),
  });
};

export const sendWhatsAppNotification = async (order, whatsappNumbers) => {
  if (!IS_PROD)                        return;
  if (!whatsappNumbers?.length)        return;

  await fetch('/api/whatsapp.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ order, numbers: whatsappNumbers }),
  });
};
