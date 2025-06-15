
import React, { ForwardedRef } from "react";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { SleepAnalytics } from "@/components/reports/SleepAnalytics";
import { FeedingAnalytics } from "@/components/reports/FeedingAnalytics";
import { ActivitySummary } from "@/components/reports/ActivitySummary";
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
}) => (
  <div style={{ position: "fixed", left: -9999, top: -9999, width: "800px", pointerEvents: "none", opacity: 0 }}>
    <div ref={comprehensiveRef}>
      <h2 className="text-2xl font-bold mb-2">Comprehensive Health Report</h2>
      <ReportsOverview babyId={activeProfile.id} dateRange={getDateRange(comprehensiveRange)} />
      <SleepAnalytics babyId={activeProfile.id} dateRange={getDateRange(comprehensiveRange)} />
      <FeedingAnalytics babyId={activeProfile.id} dateRange={getDateRange(comprehensiveRange)} />
      <ActivitySummary babyId={activeProfile.id} dateRange={getDateRange(comprehensiveRange)} />
    </div>
    <div ref={sleepRef}>
      <h2 className="text-2xl font-bold mb-2">Sleep Pattern Analysis</h2>
      <SleepAnalytics babyId={activeProfile.id} dateRange={getDateRange(sleepRange)} />
      <ReportsOverview babyId={activeProfile.id} dateRange={getDateRange(sleepRange)} />
    </div>
    <div ref={growthRef}>
      <h2 className="text-2xl font-bold mb-2">Growth & Development Report</h2>
      <ReportsOverview babyId={activeProfile.id} dateRange={getDateRange(growthRange)} />
      <ActivitySummary babyId={activeProfile.id} dateRange={getDateRange(growthRange)} />
    </div>
  </div>
);

