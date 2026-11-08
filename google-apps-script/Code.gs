const SPREADSHEET_ID = "1njc0HuBSa5P0Rz_6YLasKFuU-MbMqcu2-zq284y58V4";
const SHEET_NAME = "Leads";
const NOTIFICATION_EMAIL = "ENZOSERVICES41@GMAIL.COM";

function doPost(e) {
  const data = e && e.parameter ? e.parameter : {};
  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").trim();
  const email = String(data.email || "").trim();
  const message = String(data.message || "").trim();
  const type = String(data.type || "ebook").trim();

  if (name.length < 2 || (type === "contact" ? !email || !message : !phone)) {
    return jsonResponse({ ok: false, error: type === "contact" ? "Name, email, and message are required." : "Name and phone are required." });
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Type", "Full name", "Phone", "Email", "Message", "Language", "Source"]);
  }
  sheet.appendRow([
    new Date(),
    type,
    name,
    phone,
    email,
    message,
    String(data.language || ""),
    String(data.source || "")
  ]);
  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: type === "contact" ? "New ENZO SERVICES contact message" : "New ENZO SERVICES ebook lead",
    htmlBody: [
      "<h2>New ebook lead</h2>",
      "<p><strong>Full name:</strong> " + escapeHtml(name) + "</p>",
      "<p><strong>Phone:</strong> " + escapeHtml(phone) + "</p>",
      "<p><strong>Email:</strong> " + escapeHtml(email || "Not provided") + "</p>",
      "<p><strong>Message:</strong> " + escapeHtml(message || "Not provided") + "</p>",
      "<p><strong>Language:</strong> " + escapeHtml(String(data.language || "")) + "</p>",
      "<p><strong>Source:</strong> " + escapeHtml(String(data.source || "")) + "</p>"
    ].join("")
  });
  return jsonResponse({ ok: true });
}

function doGet() {
  return jsonResponse({ ok: true, service: "ENZO lead collector" });
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
