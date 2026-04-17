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
  birthDate?: string | null;
  reportType: ReportType;
  dateRange: DateRange;
  filename: string;
}

// ============ Constants ============

const PAGE = { margin: 40, width: 595.28, height: 841.89 };

const COLORS = {
  primary: [41, 98, 255] as [number, number, number],       // Deep blue (medical/trust)
  sleep: [99, 102, 241] as [number, number, number],        // Indigo
  feeding: [245, 158, 11] as [number, number, number],      // Amber
  diaper: [236, 72, 153] as [number, number, number],       // Pink
  custom: [16, 185, 129] as [number, number, number],       // Emerald
  dark: [17, 24, 39] as [number, number, number],           // Near-black
  text: [55, 65, 81] as [number, number, number],           // Gray-700
  muted: [107, 114, 128] as [number, number, number],       // Gray-500
  light: [243, 244, 246] as [number, number, number],       // Gray-100
  lighter: [249, 250, 251] as [number, number, number],     // Gray-50
  border: [229, 231, 235] as [number, number, number],      // Gray-200
  success: [16, 185, 129] as [number, number, number],
  warning: [251, 146, 60] as [number, number, number],
  info: [59, 130, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// ============ Utilities ============

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateTime(d: Date | string): string {
  return `${formatDate(d)} • ${formatTime(d)}`;
}

function formatDuration(minutes: number | null, showZero = false): string {
  if (minutes === null || minutes === undefined || (minutes <= 0 && !showZero)) return '—';
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function calculateAge(birthDate?: string | null): string | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  if (isNaN(birth.getTime())) return null;

  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} day${days === 1 ? '' : 's'} old`;
  }
  if (months < 24) return `${months} month${months === 1 ? '' : 's'} old`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} year${years === 1 ? '' : 's'} old`;
  return `${years}y ${remMonths}mo`;
}

function classifySleep(startHour: number): 'nap' | 'night' {
  // More accurate: naps are 6am-7pm, night sleep is 7pm-6am
  return (startHour >= 6 && startHour < 19) ? 'nap' : 'night';
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// ============ PDF Builder ============

class PdfBuilder {
  pdf: jsPDF;
  y: number;
  pageNum: number;

  constructor() {
    this.pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    this.y = PAGE.margin;
    this.pageNum = 1;
  }

  newPage() {
    this.pdf.addPage();
    this.pageNum++;
    this.y = PAGE.margin;
  }

  space(h: number) {
    if (this.y + h > PAGE.height - 60) {
      this.newPage();
    }
  }

  drawBrandHeader(subtitle: string, color: [number, number, number] = COLORS.primary) {
    // Top color band
    this.pdf.setFillColor(...color);
    this.pdf.rect(0, 0, PAGE.width, 6, 'F');

    // Brand name
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...color);
    this.pdf.text('SleepyBabyy', PAGE.margin, 28);

    // Subtitle (right side)
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...COLORS.muted);
    this.pdf.text(subtitle, PAGE.width - PAGE.margin, 28, { align: 'right' });

    this.y = 50;
  }

  hr(thick = 0.5, color: [number, number, number] = COLORS.border) {
    this.space(12);
    this.pdf.setDrawColor(...color);
    this.pdf.setLineWidth(thick);
    this.pdf.line(PAGE.margin, this.y, PAGE.width - PAGE.margin, this.y);
    this.y += 12;
  }

  // Big hero title with colored bar on left
  heroTitle(title: string, color: [number, number, number] = COLORS.primary) {
    this.space(50);
    // Left accent bar
    this.pdf.setFillColor(...color);
    this.pdf.rect(PAGE.margin, this.y, 4, 30, 'F');

    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(20);
    this.pdf.setTextColor(...COLORS.dark);
    this.pdf.text(title, PAGE.margin + 14, this.y + 22);
    this.y += 44;
  }

  sectionTitle(title: string, color: [number, number, number] = COLORS.primary) {
    this.space(32);
    this.y += 6;

    // Colored dot
    this.pdf.setFillColor(...color);
    this.pdf.circle(PAGE.margin + 4, this.y + 6, 4, 'F');

    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(13);
    this.pdf.setTextColor(...COLORS.dark);
    this.pdf.text(title, PAGE.margin + 16, this.y + 10);

    this.y += 20;

    // Thin underline
    this.pdf.setDrawColor(...COLORS.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(PAGE.margin, this.y, PAGE.width - PAGE.margin, this.y);
    this.y += 12;
  }

  subTitle(text: string) {
    this.space(20);
    this.y += 4;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...COLORS.text);
    this.pdf.text(text, PAGE.margin, this.y + 8);
    this.y += 18;
  }

  paragraph(text: string, size = 10, color: [number, number, number] = COLORS.text) {
    const lines = this.pdf.splitTextToSize(text, PAGE.width - PAGE.margin * 2);
    const h = lines.length * (size + 3);
    this.space(h + 4);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(size);
    this.pdf.setTextColor(...color);
    this.pdf.text(lines, PAGE.margin, this.y + size * 0.8);
    this.y += h + 4;
  }

  // Info box with icon-like circle
  infoBox(title: string, text: string, color: [number, number, number] = COLORS.info) {
    const lines = this.pdf.splitTextToSize(text, PAGE.width - PAGE.margin * 2 - 28);
    const h = Math.max(44, 28 + lines.length * 12);
    this.space(h + 8);

    // Background
    this.pdf.setFillColor(...COLORS.lighter);
    this.pdf.roundedRect(PAGE.margin, this.y, PAGE.width - PAGE.margin * 2, h, 6, 6, 'F');

    // Left color strip
    this.pdf.setFillColor(...color);
    this.pdf.roundedRect(PAGE.margin, this.y, 4, h, 2, 2, 'F');

    // Title
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...color);
    this.pdf.text(title, PAGE.margin + 14, this.y + 16);

    // Body
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...COLORS.text);
    this.pdf.text(lines, PAGE.margin + 14, this.y + 30);

    this.y += h + 10;
  }

  // Key-Value style metadata row (2 columns)
  metaRow(key1: string, value1: string, key2?: string, value2?: string) {
    this.space(28);
    const colWidth = (PAGE.width - PAGE.margin * 2) / 2;

    // Col 1
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...COLORS.muted);
    this.pdf.text(key1.toUpperCase(), PAGE.margin, this.y + 8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(...COLORS.dark);
    this.pdf.text(value1, PAGE.margin, this.y + 22);

    // Col 2
    if (key2 && value2) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(...COLORS.muted);
      this.pdf.text(key2.toUpperCase(), PAGE.margin + colWidth, this.y + 8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(11);
      this.pdf.setTextColor(...COLORS.dark);
      this.pdf.text(value2, PAGE.margin + colWidth, this.y + 22);
    }

    this.y += 32;
  }

  // Metric card (colored)
  statCard(label: string, value: string, subtitle: string, color: [number, number, number], x: number, width: number) {
    const h = 74;
    // Background
    this.pdf.setFillColor(...COLORS.lighter);
    this.pdf.roundedRect(x, this.y, width, h, 8, 8, 'F');
    // Top color accent
    this.pdf.setFillColor(...color);
    this.pdf.roundedRect(x, this.y, width, 4, 2, 2, 'F');

    // Value
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(22);
    this.pdf.setTextColor(...color);
    this.pdf.text(value, x + width / 2, this.y + 36, { align: 'center' });

    // Label
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...COLORS.text);
    this.pdf.text(label, x + width / 2, this.y + 54, { align: 'center' });

    // Subtitle
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(...COLORS.muted);
    this.pdf.text(subtitle, x + width / 2, this.y + 66, { align: 'center' });
  }

  statsRow(cards: { label: string; value: string; subtitle: string; color: [number, number, number] }[]) {
    const gap = 10;
    const total = PAGE.width - PAGE.margin * 2;
    const w = (total - gap * (cards.length - 1)) / cards.length;
    this.space(84);
    cards.forEach((c, i) => {
      this.statCard(c.label, c.value, c.subtitle, c.color, PAGE.margin + i * (w + gap), w);
    });
    this.y += 84;
  }

  // Professional table
  table(headers: string[], rows: string[][], widths?: number[], headerColor: [number, number, number] = COLORS.primary) {
    const total = PAGE.width - PAGE.margin * 2;
    const w = widths || headers.map(() => total / headers.length);
    const headerH = 26;
    const rowH = 22;

    // Header row
    this.space(headerH + rowH);
    this.pdf.setFillColor(...headerColor);
    this.pdf.rect(PAGE.margin, this.y, total, headerH, 'F');
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(255, 255, 255);
    let x = PAGE.margin;
    headers.forEach((h, i) => {
      this.pdf.text(h.toUpperCase(), x + 8, this.y + 16);
      x += w[i];
    });
    this.y += headerH;

    // Body rows
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    rows.forEach((row, rIdx) => {
      this.space(rowH);
      if (rIdx % 2 === 0) {
        this.pdf.setFillColor(...COLORS.lighter);
        this.pdf.rect(PAGE.margin, this.y, total, rowH, 'F');
      }
      let cx = PAGE.margin;
      this.pdf.setTextColor(...COLORS.text);
      row.forEach((cell, i) => {
        const lines = this.pdf.splitTextToSize(String(cell || '—'), w[i] - 14);
        this.pdf.text(lines[0] || '—', cx + 8, this.y + 14);
        cx += w[i];
      });
      this.y += rowH;
    });
    this.y += 8;
  }

  // Simple text-based "bar" visualization for data distribution
  barChart(data: { label: string; value: number; color: [number, number, number] }[], maxLabel = 100) {
    if (data.length === 0) return;
    const max = Math.max(...data.map(d => d.value), 1);
    const labelWidth = maxLabel;
    const barWidth = PAGE.width - PAGE.margin * 2 - labelWidth - 60;
    const barH = 18;
    const gap = 6;
    const totalH = data.length * (barH + gap) + 10;
    this.space(totalH);

    data.forEach(d => {
      // Label
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(...COLORS.text);
      this.pdf.text(d.label, PAGE.margin, this.y + 12);

      // Bar background
      this.pdf.setFillColor(...COLORS.light);
      this.pdf.roundedRect(PAGE.margin + labelWidth, this.y, barWidth, barH, 3, 3, 'F');

      // Bar fill
      const fillW = Math.max(2, (d.value / max) * barWidth);
      this.pdf.setFillColor(...d.color);
      this.pdf.roundedRect(PAGE.margin + labelWidth, this.y, fillW, barH, 3, 3, 'F');

      // Value on the right
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(...COLORS.dark);
      this.pdf.text(String(d.value), PAGE.margin + labelWidth + barWidth + 6, this.y + 12);

      this.y += barH + gap;
    });
    this.y += 4;
  }

  // Empty state message
  emptyState(message: string) {
    this.space(40);
    this.pdf.setFillColor(...COLORS.lighter);
    this.pdf.roundedRect(PAGE.margin, this.y, PAGE.width - PAGE.margin * 2, 40, 6, 6, 'F');
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...COLORS.muted);
    this.pdf.text(message, PAGE.width / 2, this.y + 24, { align: 'center' });
    this.y += 48;
  }

  drawFooterAllPages() {
    const pageCount = (this.pdf.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);

      // Bottom border line
      this.pdf.setDrawColor(...COLORS.border);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(PAGE.margin, PAGE.height - 42, PAGE.width - PAGE.margin, PAGE.height - 42);

      // Left: brand
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(...COLORS.muted);
      this.pdf.text('SleepyBabyy • Parent-reported tracking data', PAGE.margin, PAGE.height - 24);

      // Right: page number
      this.pdf.text(`Page ${i} of ${pageCount}`, PAGE.width - PAGE.margin, PAGE.height - 24, { align: 'right' });
    }
  }

  save(filename: string) {
    this.drawFooterAllPages();
    this.pdf.save(filename);
  }
}

// ============ Stats ============

interface Stats {
  totalActivities: number;
  sleepCount: number;
  totalSleepMinutes: number;
  avgSleepMinutes: number;
  longestSleepMinutes: number;
  shortestSleepMinutes: number;
  napCount: number;
  nightCount: number;
  feedingCount: number;
  diaperCount: number;
  customCount: number;
  daysWithData: number;
  avgSleepPerDay: number;
  avgFeedingsPerDay: number;
  avgDiapersPerDay: number;
}

function computeStats(logs: ReportLog[], dateRange: DateRange): Stats {
  const sleep = logs.filter(l => l.activity_type === 'sleep');
  const feeding = logs.filter(l => l.activity_type === 'feeding');
  const diaper = logs.filter(l => l.activity_type === 'diaper');
  const custom = logs.filter(l => l.activity_type === 'custom');

  const sleepDurations = sleep.map(l => l.duration_minutes || 0).filter(d => d > 0);
  const totalSleep = sleepDurations.reduce((s, d) => s + d, 0);

  let napCount = 0, nightCount = 0;
  sleep.forEach(l => {
    const hour = new Date(l.start_time).getHours();
    classifySleep(hour) === 'nap' ? napCount++ : nightCount++;
  });

  // Unique days with any data
  const uniqueDays = new Set(logs.map(l => new Date(l.start_time).toDateString()));

  // Number of days in the range
  const rangeDays = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    totalActivities: logs.length,
    sleepCount: sleep.length,
    totalSleepMinutes: totalSleep,
    avgSleepMinutes: sleepDurations.length > 0 ? totalSleep / sleepDurations.length : 0,
    longestSleepMinutes: sleepDurations.length > 0 ? Math.max(...sleepDurations) : 0,
    shortestSleepMinutes: sleepDurations.length > 0 ? Math.min(...sleepDurations) : 0,
    napCount,
    nightCount,
    feedingCount: feeding.length,
    diaperCount: diaper.length,
    customCount: custom.length,
    daysWithData: uniqueDays.size,
    avgSleepPerDay: uniqueDays.size > 0 ? totalSleep / uniqueDays.size : 0,
    avgFeedingsPerDay: uniqueDays.size > 0 ? feeding.length / uniqueDays.size : 0,
    avgDiapersPerDay: uniqueDays.size > 0 ? diaper.length / uniqueDays.size : 0,
  };
}

// ============ Report sections ============

function renderHeader(b: PdfBuilder, title: string, subtitle: string, color: [number, number, number], profileName: string, age: string | null, birthDate: string | null | undefined, dateRange: DateRange, daysWithData: number) {
  b.drawBrandHeader(`Report generated ${formatDate(new Date())}`, color);

  // Hero title
  b.heroTitle(title, color);
  b.paragraph(subtitle, 11, COLORS.muted);
  b.y += 6;
  b.hr(0.5);

  // Patient info (2-column metadata)
  b.metaRow(
    'Patient Name', profileName,
    'Age', age || 'Not specified'
  );
  b.metaRow(
    'Date of Birth', birthDate ? formatDate(birthDate) : 'Not specified',
    'Report Type', title
  );
  b.metaRow(
    'Reporting Period', `${formatDate(dateRange.start)} → ${formatDate(dateRange.end)}`,
    'Days with Data', `${daysWithData} day${daysWithData === 1 ? '' : 's'}`
  );
  b.y += 4;
  b.hr(0.5);
}

function renderClinicalDisclaimer(b: PdfBuilder) {
  b.infoBox(
    'Clinical Notice',
    'This report is based on parent-reported tracking data from the SleepyBabyy mobile app. Information is intended to supplement clinical assessment and should not replace professional medical evaluation. Please combine with in-person observations and developmental screenings.',
    COLORS.warning
  );
}

// ============ Comprehensive Health Report ============

function renderComprehensive(b: PdfBuilder, input: ReportInput, stats: Stats) {
  const { logs, profileName, birthDate, dateRange } = input;
  const age = calculateAge(birthDate);

  renderHeader(b, 'Comprehensive Health Report', 'A full overview of sleep, feeding, diapering, and activity patterns.', COLORS.primary, profileName, age, birthDate, dateRange, stats.daysWithData);

  // Executive Summary
  b.sectionTitle('Executive Summary', COLORS.primary);
  if (stats.totalActivities === 0) {
    b.emptyState('No tracking data recorded during this period.');
  } else {
    const summary = `During this ${Math.round((dateRange.end.getTime() - dateRange.start.getTime()) / (1000*60*60*24))}-day period, ${stats.totalActivities} activities were logged across ${stats.daysWithData} day${stats.daysWithData === 1 ? '' : 's'}. The baby averaged ${formatDuration(stats.avgSleepPerDay)} of sleep per tracked day across ${stats.sleepCount} sleep sessions (${stats.napCount} naps, ${stats.nightCount} night sessions). A total of ${stats.feedingCount} feedings and ${stats.diaperCount} diaper changes were recorded.`;
    b.paragraph(summary, 10);
  }

  // Key Metrics
  b.sectionTitle('Key Metrics', COLORS.primary);
  b.statsRow([
    { label: 'TOTAL SLEEP', value: formatDuration(stats.totalSleepMinutes), subtitle: `across ${stats.sleepCount} sessions`, color: COLORS.sleep },
    { label: 'AVG SLEEP / SESSION', value: formatDuration(stats.avgSleepMinutes), subtitle: 'per sleep session', color: COLORS.sleep },
    { label: 'FEEDINGS', value: String(stats.feedingCount), subtitle: `${stats.avgFeedingsPerDay.toFixed(1)}/day avg`, color: COLORS.feeding },
    { label: 'DIAPERS', value: String(stats.diaperCount), subtitle: `${stats.avgDiapersPerDay.toFixed(1)}/day avg`, color: COLORS.diaper },
  ]);

  // Activity Distribution
  b.sectionTitle('Activity Distribution', COLORS.primary);
  if (stats.totalActivities === 0) {
    b.emptyState('No activity data available.');
  } else {
    b.barChart([
      { label: 'Sleep', value: stats.sleepCount, color: COLORS.sleep },
      { label: 'Feeding', value: stats.feedingCount, color: COLORS.feeding },
      { label: 'Diaper', value: stats.diaperCount, color: COLORS.diaper },
      { label: 'Other', value: stats.customCount, color: COLORS.custom },
    ], 70);
  }

  // Sleep Details
  b.sectionTitle('Sleep Overview', COLORS.sleep);
  if (stats.sleepCount === 0) {
    b.emptyState('No sleep sessions recorded.');
  } else {
    b.statsRow([
      { label: 'NAPS', value: String(stats.napCount), subtitle: 'daytime sleep', color: COLORS.sleep },
      { label: 'NIGHT SLEEP', value: String(stats.nightCount), subtitle: 'nighttime sleep', color: COLORS.sleep },
      { label: 'LONGEST', value: formatDuration(stats.longestSleepMinutes), subtitle: 'single session', color: COLORS.sleep },
    ]);
  }

  // Feeding Details
  b.sectionTitle('Feeding Overview', COLORS.feeding);
  const feedingLogs = logs.filter(l => l.activity_type === 'feeding');
  if (feedingLogs.length === 0) {
    b.emptyState('No feeding sessions recorded.');
  } else {
    // Recent feedings table (up to 15 most recent)
    const recent = [...feedingLogs]
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 15);
    const rows = recent.map(l => {
      const type = l.metadata?.feeding_type || l.metadata?.type || 'Feeding';
      return [
        formatDateTime(l.start_time),
        String(type),
        formatDuration(l.duration_minutes),
        l.notes || '—'
      ];
    });
    b.table(['Date & Time', 'Type', 'Duration', 'Notes'], rows, [180, 100, 70, 165], COLORS.feeding);
  }

  // Recent Activities (all types)
  b.sectionTitle('Recent Activities', COLORS.primary);
  const recent = [...logs]
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 20);
  if (recent.length === 0) {
    b.emptyState('No activities recorded.');
  } else {
    const rows = recent.map(l => [
      l.activity_type.charAt(0).toUpperCase() + l.activity_type.slice(1),
      formatDateTime(l.start_time),
      formatDuration(l.duration_minutes),
      l.notes || '—'
    ]);
    b.table(['Type', 'Date & Time', 'Duration', 'Notes'], rows, [90, 180, 70, 175]);
  }

  // Disclaimer at the end
  b.y += 10;
  renderClinicalDisclaimer(b);
}

// ============ Sleep Pattern Analysis ============

function renderSleep(b: PdfBuilder, input: ReportInput, stats: Stats) {
  const { logs, profileName, birthDate, dateRange } = input;
  const age = calculateAge(birthDate);
  const sleepLogs = logs.filter(l => l.activity_type === 'sleep');

  renderHeader(b, 'Sleep Pattern Analysis', 'Detailed analysis of sleep duration, distribution, and trends.', COLORS.sleep, profileName, age, birthDate, dateRange, stats.daysWithData);

  // Executive Summary
  b.sectionTitle('Summary', COLORS.sleep);
  if (stats.sleepCount === 0) {
    b.emptyState('No sleep data recorded during this period.');
    b.y += 10;
    renderClinicalDisclaimer(b);
    return;
  }

  const summary = `Over the reporting period, ${stats.sleepCount} sleep session${stats.sleepCount === 1 ? ' was' : 's were'} recorded, totaling ${formatDuration(stats.totalSleepMinutes)}. The baby averaged ${formatDuration(stats.avgSleepPerDay)} per tracked day, with an average session length of ${formatDuration(stats.avgSleepMinutes)}.`;
  b.paragraph(summary, 10);

  // Key Metrics
  b.sectionTitle('Key Sleep Metrics', COLORS.sleep);
  b.statsRow([
    { label: 'TOTAL SLEEP', value: formatDuration(stats.totalSleepMinutes), subtitle: 'across period', color: COLORS.sleep },
    { label: 'AVG / DAY', value: formatDuration(stats.avgSleepPerDay), subtitle: 'per tracked day', color: COLORS.sleep },
    { label: 'AVG / SESSION', value: formatDuration(stats.avgSleepMinutes), subtitle: 'per sleep event', color: COLORS.sleep },
  ]);

  b.statsRow([
    { label: 'LONGEST SESSION', value: formatDuration(stats.longestSleepMinutes), subtitle: 'continuous sleep', color: COLORS.sleep },
    { label: 'SHORTEST SESSION', value: formatDuration(stats.shortestSleepMinutes), subtitle: 'shortest logged', color: COLORS.sleep },
    { label: 'TOTAL SESSIONS', value: String(stats.sleepCount), subtitle: 'sleep events', color: COLORS.sleep },
  ]);

  // Nap vs Night distribution
  b.sectionTitle('Nap vs Night Sleep', COLORS.sleep);
  b.barChart([
    { label: 'Naps (6am–7pm)', value: stats.napCount, color: COLORS.sleep },
    { label: 'Night (7pm–6am)', value: stats.nightCount, color: [79, 70, 229] },
  ]);

  // Sleep by day-of-week
  b.sectionTitle('Sleep by Day of Week', COLORS.sleep);
  const dayOfWeekTotals: Record<string, number> = {};
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(d => dayOfWeekTotals[d] = 0);
  sleepLogs.forEach(l => {
    const day = dayNames[new Date(l.start_time).getDay()];
    dayOfWeekTotals[day] += l.duration_minutes || 0;
  });
  const dayChartData = dayNames.map(d => ({
    label: d,
    value: Math.round(dayOfWeekTotals[d] / 60 * 10) / 10,
    color: COLORS.sleep
  }));
  // Use hours in label
  b.paragraph('Total sleep hours recorded on each day of the week:', 9, COLORS.muted);
  b.barChart(dayChartData, 70);

  // Detailed sleep log
  b.sectionTitle('Detailed Sleep Log', COLORS.sleep);
  const recent = [...sleepLogs]
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 50);
  const rows = recent.map(l => {
    const start = new Date(l.start_time);
    const hour = start.getHours();
    const category = classifySleep(hour) === 'nap' ? 'Nap' : 'Night';
    return [
      category,
      formatDate(start),
      formatTime(start),
      formatDuration(l.duration_minutes),
      l.notes || '—'
    ];
  });
  b.table(['Category', 'Date', 'Start Time', 'Duration', 'Notes'], rows, [60, 110, 80, 70, 195], COLORS.sleep);

  b.y += 10;
  renderClinicalDisclaimer(b);
}

// ============ Growth & Development Report ============

function renderGrowth(b: PdfBuilder, input: ReportInput, stats: Stats) {
  const { logs, profileName, birthDate, dateRange } = input;
  const age = calculateAge(birthDate);

  // Special handling: if report type is "since birth" use birth date as start
  const effectiveStart = birthDate ? new Date(birthDate) : dateRange.start;
  const effectiveRange: DateRange = {
    start: effectiveStart,
    end: dateRange.end,
    label: birthDate ? `Since birth` : dateRange.label,
  };

  // Use the effective range for stats (since birth)
  const effectiveStats = birthDate
    ? computeStats(logs.filter(l => new Date(l.start_time) >= effectiveStart), effectiveRange)
    : stats;

  renderHeader(b, 'Growth & Development Report', 'A developmental tracking overview from birth to the present.', COLORS.custom, profileName, age, birthDate, effectiveRange, effectiveStats.daysWithData);

  // Summary
  b.sectionTitle('Developmental Snapshot', COLORS.custom);
  const daysAlive = birthDate ? Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (1000*60*60*24)) : 0;
  const intro = birthDate
    ? `${profileName} is currently ${age}. Since birth (${daysAlive} days ago), ${effectiveStats.totalActivities} activit${effectiveStats.totalActivities === 1 ? 'y has' : 'ies have'} been tracked across ${effectiveStats.daysWithData} day${effectiveStats.daysWithData === 1 ? '' : 's'} of parent-reported data.`
    : `A total of ${effectiveStats.totalActivities} activit${effectiveStats.totalActivities === 1 ? 'y has' : 'ies have'} been tracked across ${effectiveStats.daysWithData} day${effectiveStats.daysWithData === 1 ? '' : 's'} of parent-reported data.`;
  b.paragraph(intro, 10);

  if (!birthDate) {
    b.infoBox(
      'Tip',
      'Adding a date of birth to the baby profile will unlock age-based insights and allow this report to calculate growth metrics from birth.',
      COLORS.info
    );
  }

  // Lifetime Metrics
  b.sectionTitle('Lifetime Activity Summary', COLORS.custom);
  b.statsRow([
    { label: 'TOTAL ACTIVITIES', value: String(effectiveStats.totalActivities), subtitle: 'all-time logged', color: COLORS.custom },
    { label: 'SLEEP SESSIONS', value: String(effectiveStats.sleepCount), subtitle: 'total naps + nights', color: COLORS.sleep },
    { label: 'FEEDINGS', value: String(effectiveStats.feedingCount), subtitle: 'total feedings', color: COLORS.feeding },
    { label: 'DIAPER CHANGES', value: String(effectiveStats.diaperCount), subtitle: 'total changes', color: COLORS.diaper },
  ]);

  // Daily averages
  b.sectionTitle('Daily Averages', COLORS.custom);
  b.paragraph('Average activity per day (based on days with recorded data):', 9, COLORS.muted);
  b.statsRow([
    { label: 'SLEEP / DAY', value: formatDuration(effectiveStats.avgSleepPerDay), subtitle: `${(effectiveStats.sleepCount / Math.max(1, effectiveStats.daysWithData)).toFixed(1)} sessions`, color: COLORS.sleep },
    { label: 'FEEDINGS / DAY', value: effectiveStats.avgFeedingsPerDay.toFixed(1), subtitle: 'per tracked day', color: COLORS.feeding },
    { label: 'DIAPERS / DAY', value: effectiveStats.avgDiapersPerDay.toFixed(1), subtitle: 'per tracked day', color: COLORS.diaper },
  ]);

  // Activity distribution
  b.sectionTitle('Activity Distribution', COLORS.custom);
  if (effectiveStats.totalActivities === 0) {
    b.emptyState('No activity data available.');
  } else {
    b.barChart([
      { label: 'Sleep', value: effectiveStats.sleepCount, color: COLORS.sleep },
      { label: 'Feeding', value: effectiveStats.feedingCount, color: COLORS.feeding },
      { label: 'Diaper', value: effectiveStats.diaperCount, color: COLORS.diaper },
      { label: 'Custom', value: effectiveStats.customCount, color: COLORS.custom },
    ], 70);
  }

  // Custom / milestone activities
  const customLogs = logs.filter(l => l.activity_type === 'custom');
  b.sectionTitle('Custom Activities & Milestones', COLORS.custom);
  if (customLogs.length === 0) {
    b.emptyState('No custom activities or milestones logged.');
  } else {
    const recent = [...customLogs]
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 20);
    const rows = recent.map(l => {
      const activityName = l.metadata?.activity_name || l.metadata?.name || 'Custom Activity';
      return [
        String(activityName),
        formatDateTime(l.start_time),
        formatDuration(l.duration_minutes),
        l.notes || '—'
      ];
    });
    b.table(['Activity', 'Date & Time', 'Duration', 'Notes'], rows, [140, 170, 70, 135], COLORS.custom);
  }

  b.y += 10;
  renderClinicalDisclaimer(b);
}

// ============ Main entry ============

export async function exportReportAsPDF(input: ReportInput): Promise<void> {
  const b = new PdfBuilder();
  const stats = computeStats(input.logs, input.dateRange);

  if (input.reportType === 'comprehensive') {
    renderComprehensive(b, input, stats);
  } else if (input.reportType === 'sleep') {
    renderSleep(b, input, stats);
  } else if (input.reportType === 'growth') {
    renderGrowth(b, input, stats);
  }

  b.save(input.filename);
}

// ============ Backward-compatible wrapper (DOM-based entry point, no longer used) ============
export async function exportNodeAsPDF(_nodeRef: HTMLElement, filename: string): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Please refresh the page to use the updated report generator.', 40, 60);
  pdf.save(filename);
}
