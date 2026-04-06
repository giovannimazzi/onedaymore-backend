require("dotenv").config();
const nodemailer = require("nodemailer");
const { roundCurrency } = require("../utils/financial");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || 2525),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendCustomerOrderEmail({
  to,
  orderNumber,
  placedAt,
  customerFirstName,
  customerLastName,
  phone,
  billingAddress,
  shippingAddress,
  items,
  subtotal,
  discount,
  shipping,
  total,
}) {
  const subject = `Conferma ordine ${orderNumber}`;

  const text = [
    `Ciao ${customerFirstName || "cliente"},`,
    "",
    "grazie per il tuo ordine. Il pagamento è stato confermato con successo.",
    "",
    "==============================",
    "RIEPILOGO ORDINE",
    "==============================",
    `Numero ordine: ${orderNumber}`,
    `Data ordine: ${formatDateTime(placedAt)}`,
    "Stato: confirmed",
    "",
    "DATI CLIENTE",
    `Nome: ${buildFullName(customerFirstName, customerLastName)}`,
    `Email: ${to}`,
    `Telefono: ${phone || "Non specificato"}`,
    "",
    "INDIRIZZO DI SPEDIZIONE",
    formatAddressBlock(shippingAddress),
    "",
    "INDIRIZZO DI FATTURAZIONE",
    formatAddressBlock(billingAddress),
    "",
    "SCONTRINO",
    formatItemsBlock(items),
    "",
    `Subtotale: € ${formatMoney(subtotal)}`,
    `Sconto: € ${formatMoney(discount)}`,
    `Spedizione: € ${formatMoney(shipping)}`,
    `Totale: € ${formatMoney(total)}`,
    "",
    "Conserva questa email come riepilogo del tuo ordine.",
    "",
    "OneDayMore",
  ].join("\n");

  return transporter.sendMail({
    from: process.env.EMAIL_VENDOR,
    to,
    subject,
    text,
  });
}

function sendVendorOrderEmail({
  orderNumber,
  placedAt,
  customerEmail,
  customerFirstName,
  customerLastName,
  phone,
  billingAddress,
  shippingAddress,
  items,
  subtotal,
  discount,
  shipping,
  total,
}) {
  const subject = `Nuovo ordine ricevuto ${orderNumber}`;

  const text = [
    "È stato ricevuto un nuovo ordine confermato.",
    "",
    "==============================",
    "DETTAGLI ORDINE",
    "==============================",
    `Numero ordine: ${orderNumber}`,
    `Data ordine: ${formatDateTime(placedAt)}`,
    "Stato: confirmed",
    "",
    "DATI CLIENTE",
    `Nome: ${buildFullName(customerFirstName, customerLastName)}`,
    `Email: ${customerEmail}`,
    `Telefono: ${phone || "Non specificato"}`,
    "",
    "INDIRIZZO DI SPEDIZIONE",
    formatAddressBlock(shippingAddress),
    "",
    "INDIRIZZO DI FATTURAZIONE",
    formatAddressBlock(billingAddress),
    "",
    "RIGHE ORDINE",
    formatItemsBlock(items),
    "",
    `Subtotale: € ${formatMoney(subtotal)}`,
    `Sconto: € ${formatMoney(discount)}`,
    `Spedizione: € ${formatMoney(shipping)}`,
    `Totale: € ${formatMoney(total)}`,
  ].join("\n");

  return transporter.sendMail({
    from: process.env.EMAIL_VENDOR,
    to: process.env.EMAIL_VENDOR,
    subject,
    text,
  });
}

module.exports = {
  sendCustomerOrderEmail,
  sendVendorOrderEmail,
};

function buildFullName(firstName, lastName) {
  return (
    [firstName, lastName].filter(Boolean).join(" ").trim() || "Non specificato"
  );
}

function formatMoney(value) {
  return roundCurrency(Number(value)).toFixed(2);
}

function formatDateTime(value) {
  if (!value) return "Non disponibile";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("it-IT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddressBlock(address) {
  if (!address) return "Non disponibile";

  const lines = [
    address.line1 || "",
    address.line2 || "",
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.province || "",
    address.country || "",
  ].filter((line) => String(line).trim() !== "");

  return lines.length ? lines.join("\n") : "Non disponibile";
}

function formatItemsBlock(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Nessun articolo presente";
  }

  return items
    .map((item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const lineTotal = roundCurrency(unitPrice * quantity);

      return `- ${item.product_name} | € ${formatMoney(unitPrice)} x ${quantity} = € ${formatMoney(lineTotal)}`;
    })
    .join("\n");
}
