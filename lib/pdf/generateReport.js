// lib/pdf/generateReport.js
// Generates a branded VedicAI PDF report using pdf-lib

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

// Color palette
const C = {
  saffron:    rgb(0.831, 0.384, 0.102),
  terracotta: rgb(0.722, 0.290, 0.165),
  ink:        rgb(0.110, 0.078, 0.063),
  ink2:       rgb(0.239, 0.169, 0.122),
  muted:      rgb(0.612, 0.482, 0.408),
  cream:      rgb(0.980, 0.969, 0.949),
  gold:       rgb(0.831, 0.671, 0.259),
  white:      rgb(1, 1, 1),
  bg:         rgb(0.980, 0.969, 0.949),
  lightBg:    rgb(0.957, 0.937, 0.902),
  border:     rgb(0.780, 0.647, 0.569),
}

// Page dimensions (A4)
const W = 595.28
const H = 841.89

function drawRect(page, x, y, w, h, color, opacity = 1) {
  page.drawRectangle({ x, y, width: w, height: h, color, opacity })
}

function drawLine(page, x1, y1, x2, y2, color = C.border, thickness = 0.5) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color })
}

function wrapText(text, maxCharsPerLine) {
  if (!text) return ['']
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    if ((current + word).length > maxCharsPerLine) {
      if (current) lines.push(current.trim())
      current = word + ' '
    } else {
      current += word + ' '
    }
  }
  if (current.trim()) lines.push(current.trim())
  return lines.length ? lines : ['']
}

function drawWrappedText(page, text, x, y, font, size, color, maxWidth, lineHeight = 1.4) {
  const charsPerLine = Math.floor(maxWidth / (size * 0.52))
  const lines = wrapText(text, charsPerLine)
  let cy = y
  for (const line of lines) {
    page.drawText(line, { x, y: cy, font, size, color })
    cy -= size * lineHeight
  }
  return cy
}

export async function generatePDFReport({ service, result, userName, lang = 'en', readingDate }) {
  const pdfDoc = await PDFDocument.create()
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica    = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const timesRoman   = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesBold    = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const timesItalic  = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  const serviceNames = {
    palm:        { en:'Palm Reading', hi:'हस्त रेखा', gu:'હસ્ત રેખા', ta:'கை ரேகை' },
    kundli:      { en:'Kundli & Astrology', hi:'कुंडली', gu:'કુંડળી', ta:'ஜாதகம்' },
    tarot:       { en:'Tarot Reading', hi:'टैरो', gu:'ટેરો', ta:'தாரோ' },
    numerology:  { en:'Numerology', hi:'अंक ज्योतिष', gu:'અંક જ્યોતિષ', ta:'எண் ஜோதிடம்' },
    face:        { en:'Face Reading', hi:'मुख पठन', gu:'મુખ વાંચન', ta:'முக வாசிப்பு' },
    dream:       { en:'Dream Interpretation', hi:'स्वप्न व्याख्या', gu:'સ્વપ્ન વ્યાખ્યા', ta:'கனவு விளக்கம்' },
  }
  const svcName = serviceNames[service]?.[lang] || serviceNames[service]?.en || service

  // ── PAGE 1: COVER ──────────────────────────────────────────
  const p1 = pdfDoc.addPage([W, H])

  // Background
  drawRect(p1, 0, 0, W, H, C.cream)
  // Top decorative band
  drawRect(p1, 0, H - 180, W, 180, C.saffron)
  // Subtle warm overlay bands
  drawRect(p1, 0, H - 185, W, 6, C.terracotta)
  // Bottom band
  drawRect(p1, 0, 0, W, 60, C.ink)

  // OM symbol in header (large decorative)
  p1.drawText('OM', {
    x: W - 120, y: H - 130,
    font: helveticaBold, size: 72,
    color: rgb(1, 1, 1), opacity: 0.12
  })

  // Header text
  p1.drawText('VedicAI', {
    x: 48, y: H - 68,
    font: timesBold, size: 38,
    color: C.white,
  })
  p1.drawText('Ancient Wisdom · Powered by AI', {
    x: 48, y: H - 92,
    font: helvetica, size: 13,
    color: rgb(1, 0.85, 0.65),
  })

  // Date & lang
  const dateStr = readingDate || new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
  p1.drawText(dateStr, {
    x: W - 200, y: H - 68,
    font: helvetica, size: 11,
    color: rgb(1, 1, 1), opacity: 0.7,
  })

  // Horizontal decorative line
  drawLine(p1, 48, H - 200, W - 48, H - 200, C.gold, 1.5)

  // Service title
  p1.drawText(svcName.toUpperCase(), {
    x: 48, y: H - 250,
    font: helveticaBold, size: 11,
    color: C.saffron,
  })

  p1.drawText('PERSONALIZED READING REPORT', {
    x: 48, y: H - 280,
    font: timesBold, size: 32,
    color: C.ink,
  })

  // Name
  if (userName) {
    p1.drawText(`Prepared for: ${userName}`, {
      x: 48, y: H - 320,
      font: timesItalic, size: 16,
      color: C.ink2,
    })
  }

  // Decorative divider
  drawRect(p1, 48, H - 342, 60, 3, C.saffron)

  // Summary cards
  const summaryKeys = Object.keys(result?.summary || {}).slice(0, 3)
  let cy = H - 380
  for (const key of summaryKeys) {
    const label = key.charAt(0).toUpperCase() + key.slice(1)
    const text  = result.summary[key] || ''
    drawRect(p1, 48, cy - 52, W - 96, 58, C.lightBg)
    drawLine(p1, 48, cy + 4, 54, cy - 52, C.saffron, 3)
    p1.drawText(label.toUpperCase(), { x: 62, y: cy - 6, font: helveticaBold, size: 9, color: C.saffron })
    drawWrappedText(p1, text, 62, cy - 22, timesItalic, 11, C.ink2, W - 130)
    cy -= 68
  }

  // Quick facts bar
  const facts = []
  if (result?.dominant_trait || result?.overall_energy) facts.push({ l:'Theme', v: result.dominant_trait || result.overall_energy || '' })
  if (result?.lucky_element) facts.push({ l:'Element', v: result.lucky_element })
  if (result?.rashi) facts.push({ l:'Rashi', v: result.rashi })
  if (result?.life_path_number) facts.push({ l:'Life Path', v: String(result.life_path_number) })
  if (result?.chakra_affected) facts.push({ l:'Chakra', v: result.chakra_affected })
  if (result?.primary_symbol) facts.push({ l:'Symbol', v: result.primary_symbol })

  if (facts.length) {
    drawRect(p1, 48, cy - 64, W - 96, 68, C.ink)
    p1.drawText('YOUR COSMIC SNAPSHOT', { x: 56, y: cy - 16, font: helveticaBold, size: 8, color: rgb(1, 0.85, 0.65) })
    const fw = (W - 96) / Math.max(facts.length, 1)
    facts.forEach((f, i) => {
      const fx = 56 + i * fw
      p1.drawText(f.l.toUpperCase(), { x: fx, y: cy - 32, font: helveticaBold, size: 7, color: C.gold })
      p1.drawText(f.v.substring(0, 18), { x: fx, y: cy - 48, font: helvetica, size: 10, color: C.white })
    })
    cy -= 80
  }

  // Footer on page 1
  p1.drawText('vedicai.com  ·  For entertainment purposes only', {
    x: 48, y: 20,
    font: helvetica, size: 8,
    color: rgb(0.85, 0.78, 0.7),
  })
  p1.drawText('Page 1', { x: W - 70, y: 20, font: helvetica, size: 8, color: rgb(0.85, 0.78, 0.7) })

  // ── PAGE 2: FULL DETAILED REPORT ──────────────────────────
  const p2 = pdfDoc.addPage([W, H])
  drawRect(p2, 0, 0, W, H, C.cream)
  // Thin top bar
  drawRect(p2, 0, H - 50, W, 50, C.saffron)
  p2.drawText('VedicAI  ·  ' + svcName.toUpperCase() + '  ·  FULL REPORT', {
    x: 48, y: H - 30,
    font: helveticaBold, size: 9,
    color: rgb(1, 0.9, 0.7),
  })
  p2.drawText(dateStr, { x: W - 160, y: H - 30, font: helvetica, size: 9, color: rgb(1,1,1), opacity: 0.6 })

  // Decorative line
  drawLine(p2, 48, H - 70, W - 48, H - 70, C.border, 0.5)

  p2.drawText('DETAILED READING', {
    x: 48, y: H - 90,
    font: helveticaBold, size: 10,
    color: C.saffron,
  })
  if (userName) {
    p2.drawText(`For ${userName}`, { x: 48, y: H - 108, font: timesItalic, size: 12, color: C.ink2 })
  }

  drawLine(p2, 48, H - 120, W - 48, H - 120, C.border, 0.5)

  // Full detailed report text
  const reportText = result?.detailed_report || 'Your full reading is being prepared.'
  const paragraphs = reportText.split(/\n\n|\n/).filter(p => p.trim())
  let ty = H - 142
  const lineH = 14.5
  const maxW = W - 96

  for (const para of paragraphs) {
    if (!para.trim()) continue
    if (ty < 80) {
      // New page
      const np = pdfDoc.addPage([W, H])
      drawRect(np, 0, 0, W, H, C.cream)
      drawRect(np, 0, H - 50, W, 50, C.saffron)
      np.drawText('VedicAI  ·  ' + svcName.toUpperCase(), { x: 48, y: H - 30, font: helveticaBold, size: 9, color: rgb(1, 0.9, 0.7) })
      ty = H - 70
      // Footer
      np.drawText('vedicai.com  ·  For entertainment purposes only', { x: 48, y: 20, font: helvetica, size: 8, color: C.muted })
    }
    const charsPerLine = Math.floor(maxW / (11 * 0.52))
    const lines = wrapText(para, charsPerLine)
    // Get current page (last added)
    const currentPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
    for (const line of lines) {
      if (ty < 80) break
      currentPage.drawText(line, { x: 48, y: ty, font: timesRoman, size: 11, color: C.ink })
      ty -= lineH
    }
    ty -= 8 // paragraph spacing
  }

  // ── PAGE 3: ADDITIONAL DETAILS (numerology/kundli specific) ──
  const hasExtra = result?.lucky || result?.doshas || result?.card_meanings || result?.features || result?.symbols
  if (hasExtra) {
    const p3 = pdfDoc.addPage([W, H])
    drawRect(p3, 0, 0, W, H, C.cream)
    drawRect(p3, 0, H - 50, W, 50, C.saffron)
    p3.drawText('VedicAI  ·  ADDITIONAL INSIGHTS', { x: 48, y: H - 30, font: helveticaBold, size: 9, color: rgb(1, 0.9, 0.7) })

    let y3 = H - 80
    drawLine(p3, 48, y3, W - 48, y3, C.border, 0.5)
    y3 -= 20

    // Lucky info (kundli)
    if (result?.lucky) {
      p3.drawText('LUCKY ELEMENTS', { x: 48, y: y3, font: helveticaBold, size: 10, color: C.saffron })
      y3 -= 20
      const lItems = [
        ['Lucky Number', result.lucky.number],
        ['Lucky Color', result.lucky.color],
        ['Lucky Day', result.lucky.day],
        ['Gemstone', result.lucky.gemstone],
      ]
      lItems.forEach(([k, v]) => {
        if (!v) return
        p3.drawText(`${k}:`, { x: 48, y: y3, font: helveticaBold, size: 11, color: C.ink2 })
        p3.drawText(String(v), { x: 180, y: y3, font: timesRoman, size: 11, color: C.ink })
        y3 -= 18
      })
      y3 -= 10
    }

    // Doshas
    if (result?.doshas?.length) {
      drawLine(p3, 48, y3, W - 48, y3, C.border, 0.5)
      y3 -= 20
      p3.drawText('DOSHAS', { x: 48, y: y3, font: helveticaBold, size: 10, color: C.saffron })
      y3 -= 20
      result.doshas.forEach(d => {
        p3.drawText(`• ${d}`, { x: 56, y: y3, font: timesRoman, size: 11, color: C.ink })
        y3 -= 16
      })
      y3 -= 10
    }

    // Dream symbols
    if (result?.symbols?.length) {
      drawLine(p3, 48, y3, W - 48, y3, C.border, 0.5)
      y3 -= 20
      p3.drawText('KEY SYMBOLS IN YOUR DREAM', { x: 48, y: y3, font: helveticaBold, size: 10, color: C.saffron })
      y3 -= 20
      result.symbols.forEach(s => {
        p3.drawText(`✦ ${s}`, { x: 56, y: y3, font: timesRoman, size: 11, color: C.ink })
        y3 -= 16
      })
    }

    // Tarot card meanings
    if (result?.card_meanings?.length) {
      drawLine(p3, 48, y3, W - 48, y3, C.border, 0.5)
      y3 -= 20
      p3.drawText('CARD MEANINGS', { x: 48, y: y3, font: helveticaBold, size: 10, color: C.saffron })
      y3 -= 20
      result.card_meanings.forEach(cm => {
        if (y3 < 80) return
        p3.drawText(cm.card + ':', { x: 48, y: y3, font: timesBold, size: 11, color: C.saffron })
        y3 -= 15
        y3 = drawWrappedText(p3, cm.meaning || '', 56, y3, timesItalic, 10, C.ink2, W - 120) - 6
      })
    }

    // Numerology numbers
    if (result?.life_path_number) {
      drawLine(p3, 48, y3, W - 48, y3, C.border, 0.5)
      y3 -= 20
      p3.drawText('YOUR CORE NUMBERS', { x: 48, y: y3, font: helveticaBold, size: 10, color: C.saffron })
      y3 -= 20
      const numItems = [
        ['Life Path Number', result.life_path_number],
        ['Destiny Number', result.destiny_number],
        ['Soul Urge Number', result.soul_urge_number],
        ['Personality Number', result.personality_number],
        ['Birth Day Number', result.birth_day_number],
        ['Lucky Numbers', result.lucky_numbers?.join(', ')],
      ]
      numItems.forEach(([k, v]) => {
        if (!v) return
        p3.drawText(`${k}:`, { x: 48, y: y3, font: helveticaBold, size: 11, color: C.ink2 })
        p3.drawText(String(v), { x: 220, y: y3, font: timesBold, size: 13, color: C.saffron })
        y3 -= 18
      })
    }

    // Footer
    p3.drawText('vedicai.com  ·  For entertainment purposes only', { x: 48, y: 20, font: helvetica, size: 8, color: C.muted })
    p3.drawText(`Page ${pdfDoc.getPageCount()}`, { x: W - 70, y: 20, font: helvetica, size: 8, color: C.muted })
  }

  // ── LAST PAGE: BLESSING + DISCLAIMER ──────────────────────
  const lastPage = pdfDoc.addPage([W, H])
  drawRect(lastPage, 0, 0, W, H, C.ink)
  drawRect(lastPage, 0, H - 8, W, 8, C.saffron)
  drawRect(lastPage, 0, 0, W, 8, C.saffron)

  // OM in center
  lastPage.drawText('OM', {
    x: W/2 - 52, y: H/2 + 20,
    font: timesBold, size: 96,
    color: C.saffron, opacity: 0.15,
  })

  lastPage.drawText('OM SHANTI', {
    x: W/2 - 68, y: H/2 + 30,
    font: timesBold, size: 28,
    color: C.gold,
  })

  const blessingLines = [
    'May the wisdom of this reading illuminate your path.',
    'May the cosmic forces guide you toward your highest purpose.',
    'May you walk in alignment with your dharma, always.',
    '',
    '"The cosmos is within us. We are made of star-stuff."',
  ]
  let by = H/2 - 10
  blessingLines.forEach(line => {
    const tw = timesItalic.widthOfTextAtSize(line, 13)
    lastPage.drawText(line, {
      x: (W - tw) / 2, y: by,
      font: timesItalic, size: 13,
      color: line.startsWith('"') ? C.gold : rgb(0.8, 0.72, 0.65),
    })
    by -= 22
  })

  // Divider
  drawLine(lastPage, 120, H/2 - 110, W - 120, H/2 - 110, C.gold, 0.5)

  lastPage.drawText('Generated by VedicAI  ·  vedicai.com', {
    x: W/2 - 96, y: H/2 - 140,
    font: helvetica, size: 10,
    color: C.muted,
  })
  lastPage.drawText('⚠️ For entertainment purposes only. Not a substitute for professional advice.', {
    x: W/2 - 190, y: H/2 - 162,
    font: helvetica, size: 9,
    color: rgb(0.5, 0.42, 0.38),
  })
  lastPage.drawText(dateStr, {
    x: W/2 - 50, y: H/2 - 180,
    font: helvetica, size: 9,
    color: rgb(0.4, 0.34, 0.30),
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
