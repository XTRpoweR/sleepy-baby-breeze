import jsPDF from "jspdf";
import { DateRange } from "@/utils/dateRangeUtils";

export interface ReportLog {
  id: string;
  activity_type: 'sleep' | 'feeding' | 'diaper' | 'custom';
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  metadata: any;
  created_at: string;
}

export type ReportType = 'comprehensive' | 'sleep' | 'growth';

interface ReportInput {
  logs: ReportLog[];
  profileName: string;
  reportType: ReportType;
  dateRange: DateRange;
  filename: string;
}

// ============ Helpers ============

const PAGE = {
  margin: 40,
  width: 595.28,   // A4 pt
  height: 841.89,
};

const COLORS = {
  primary: [33, 118, 174] as [number, number, number],
  dark: [33, 37, 41] as [number, number, number],
  muted: [108, 117, 125] as [number, number, number],
  light: [240, 245, 250] as [number, number, number],
  border: [220, 224, 229] as [number, number, number],
  accent: [16, 163, 127] as [number, number, number],
};

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ============ Page helpers (handle pagination) ============

class PdfBuilder {
  pdf: jsPDF;
  y: number;

  constructor() {
    this.pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    this.y = PAGE.margin;
  }

  ensureSpace(neededHeight: number) {
    if (this.y + neededHeight > PAGE.height - PAGE.margin) {
      this.pdf.addPage();
      this.y = PAGE.margin;
    }
  }

  drawLine() {
    this.ensureSpace(10);
    this.pdf.setDrawColor(...COLORS.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(PAGE.margin, this.y, PAGE.width - PAGE.margin, this.y);
    this.y += 10;
  }

  drawTitle(text: string, size = 22) {
    this.ensureSpace(size + 10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(size);
    this.pdf.setTextColor(...COLORS.primary);
    this.pdf.text(text, PAGE.margin, this.y + size * 0.7);
    this.y += size + 8;
  }

  drawSubtitle(text: string, size = 14) {
    this.ensureSpace(size + 14);
    this.y += 6;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(size);
    this.pdf.setTextColor(...COLORS.dark);
    this.pdf.text(text, PAGE.margin, this.y + size * 0.7);
    this.y += size + 8;
  }

  drawText(text: string, size = 10, bold = false, color = COLORS.dark) {
    const lines = this.pdf.splitTextToSize(text, PAGE.width - PAGE.margin * 2);
    const neededHeight = lines.length * (size + 4);
    this.ensureSpace(neededHeight);
    this.pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    this.pdf.setFontSize(size);
    this.pdf.setTextColor(...color);
    this.pdf.text(lines, PAGE.margin, this.y + size * 0.7);
    this.y += neededHeight;
  }

  drawKeyValue(key: string, value: string) {
    this.ensureSpace(22);
    const keyWidth = 150;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...COLORS.muted);
    this.pdf.text(key.toUpperCase(), PAGE.margin, this.y + 10);

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...COLORS.dark);
    this.pdf.text(value, PAGE.margin + keyWidth, this.y + 10);
    this.y += 18;
  }

  drawStatCard(label: string, value: string, x: number, width: number) {
    const height = 60;
    this.pdf.setFillColor(...COLORS.light);
    this.pdf.setDrawColor(...COLORS.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(x, this.y, width, height, 6, 6, 'FD');

    // Value (big)
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(20);
    this.pdf.setTextColor(...COLORS.primary);
    this.pdf.text(value, x + width / 2, this.y + 28, { align: 'center' });

    // Label (small)
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...COLORS.muted);
    this.pdf.text(label, x + width / 2, this.y + 48, { align: 'center' });
  }

  drawStatsRow(cards: { label: string; value: string }[]) {
    const gap = 10;
    const cardCount = cards.length;
    const totalWidth = PAGE.width - PAGE.margin * 2;
    const cardWidth = (totalWidth - gap * (cardCount - 1)) / cardCount;
    this.ensureSpace(70);
    cards.forEach((c, i) => {
      const x = PAGE.margin + i * (cardWidth + gap);
      this.drawStatCard(c.label, c.value, x, cardWidth);
    });
    this.y += 70;
  }

  drawTable(headers: string[], rows: string[][], columnWidths?: number[]) {
    const availableWidth = PAGE.width - PAGE.margin * 2;
    const widths = columnWidths || headers.map(() => availableWidth / headers.length);
    const rowHeight = 22;

    // Header
    this.ensureSpace(rowHeight + 4);
    this.pdf.setFillColor(...COLORS.primary);
    this.pdf.rect(PAGE.margin, this.y, availableWidth, rowHeight, 'F');
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(255, 255, 255);
    let x = PAGE.margin;
    headers.forEach((h, i) => {
      this.pdf.text(h, x + 6, this.y + 14);
      x += widths[i];
    });
    this.y += rowHeight;

    // Rows
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...COLORS.dark);
    rows.forEach((row, rIdx) => {
      this.ensureSpace(rowHeight);
      if (rIdx % 2 === 0) {
        this.pdf.setFillColor(...COLORS.light);
        this.pdf.rect(PAGE.margin, this.y, availableWidth, rowHeight, 'F');
      }
      let cx = PAGE.margin;
      row.forEach((cell, i) => {
        const maxWidth = widths[i] - 10;
        const lines = this.pdf.splitTextToSize(String(cell || '—'), maxWidth);
        this.pdf.text(lines[0] || '—', cx + 6, this.y + 14);
        cx += widths[i];
      });
      this.y += rowHeight;
    });
    this.y += 6;
  }

  drawFooter() {
    const pageCount = (this.pdf.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(...COLORS.muted);
      const footerText = `Generated by SleepyBabyy • Page ${i} of ${pageCount}`;
      this.pdf.text(footerText, PAGE.width / 2, PAGE.height - 20, { align: 'center' });
    }
  }

  save(filename: string) {
    this.drawFooter();
    this.pdf.save(filename);
  }
}

// ============ Stats calculators ============

interface ComputedStats {
  totalActivities: number;
  sleepCount: number;
  totalSleepMinutes: number;
  avgSleepMinutes: number;
  napCount: number;
  nightSleepCount: number;
  feedingCount: number;
  diaperCount: number;
  customCount: number;
}

function computeStats(logs: ReportLog[]): ComputedStats {
  const sleepLogs = logs.filter(l => l.activity_type === 'sleep');
  const feedingLogs = logs.filter(l => l.activity_type === 'feeding');
  const diaperLogs = logs.filter(l => l.activity_type === 'diaper');
  const customLogs = logs.filter(l => l.activity_type === 'custom');

  const totalSleepMinutes = sleepLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const avgSleepMinutes = sleepLogs.length > 0 ? totalSleepMinutes / sleepLogs.length : 0;

  // Classify naps vs night sleep: start hour between 6am-6pm = nap, else night
  let napCount = 0, nightSleepCount = 0;
  sleepLogs.forEach(l => {
    const hour = new Date(l.start_time).getHours();
    if (hour >= 6 && hour < 18) napCount++;
    else nightSleepCount++;
  });

  return {
    totalActivities: logs.length,
    sleepCount: sleepLogs.length,
    totalSleepMinutes,
    avgSleepMinutes,
    napCount,
    nightSleepCount,
    feedingCount: feedingLogs.length,
    diaperCount: diaperLogs.length,
    customCount: customLogs.length,
  };
}

// ============ Main builder ============

export async function exportReportAsPDF(input: ReportInput): Promise<void> {
  const { logs, profileName, reportType, dateRange, filename } = input;
  const b = new PdfBuilder();
  const stats = computeStats(logs);

  const reportTitleMap: Record<ReportType, string> = {
    comprehensive: 'Comprehensive Health Report',
    sleep: 'Sleep Pattern Analysis',
    growth: 'Growth & Development Report',
  };
  const reportTypeLabelMap: Record<ReportType, string> = {
    comprehensive: 'Full Health Overview',
    sleep: 'Sleep Tracking Report',
    growth: 'Developmental Tracking',
  };

  // ---- Header ----
  b.drawTitle('Pediatric Health Report');
  b.drawText(reportTitleMap[reportType], 13, false, COLORS.accent);
  b.y += 6;
  b.drawLine();

  b.drawKeyValue('Report Generated', `${formatDate(new Date())}  ${formatTime(new Date())}`);
  b.drawKeyValue('Patient Name', profileName);
  b.drawKeyValue('Report Type', reportTypeLabelMap[reportType]);
  b.drawKeyValue('Reporting Period', `${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`);
  b.drawKeyValue('Data Source', 'Parent Tracking App');
  b.y += 6;
  b.drawLine();

  // ---- Key Clinical Insights ----
  b.drawSubtitle('Key Clinical Insights');
  b.drawText('• This report provides an overview of tracked activities including sleep, feeding, and care routines.', 10);
  b.drawText('• Data is parent-reported and may not capture all activities or exact measurements.', 10);
  b.drawText('• Please combine with clinical measurements for complete assessment.', 10);

  // ---- Summary Statistics ----
  b.drawSubtitle('Summary Statistics');
  b.drawStatsRow([
    { label: 'Total Sleep', value: formatDuration(stats.totalSleepMinutes) },
    { label: 'Avg Sleep / Session', value: formatDuration(stats.avgSleepMinutes) },
    { label: 'Total Feedings', value: String(stats.feedingCount) },
    { label: 'Total Activities', value: String(stats.totalActivities) },
  ]);

  // ---- Sleep Breakdown ----
  if (reportType === 'comprehensive' || reportType === 'sleep') {
    b.drawSubtitle('Sleep Breakdown');
    b.drawStatsRow([
      { label: 'Sleep Sessions', value: String(stats.sleepCount) },
      { label: 'Naps', value: String(stats.napCount) },
      { label: 'Night Sleep', value: String(stats.nightSleepCount) },
    ]);

    // Sleep log table
    const sleepLogs = logs.filter(l => l.activity_type === 'sleep').slice(0, 40);
    if (sleepLogs.length > 0) {
      b.drawSubtitle('Detailed Sleep Log', 12);
      const rows = sleepLogs.map(l => {
        const start = new Date(l.start_time);
        const hour = start.getHours();
        const category = (hour >= 6 && hour < 18) ? 'Nap' : 'Night';
        return [
          category,
          `${formatDate(start)} ${formatTime(start)}`,
          formatDuration(l.duration_minutes),
          l.notes || '—',
        ];
      });
      b.drawTable(['Category', 'Date & Time', 'Duration', 'Notes'], rows, [80, 180, 80, 175]);
    } else {
      b.drawText('No sleep sessions recorded in this period.', 10, false, COLORS.muted);
    }
  }

  // ---- Feeding Breakdown ----
  if (reportType === 'comprehensive') {
    b.drawSubtitle('Feeding Analysis');
    const feedingLogs = logs.filter(l => l.activity_type === 'feeding').slice(0, 30);
    b.drawStatsRow([
      { label: 'Feeding Sessions', value: String(stats.feedingCount) },
      { label: 'Diaper Changes', value: String(stats.diaperCount) },
    ]);
    if (feedingLogs.length > 0) {
      b.drawSubtitle('Recent Feedings', 12);
      const rows = feedingLogs.map(l => {
        const start = new Date(l.start_time);
        const type = l.metadata?.feeding_type || l.metadata?.type || '—';
        return [
          `${formatDate(start)} ${formatTime(start)}`,
          String(type),
          formatDuration(l.duration_minutes),
          l.notes || '—',
        ];
      });
      b.drawTable(['Date & Time', 'Type', 'Duration', 'Notes'], rows, [170, 100, 80, 165]);
    } else {
      b.drawText('No feeding sessions recorded in this period.', 10, false, COLORS.muted);
    }
  }

  // ---- Activity Summary ----
  if (reportType === 'comprehensive' || reportType === 'growth') {
    b.drawSubtitle('Activity Summary');
    b.drawStatsRow([
      { label: 'Total Activities', value: String(stats.totalActivities) },
      { label: 'Custom Activities', value: String(stats.customCount) },
      { label: 'Diaper Changes', value: String(stats.diaperCount) },
    ]);

    // Recent activity log (last 20)
    const recent = [...logs]
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 20);
    if (recent.length > 0) {
      b.drawSubtitle('Recent Activities', 12);
      const rows = recent.map(l => {
        const start = new Date(l.start_time);
        return [
          l.activity_type.charAt(0).toUpperCase() + l.activity_type.slice(1),
          `${formatDate(start)} ${formatTime(start)}`,
          formatDuration(l.duration_minutes),
          l.notes || '—',
        ];
      });
      b.drawTable(['Type', 'Date & Time', 'Duration', 'Notes'], rows, [90, 170, 80, 175]);
    } else {
      b.drawText('No activities recorded in this period.', 10, false, COLORS.muted);
    }
  }

  // ---- Disclaimer ----
  b.y += 10;
  b.drawLine();
  b.drawText('This report is generated from parent-reported tracking data and is intended as a supplemental reference for healthcare providers. It should not replace professional medical assessment.', 8, false, COLORS.muted);

  b.save(filename);
}

// ============ Backward-compatible wrapper (legacy DOM-based entry point) ============
// Kept as a no-op fallback — actual PDF is now built from data, not DOM.
export async function exportNodeAsPDF(_nodeRef: HTMLElement, filename: string): Promise<void> {
  // If something still calls this old entry point, we just save an empty notice
  // so the button never gets stuck. Real reports go through exportReportAsPDF.
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Please update the page — use the new report generator.', 40, 60);
  pdf.save(filename);
}
