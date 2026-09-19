const IS_PROD = process.env.NODE_ENV === 'production';

export const createTapCharge = async (orderId, paymentToken) => {
  if (!IS_PROD) {
    throw new Error('الدفع الإلكتروني عبر Tap متاح فقط على الموقع المباشر بعد رفع التحديثات — لا يعمل في وضع التطوير المحلي.');
  }
  const res  = await fetch('/api/tap-charge.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ orderId, paymentToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'تعذر إنشاء عملية الدفع، حاول مرة أخرى.');
  }
  return data; // { url, chargeId }
};

export const checkTapStatus = async (ref, paymentToken) => {
  if (!IS_PROD) return { status: 'unknown', ref };
  const res  = await fetch(`/api/tap-status.php?ref=${encodeURIComponent(ref)}&token=${encodeURIComponent(paymentToken)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'تعذر التحقق من حالة الدفع.');
  return data; // { status: 'paid' | 'pending' | 'failed', ref }
};
