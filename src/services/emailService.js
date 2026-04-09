const IS_PROD = process.env.NODE_ENV === 'production';

export const sendOrderConfirmationEmail = async (order) => {
  if (!order.email) return;          // مفيش إيميل → تجاهل
  if (!IS_PROD)     return;          // في Dev مفيش PHP server → تجاهل

  await fetch('/api/send-email.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(order),
  });
};
