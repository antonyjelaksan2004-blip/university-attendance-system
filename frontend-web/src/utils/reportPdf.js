const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function downloadAttendancePdf({ title, subtitle, summary, columns, rows }) {
  if (!rows.length) {
    alert("No report records available to download.");
    return;
  }

  const summaryItems = summary
    .map((item) => `<div class="summary-item"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`)
    .join("");

  const tableHead = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  const tableRows = rows
    .map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column] || "-")}</td>`).join("")}</tr>`)
    .join("");

  const reportWindow = window.open("", "_blank", "width=1100,height=800");
  if (!reportWindow) {
    alert("Popup blocked. Please allow popups to download the PDF.");
    return;
  }

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 34px;
            color: #111827;
            font-family: Arial, sans-serif;
            background: #f4f7fb;
          }
          .report-sheet {
            max-width: 980px;
            margin: 0 auto;
            padding: 34px;
            background: #ffffff;
            border: 1px solid #dbe3ef;
            border-radius: 14px;
          }
          .report-top {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            border-bottom: 2px solid #101828;
            padding-bottom: 18px;
            margin-bottom: 22px;
          }
          h1 { margin: 0; font-size: 26px; letter-spacing: 0; }
          p { margin: 8px 0 0; color: #667085; }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .summary-item {
            padding: 14px;
            border: 1px solid #e4e7ec;
            border-radius: 10px;
            background: #f8fafc;
          }
          .summary-item span {
            display: block;
            color: #667085;
            font-size: 12px;
            margin-bottom: 8px;
          }
          .summary-item strong { font-size: 20px; }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
          }
          th, td {
            border-bottom: 1px solid #e4e7ec;
            padding: 12px 10px;
            text-align: left;
            font-size: 13px;
          }
          th {
            background: #101828;
            color: #ffffff;
            font-size: 12px;
            text-transform: uppercase;
          }
          .print-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin: 0 auto 16px;
            max-width: 980px;
          }
          button {
            border: 0;
            border-radius: 8px;
            padding: 10px 16px;
            background: #2563eb;
            color: #ffffff;
            cursor: pointer;
            font-weight: 700;
          }
          button.cancel {
            background: #475467;
          }
          @media print {
            body { padding: 0; background: #ffffff; }
            .print-actions { display: none; }
            .report-sheet { border: 0; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-actions">
          <button class="cancel" onclick="window.close()">Cancel</button>
          <button onclick="window.print()">Download PDF</button>
        </div>
        <main class="report-sheet">
          <div class="report-top">
            <div>
              <h1>${escapeHtml(title)}</h1>
              <p>${escapeHtml(subtitle)}</p>
            </div>
            <p>${new Date().toLocaleString()}</p>
          </div>
          <section class="summary-grid">${summaryItems}</section>
          <table>
            <thead><tr>${tableHead}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </main>
      </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.focus();
}
