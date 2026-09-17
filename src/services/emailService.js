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

export const notifyTeamOfNewOrder = async (order) => {
  if (!IS_PROD) return;

  await fetch('/api/notify-order.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(order),
  });
};
