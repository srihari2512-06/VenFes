// Email service (FR-35, S14) - never blocks checkout
export async function sendEmail({ to, subject, html, text }) {
  try {
    // shortcut: console logging email in development/test mode, upgrade to SMTP/SendGrid when provider configured
    console.log(`[EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);
    return { success: true, delivered: true };
  } catch (err) {
    console.error(`[EMAIL FAILURE] Failed sending email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

export async function sendOrderConfirmationEmail(order, customerEmail) {
  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmed: ${order.orderNumber}`,
    text: `Thank you for your order! Your total amount is INR ${order.totalAmount}. Order ID: ${order.orderNumber}`
  });
}

export async function sendOrderStatusUpdateEmail(subOrder, customerEmail) {
  return sendEmail({
    to: customerEmail,
    subject: `Order Status Update: ${subOrder.subOrderNumber}`,
    text: `Your sub-order ${subOrder.subOrderNumber} status has changed to: ${subOrder.status}`
  });
}
