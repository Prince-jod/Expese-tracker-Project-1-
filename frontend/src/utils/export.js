// Export the expense list as PDF or CSV (premium feature).
import { formatDate } from "./format";

// The PDF libraries are big, so they are only loaded when the user clicks Export.
export async function exportPdf(expenses, userName) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  // Title + report info
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("EXPENSE REPORT", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`User: ${userName || "User"}`, 14, 32);
  doc.text(`Generated On: ${new Date().toLocaleDateString("en-IN")}`, 14, 39);
  doc.text(`Total Records: ${expenses.length}`, 14, 46);

  // Table (default PDF fonts can't draw the ₹ sign, so "Rs." is used)
  autoTable(doc, {
    startY: 55,
    head: [["Name", "Date", "Title", "Category", "Amount"]],
    body: expenses.map((e) => [
      e.name,
      formatDate(e.date),
      e.title,
      e.category,
      `Rs. ${Number(e.amount).toFixed(2)}`,
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    columnStyles: { 4: { halign: "right" } },
    margin: { left: 14, right: 14, bottom: 20 },
    // Footer with page number on every page
    didDrawPage: () => {
      const h = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.text("SpendWise - Expense Report", 14, h - 10);
      doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, 196, h - 10, {
        align: "right",
      });
    },
  });

  // Grand total after the table (new page if there is no room)
  let y = doc.lastAutoTable.finalY + 12;
  if (y > doc.internal.pageSize.height - 20) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL EXPENSES: Rs. ${total.toFixed(2)}`, 14, y);

  doc.save("Expense_Report.pdf");
}

// CSV opens directly in Excel / Google Sheets.
export function exportCsv(expenses) {
  // Wrap each value in quotes and escape quotes inside it
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const rows = [
    ["Name", "Date", "Title", "Category", "Amount"],
    ...expenses.map((e) => [e.name, e.date, e.title, e.category, e.amount]),
  ];
  const csv = rows.map((r) => r.map(cell).join(",")).join("\n");

  // Download through a temporary link
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "expenses.csv";
  link.click();
  URL.revokeObjectURL(url);
}
