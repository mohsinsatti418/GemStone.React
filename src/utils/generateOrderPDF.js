// ─────────────────────────────────────────────
// generateOrderPDF.js
//
// WHY GENERATE PDF IN THE BROWSER?
// The PDF is generated client-side using jsPDF.
// This means no server resources are used for PDF creation.
// The result is a Base64 string we can:
//   1. Offer as a download to the user
//   2. Attach to the email via your .NET API
//   3. Show as a preview
//
// jsPDF works by drawing text and shapes onto a canvas
// and then encoding it as a PDF binary.
// ─────────────────────────────────────────────

import { jsPDF } from 'jspdf'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Draw a horizontal rule line
function drawLine(doc, y, margin = 20, color = [212, 224, 218]) {
  doc.setDrawColor(...color)
  doc.setLineWidth(0.3)
  doc.line(margin, y, 210 - margin, y)
}

// Draw a filled rectangle (for section headers)
function drawRect(doc, x, y, w, h, color) {
  doc.setFillColor(...color)
  doc.rect(x, y, w, h, 'F')
}

// ─────────────────────────────────────────────
// Main generator function
//
// Parameters:
//   customer = { fullName, phone, email, address }
//   items    = cart items array from CartContext
//   totals   = { subtotal, tax, grandTotal }
//   orderRef = order reference string e.g. "ORD-20250524-001"
//
// Returns:
//   { pdf: jsPDF instance, base64: string, blob: Blob }
// ─────────────────────────────────────────────

export function generateOrderPDF({ customer, items, totals, orderRef }) {
  // A4 size, portrait, mm units
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 20      // left and right margin in mm
  const pageW  = 210     // A4 width
  const contentW = pageW - margin * 2  // usable width

  let y = 0  // current vertical position, increments as we draw

  // ── HEADER BAND ────────────────────────────
  drawRect(doc, 0, 0, pageW, 42, [15, 26, 21])  // dark green

  // Logo diamond shape (drawn as lines)
  doc.setDrawColor(212, 174, 74)   // gold
  doc.setLineWidth(0.5)
  const cx = margin, cy = 21       // center of diamond
  doc.lines([[8,-9],[8,9],[-8,9],[-8,-9]], cx, cy, [1,1], 'D')

  // Brand name
  doc.setTextColor(238, 246, 242)  // light
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('GemVault', margin + 14, 17)

  // Tagline
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(196, 154, 46)   // gold
  doc.text('FINE GEMSTONES', margin + 14, 23)

  // ENQUIRY RECEIPT label — right side
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(238, 246, 242)
  doc.text('ENQUIRY RECEIPT', pageW - margin, 17, { align: 'right' })

  // Order ref and date — right side
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(170, 200, 184)
  doc.text(orderRef, pageW - margin, 24, { align: 'right' })
  doc.text(formatDate(), pageW - margin, 30, { align: 'right' })

  y = 52

  // ── NOTICE BAND ────────────────────────────
  drawRect(doc, margin, y, contentW, 12, [238, 246, 242])
  doc.setTextColor(46, 80, 64)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(
    '  This is an enquiry receipt. Our team will contact you to confirm the order.',
    margin + 2, y + 8
  )

  y += 20

  // ── CUSTOMER INFORMATION ───────────────────
  doc.setTextColor(196, 154, 46)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('CUSTOMER INFORMATION', margin, y)
  y += 5
  drawLine(doc, y, margin)
  y += 6

  // Two-column layout for customer info
  const col1x = margin
  const col2x = margin + contentW / 2

  const customerFields = [
    ['Full Name',    customer.fullName],
    ['Phone',        customer.phone],
    ['Email',        customer.email || 'Not provided'],
    ['Address',      customer.address],
  ]

  customerFields.forEach(([label, value], i) => {
    const x = i % 2 === 0 ? col1x : col2x
    if (i % 2 === 0 && i > 0) y += 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(122, 149, 137)  // muted
    doc.text(label, x, y)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 30, 24)

    // Wrap long address text
    const lines = doc.splitTextToSize(value, contentW / 2 - 4)
    doc.text(lines, x, y + 5)
  })

  y += 18
  drawLine(doc, y, margin)
  y += 10

  // ── ORDERED ITEMS ──────────────────────────
  doc.setTextColor(196, 154, 46)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('ORDERED ITEMS', margin, y)
  y += 5

  // Table header row
  drawRect(doc, margin, y, contentW, 8, [46, 80, 64])
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)

  const col = {
    name:    margin + 2,
    type:    margin + 72,
    weight:  margin + 100,
    qty:     margin + 124,
    unit:    margin + 138,
    total:   pageW - margin - 2,
  }

  doc.text('Gemstone',    col.name,   y + 5.5)
  doc.text('Type',        col.type,   y + 5.5)
  doc.text('Weight',      col.weight, y + 5.5)
  doc.text('Qty',         col.qty,    y + 5.5)
  doc.text('Unit Price',  col.unit,   y + 5.5)
  doc.text('Total',       col.total,  y + 5.5, { align: 'right' })

  y += 8

  // Item rows
  items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 0) {
      drawRect(doc, margin, y, contentW, 9, [248, 250, 249])
    }

    doc.setTextColor(15, 30, 24)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)

    // Truncate long names
    const name = item.name.length > 28
      ? item.name.substring(0, 25) + '...'
      : item.name
    doc.text(name, col.name, y + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(61, 85, 72)

    doc.text(item.gemType  || '—',                     col.type,   y + 6)
    doc.text(item.weightInCarats
      ? `${item.weightInCarats} ct` : '—',             col.weight, y + 6)
    doc.text(String(item.quantity),                    col.qty,    y + 6)
    doc.text(formatPrice(item.price),                  col.unit,   y + 6)
    doc.text(formatPrice(item.price * item.quantity),  col.total,  y + 6,
      { align: 'right' })

    // SKU below item name in smaller grey text
    doc.setFontSize(7)
    doc.setTextColor(122, 149, 137)
    doc.text(`SKU: ${item.sku}`, col.name, y + 10)

    y += 12

    // Page break guard — if close to bottom, add new page
    if (y > 250) {
      doc.addPage()
      y = 20
    }
  })

  drawLine(doc, y, margin)
  y += 8

  // ── TOTALS ─────────────────────────────────
  const totalsX     = pageW - margin - 60
  const totalsLabelX = totalsX - 2
  const totalsValueX = pageW - margin

  const totalsRows = [
    ['Subtotal',    formatPrice(totals.subtotal), false],
    ['Tax (8%)',    formatPrice(totals.tax),       false],
    ['Grand Total', formatPrice(totals.grandTotal), true],
  ]

  totalsRows.forEach(([label, value, isBold]) => {
    if (isBold) {
      drawRect(doc, totalsX - 4, y - 4, 70, 10, [238, 246, 242])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(15, 30, 24)
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(61, 85, 72)
    }

    doc.text(label, totalsLabelX, y, { align: 'right' })
    doc.text(value, totalsValueX, y, { align: 'right' })
    y += isBold ? 8 : 7
  })

  y += 6

  // ── ADDITIONAL NOTES (if any) ──────────────
  if (customer.notes && customer.notes.trim()) {
    drawLine(doc, y, margin)
    y += 8

    doc.setTextColor(196, 154, 46)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('ADDITIONAL NOTES', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(61, 85, 72)
    const noteLines = doc.splitTextToSize(customer.notes, contentW)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 5 + 4
  }

  // ── FOOTER ─────────────────────────────────
  const footerY = 287  // near bottom of A4

  drawLine(doc, footerY - 6, margin, [212, 224, 218])

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(122, 149, 137)
  doc.text(
    'GemVault Fine Gemstones — This receipt confirms receipt of your enquiry only.',
    pageW / 2, footerY, { align: 'center' }
  )
  doc.text(
    'A team member will contact you within 24–48 hours to confirm availability and payment.',
    pageW / 2, footerY + 5, { align: 'center' }
  )

  // ── Return all useful formats ───────────────
  return {
    pdf:    doc,
    // base64 string — send to server to attach to email
    base64: doc.output('datauristring').split(',')[1],
    // Blob — for browser download
    blob:   doc.output('blob'),
    // For naming the file
    filename: `GemVault-Enquiry-${orderRef}.pdf`,
  }
}

// ─────────────────────────────────────────────
// Trigger a browser download of the PDF
// ─────────────────────────────────────────────

export function downloadPDF(pdfResult) {
  const url  = URL.createObjectURL(pdfResult.blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = pdfResult.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  // ↑ Clean up the blob URL from memory after download starts
}