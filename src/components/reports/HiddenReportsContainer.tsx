
import React, { ForwardedRef } from "react";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { DetailedSleepAnalytics } from "@/components/reports/DetailedSleepAnalytics";
import { FeedingAnalytics } from "@/components/reports/FeedingAnalytics";
import { ActivitySummary } from "@/components/reports/ActivitySummary";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportFooter } from "@/components/reports/ReportFooter";
import { ClinicalInsights } from "@/components/reports/ClinicalInsights";
import { getDateRange, DateRangeOption } from "@/utils/dateRangeUtils";

interface HiddenReportsContainerProps {
  comprehensiveRef: ForwardedRef<HTMLDivElement>;
  sleepRef: ForwardedRef<HTMLDivElement>;
  growthRef: ForwardedRef<HTMLDivElement>;
  activeProfile: { id: string; name: string };
  comprehensiveRange: DateRangeOption;
  sleepRange: DateRangeOption;
  growthRange: DateRangeOption;
}

export const HiddenReportsContainer: React.FC<HiddenReportsContainerProps> = ({
  comprehensiveRef,
  sleepRef,
  growthRef,
  activeProfile,
  comprehensiveRange,
  sleepRange,
  growthRange,
}) => {
  const comprehensiveDateRange = getDateRange(comprehensiveRange);
  const sleepDateRange = getDateRange(sleepRange);
  const growthDateRange = getDateRange(growthRange);

  const reportStyles: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    minHeight: 'auto',
    pageBreakInside: 'avoid',
  };

  const sectionStyles: React.CSSProperties = {
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
    marginBottom: '24px',
  };

  return (
    <div style={{ position: "fixed", left: -9999, top: -9999, width: "900px", pointerEvents: "none", opacity: 0 }}>
      {/* Comprehensive Health Report */}
      <div ref={comprehensiveRef} className="bg-white p-8" style={reportStyles} data-pdf-fit="single">
        <div style={sectionStyles} data-pdf-section="header">
          <ReportHeader 
            reportTitle="Comprehensive Health Report"
            patientName={activeProfile.name}
            dateRange={comprehensiveDateRange}
            reportType="Full Health Overview"
          />
        </div>
        
        <div style={sectionStyles} data-pdf-section="insights">
          <ClinicalInsights insights={[
            { type: 'neutral', text: 'This report provides a comprehensive overview of tracked activities including sleep, feeding, and care routines.' },
            { type: 'neutral', text: 'Data is parent-reported and may not capture all activities or exact measurements.' }
          ]} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="overview">
          <ReportsOverview babyId={activeProfile.id} dateRange={comprehensiveDateRange} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="sleep">
          <DetailedSleepAnalytics babyId={activeProfile.id} dateRange={comprehensiveDateRange} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="feeding">
          <FeedingAnalytics babyId={activeProfile.id} dateRange={comprehensiveDateRange} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="activity">
          <ActivitySummary babyId={activeProfile.id} dateRange={comprehensiveDateRange} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="footer">
          <ReportFooter />
        </div>
      </div>

      {/* Sleep Pattern Analysis */}
      <div ref={sleepRef} className="bg-white p-8" style={reportStyles} data-pdf-fit="single">
        <div style={sectionStyles} data-pdf-section="header">
          <ReportHeader 
            reportTitle="Sleep Pattern Analysis"
            patientName={activeProfile.name}
            dateRange={sleepDateRange}
            reportType="Sleep Tracking Report"
          />
        </div>
        
        <div style={sectionStyles} data-pdf-section="insights">
          <ClinicalInsights insights={[
            { type: 'neutral', text: 'This report focuses on sleep patterns, duration, and quality metrics.' },
            { type: 'neutral', text: 'Sleep data includes both parent-tracked sessions and manual log entries.' }
          ]} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="sleep">
          <DetailedSleepAnalytics babyId={activeProfile.id} dateRange={sleepDateRange} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="overview">
          <ReportsOverview babyId={activeProfile.id} dateRange={sleepDateRange} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="footer">
          <ReportFooter />
        </div>
      </div>

      {/* Growth & Development Report */}
      <div ref={growthRef} className="bg-white p-8" style={reportStyles}>
        <div style={sectionStyles} data-pdf-section="header">
          <ReportHeader 
            reportTitle="Growth & Development Report"
            patientName={activeProfile.name}
            dateRange={growthDateRange}
            reportType="Developmental Tracking"
          />
        </div>
        
        <div style={sectionStyles} data-pdf-section="insights">
          <ClinicalInsights insights={[
            { type: 'neutral', text: 'This report tracks developmental activities and growth patterns over time.' },
            { type: 'neutral', text: 'Please combine with clinical measurements for complete assessment.' }
          ]} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="overview">
          <ReportsOverview babyId={activeProfile.id} dateRange={growthDateRange} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="activity">
          <ActivitySummary babyId={activeProfile.id} dateRange={growthDateRange} />
        </div>
        
        <div style={sectionStyles} data-pdf-section="footer">
          <ReportFooter />
        </div>
      </div>
    </div>
  );
};

