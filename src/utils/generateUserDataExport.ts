import jsPDF from "jspdf";

// Shape returned by the export-user-data edge function (loosely typed —
// we just render what's present without assuming every field exists).
export interface ExportData {
  export_version?: string;
  exported_at?: string;
  account?: {
    id?: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
    user_metadata?: Record<string, any>;
  };
  profile?: any;
  babies?: any[];
  baby_activities?: any[];
  baby_memories?: any[];
  sleep_schedules?: any[];
  family?: {
    memberships?: any[];
    members_invited_by_me?: any[];
    invitations_sent?: any[];
    invitations_received?: any[];
    messages_sent?: any[];
    message_participations?: any[];
  };
  chat?: { conversations?: any[]; messages?: any[] };
  subscriptions?: any[];
  notifications?: {
    settings?: any[];
    push_subscriptions?: any[];
    scheduled?: any[];
  };
  activity?: {
    user_queries?: any[];
    user_locations?: any[];
    security_events?: any[];
    user_sessions?: any[];
  };
  newsletter_subscribers?: any[];
}

const PAGE = { width: 595.28, height: 841.89, margin: 40 };
const COLORS = {
  primary: [99, 102, 241] as [number, number, number],
  text: [31, 41, 55] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  light: [243, 244, 246] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
  accent: [16, 185, 129] as [number, number, number],
};

function formatDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}

function formatShortDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d);
  }
}

function formatActivityType(type?: string): string {
  if (!type) return "—";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDuration(minutes?: number | null): string {
  if (minutes == null) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function generateUserDataPDF(data: ExportData, filename?: string): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const totalPagesPlaceholder = "{TOTAL_PAGES}";
  let y = PAGE.margin;
  let pageNumber = 1;

  const drawFooter = () => {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Sleepy Babyy — personal data export",
      PAGE.margin,
      PAGE.height - 20,
    );
    doc.text(
      `Page ${pageNumber} of ${totalPagesPlaceholder}`,
      PAGE.width - PAGE.margin,
      PAGE.height - 20,
      { align: "right" },
    );
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE.height - PAGE.margin - 30) {
      drawFooter();
      doc.addPage();
      pageNumber++;
      y = PAGE.margin;
    }
  };

  const addHeading = (text: string) => {
    ensureSpace(50);
    doc.setFillColor(...COLORS.primary);
    doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(text, PAGE.margin + 12, y + 19);
    y += 38;
  };

  const addSubtitle = (text: string) => {
    ensureSpace(20);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(text, PAGE.margin, y);
    y += 16;
  };

  const addKeyValueRow = (label: string, value: string) => {
    ensureSpace(18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    doc.text(label, PAGE.margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const wrapped = doc.splitTextToSize(value || "—", PAGE.width - PAGE.margin * 2 - 130);
    doc.text(wrapped, PAGE.margin + 130, y);
    y += 14 * Math.max(wrapped.length, 1) + 4;
  };

  const addNote = (text: string) => {
    ensureSpace(16);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text(text, PAGE.margin, y);
    y += 14;
  };

  const addEmptyRow = (label: string) => {
    addNote(`No ${label} on file.`);
    y += 6;
  };

  const addTable = (
    columns: { header: string; key: string; width: number; format?: (v: any, row: any) => string }[],
    rows: any[],
    maxRows: number = 50,
  ) => {
    const colTotal = columns.reduce((s, c) => s + c.width, 0);
    const usableWidth = PAGE.width - PAGE.margin * 2;
    const scale = usableWidth / colTotal;

    const headerHeight = 22;
    const rowHeight = 16;

    ensureSpace(headerHeight + rowHeight + 10);

    // Header
    let x = PAGE.margin;
    doc.setFillColor(...COLORS.light);
    doc.rect(PAGE.margin, y, usableWidth, headerHeight, "F");
    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    for (const col of columns) {
      doc.text(col.header, x + 6, y + 14);
      x += col.width * scale;
    }
    y += headerHeight;

    // Rows
    const shown = rows.slice(0, maxRows);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (let i = 0; i < shown.length; i++) {
      ensureSpace(rowHeight + 4);
      if (i % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(PAGE.margin, y, usableWidth, rowHeight, "F");
      }
      x = PAGE.margin;
      doc.setTextColor(...COLORS.text);
      for (const col of columns) {
        const formatted = col.format
          ? col.format(shown[i][col.key], shown[i])
          : shown[i][col.key] ?? "—";
        const raw = String(formatted);
        const maxChars = Math.floor((col.width * scale - 12) / 4.5);
        const text = raw.length > maxChars ? raw.slice(0, maxChars - 1) + "…" : raw;
        doc.text(text, x + 6, y + 11);
        x += col.width * scale;
      }
      y += rowHeight;
    }

    if (rows.length > maxRows) {
      y += 4;
      addNote(`Showing ${maxRows} of ${rows.length} entries — full data is in the JSON export.`);
    }
    y += 10;
  };

  // === Cover ===
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 120, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("My Sleepy Babyy Data", PAGE.margin, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("A copy of everything we store about your account.", PAGE.margin, 85);
  y = 150;

  // === Account section ===
  addHeading("Account");
  addKeyValueRow("Email:", data.account?.email ?? "—");
  addKeyValueRow("Full name:", data.account?.user_metadata?.full_name ?? data.profile?.full_name ?? "—");
  addKeyValueRow("Account ID:", data.account?.id ?? "—");
  addKeyValueRow("Account created:", formatDate(data.account?.created_at));
  addKeyValueRow("Last sign in:", formatDate(data.account?.last_sign_in_at));
  addKeyValueRow("Export generated:", formatDate(data.exported_at ?? new Date().toISOString()));
  y += 8;

  // === Babies ===
  addHeading("Baby Profiles");
  const babies = data.babies ?? [];
  if (babies.length === 0) {
    addEmptyRow("baby profiles");
  } else {
    addTable(
      [
        { header: "Name", key: "name", width: 30 },
        { header: "Birth Date", key: "birth_date", width: 25, format: (v) => formatShortDate(v) },
        { header: "Created", key: "created_at", width: 25, format: (v) => formatShortDate(v) },
        { header: "Active", key: "is_active", width: 20, format: (v) => (v ? "Yes" : "No") },
      ],
      babies,
    );
  }

  // === Activities ===
  addHeading("Activities");
  const activities = (data.baby_activities ?? []).slice().sort(
    (a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
  );
  addSubtitle(`Total recorded: ${activities.length}`);
  if (activities.length === 0) {
    addEmptyRow("activities");
  } else {
    addTable(
      [
        { header: "Type", key: "activity_type", width: 22, format: (v) => formatActivityType(v) },
        { header: "Start", key: "start_time", width: 38, format: (v) => formatDate(v) },
        { header: "Duration", key: "duration_minutes", width: 20, format: (v) => formatDuration(v) },
        { header: "Notes", key: "notes", width: 40, format: (v) => v ?? "—" },
      ],
      activities,
      40,
    );
  }

  // === Sleep schedules ===
  addHeading("Sleep Schedules");
  const schedules = data.sleep_schedules ?? [];
  if (schedules.length === 0) {
    addEmptyRow("saved sleep schedules");
  } else {
    addTable(
      [
        { header: "Child Age", key: "child_age", width: 20, format: (v) => `${v ?? "—"} months` },
        { header: "Bedtime", key: "current_bedtime", width: 25 },
        { header: "Wake Time", key: "current_wake_time", width: 25 },
        { header: "Sleep Hours", key: "total_sleep_hours", width: 25, format: (v) => v ?? "—" },
        { header: "Saved", key: "created_at", width: 25, format: (v) => formatShortDate(v) },
      ],
      schedules,
    );
  }

  // === Memories ===
  addHeading("Photo & Video Memories");
  const memories = data.baby_memories ?? [];
  if (memories.length === 0) {
    addEmptyRow("memories");
  } else {
    addTable(
      [
        { header: "Title", key: "title", width: 35, format: (v) => v ?? "(untitled)" },
        { header: "Type", key: "media_type", width: 15 },
        { header: "Taken", key: "taken_at", width: 25, format: (v) => formatShortDate(v) },
        { header: "Uploaded", key: "created_at", width: 25, format: (v) => formatShortDate(v) },
      ],
      memories,
    );
  }

  // === Family sharing ===
  addHeading("Family Sharing");
  const memberships = data.family?.memberships ?? [];
  const invitedByMe = data.family?.members_invited_by_me ?? [];
  const invSent = data.family?.invitations_sent ?? [];
  const invReceived = data.family?.invitations_received ?? [];
  addKeyValueRow("My memberships:", String(memberships.length));
  addKeyValueRow("People I invited (joined):", String(invitedByMe.length));
  addKeyValueRow("Invitations I sent:", String(invSent.length));
  addKeyValueRow("Invitations I received:", String(invReceived.length));
  y += 8;

  // === Subscriptions ===
  addHeading("Subscription & Billing");
  const subs = data.subscriptions ?? [];
  if (subs.length === 0) {
    addEmptyRow("subscriptions");
  } else {
    addTable(
      [
        { header: "Plan", key: "subscription_tier", width: 25 },
        { header: "Status", key: "status", width: 20 },
        { header: "Billing", key: "billing_cycle", width: 20 },
        { header: "Period ends", key: "current_period_end", width: 30, format: (v) => formatShortDate(v) },
        { header: "Trial?", key: "is_trial", width: 15, format: (v) => (v ? "Yes" : "No") },
      ],
      subs,
    );
  }

  // === Notification settings ===
  addHeading("Notification Settings");
  const notif = data.notifications?.settings ?? [];
  if (notif.length === 0) {
    addEmptyRow("notification settings");
  } else {
    const n = notif[0] ?? {};
    addKeyValueRow("Notifications enabled:", n.notifications_enabled ? "Yes" : "No");
    addKeyValueRow("Feeding reminders:", n.feeding_reminders ? "Yes" : "No");
    addKeyValueRow("Sleep reminders:", n.sleep_reminders ? "Yes" : "No");
    addKeyValueRow("Milestone reminders:", n.milestone_reminders ? "Yes" : "No");
    addKeyValueRow("Pattern alerts:", n.pattern_alerts ? "Yes" : "No");
    addKeyValueRow("Quiet hours:", n.quiet_hours_enabled ? `${n.quiet_hours_start} – ${n.quiet_hours_end}` : "Off");
    y += 8;
  }
  addKeyValueRow("Push subscriptions registered:", String(data.notifications?.push_subscriptions?.length ?? 0));
  addKeyValueRow("Scheduled notifications stored:", String(data.notifications?.scheduled?.length ?? 0));
  y += 8;

  // === Chat assistant ===
  addHeading("Chat Assistant History");
  addKeyValueRow("Conversations:", String(data.chat?.conversations?.length ?? 0));
  addKeyValueRow("Messages:", String(data.chat?.messages?.length ?? 0));
  addNote("Full chat history is included in the JSON export if you need it.");
  y += 8;

  // === Activity / security ===
  addHeading("Account Activity");
  addKeyValueRow("Sign-in / security events:", String(data.activity?.security_events?.length ?? 0));
  addKeyValueRow("Tracked sessions:", String(data.activity?.user_sessions?.length ?? 0));
  addKeyValueRow("Support queries sent:", String(data.activity?.user_queries?.length ?? 0));
  addKeyValueRow("Location records:", String(data.activity?.user_locations?.length ?? 0));
  y += 8;

  // === Footer page ===
  ensureSpace(60);
  doc.setDrawColor(...COLORS.border);
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 14;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  const disclaimer = doc.splitTextToSize(
    "This document is a human-readable summary of your data. If you want the complete raw data (including chat messages, full activity log, and metadata), you can request a JSON export — contact support or use the developer export option.",
    PAGE.width - PAGE.margin * 2,
  );
  doc.text(disclaimer, PAGE.margin, y);

  drawFooter();

  // Substitute total page count on every page footer
  const total = (doc as any).getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.setFillColor(255, 255, 255);
    doc.rect(PAGE.width - PAGE.margin - 80, PAGE.height - 30, 80, 14, "F");
    doc.text(`Page ${i} of ${total}`, PAGE.width - PAGE.margin, PAGE.height - 20, { align: "right" });
  }

  const finalName =
    filename ??
    `sleepybabyy-data-${(data.account?.id ?? "user").slice(0, 8)}-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
  doc.save(finalName);
}
