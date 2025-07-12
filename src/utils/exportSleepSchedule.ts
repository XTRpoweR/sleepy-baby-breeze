
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ScheduleRecommendation } from "@/types/sleepSchedule";

export async function exportSleepScheduleAsPDF(
  recommendation: ScheduleRecommendation, 
  childAge?: number,
  filename = "sleep-schedule.pdf"
) {
  // Create a temporary div to render the schedule
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '40px';
  tempDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  tempDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Personalized Sleep Schedule</h1>
      ${childAge ? `<p style="color: #6b7280; font-size: 16px;">For ${childAge} month old child</p>` : ''}
      <p style="color: #6b7280; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center;">
        <h3 style="color: #3b82f6; font-size: 16px; margin-bottom: 10px;">🌙 Bedtime</h3>
        <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${formatTime(recommendation.bedtime)}</div>
      </div>
      <div style="border: 2px solid #eab308; border-radius: 12px; padding: 20px; text-align: center;">
        <h3 style="color: #eab308; font-size: 16px; margin-bottom: 10px;">☀️ Wake Time</h3>
        <div style="font-size: 24px; font-weight: bold; color: #eab308;">${formatTime(recommendation.wakeTime)}</div>
      </div>
    </div>

    ${recommendation.naps.length > 0 ? `
    <div style="margin-bottom: 30px;">
      <h3 style="color: #059669; font-size: 18px; margin-bottom: 15px;">🕐 Nap Schedule</h3>
      ${recommendation.naps.map(nap => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 8px;">
          <div>
            <strong style="color: #065f46;">${nap.name}</strong>
            <div style="color: #059669; font-size: 14px;">Duration: ${formatDuration(nap.duration)}</div>
          </div>
          <div style="font-size: 18px; font-weight: bold; color: #065f46;">${formatTime(nap.startTime)}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div style="margin-bottom: 30px;">
      <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">📅 Daily Schedule Overview</h3>
      <div style="background-color: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: 500;">Wake Up</span>
          <span style="color: #d97706; font-weight: bold;">${formatTime(recommendation.wakeTime)}</span>
        </div>
      </div>
      ${recommendation.naps.map(nap => `
        <div style="background-color: #f0fdf4; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 500;">${nap.name}</span>
            <span style="color: #059669; font-weight: bold;">${formatTime(nap.startTime)} (${formatDuration(nap.duration)})</span>
          </div>
        </div>
      `).join('')}
      <div style="background-color: #dbeafe; padding: 12px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: 500;">Bedtime</span>
          <span style="color: #2563eb; font-weight: bold;">${formatTime(recommendation.bedtime)}</span>
        </div>
      </div>
    </div>

    <div style="background-color: #faf5ff; border: 1px solid #d4b4fe; border-radius: 12px; padding: 20px;">
      <h3 style="color: #7c3aed; font-size: 16px; margin-bottom: 15px;">💡 Implementation Tips</h3>
      <ul style="color: #7c3aed; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Gradually adjust current times by 15-30 minutes every few days</li>
        <li>Keep consistent wake times even on weekends</li>
        <li>Create a calming bedtime routine 30-60 minutes before sleep</li>
        <li>Ensure the sleep environment is dark, quiet, and comfortable</li>
        <li>Be patient - it may take 1-2 weeks for the new schedule to feel natural</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        Total Sleep: ${recommendation.totalSleepHours}h per day<br>
        Generated by BabyTracker Sleep Schedule Planner
      </p>
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      backgroundColor: "#fff",
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = {
      width: canvas.width,
      height: canvas.height
    };
    
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } finally {
    document.body.removeChild(tempDiv);
  }
}
