
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ArrowLeft, Book, Clock, User, ChevronRight } from "lucide-react";

const HelpArticle = () => {
  const navigate = useNavigate();
  const { categoryName, articleId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  // Article content data
  const getArticleContent = (category: string, id: string) => {
    const articlesContent = {
      'getting-started': {
        title: 'Getting Started',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        articles: {
          '1': {
            title: 'How to create your first baby profile',
            readTime: '3 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Setting Up Your Baby's Profile</h2>
              <p>Creating your baby's profile is the first step to getting the most out of SleepyBabyy. This profile will be the foundation for all tracking, scheduling, and reporting features.</p>
              
              <h3>Step 1: Basic Information</h3>
              <p>Start by entering your baby's essential details:</p>
              <ul>
                <li><strong>Baby's Name:</strong> Enter your little one's full name</li>
                <li><strong>Date of Birth:</strong> This helps us calculate age-appropriate sleep recommendations</li>
                <li><strong>Gender:</strong> Optional, but helps personalize the experience</li>
                <li><strong>Profile Photo:</strong> Add a cute photo to make the profile more personal</li>
              </ul>

              <h3>Step 2: Sleep Preferences</h3>
              <p>Tell us about your baby's current sleep patterns:</p>
              <ul>
                <li>Typical bedtime and wake-up time</li>
                <li>Number of naps per day</li>
                <li>Preferred sleep environment (sounds, lighting)</li>
                <li>Any specific sleep challenges</li>
              </ul>

              <h3>Step 3: Feeding Information</h3>
              <p>Add feeding details to get comprehensive tracking:</p>
              <ul>
                <li>Feeding method (breastfeeding, bottle, or mixed)</li>
                <li>Typical feeding schedule</li>
                <li>Any dietary restrictions or notes</li>
              </ul>

              <h3>Step 4: Family Settings</h3>
              <p>Configure who can access and edit your baby's information:</p>
              <ul>
                <li>Add partner or co-parent</li>
                <li>Set permission levels for grandparents</li>
                <li>Configure caregiver access</li>
              </ul>

              <h3>Tips for Success</h3>
              <ul>
                <li>Keep information updated as your baby grows</li>
                <li>Use the photo upload feature regularly</li>
                <li>Review and adjust settings monthly</li>
                <li>Enable notifications for important milestones</li>
              </ul>
            `
          },
          '2': {
            title: 'Quick setup guide for new parents',
            readTime: '5 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Get Started in Under 5 Minutes</h2>
              <p>Welcome to SleepyBabyy! This quick setup guide will get you tracking your baby's activities in no time.</p>
              
              <h3>Step 1: Create Your Account (1 minute)</h3>
              <ul>
                <li>Sign up with email or Google account</li>
                <li>Verify your email address</li>
                <li>Choose your preferred language and timezone</li>
              </ul>

              <h3>Step 2: Add Your Baby's Profile (2 minutes)</h3>
              <ul>
                <li>Enter baby's name and birth date</li>
                <li>Upload a profile photo</li>
                <li>Set basic preferences (feeding method, sleep environment)</li>
              </ul>

              <h3>Step 3: Start Your First Activity Log (1 minute)</h3>
              <ul>
                <li>Tap the "Track Activity" button</li>
                <li>Log your baby's current status (sleeping, feeding, or playing)</li>
                <li>Add any notes about mood or behavior</li>
              </ul>

              <h3>Step 4: Explore Key Features (1 minute)</h3>
              <ul>
                <li>Check out the sleep sounds library</li>
                <li>Review the dashboard overview</li>
                <li>Set up your first smart notification</li>
              </ul>

              <h3>Pro Tips for New Users</h3>
              <ul>
                <li>Start simple - don't try to track everything at once</li>
                <li>Use the timer features for feeding and tummy time</li>
                <li>Take advantage of the quick-log buttons</li>
                <li>Check reports after your first week of tracking</li>
              </ul>

              <h3>What's Next?</h3>
              <p>Once you've completed the basic setup:</p>
              <ul>
                <li>Invite your partner to collaborate</li>
                <li>Set up your first sleep schedule</li>
                <li>Explore the premium features with a free trial</li>
                <li>Join our community forum for tips and support</li>
              </ul>
            `
          },
          '3': {
            title: 'Understanding the dashboard layout',
            readTime: '4 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Navigate Your SleepyBabyy Dashboard</h2>
              <p>Your dashboard is command center for all your baby's activities. Here's how to make the most of every section.</p>
              
              <h3>Top Navigation Bar</h3>
              <ul>
                <li><strong>Profile Selector:</strong> Switch between multiple babies</li>
                <li><strong>Quick Actions:</strong> Fast access to common tasks</li>
                <li><strong>Notifications:</strong> Stay updated on important events</li>
                <li><strong>Settings:</strong> Customize your experience</li>
              </ul>

              <h3>Main Dashboard Widgets</h3>
              
              <h4>Today's Overview</h4>
              <p>Get a snapshot of your baby's current day:</p>
              <ul>
                <li>Total sleep hours and nap count</li>
                <li>Feeding sessions and amounts</li>
                <li>Diaper changes and types</li>
                <li>Mood and activity highlights</li>
              </ul>

              <h4>Quick Log Cards</h4>
              <p>One-tap logging for common activities:</p>
              <ul>
                <li>Sleep (start/stop timer)</li>
                <li>Feeding (bottle, breast, or solid food)</li>
                <li>Diaper changes (wet, dirty, or both)</li>
                <li>Play time and tummy time</li>
              </ul>

              <h4>Recent Activity Feed</h4>
              <p>Timeline view of recent logs with options to:</p>
              <ul>
                <li>Edit entries by tapping on them</li>
                <li>Add notes or photos to activities</li>
                <li>View patterns and trends</li>
              </ul>

              <h3>Sidebar Navigation</h3>
              <ul>
                <li><strong>Track:</strong> Detailed activity logging</li>
                <li><strong>Reports:</strong> Analytics and insights</li>
                <li><strong>Sleep Schedule:</strong> Manage routines</li>
                <li><strong>Family:</strong> Collaborate with others</li>
                <li><strong>Sounds:</strong> Sleep and play audio</li>
                <li><strong>Memories:</strong> Photos and milestones</li>
              </ul>

              <h3>Customization Options</h3>
              <p>Make the dashboard work for you:</p>
              <ul>
                <li>Rearrange widgets by dragging</li>
                <li>Hide or show specific sections</li>
                <li>Choose between light and dark themes</li>
                <li>Set your preferred units (metric/imperial)</li>
              </ul>

              <h3>Mobile vs Desktop Views</h3>
              <p>The dashboard adapts to your device:</p>
              <ul>
                <li><strong>Mobile:</strong> Stacked layout with swipe navigation</li>
                <li><strong>Tablet:</strong> Dual-column view with more widgets</li>
                <li><strong>Desktop:</strong> Full three-column layout with all features</li>
              </ul>
            `
          },
          '4': {
            title: 'Setting up your first sleep schedule',
            readTime: '6 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Create the Perfect Sleep Schedule</h2>
              <p>A consistent sleep schedule is key to better nights for both baby and parents. Here's how to set one up that works for your family.</p>
              
              <h3>Before You Begin</h3>
              <p>Track your baby's natural patterns for 3-5 days to understand their current rhythm:</p>
              <ul>
                <li>Note natural wake-up times</li>
                <li>Observe when they get sleepy</li>
                <li>Track nap lengths and frequency</li>
                <li>Record bedtime resistance or ease</li>
              </ul>

              <h3>Step 1: Choose a Schedule Template</h3>
              <p>SleepyBabyy offers age-appropriate templates:</p>
              <ul>
                <li><strong>Newborn (0-3 months):</strong> Flexible feeding-based schedule</li>
                <li><strong>Infant (3-6 months):</strong> 3-4 naps with consistent bedtime</li>
                <li><strong>Older Baby (6-12 months):</strong> 2 naps with earlier bedtime</li>
                <li><strong>Toddler (12+ months):</strong> 1 nap with structured routine</li>
              </ul>

              <h3>Step 2: Customize Your Schedule</h3>
              
              <h4>Set Core Times</h4>
              <ul>
                <li><strong>Wake-up time:</strong> Choose a consistent morning start</li>
                <li><strong>Nap times:</strong> Plan 1-3 naps based on age</li>
                <li><strong>Bedtime:</strong> Select an age-appropriate evening time</li>
                <li><strong>Feeding windows:</strong> Coordinate with sleep periods</li>
              </ul>

              <h4>Add Flexibility</h4>
              <ul>
                <li>Set 15-30 minute windows for timing</li>
                <li>Allow for growth spurts and sick days</li>
                <li>Build in adjustment periods</li>
              </ul>

              <h3>Step 3: Implement Gradually</h3>
              <p>Don't change everything at once:</p>
              <ul>
                <li><strong>Week 1:</strong> Focus on consistent wake-up time</li>
                <li><strong>Week 2:</strong> Add structured nap times</li>
                <li><strong>Week 3:</strong> Establish bedtime routine</li>
                <li><strong>Week 4:</strong> Fine-tune and adjust</li>
              </ul>

              <h3>Step 4: Use SleepyBabyy Tools</h3>
              
              <h4>Smart Notifications</h4>
              <ul>
                <li>Bedtime reminders 30 minutes before</li>
                <li>Nap time alerts</li>
                <li>Wake window warnings</li>
              </ul>

              <h4>Sleep Sounds</h4>
              <ul>
                <li>White noise for naps</li>
                <li>Lullabies for bedtime</li>
                <li>Nature sounds for relaxation</li>
              </ul>

              <h4>Progress Tracking</h4>
              <ul>
                <li>Monitor schedule adherence</li>
                <li>Track sleep quality improvements</li>
                <li>Identify needed adjustments</li>
              </ul>

              <h3>Troubleshooting Common Issues</h3>
              
              <h4>Schedule Resistance</h4>
              <ul>
                <li>Move times by 15 minutes gradually</li>
                <li>Ensure adequate wake windows</li>
                <li>Check room environment (temperature, light)</li>
              </ul>

              <h4>Inconsistent Results</h4>
              <ul>
                <li>Give changes 1-2 weeks to settle</li>
                <li>Adjust for daylight saving time</li>
                <li>Account for developmental leaps</li>
              </ul>

              <h3>Success Indicators</h3>
              <p>You'll know your schedule is working when:</p>
              <ul>
                <li>Baby falls asleep within 10-15 minutes</li>
                <li>Fewer night wakings occur</li>
                <li>Naps become more predictable</li>
                <li>Overall mood improves during wake times</li>
              </ul>
            `
          }
        }
      },
      'family-sharing': {
        title: 'Family Sharing',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        articles: {
          '1': {
            title: 'Inviting family members to collaborate',
            readTime: '4 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Building Your Baby Care Team</h2>
              <p>Caring for a baby is a team effort. SleepyBabyy makes it easy to include partners, grandparents, and caregivers in your baby's tracking journey.</p>
              
              <h3>Who Can You Invite?</h3>
              <ul>
                <li><strong>Co-parents:</strong> Full access to all features and data</li>
                <li><strong>Grandparents:</strong> View access with optional editing permissions</li>
                <li><strong>Babysitters:</strong> Limited access for specific timeframes</li>
                <li><strong>Daycare Providers:</strong> Professional caregiver access</li>
                <li><strong>Pediatricians:</strong> Medical professional view-only access</li>
              </ul>

              <h3>Step-by-Step Invitation Process</h3>
              
              <h4>1. Access Family Settings</h4>
              <ul>
                <li>Navigate to the Family tab from your dashboard</li>
                <li>Click "Invite Family Member" button</li>
                <li>Choose from pre-set roles or create custom permissions</li>
              </ul>

              <h4>2. Enter Contact Information</h4>
              <ul>
                <li>Add email address (required)</li>
                <li>Include full name for identification</li>
                <li>Select their relationship to baby</li>
                <li>Add phone number for notifications (optional)</li>
              </ul>

              <h4>3. Set Permission Levels</h4>
              <ul>
                <li><strong>Full Access:</strong> Can add, edit, and delete all activities</li>
                <li><strong>Editor:</strong> Can add and edit but not delete</li>
                <li><strong>Contributor:</strong> Can add activities but not edit existing ones</li>
                <li><strong>Viewer:</strong> Can view all data but not make changes</li>
              </ul>

              <h4>4. Customize Access Areas</h4>
              <p>Fine-tune what each person can access:</p>
              <ul>
                <li>Daily activity tracking</li>
                <li>Sleep schedule management</li>
                <li>Medical information and appointments</li>
                <li>Photos and milestone memories</li>
                <li>Reports and analytics</li>
                <li>Account and billing settings</li>
              </ul>

              <h3>Managing Invitations</h3>
              
              <h4>Pending Invitations</h4>
              <ul>
                <li>Track who hasn't accepted yet</li>
                <li>Resend invitations if needed</li>
                <li>Cancel pending invitations</li>
                <li>Set expiration dates for security</li>
              </ul>

              <h4>Active Family Members</h4>
              <ul>
                <li>See who's currently online</li>
                <li>View recent activity by each member</li>
                <li>Modify permissions at any time</li>
                <li>Remove members if needed</li>
              </ul>

              <h3>Best Practices for Family Collaboration</h3>
              
              <h4>Communication Guidelines</h4>
              <ul>
                <li>Establish who logs what activities</li>
                <li>Use the notes feature for important details</li>
                <li>Create group chats for coordination</li>
                <li>Regular check-ins about baby's needs</li>
              </ul>

              <h4>Data Consistency</h4>
              <ul>
                <li>Agree on units of measurement</li>
                <li>Use consistent timing for activities</li>
                <li>Establish clear routines everyone follows</li>
                <li>Review and sync regularly</li>
              </ul>

              <h3>Privacy and Security</h3>
              <ul>
                <li>All invitations are encrypted and secure</li>
                <li>Members can only access what you allow</li>
                <li>Audit trails show who made what changes</li>
                <li>Easy removal process if relationships change</li>
              </ul>

              <h3>Troubleshooting Common Issues</h3>
              
              <h4>Invitation Not Received</h4>
              <ul>
                <li>Check spam/junk folders</li>
                <li>Verify email address is correct</li>
                <li>Try alternative email if available</li>
                <li>Use the direct link sharing option</li>
              </ul>

              <h4>Permission Conflicts</h4>
              <ul>
                <li>Review and adjust access levels</li>
                <li>Communicate expectations clearly</li>
                <li>Use temporary permissions for short-term help</li>
                <li>Regular permission audits</li>
              </ul>
            `
          },
          '2': {
            title: 'Managing family member permissions',
            readTime: '3 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Control Who Sees and Edits What</h2>
              <p>Not every family member needs the same level of access to your baby's information. Learn how to set appropriate permissions for each person on your care team.</p>
              
              <h3>Understanding Permission Levels</h3>
              
              <h4>Owner (You)</h4>
              <ul>
                <li>Complete control over all settings</li>
                <li>Can invite and remove family members</li>
                <li>Access to billing and subscription management</li>
                <li>Can delete the baby profile</li>
              </ul>

              <h4>Co-Parent</h4>
              <ul>
                <li>Full editing access to all activities</li>
                <li>Can modify sleep schedules and routines</li>
                <li>Access to all reports and analytics</li>
                <li>Can invite other family members</li>
                <li>Cannot access billing or delete profile</li>
              </ul>

              <h4>Family Member</h4>
              <ul>
                <li>Can view all activities and reports</li>
                <li>Can add new activity logs</li>
                <li>Can edit activities they created</li>
                <li>Cannot modify schedules or invite others</li>
              </ul>

              <h4>Caregiver</h4>
              <ul>
                <li>Can log activities during their care time</li>
                <li>Access to relevant schedules and routines</li>
                <li>Can view recent feeding and sleep patterns</li>
                <li>Limited to essential information only</li>
              </ul>

              <h4>Viewer</h4>
              <ul>
                <li>Read-only access to basic information</li>
                <li>Can view recent activities and photos</li>
                <li>Cannot make any changes or additions</li>
                <li>Perfect for distant relatives</li>
              </ul>

              <h3>Customizing Access Areas</h3>
              
              <h4>Activity Tracking</h4>
              <ul>
                <li><strong>Full Access:</strong> Can log, edit, and delete any activity</li>
                <li><strong>Add Only:</strong> Can create new logs but not modify existing ones</li>
                <li><strong>Own Edits:</strong> Can only edit activities they created</li>
                <li><strong>View Only:</strong> Can see activity history but not change it</li>
              </ul>

              <h4>Medical Information</h4>
              <ul>
                <li><strong>Full Medical:</strong> Access to all health data and appointments</li>
                <li><strong>Basic Health:</strong> General wellness info, no sensitive data</li>
                <li><strong>Emergency Only:</strong> Critical medical information only</li>
                <li><strong>No Access:</strong> Cannot view any medical information</li>
              </ul>

              <h4>Photos and Memories</h4>
              <ul>
                <li><strong>Full Gallery:</strong> Can add, view, and organize all photos</li>
                <li><strong>Add Photos:</strong> Can upload but not delete others' photos</li>
                <li><strong>View All:</strong> Can see all photos but not add new ones</li>
                <li><strong>Limited View:</strong> Only sees photos shared with them</li>
              </ul>

              <h3>Managing Permissions Over Time</h3>
              
              <h4>Temporary Access</h4>
              <ul>
                <li>Set expiration dates for babysitter access</li>
                <li>Grant temporary full access during emergencies</li>
                <li>Create time-limited viewer access for visits</li>
                <li>Automatically revoke access after set periods</li>
              </ul>

              <h4>Permission Changes</h4>
              <ul>
                <li>Upgrade grandparents from viewer to family member</li>
                <li>Reduce access if relationships change</li>
                <li>Seasonal adjustments for varying care needs</li>
                <li>Emergency permission escalation</li>
              </ul>

              <h3>Security Best Practices</h3>
              
              <h4>Regular Reviews</h4>
              <ul>
                <li>Monthly permission audits</li>
                <li>Remove unused or unnecessary access</li>
                <li>Update permissions as baby grows</li>
                <li>Verify active family members regularly</li>
              </ul>

              <h4>Communication</h4>
              <ul>
                <li>Explain permission levels to family members</li>
                <li>Set clear expectations about access</li>
                <li>Provide alternative ways to share updates</li>
                <li>Address concerns about limited access</li>
              </ul>

              <h3>Common Permission Scenarios</h3>
              
              <h4>Divorced or Separated Parents</h4>
              <ul>
                <li>Equal co-parent access when sharing custody</li>
                <li>Limited access during transition periods</li>
                <li>Separate communication channels if needed</li>
                <li>Professional mediation through the app</li>
              </ul>

              <h4>Professional Caregivers</h4>
              <ul>
                <li>Work-hours-only access for daycare providers</li>
                <li>Activity-specific permissions for specialists</li>
                <li>Temporary elevated access for medical visits</li>
                <li>Easy permission transfer between providers</li>
              </ul>
            `
          },
          '3': {
            title: 'Setting up caregiver access',
            readTime: '5 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Professional Caregiver Integration</h2>
              <p>Whether it's a babysitter, daycare provider, or nanny, giving caregivers the right level of access ensures continuity in your baby's care while maintaining your privacy.</p>
              
              <h3>Types of Professional Caregivers</h3>
              
              <h4>Babysitters</h4>
              <ul>
                <li><strong>Occasional care:</strong> Evening or weekend sitting</li>
                <li><strong>Regular sitters:</strong> Weekly or bi-weekly care</li>
                <li><strong>Emergency contacts:</strong> Last-minute care providers</li>
                <li><strong>Date night sitters:</strong> Short-term evening care</li>
              </ul>

              <h4>Daycare Providers</h4>
              <ul>
                <li><strong>Center directors:</strong> Oversight and communication</li>
                <li><strong>Primary teachers:</strong> Daily care and activities</li>
                <li><strong>Assistant teachers:</strong> Support and backup care</li>
                <li><strong>Specialized staff:</strong> Nurses, nutritionists, etc.</li>
              </ul>

              <h4>Nannies and Au Pairs</h4>
              <ul>
                <li><strong>Full-time nannies:</strong> 40+ hours per week</li>
                <li><strong>Part-time nannies:</strong> Regular but limited hours</li>
                <li><strong>Au pairs:</strong> Live-in cultural exchange caregivers</li>
                <li><strong>Shared nannies:</strong> Split between multiple families</li>
              </ul>

              <h3>Setting Up Caregiver Profiles</h3>
              
              <h4>Essential Information</h4>
              <ul>
                <li>Full name and contact information</li>
                <li>Role and relationship to your family</li>
                <li>Schedule and availability</li>
                <li>Emergency contact details</li>
                <li>Certifications (CPR, First Aid, etc.)</li>
              </ul>

              <h4>Care-Specific Details</h4>
              <ul>
                <li>Which activities they're responsible for</li>
                <li>Feeding permissions and restrictions</li>
                <li>Sleep routine authority</li>
                <li>Medical care limitations</li>
                <li>Discipline and boundary guidelines</li>
              </ul>

              <h3>Configuring Access Levels</h3>
              
              <h4>Time-Based Access</h4>
              <ul>
                <li><strong>Work Hours Only:</strong> Access during scheduled care time</li>
                <li><strong>Extended Hours:</strong> Includes prep and wrap-up time</li>
                <li><strong>On-Call Access:</strong> Available during emergency situations</li>
                <li><strong>24/7 Access:</strong> For live-in or full-time caregivers</li>
              </ul>

              <h4>Activity Permissions</h4>
              <ul>
                <li><strong>Feeding Logs:</strong> Can record what and when baby ate</li>
                <li><strong>Sleep Tracking:</strong> Log naps and sleep quality</li>
                <li><strong>Diaper Changes:</strong> Track frequency and type</li>
                <li><strong>Play Activities:</strong> Record games, outings, learning</li>
                <li><strong>Medical Notes:</strong> Limited to basic observations</li>
              </ul>

              <h3>Communication Tools</h3>
              
              <h4>Daily Reports</h4>
              <ul>
                <li>Automated summary of baby's day</li>
                <li>Custom notes from caregiver</li>
                <li>Photo and video sharing</li>
                <li>Milestone and achievement alerts</li>
              </ul>

              <h4>Real-Time Updates</h4>
              <ul>
                <li>Live activity notifications to parents</li>
                <li>Emergency alert system</li>
                <li>Schedule change communications</li>
                <li>Direct messaging between caregiver and parents</li>
              </ul>

              <h3>Professional Boundaries</h3>
              
              <h4>Information Limits</h4>
              <ul>
                <li>No access to family financial information</li>
                <li>Limited medical history viewing</li>
                <li>Cannot invite other family members</li>
                <li>No permanent data deletion rights</li>
              </ul>

              <h4>Privacy Protections</h4>
              <ul>
                <li>Cannot view historical data before their start date</li>
                <li>No access to parent private notes</li>
                <li>Cannot see other caregiver information</li>
                <li>Limited photo and video access</li>
              </ul>

              <h3>Onboarding New Caregivers</h3>
              
              <h4>Initial Setup Process</h4>
              <ol>
                <li>Create caregiver profile with basic information</li>
                <li>Set appropriate permission levels</li>
                <li>Send invitation email with login instructions</li>
                <li>Schedule orientation call to review app features</li>
                <li>Provide written guidelines for data entry</li>
                <li>Test run with supervised access</li>
              </ol>

              <h4>Training Resources</h4>
              <ul>
                <li>Video tutorials for basic app navigation</li>
                <li>Written guides for common activities</li>
                <li>Quick reference cards for emergency situations</li>
                <li>Contact information for technical support</li>
              </ul>

              <h3>Managing Multiple Caregivers</h3>
              
              <h4>Coordination Strategies</h4>
              <ul>
                <li>Shared calendar for scheduling</li>
                <li>Handoff notes between caregivers</li>
                <li>Group messaging for team updates</li>
                <li>Regular team meetings via app</li>
              </ul>

              <h4>Preventing Conflicts</h4>
              <ul>
                <li>Clear role definitions for each caregiver</li>
                <li>Established hierarchy for decision-making</li>
                <li>Consistent guidelines across all caregivers</li>
                <li>Regular performance reviews and feedback</li>
              </ul>

              <h3>Ending Caregiver Relationships</h3>
              
              <h4>Planned Transitions</h4>
              <ul>
                <li>Gradual reduction of access permissions</li>
                <li>Data export for caregiver's records</li>
                <li>Thank you message and final report</li>
                <li>Reference letter generation if requested</li>
              </ul>

              <h4>Emergency Removals</h4>
              <ul>
                <li>Immediate access revocation</li>
                <li>Account activity audit</li>
                <li>Data security verification</li>
                <li>Backup caregiver activation</li>
              </ul>
            `
          }
        }
      },
      'reports-analytics': {
        title: 'Reports & Analytics',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        articles: {
          '1': {
            title: 'Understanding sleep pattern charts',
            readTime: '7 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Decode Your Baby's Sleep Patterns</h2>
              <p>Sleep pattern charts are powerful tools that reveal insights into your baby's rest cycles, helping you optimize their sleep schedule and identify potential issues.</p>
              
              <h3>Types of Sleep Charts</h3>
              
              <h4>Daily Sleep Timeline</h4>
              <ul>
                <li><strong>Horizontal bars:</strong> Show sleep periods throughout 24 hours</li>
                <li><strong>Color coding:</strong> Different colors for naps vs. night sleep</li>
                <li><strong>Activity markers:</strong> Feeding, diaper changes, and wake periods</li>
                <li><strong>Quality indicators:</strong> Peaceful vs. restless sleep periods</li>
              </ul>

              <h4>Weekly Sleep Summary</h4>
              <ul>
                <li><strong>Total sleep hours:</strong> Average and daily variations</li>
                <li><strong>Nap frequency:</strong> Number of naps per day</li>
                <li><strong>Night wakings:</strong> Frequency and duration trends</li>
                <li><strong>Bedtime consistency:</strong> How regular sleep times are</li>
              </ul>

              <h4>Monthly Progress View</h4>
              <ul>
                <li><strong>Long-term trends:</strong> Gradual improvements or regressions</li>
                <li><strong>Developmental impacts:</strong> Sleep changes during growth spurts</li>
                <li><strong>Seasonal variations:</strong> How daylight changes affect sleep</li>
                <li><strong>Milestone correlations:</strong> Sleep disruptions during new skills</li>
              </ul>

              <h3>Reading the Charts</h3>
              
              <h4>Color Meanings</h4>
              <ul>
                <li><strong>Deep Blue:</strong> Night sleep (10pm-6am typically)</li>
                <li><strong>Light Blue:</strong> Day naps</li>
                <li><strong>Green:</strong> Quiet/calm awake periods</li>
                <li><strong>Yellow:</strong> Active/stimulated awake time</li>
                <li><strong>Red:</strong> Fussy or crying periods</li>
                <li><strong>Gray:</strong> Feeding times</li>
              </ul>

              <h4>Pattern Indicators</h4>
              <ul>
                <li><strong>Solid blocks:</strong> Continuous sleep periods</li>
                <li><strong>Dotted lines:</strong> Light sleep or frequent stirring</li>
                <li><strong>Jagged edges:</strong> Difficulty falling asleep or frequent wakings</li>
                <li><strong>Thickness:</strong> Sleep quality (thicker = better quality)</li>
              </ul>

              <h3>Identifying Healthy Patterns</h3>
              
              <h4>Age-Appropriate Sleep Totals</h4>
              <ul>
                <li><strong>Newborn (0-3 months):</strong> 14-17 hours per day</li>
                <li><strong>Infant (3-6 months):</strong> 12-15 hours per day</li>
                <li><strong>Older infant (6-12 months):</strong> 12-14 hours per day</li>
                <li><strong>Toddler (12+ months):</strong> 11-14 hours per day</li>
              </ul>

              <h4>Positive Pattern Indicators</h4>
              <ul>
                <li>Consistent bedtime within 30-minute window</li>
                <li>Gradually longer sleep stretches at night</li>
                <li>Predictable nap times and durations</li>
                <li>Quick sleep onset (under 20 minutes)</li>
                <li>Minimal night wakings for age</li>
                <li>Happy mood upon waking</li>
              </ul>

              <h3>Spotting Concerning Patterns</h3>
              
              <h4>Sleep Issues to Watch For</h4>
              <ul>
                <li><strong>Irregular bedtimes:</strong> Varying by more than 1 hour nightly</li>
                <li><strong>Frequent night wakings:</strong> More than expected for age</li>
                <li><strong>Short naps:</strong> Consistently under 45 minutes</li>
                <li><strong>Early morning wakings:</strong> Before 6am regularly</li>
                <li><strong>Sleep resistance:</strong> Taking over 30 minutes to fall asleep</li>
                <li><strong>Total sleep deficiency:</strong> Consistently below age recommendations</li>
              </ul>

              <h4>When to Consult Your Pediatrician</h4>
              <ul>
                <li>Sudden changes in established patterns</li>
                <li>Excessive daytime sleepiness</li>
                <li>Loud snoring or breathing difficulties</li>
                <li>Night terrors or frequent nightmares</li>
                <li>Persistent early morning wakings</li>
                <li>Regression after months of good sleep</li>
              </ul>

              <h3>Using Charts to Optimize Sleep</h3>
              
              <h4>Identifying Optimal Bedtime</h4>
              <ul>
                <li>Look for natural sleepy periods in the evening</li>
                <li>Note when baby falls asleep easily vs. struggles</li>
                <li>Track mood and behavior leading up to sleep</li>
                <li>Adjust bedtime based on total sleep needs</li>
              </ul>

              <h4>Nap Schedule Optimization</h4>
              <ul>
                <li>Find natural low-energy periods for naps</li>
                <li>Balance nap length with nighttime sleep</li>
                <li>Adjust timing based on previous night's sleep</li>
                <li>Gradually transition between nap schedules as baby grows</li>
              </ul>

              <h3>Advanced Chart Features</h3>
              
              <h4>Overlay Options</h4>
              <ul>
                <li><strong>Feeding overlay:</strong> See how meals affect sleep timing</li>
                <li><strong>Growth tracking:</strong> Correlate sleep with weight/height gains</li>
                <li><strong>Weather data:</strong> Understand environmental impacts</li>
                <li><strong>Activity overlay:</strong> See how stimulation affects rest</li>
              </ul>

              <h4>Comparison Views</h4>
              <ul>
                <li><strong>Week-over-week:</strong> Track gradual improvements</li>
                <li><strong>Before/after:</strong> Measure schedule change impacts</li>
                <li><strong>Sibling comparison:</strong> See family sleep patterns</li>
                <li><strong>Developmental stages:</strong> Compare across growth periods</li>
              </ul>

              <h3>Sharing Charts with Healthcare Providers</h3>
              
              <h4>Export Options</h4>
              <ul>
                <li>PDF reports for pediatrician visits</li>
                <li>Email summaries to share with partners</li>
                <li>Print-friendly formats for medical records</li>
                <li>Data export for sleep specialists</li>
              </ul>

              <h4>Key Information to Highlight</h4>
              <ul>
                <li>Recent changes in sleep patterns</li>
                <li>Persistent issues or concerns</li>
                <li>Successful interventions or strategies</li>
                <li>Questions about normal development</li>
              </ul>
            `
          },
          '2': {
            title: 'Exporting your baby\'s data',
            readTime: '3 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Share Your Baby's Data Safely</h2>
              <p>Whether for pediatrician visits, family sharing, or personal records, exporting your baby's data from SleepyBabyy is simple and secure.</p>
              
              <h3>Export Options Available</h3>
              
              <h4>PDF Reports</h4>
              <ul>
                <li><strong>Comprehensive summary:</strong> All activities for selected timeframe</li>
                <li><strong>Sleep-focused report:</strong> Detailed sleep patterns and analytics</li>
                <li><strong>Feeding analysis:</strong> Nutrition intake and growth correlation</li>
                <li><strong>Medical summary:</strong> Health-related activities and milestones</li>
                <li><strong>Custom reports:</strong> Choose specific data points to include</li>
              </ul>

              <h4>Spreadsheet Formats</h4>
              <ul>
                <li><strong>CSV files:</strong> Raw data for analysis in Excel or Google Sheets</li>
                <li><strong>Formatted Excel:</strong> Pre-organized with charts and summaries</li>
                <li><strong>Google Sheets:</strong> Cloud-based sharing and collaboration</li>
                <li><strong>Numbers format:</strong> Optimized for Mac users</li>
              </ul>

              <h4>Photo Collections</h4>
              <ul>
                <li><strong>ZIP archives:</strong> All photos from selected date range</li>
                <li><strong>Monthly albums:</strong> Organized by month with metadata</li>
                <li><strong>Milestone collections:</strong> Photos tagged with developmental markers</li>
                <li><strong>High-resolution exports:</strong> Original quality for printing</li>
              </ul>

              <h3>Step-by-Step Export Process</h3>
              
              <h4>1. Navigate to Reports</h4>
              <ul>
                <li>Go to the Reports section of your dashboard</li>
                <li>Click on "Export Data" in the top right corner</li>
                <li>Choose your export type from the dropdown menu</li>
              </ul>

              <h4>2. Select Date Range</h4>
              <ul>
                <li><strong>Last 7 days:</strong> Recent activity summary</li>
                <li><strong>Last 30 days:</strong> Monthly progress report</li>
                <li><strong>Last 3 months:</strong> Quarterly development summary</li>
                <li><strong>Custom range:</strong> Pick specific start and end dates</li>
                <li><strong>All data:</strong> Complete history since account creation</li>
              </ul>

              <h4>3. Choose Data Categories</h4>
              <ul>
                <li><strong>Sleep tracking:</strong> Naps, night sleep, and quality metrics</li>
                <li><strong>Feeding logs:</strong> Times, amounts, and types of feeding</li>
                <li><strong>Diaper changes:</strong> Frequency and type tracking</li>
                <li><strong>Growth data:</strong> Weight, height, and head circumference</li>
                <li><strong>Developmental milestones:</strong> Skills and achievements</li>
                <li><strong>Medical information:</strong> Symptoms, medications, appointments</li>
                <li><strong>Photos and videos:</strong> Visual memories and documentation</li>
              </ul>

              <h4>4. Customize Report Format</h4>
              <ul>
                <li>Add your baby's name and photo to headers</li>
                <li>Include or exclude specific family member contributions</li>
                <li>Choose chart and graph styles</li>
                <li>Select privacy level for shared reports</li>
              </ul>

              <h3>Export Formats Explained</h3>
              
              <h4>Medical Professional Report (PDF)</h4>
              <ul>
                <li>Formal layout suitable for medical records</li>
                <li>Summary statistics and trend analysis</li>
                <li>Growth charts and percentile tracking</li>
                <li>Medication and symptom logging</li>
                <li>Sleep quality assessment</li>
              </ul>

              <h4>Family Sharing Report (PDF)</h4>
              <ul>
                <li>Photo-rich format with highlights</li>
                <li>Milestone celebrations and achievements</li>
                <li>Fun facts and statistics</li>
                <li>Growth progress in easy-to-read format</li>
                <li>Shareable via email or social media</li>
              </ul>

              <h4>Data Analysis Export (CSV)</h4>
              <ul>
                <li>Raw timestamps and measurements</li>
                <li>Suitable for advanced analysis</li>
                <li>Compatible with statistical software</li>
                <li>No formatting - pure data</li>
                <li>Ideal for researchers or data enthusiasts</li>
              </ul>

              <h3>Security and Privacy</h3>
              
              <h4>Data Protection</h4>
              <ul>
                <li>All exports are encrypted during transmission</li>
                <li>Downloads expire after 24 hours for security</li>
                <li>No personal data stored on SleepyBabyy servers after export</li>
                <li>HIPAA-compliant formatting for medical reports</li>
              </ul>

              <h4>Sharing Safely</h4>
              <ul>
                <li>Use secure email services for sensitive reports</li>
                <li>Password-protect files containing medical information</li>
                <li>Only share relevant sections with each recipient</li>
                <li>Consider removing identifying information for research</li>
              </ul>

              <h3>Common Export Scenarios</h3>
              
              <h4>Pediatrician Visits</h4>
              <ul>
                <li>Export 2-4 weeks of comprehensive data</li>
                <li>Focus on concerning patterns or questions</li>
                <li>Include growth measurements and milestones</li>
                <li>Print backup copy in case of technology issues</li>
              </ul>

              <h4>Childcare Provider Handoffs</h4>
              <ul>
                <li>Weekly routine summaries</li>
                <li>Recent schedule changes or preferences</li>
                <li>Emergency contact information</li>
                <li>Simple format focusing on daily needs</li>
              </ul>

              <h4>Family History Documentation</h4>
              <ul>
                <li>Monthly or quarterly milestone reports</li>
                <li>Photo-rich formats for grandparents</li>
                <li>Growth progress celebrations</li>
                <li>Achievement and development highlights</li>
              </ul>

              <h3>Troubleshooting Export Issues</h3>
              
              <h4>Large File Problems</h4>
              <ul>
                <li>Reduce date range for shorter periods</li>
                <li>Export data categories separately</li>
                <li>Use compression for photo collections</li>
                <li>Consider cloud storage for large files</li>
              </ul>

              <h4>Format Compatibility</h4>
              <ul>
                <li>Test file opening before important meetings</li>
                <li>Have backup formats ready (PDF + Excel)</li>
                <li>Use universal formats for maximum compatibility</li>
                <li>Contact support for custom format needs</li>
              </ul>
            `
          },
          '3': {
            title: 'Weekly and monthly report summaries',
            readTime: '5 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Track Progress with Automated Summaries</h2>
              <p>Weekly and monthly reports help you see the big picture of your baby's development, identify trends, and celebrate achievements.</p>
              
              <h3>Weekly Summary Reports</h3>
              
              <h4>Key Metrics Tracked</h4>
              <ul>
                <li><strong>Sleep totals:</strong> Average hours per night and day</li>
                <li><strong>Feeding frequency:</strong> Number of sessions and total intake</li>
                <li><strong>Growth indicators:</strong> Weight gain and development progress</li>
                <li><strong>Mood patterns:</strong> Happy vs. fussy periods throughout the week</li>
                <li><strong>Activity highlights:</strong> New skills, play time, and social interactions</li>
              </ul>

              <h4>Week-over-Week Comparisons</h4>
              <ul>
                <li>Sleep quality improvements or regressions</li>
                <li>Feeding pattern changes</li>
                <li>Growth velocity tracking</li>
                <li>Behavioral development markers</li>
                <li>Schedule adherence success rates</li>
              </ul>

              <h4>Weekly Achievements Section</h4>
              <ul>
                <li>New milestones reached</li>
                <li>Successful schedule adjustments</li>
                <li>Improved sleep stretches</li>
                <li>Social and cognitive developments</li>
                <li>Family bonding moments</li>
              </ul>

              <h3>Monthly Progress Reports</h3>
              
              <h4>Developmental Overview</h4>
              <ul>
                <li><strong>Physical growth:</strong> Weight, height, and head circumference trends</li>
                <li><strong>Motor skills:</strong> Rolling, sitting, crawling, walking progress</li>
                <li><strong>Cognitive development:</strong> Recognition, communication, problem-solving</li>
                <li><strong>Social skills:</strong> Smiling, laughing, interaction preferences</li>
                <li><strong>Sleep evolution:</strong> Pattern maturation and quality improvements</li>
              </ul>

              <h4>Health and Wellness Summary</h4>
              <ul>
                <li>Illness frequency and recovery times</li>
                <li>Vaccination schedule compliance</li>
                <li>Nutrition adequacy and variety</li>
                <li>Activity level and exercise patterns</li>
                <li>Overall mood and temperament assessment</li>
              </ul>

              <h4>Monthly Milestones</h4>
              <ul>
                <li>Age-appropriate developmental achievements</li>
                <li>Early or late milestone notifications</li>
                <li>Skills progression timeline</li>
                <li>Comparative development tracking</li>
                <li>Next month's expected milestones</li>
              </ul>

              <h3>Understanding Your Reports</h3>
              
              <h4>Color-Coded Progress Indicators</h4>
              <ul>
                <li><strong>Green:</strong> Meeting or exceeding expectations</li>
                <li><strong>Yellow:</strong> Slight variations but within normal range</li>
                <li><strong>Orange:</strong> Worth monitoring, possible adjustments needed</li>
                <li><strong>Red:</strong> Significant deviation, consider professional consultation</li>
              </ul>

              <h4>Trend Analysis</h4>
              <ul>
                <li><strong>Upward trends:</strong> Positive progress indicators</li>
                <li><strong>Stable patterns:</strong> Consistent healthy behaviors</li>
                <li><strong>Fluctuating cycles:</strong> Normal developmental variations</li>
                <li><strong>Concerning drops:</strong> Areas needing attention or intervention</li>
              </ul>

              <h3>Customizing Your Reports</h3>
              
              <h4>Priority Focus Areas</h4>
              <ul>
                <li><strong>Sleep-focused:</strong> Emphasize rest patterns and quality</li>
                <li><strong>Growth-centered:</strong> Highlight physical development</li>
                <li><strong>Development-oriented:</strong> Focus on milestones and skills</li>
                <li><strong>Health-primary:</strong> Prioritize medical and wellness data</li>
                <li><strong>Balanced view:</strong> Equal weight to all areas</li>
              </ul>

              <h4>Report Frequency Options</h4>
              <ul>
                <li><strong>Weekly delivery:</strong> Every Sunday evening summary</li>
                <li><strong>Bi-weekly reports:</strong> Every other week for busy parents</li>
                <li><strong>Monthly only:</strong> Comprehensive monthly overviews</li>
                <li><strong>On-demand:</strong> Generate reports when needed</li>
                <li><strong>Before appointments:</strong> Automatic pre-visit summaries</li>
              </ul>

              <h3>Sharing Reports with Family</h3>
              
              <h4>Grandparent-Friendly Versions</h4>
              <ul>
                <li>Photo-rich layouts with highlights</li>
                <li>Simplified language and explanations</li>
                <li>Focus on positive achievements</li>
                <li>Growth comparisons to family members</li>
                <li>Upcoming milestone predictions</li>
              </ul>

              <h4>Partner Collaboration</h4>
              <ul>
                <li>Joint progress reviews and planning</li>
                <li>Shared goal setting for next period</li>
                <li>Division of responsibilities tracking</li>
                <li>Celebrate successes together</li>
                <li>Address concerns collaboratively</li>
              </ul>

              <h3>Professional Use Cases</h3>
              
              <h4>Pediatrician Visits</h4>
              <ul>
                <li>Comprehensive health overview</li>
                <li>Growth chart integration</li>
                <li>Vaccination and appointment history</li>
                <li>Concern areas highlighted</li>
                <li>Questions for discussion prepared</li>
              </ul>

              <h4>Childcare Coordination</h4>
              <ul>
                <li>Schedule effectiveness summaries</li>
                <li>Behavioral pattern sharing</li>
                <li>Successful routine documentation</li>
                <li>Areas needing caregiver attention</li>
                <li>Home-to-daycare consistency tracking</li>
              </ul>

              <h3>Using Reports for Decision Making</h3>
              
              <h4>Schedule Adjustments</h4>
              <ul>
                <li>Identify optimal sleep and feeding times</li>
                <li>Recognize pattern disruptions</li>
                <li>Plan gradual routine transitions</li>
                <li>Measure adjustment success rates</li>
              </ul>

              <h4>Development Support</h4>
              <ul>
                <li>Focus activities on lagging areas</li>
                <li>Celebrate and build on strengths</li>
                <li>Plan age-appropriate stimulation</li>
                <li>Seek professional help when indicated</li>
              </ul>

              <h3>Troubleshooting Report Issues</h3>
              
              <h4>Missing Data Problems</h4>
              <ul>
                <li>Incomplete tracking affects accuracy</li>
                <li>Encourage consistent logging</li>
                <li>Use estimation features for missing periods</li>
                <li>Focus on trends rather than absolute numbers</li>
              </ul>

              <h4>Unexpected Results</h4>
              <ul>
                <li>Review data entry for errors</li>
                <li>Consider external factors (illness, travel)</li>
                <li>Compare with previous months</li>
                <li>Consult healthcare provider if concerning</li>
              </ul>

              <h3>Advanced Report Features</h3>
              
              <h4>Predictive Analytics</h4>
              <ul>
                <li>Next milestone timing predictions</li>
                <li>Growth trajectory forecasting</li>
                <li>Sleep pattern maturation estimates</li>
                <li>Developmental readiness indicators</li>
              </ul>

              <h4>Comparative Analysis</h4>
              <ul>
                <li>Anonymous peer comparisons</li>
                <li>Sibling development tracking</li>
                <li>Cultural and regional benchmarks</li>
                <li>Historical family pattern analysis</li>
              </ul>
            `
          }
        }
      },
      'billing-subscriptions': {
        title: 'Billing & Subscriptions',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        articles: {
          '1': {
            title: 'Understanding premium features',
            readTime: '4 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Unlock the Full Potential of SleepyBabyy</h2>
              <p>SleepyBabyy Premium offers advanced features designed to give you deeper insights and more comprehensive tracking capabilities for your baby's development.</p>
              
              <h3>Premium Feature Categories</h3>
              
              <h4>Advanced Analytics & Reports</h4>
              <ul>
                <li><strong>Detailed sleep analysis:</strong> REM cycle tracking, sleep efficiency metrics</li>
                <li><strong>Growth predictions:</strong> AI-powered development forecasting</li>
                <li><strong>Comparative analytics:</strong> Anonymous peer comparisons and percentile tracking</li>
                <li><strong>Custom report generation:</strong> Tailored reports for specific needs</li>
                <li><strong>Trend identification:</strong> Automatic pattern recognition and alerts</li>
              </ul>

              <h4>Enhanced Family Sharing</h4>
              <ul>
                <li><strong>Unlimited family members:</strong> Add as many caregivers as needed</li>
                <li><strong>Professional caregiver accounts:</strong> Specialized access for daycare providers</li>
                <li><strong>Advanced permissions:</strong> Granular control over data access</li>
                <li><strong>Family activity feed:</strong> See who logged what activities when</li>
                <li><strong>Group messaging:</strong> Communicate within the app</li>
              </ul>

              <h4>Smart Notifications & Reminders</h4>
              <ul>
                <li><strong>Predictive alerts:</strong> AI suggests optimal feeding and sleep times</li>
                <li><strong>Milestone reminders:</strong> Never miss important developmental markers</li>
                <li><strong>Health appointment scheduling:</strong> Automatic pediatrician visit planning</li>
                <li><strong>Growth tracking alerts:</strong> Notifications for significant changes</li>
                <li><strong>Custom reminder system:</strong> Personalized alerts for your routine</li>
              </ul>

              <h4>Extended Media Storage</h4>
              <ul>
                <li><strong>Unlimited photo storage:</strong> Capture every precious moment</li>
                <li><strong>Video recording:</strong> Save longer video memories</li>
                <li><strong>Cloud backup:</strong> Automatic secure storage of all memories</li>
                <li><strong>HD quality preservation:</strong> Original resolution maintained</li>
                <li><strong>Easy sharing:</strong> Create beautiful photo albums for family</li>
              </ul>

              <h3>Premium-Only Tools</h3>
              
              <h4>Sleep Optimization Engine</h4>
              <ul>
                <li>Personalized sleep schedule recommendations</li>
                <li>Environmental factor analysis (temperature, lighting, sound)</li>
                <li>Sleep regression prediction and management</li>
                <li>Custom bedtime routine optimization</li>
                <li>Integration with smart home devices</li>
              </ul>

              <h4>Feeding Intelligence</h4>
              <ul>
                <li>Nutritional intake analysis and recommendations</li>
                <li>Growth correlation with feeding patterns</li>
                <li>Allergic reaction tracking and alerts</li>
                <li>Weaning transition guidance</li>
                <li>Portion size optimization for age and development</li>
              </ul>

              <h4>Development Tracker Pro</h4>
              <ul>
                <li>Comprehensive milestone database (500+ markers)</li>
                <li>Video milestone documentation</li>
                <li>Early intervention alerts for developmental delays</li>
                <li>Personalized activity suggestions</li>
                <li>Professional developmental assessment tools</li>
              </ul>

              <h3>Data Export & Integration</h3>
              
              <h4>Advanced Export Options</h4>
              <ul>
                <li><strong>Medical-grade reports:</strong> HIPAA-compliant formats for healthcare providers</li>
                <li><strong>Research participation:</strong> Anonymized data contribution to pediatric studies</li>
                <li><strong>Insurance documentation:</strong> Formatted reports for health insurance claims</li>
                <li><strong>Baby book creation:</strong> Automated photo book generation with milestones</li>
                <li><strong>Data portability:</strong> Full data export if you ever need to switch platforms</li>
              </ul>

              <h4>Third-Party Integrations</h4>
              <ul>
                <li><strong>Smart baby monitors:</strong> Automatic sleep and feeding data import</li>
                <li><strong>Wearable devices:</strong> Activity and vital sign monitoring integration</li>
                <li><strong>Digital scales:</strong> Automatic weight tracking</li>
                <li><strong>Pediatric EMR systems:</strong> Direct data sharing with healthcare providers</li>
                <li><strong>Calendar applications:</strong> Appointment and feeding schedule synchronization</li>
              </ul>

              <h3>Priority Support & Consultation</h3>
              
              <h4>Expert Access</h4>
              <ul>
                <li><strong>Pediatric sleep consultants:</strong> Virtual consultations available</li>
                <li><strong>Lactation specialists:</strong> Feeding guidance and support</li>
                <li><strong>Child development experts:</strong> Milestone and behavior consultation</li>
                <li><strong>Nutritionist access:</strong> Dietary planning and guidance</li>
                <li><strong>24/7 support chat:</strong> Immediate help when you need it</li>
              </ul>

              <h4>Educational Resources</h4>
              <ul>
                <li>Premium webinar series with parenting experts</li>
                <li>Age-specific development guides and activities</li>
                <li>Sleep training programs with step-by-step guidance</li>
                <li>Feeding transition workshops</li>
                <li>Safety and first aid video library</li>
              </ul>

              <h3>Premium Subscription Tiers</h3>
              
              <h4>Premium Basic ($9.99/month)</h4>
              <ul>
                <li>Advanced analytics and reports</li>
                <li>Unlimited family sharing</li>
                <li>Extended photo storage (10GB)</li>
                <li>Smart notifications</li>
                <li>Priority email support</li>
              </ul>

              <h4>Premium Plus ($14.99/month)</h4>
              <ul>
                <li>All Premium Basic features</li>
                <li>Expert consultation credits (2 per month)</li>
                <li>Unlimited media storage</li>
                <li>Advanced integrations</li>
                <li>Custom report generation</li>
                <li>24/7 chat support</li>
              </ul>

              <h4>Premium Family ($19.99/month)</h4>
              <ul>
                <li>All Premium Plus features</li>
                <li>Multiple baby profiles (up to 5)</li>
                <li>Sibling comparison analytics</li>
                <li>Professional caregiver accounts</li>
                <li>Unlimited expert consultations</li>
                <li>Priority feature requests</li>
              </ul>

              <h3>Free Trial & Money-Back Guarantee</h3>
              
              <h4>30-Day Free Trial</h4>
              <ul>
                <li>Full access to all Premium features</li>
                <li>No credit card required to start</li>
                <li>Easy cancellation anytime</li>
                <li>Data remains accessible even after trial</li>
              </ul>

              <h4>60-Day Money-Back Guarantee</h4>
              <ul>
                <li>Full refund if not completely satisfied</li>
                <li>No questions asked policy</li>
                <li>Keep all data and memories</li>
                <li>Downgrade to free plan option</li>
              </ul>

              <h3>Value Comparison</h3>
              
              <h4>Cost vs. Professional Services</h4>
              <ul>
                <li>Sleep consultant: $300-500 per session vs. ongoing guidance</li>
                <li>Lactation consultant: $100-200 per visit vs. 24/7 access</li>
                <li>Baby photographer: $200-400 per session vs. unlimited storage</li>
                <li>Development assessment: $150-300 vs. continuous monitoring</li>
              </ul>

              <h4>Peace of Mind Value</h4>
              <ul>
                <li>Comprehensive tracking reduces anxiety</li>
                <li>Expert guidance builds confidence</li>
                <li>Early problem identification</li>
                <li>Better sleep for the whole family</li>
                <li>Preserved memories for a lifetime</li>
              </ul>
            `
          },
          '2': {
            title: 'Managing your subscription',
            readTime: '3 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Control Your SleepyBabyy Subscription</h2>
              <p>Managing your SleepyBabyy subscription is straightforward and flexible. Here's everything you need to know about upgrades, downgrades, and account management.</p>
              
              <h3>Accessing Subscription Settings</h3>
              
              <h4>Desktop Navigation</h4>
              <ul>
                <li>Click on your profile icon in the top right corner</li>
                <li>Select "Account Settings" from the dropdown menu</li>
                <li>Click on the "Subscription" tab</li>
                <li>View your current plan and billing information</li>
              </ul>

              <h4>Mobile Access</h4>
              <ul>
                <li>Tap the menu icon (three lines) in the top left</li>
                <li>Scroll down and tap "Account"</li>
                <li>Tap "Subscription & Billing"</li>
                <li>Manage your plan from the subscription dashboard</li>
              </ul>

              <h3>Current Subscription Overview</h3>
              
              <h4>Plan Information</h4>
              <ul>
                <li><strong>Plan name:</strong> Your current subscription tier</li>
                <li><strong>Billing cycle:</strong> Monthly or annual billing</li>
                <li><strong>Next billing date:</strong> When your next payment is due</li>
                <li><strong>Price:</strong> Amount charged per billing period</li>
                <li><strong>Features included:</strong> List of active premium features</li>
              </ul>

              <h4>Usage Statistics</h4>
              <ul>
                <li>Storage used vs. available space</li>
                <li>Number of family members added</li>
                <li>Expert consultation credits remaining</li>
                <li>Reports generated this month</li>
                <li>Feature usage analytics</li>
              </ul>

              <h3>Upgrading Your Plan</h3>
              
              <h4>When to Consider Upgrading</h4>
              <ul>
                <li>Need more storage for photos and videos</li>
                <li>Want to add more family members</li>
                <li>Require expert consultation access</li>
                <li>Need advanced analytics features</li>
                <li>Preparing for multiple babies</li>
              </ul>

              <h4>Upgrade Process</h4>
              <ul>
                <li>Review available plans and features</li>
                <li>Click "Upgrade Plan" next to desired tier</li>
                <li>Confirm billing information</li>
                <li>Features activate immediately upon payment</li>
                <li>Prorated billing adjusts for plan changes</li>
              </ul>

              <h3>Downgrading Your Plan</h3>
              
              <h4>Important Considerations</h4>
              <ul>
                <li><strong>Data retention:</strong> All your data remains safe</li>
                <li><strong>Feature access:</strong> Some features become unavailable</li>
                <li><strong>Storage limits:</strong> May need to manage photo storage</li>
                <li><strong>Family members:</strong> Excess members become read-only</li>
                <li><strong>Reports:</strong> Advanced analytics become unavailable</li>
              </ul>

              <h4>Downgrade Process</h4>
              <ul>
                <li>Click "Change Plan" in subscription settings</li>
                <li>Select a lower-tier plan or free option</li>
                <li>Review what changes will occur</li>
                <li>Confirm downgrade with security verification</li>
                <li>Changes take effect at next billing cycle</li>
              </ul>

              <h3>Billing and Payment Management</h3>
              
              <h4>Payment Methods</h4>
              <ul>
                <li><strong>Credit cards:</strong> Visa, Mastercard, American Express, Discover</li>
                <li><strong>Digital wallets:</strong> Apple Pay, Google Pay, PayPal</li>
                <li><strong>Bank transfers:</strong> ACH direct debit (annual plans only)</li>
                <li><strong>Gift cards:</strong> SleepyBabyy gift card redemption</li>
              </ul>

              <h4>Updating Payment Information</h4>
              <ul>
                <li>Navigate to "Payment Methods" in subscription settings</li>
                <li>Add new payment method or update existing</li>
                <li>Set primary payment method for automatic billing</li>
                <li>Remove old or expired payment methods</li>
                <li>Enable backup payment method for failed charges</li>
              </ul>

              <h3>Billing Cycles and Discounts</h3>
              
              <h4>Monthly vs. Annual Billing</h4>
              <ul>
                <li><strong>Monthly billing:</strong> Pay each month, cancel anytime</li>
                <li><strong>Annual billing:</strong> Pay once yearly, save 20% on all plans</li>
                <li><strong>Switching cycles:</strong> Change billing frequency anytime</li>
                <li><strong>Prorated adjustments:</strong> Fair pricing when making changes</li>
              </ul>

              <h4>Available Discounts</h4>
              <ul>
                <li><strong>Annual subscription:</strong> 20% discount on yearly payments</li>
                <li><strong>Multiple children:</strong> 15% off Premium Family for 3+ profiles</li>
                <li><strong>Military families:</strong> 25% discount with verification</li>
                <li><strong>Student parents:</strong> 15% off with valid student ID</li>
                <li><strong>Referral program:</strong> One month free for each successful referral</li>
              </ul>

              <h3>Subscription Pause and Cancellation</h3>
              
              <h4>Temporary Pause Option</h4>
              <ul>
                <li>Pause subscription for up to 3 months</li>
                <li>Perfect for extended travel or temporary breaks</li>
                <li>All data preserved during pause period</li>
                <li>Resume anytime with same plan and pricing</li>
                <li>No cancellation fees or penalties</li>
              </ul>

              <h4>Cancellation Process</h4>
              <ul>
                <li>Click "Cancel Subscription" in settings</li>
                <li>Complete brief feedback survey (optional)</li>
                <li>Choose immediate or end-of-cycle cancellation</li>
                <li>Receive confirmation email with details</li>
                <li>Access to premium features until period ends</li>
              </ul>

              <h3>Account Recovery and Data Access</h3>
              
              <h4>After Cancellation</h4>
              <ul>
                <li><strong>Free plan access:</strong> Basic features remain available</li>
                <li><strong>Data preservation:</strong> All logs and photos retained</li>
                <li><strong>Export options:</strong> Download data anytime</li>
                <li><strong>Reactivation:</strong> Easy to restart premium subscription</li>
                <li><strong>No data loss:</strong> Everything exactly as you left it</li>
              </ul>

              <h4>Win-Back Offers</h4>
              <ul>
                <li>Special pricing to return within 30 days</li>
                <li>Extended free trial periods</li>
                <li>Feature-specific discounts based on usage</li>
                <li>Loyalty rewards for long-term users</li>
              </ul>

              <h3>Customer Support for Billing</h3>
              
              <h4>Common Issues We Can Help With</h4>
              <ul>
                <li>Failed payment troubleshooting</li>
                <li>Billing cycle confusion</li>
                <li>Refund requests and processing</li>
                <li>Plan comparison questions</li>
                <li>Discount eligibility verification</li>
              </ul>

              <h4>Getting Help</h4>
              <ul>
                <li><strong>Live chat:</strong> Available 24/7 for Premium subscribers</li>
                <li><strong>Email support:</strong> billing@sleepybabyy.com</li>
                <li><strong>Phone support:</strong> Premium Plus and Family plan holders</li>
                <li><strong>Help center:</strong> Self-service articles and FAQs</li>
                <li><strong>Video tutorials:</strong> Step-by-step subscription management guides</li>
              </ul>
            `
          },
          '3': {
            title: 'Billing and payment issues',
            readTime: '5 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Resolve Billing Issues Quickly</h2>
              <p>Payment problems can be frustrating, but most billing issues with SleepyBabyy can be resolved quickly. Here's your complete troubleshooting guide.</p>
              
              <h3>Common Payment Failures</h3>
              
              <h4>Declined Credit Card Charges</h4>
              <ul>
                <li><strong>Insufficient funds:</strong> Account balance too low for charge</li>
                <li><strong>Expired card:</strong> Credit card has passed expiration date</li>
                <li><strong>Incorrect information:</strong> Wrong card number, CVV, or zip code</li>
                <li><strong>Bank security:</strong> Unusual activity triggers automatic decline</li>
                <li><strong>Credit limit:</strong> Purchase would exceed available credit</li>
                <li><strong>International restrictions:</strong> Card blocked for online international purchases</li>
              </ul>

              <h4>Digital Wallet Issues</h4>
              <ul>
                <li><strong>PayPal problems:</strong> Insufficient PayPal balance or linked account issues</li>
                <li><strong>Apple Pay failures:</strong> Touch ID/Face ID authentication problems</li>
                <li><strong>Google Pay errors:</strong> Account verification or payment method issues</li>
                <li><strong>Expired payment methods:</strong> Linked cards or accounts need updating</li>
              </ul>

              <h3>Immediate Troubleshooting Steps</h3>
              
              <h4>Step 1: Check Payment Method</h4>
              <ul>
                <li>Verify card number is entered correctly</li>
                <li>Confirm expiration date is current</li>
                <li>Double-check CVV security code</li>
                <li>Ensure billing address matches bank records</li>
                <li>Try a different payment method if available</li>
              </ul>

              <h4>Step 2: Contact Your Bank</h4>
              <ul>
                <li>Call the customer service number on your card</li>
                <li>Ask if they declined a charge from "SleepyBabyy"</li>
                <li>Request they allow future charges from our platform</li>
                <li>Verify your account has sufficient funds</li>
                <li>Update your address or contact information if needed</li>
              </ul>

              <h4>Step 3: Retry Payment</h4>
              <ul>
                <li>Wait 15-30 minutes after bank approval</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try a different browser or device</li>
                <li>Use incognito/private browsing mode</li>
                <li>Attempt payment during off-peak hours</li>
              </ul>

              <h3>Specific Error Messages</h3>
              
              <h4>"Your card was declined"</h4>
              <ul>
                <li><strong>Solution:</strong> Contact your bank to authorize the transaction</li>
                <li><strong>Common cause:</strong> Security system flagged as suspicious</li>
                <li><strong>Prevention:</strong> Add SleepyBabyy to authorized merchant list</li>
                <li><strong>Alternative:</strong> Use a different payment method</li>
              </ul>

              <h4>"Invalid card information"</h4>
              <ul>
                <li><strong>Solution:</strong> Re-enter all card details carefully</li>
                <li><strong>Check:</strong> Card number, expiration date, CVV, and billing zip</li>
                <li><strong>Verify:</strong> Information matches exactly what's on file with bank</li>
                <li><strong>Try:</strong> Typing instead of auto-fill to avoid formatting errors</li>
              </ul>

              <h4>"Payment processing error"</h4>
              <ul>
                <li><strong>Solution:</strong> Wait a few minutes and try again</li>
                <li><strong>Cause:</strong> Temporary system overload or maintenance</li>
                <li><strong>Check:</strong> SleepyBabyy status page for known issues</li>
                <li><strong>Contact:</strong> Support if problem persists for over an hour</li>
              </ul>

              <h3>Alternative Payment Options</h3>
              
              <h4>When Primary Method Fails</h4>
              <ul>
                <li>Add a backup credit or debit card</li>
                <li>Link your PayPal account</li>
                <li>Use Apple Pay or Google Pay if available</li>
                <li>Consider prepaid SleepyBabyy gift cards</li>
                <li>Request invoice billing (annual plans only)</li>
              </ul>

              <h4>Gift Card Redemption</h4>
              <ul>
                <li>Purchase gift cards from our website</li>
                <li>Redeem in Account Settings > Payment Methods</li>
                <li>Enter gift card code and PIN</li>
                <li>Balance applies to next billing cycle</li>
                <li>Partial balances roll over to future charges</li>
              </ul>

              <h3>Billing Dispute Resolution</h3>
              
              <h4>Unexpected Charges</h4>
              <ul>
                <li><strong>Review billing history:</strong> Check all charges in Account Settings</li>
                <li><strong>Plan changes:</strong> Verify recent upgrades or downgrades</li>
                <li><strong>Family sharing:</strong> Check if family members made changes</li>
                <li><strong>Trial expiration:</strong> Free trials convert to paid subscriptions</li>
                <li><strong>Currency fluctuations:</strong> International charges may vary</li>
              </ul>

              <h4>Duplicate Charges</h4>
              <ul>
                <li>Check if charge appears twice on credit card statement</li>
                <li>Verify only one active subscription exists</li>
                <li>Contact support immediately for investigation</li>
                <li>Keep credit card statement as evidence</li>
                <li>Refund processed within 5-7 business days</li>
              </ul>

              <h3>Refund Requests</h3>
              
              <h4>Eligible Refund Scenarios</h4>
              <ul>
                <li><strong>Accidental charges:</strong> Unintended upgrades or purchases</li>
                <li><strong>Technical issues:</strong> Service unavailable during billing period</li>
                <li><strong>Duplicate billing:</strong> Charged multiple times for same service</li>
                <li><strong>Cancelled within grace period:</strong> Within 30 days of subscription start</li>
                <li><strong>Billing errors:</strong> Incorrect amounts or unauthorized changes</li>
              </ul>

              <h4>Refund Process</h4>
              <ul>
                <li>Submit refund request through support chat or email</li>
                <li>Provide transaction ID and reason for refund</li>
                <li>Include screenshots of billing statements if applicable</li>
                <li>Refunds processed within 5-10 business days</li>
                <li>Money returns to original payment method</li>
              </ul>

              <h3>International Billing</h3>
              
              <h4>Currency and Conversion</h4>
              <ul>
                <li><strong>Supported currencies:</strong> USD, EUR, GBP, CAD, AUD</li>
                <li><strong>Conversion rates:</strong> Updated daily based on market rates</li>
                <li><strong>Bank fees:</strong> Your bank may charge foreign transaction fees</li>
                <li><strong>Price display:</strong> Shown in your local currency when possible</li>
              </ul>

              <h4>International Payment Issues</h4>
              <ul>
                <li>Contact bank to enable international online purchases</li>
                <li>Use PayPal for easier international processing</li>
                <li>Consider local payment methods where available</li>
                <li>Be aware of time zone differences for support</li>
              </ul>

              <h3>Subscription Interruption</h3>
              
              <h4>When Payments Fail</h4>
              <ul>
                <li><strong>Grace period:</strong> 7-day grace period before service interruption</li>
                <li><strong>Email reminders:</strong> Notifications sent at 3, 1, and 0 days remaining</li>
                <li><strong>Feature access:</strong> Premium features disabled after grace period</li>
                <li><strong>Data safety:</strong> All data remains secure and accessible</li>
                <li><strong>Easy restoration:</strong> Update payment method to restore immediately</li>
              </ul>

              <h4>Reactivating Service</h4>
              <ul>
                <li>Update payment method in Account Settings</li>
                <li>Click "Reactivate Subscription" button</li>
                <li>Pay any outstanding balance</li>
                <li>Premium features restored within minutes</li>
                <li>No data loss or service interruption going forward</li>
              </ul>

              <h3>Getting Help with Billing</h3>
              
              <h4>Self-Service Options</h4>
              <ul>
                <li><strong>Billing FAQ:</strong> Common questions and answers</li>
                <li><strong>Video tutorials:</strong> Step-by-step payment troubleshooting</li>
                <li><strong>Account dashboard:</strong> View all billing history and details</li>
                <li><strong>Automated tools:</strong> Update payment methods instantly</li>
              </ul>

              <h4>Contacting Support</h4>
              <ul>
                <li><strong>Live chat:</strong> Fastest response for urgent billing issues</li>
                <li><strong>Email:</strong> billing@sleepybabyy.com for detailed problems</li>
                <li><strong>Phone support:</strong> Available for Premium Plus and Family subscribers</li>
                <li><strong>Priority handling:</strong> Billing issues resolved within 24 hours</li>
                <li><strong>Follow-up:</strong> Confirmation when issue is fully resolved</li>
              </ul>
            `
          }
        }
      },
      'sounds-sleep': {
        title: 'Sounds & Sleep',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        articles: {
          '1': {
            title: 'Choosing the right sounds for sleep',
            readTime: '6 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Find the Perfect Sleep Sounds for Your Baby</h2>
              <p>The right sound environment can transform your baby's sleep quality. Learn how to choose and use sounds that promote better, longer sleep periods.</p>
              
              <h3>Understanding Sound Categories</h3>
              
              <h4>White Noise</h4>
              <ul>
                <li><strong>Characteristics:</strong> Consistent, steady sound across all frequencies</li>
                <li><strong>Benefits:</strong> Masks household noises and creates consistent environment</li>
                <li><strong>Best for:</strong> Light sleepers and noisy environments</li>
                <li><strong>Examples:</strong> Fan sounds, hair dryer, vacuum cleaner</li>
                <li><strong>Volume:</strong> Should be around 50-60 decibels (conversation level)</li>
              </ul>

              <h4>Pink Noise</h4>
              <ul>
                <li><strong>Characteristics:</strong> Deeper, more balanced than white noise</li>
                <li><strong>Benefits:</strong> More natural sound that's less harsh on ears</li>
                <li><strong>Best for:</strong> Babies sensitive to sharp sounds</li>
                <li><strong>Examples:</strong> Rain, ocean waves, wind through trees</li>
                <li><strong>Research:</strong> Studies show improved deep sleep quality</li>
              </ul>

              <h4>Nature Sounds</h4>
              <ul>
                <li><strong>Characteristics:</strong> Organic, rhythmic patterns from natural sources</li>
                <li><strong>Benefits:</strong> Calming effect, promotes relaxation</li>
                <li><strong>Best for:</strong> Bedtime routines and relaxation</li>
                <li><strong>Examples:</strong> Forest sounds, babbling brook, ocean waves, rain</li>
                <li><strong>Caution:</strong> Avoid sounds with sudden loud elements (thunder)</li>
              </ul>

              <h4>Lullabies and Musical Sounds</h4>
              <ul>
                <li><strong>Characteristics:</strong> Melodic, rhythmic, often with vocals</li>
                <li><strong>Benefits:</strong> Emotional bonding, cultural connection</li>
                <li><strong>Best for:</strong> Bedtime routine, parent-child bonding</li>
                <li><strong>Examples:</strong> Traditional lullabies, soft instrumental music</li>
                <li><strong>Timing:</strong> Best during wind-down, not continuous sleep</li>
              </ul>

              <h3>Age-Appropriate Sound Selection</h3>
              
              <h4>Newborns (0-3 months)</h4>
              <ul>
                <li><strong>Preferred sounds:</strong> Womb-like sounds, shushing, heartbeat</li>
                <li><strong>Volume:</strong> Can be louder (up to 70 decibels) initially</li>
                <li><strong>Duration:</strong> Continuous during sleep periods</li>
                <li><strong>Why it works:</strong> Mimics familiar in-utero environment</li>
                <li><strong>Recommendations:</strong> Hair dryer, vacuum, womb sounds</li>
              </ul>

              <h4>Infants (3-6 months)</h4>
              <ul>
                <li><strong>Transition period:</strong> Begin introducing variety</li>
                <li><strong>Volume:</strong> Gradually reduce to 60 decibels</li>
                <li><strong>New sounds:</strong> Gentle rain, soft fan noise</li>
                <li><strong>Consistency:</strong> Maintain same sound for naps and night</li>
                <li><strong>Watch for:</strong> Preferences and sound associations</li>
              </ul>

              <h4>Older Babies (6-12 months)</h4>
              <ul>
                <li><strong>Sound exploration:</strong> Can appreciate more variety</li>
                <li><strong>Nature integration:</strong> Ocean, forest, rain sounds work well</li>
                <li><strong>Musical introduction:</strong> Soft instrumental during bedtime routine</li>
                <li><strong>Sleep association:</strong> Use same sound consistently for sleep cues</li>
                <li><strong>Safety:</strong> Ensure sounds don't startle during light sleep phases</li>
              </ul>

              <h4>Toddlers (12+ months)</h4>
              <ul>
                <li><strong>Personal preferences:</strong> May develop favorite sounds</li>
                <li><strong>Story integration:</strong> Nature sounds can complement bedtime stories</li>
                <li><strong>Routine importance:</strong> Sound becomes part of sleep ritual</li>
                <li><strong>Flexibility:</strong> Can handle minor variations in sound</li>
                <li><strong>Education:</strong> Begin explaining why sounds help sleep</li>
              </ul>

              <h3>Environmental Considerations</h3>
              
              <h4>Room Acoustics</h4>
              <ul>
                <li><strong>Hard surfaces:</strong> Sound reflects and may seem louder</li>
                <li><strong>Soft furnishings:</strong> Carpet, curtains absorb and soften sound</li>
                <li><strong>Room size:</strong> Larger rooms may need higher volume</li>
                <li><strong>Sound placement:</strong> Position speaker away from baby's head</li>
                <li><strong>Multiple speakers:</strong> Can create more even sound distribution</li>
              </ul>

              <h4>External Noise Factors</h4>
              <ul>
                <li><strong>Traffic noise:</strong> White noise helps mask car sounds</li>
                <li><strong>Neighbor sounds:</strong> Pink noise good for muffling voices</li>
                <li><strong>Household activity:</strong> Consistent sound masks footsteps, conversations</li>
                <li><strong>HVAC systems:</strong> Consider how heating/cooling affects sound</li>
                <li><strong>Pets:</strong> Choose sounds that mask barking or meowing</li>
              </ul>

              <h3>Sound Safety Guidelines</h3>
              
              <h4>Volume Recommendations</h4>
              <ul>
                <li><strong>Maximum safe level:</strong> 70 decibels (shower sound level)</li>
                <li><strong>Optimal range:</strong> 50-60 decibels (conversation level)</li>
                <li><strong>Measurement tool:</strong> Use smartphone decibel meter apps</li>
                <li><strong>Distance matters:</strong> Volume decreases with distance from source</li>
                <li><strong>Gradual adjustment:</strong> Start higher, reduce over time</li>
              </ul>

              <h4>Duration Guidelines</h4>
              <ul>
                <li><strong>Continuous play:</strong> Safe for entire sleep period</li>
                <li><strong>Timer function:</strong> Can fade out after baby falls asleep</li>
                <li><strong>All night use:</strong> Recommended for consistent sleep environment</li>
                <li><strong>Nap consistency:</strong> Use same sounds for day and night sleep</li>
                <li><strong>Travel considerations:</strong> Portable options for maintaining routine</li>
              </ul>

              <h3>Using SleepyBabyy Sound Features</h3>
              
              <h4>Sound Library Navigation</h4>
              <ul>
                <li><strong>Categories:</strong> Browse by sound type (white noise, nature, lullabies)</li>
                <li><strong>Favorites:</strong> Save preferred sounds for quick access</li>
                <li><strong>Recently played:</strong> Find sounds you've used before</li>
                <li><strong>Search function:</strong> Find specific sounds by keyword</li>
                <li><strong>Sound preview:</strong> Test sounds before playing for baby</li>
              </ul>

              <h4>Timer and Loop Settings</h4>
              <ul>
                <li><strong>Continuous loop:</strong> Sound plays until manually stopped</li>
                <li><strong>Fade timer:</strong> Gradually reduces volume over set time</li>
                <li><strong>Sleep timer:</strong> Stops playing after specified duration</li>
                <li><strong>Smart fade:</strong> Automatically reduces volume as baby sleeps deeper</li>
                <li><strong>Morning alarm:</strong> Gentle wake-up sounds after set sleep duration</li>
              </ul>

              <h3>Creating Sound Routines</h3>
              
              <h4>Bedtime Sound Sequence</h4>
              <ol>
                <li><strong>Wind-down (30 minutes before bed):</strong> Soft lullabies or gentle music</li>
                <li><strong>Transition (15 minutes):</strong> Gradually shift to sleep sound</li>
                <li><strong>Sleep induction:</strong> Consistent sound choice for falling asleep</li>
                <li><strong>Continuous sleep:</strong> Same sound maintains throughout night</li>
                <li><strong>Wake-up:</strong> Gradual volume reduction or natural wake sounds</li>
              </ol>

              <h4>Nap Time Adaptations</h4>
              <ul>
                <li>Use same sound as nighttime for consistency</li>
                <li>Consider shorter timer duration for shorter naps</li>
                <li>Account for different lighting and activity levels</li>
                <li>Adjust volume for daytime household noise</li>
                <li>Have backup sound options for travel or different rooms</li>
              </ul>

              <h3>Troubleshooting Sound Issues</h3>
              
              <h4>Baby Seems Startled by Sounds</h4>
              <ul>
                <li><strong>Lower the volume:</strong> Start very quiet and gradually increase</li>
                <li><strong>Choose gentler sounds:</strong> Switch from white to pink noise</li>
                <li><strong>Check placement:</strong> Move sound source further from baby</li>
                <li><strong>Gradual introduction:</strong> Use sounds during awake play time first</li>
                <li><strong>Consider timing:</strong> Some babies prefer sound after falling asleep</li>
              </ul>

              <h4>Sounds Not Helping Sleep</h4>
              <ul>
                <li><strong>Try different categories:</strong> Test various sound types</li>
                <li><strong>Adjust timing:</strong> Start sound earlier or later in routine</li>
                <li><strong>Check consistency:</strong> Use same sound every sleep period</li>
                <li><strong>Evaluate environment:</strong> Address other sleep disruptors first</li>
                <li><strong>Be patient:</strong> Sound associations can take 1-2 weeks to develop</li>
              </ul>

              <h4>Technical Sound Issues</h4>
              <ul>
                <li><strong>Poor audio quality:</strong> Check internet connection and device speakers</li>
                <li><strong>Sound cutting out:</strong> Ensure app remains active, check device settings</li>
                <li><strong>Volume inconsistency:</strong> Adjust device volume and app volume separately</li>
                <li><strong>Battery drain:</strong> Use power saving mode or plug in device</li>
                <li><strong>Bluetooth problems:</strong> Use wired speakers when possible</li>
              </ul>
            `
          },
          '2': {
            title: 'Setting up audio timers',
            readTime: '4 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Master Audio Timer Features</h2>
              <p>Audio timers help create consistent sleep routines and ensure sounds play for the right duration. Learn how to set up and customize timers for optimal sleep support.</p>
              
              <h3>Types of Audio Timers</h3>
              
              <h4>Sleep Timer</h4>
              <ul>
                <li><strong>Function:</strong> Stops audio after a set duration</li>
                <li><strong>Best for:</strong> Parents who prefer quiet after baby falls asleep</li>
                <li><strong>Typical duration:</strong> 30 minutes to 2 hours</li>
                <li><strong>Use case:</strong> When baby falls asleep quickly and doesn't need continuous sound</li>
                <li><strong>Benefit:</strong> Saves battery and reduces dependency on sound</li>
              </ul>

              <h4>Fade Timer</h4>
              <ul>
                <li><strong>Function:</strong> Gradually reduces volume over time until silent</li>
                <li><strong>Best for:</strong> Gentle transition from sound to silence</li>
                <li><strong>Duration options:</strong> 15 minutes to 1 hour fade time</li>
                <li><strong>Use case:</strong> Babies who wake when sound stops abruptly</li>
                <li><strong>Benefit:</strong> Natural, gradual reduction mimics real-world sound patterns</li>
              </ul>

              <h4>Loop Timer</h4>
              <ul>
                <li><strong>Function:</strong> Plays audio continuously until manually stopped</li>
                <li><strong>Best for:</strong> Babies who need consistent sound all night</li>
                <li><strong>Duration:</strong> Unlimited - plays until you turn it off</li>
                <li><strong>Use case:</strong> Light sleepers or noisy environments</li>
                <li><strong>Benefit:</strong> Maintains consistent sleep environment</li>
              </ul>

              <h4>Smart Timer</h4>
              <ul>
                <li><strong>Function:</strong> Adjusts based on baby's sleep patterns and movement</li>
                <li><strong>Best for:</strong> Advanced users who want automated adjustment</li>
                <li><strong>Technology:</strong> Uses device sensors or connected monitors</li>
                <li><strong>Use case:</strong> Busy parents who want hands-off sleep management</li>
                <li><strong>Benefit:</strong> Automatically adapts to baby's changing needs</li>
              </ul>

              <h3>Setting Up Basic Timers</h3>
              
              <h4>Accessing Timer Settings</h4>
              <ul>
                <li>Open the Sounds section from your dashboard</li>
                <li>Select your preferred sound from the library</li>
                <li>Tap the timer icon (clock symbol) near the play button</li>
                <li>Choose from preset timer options or create custom duration</li>
                <li>Confirm settings and start playback</li>
              </ul>

              <h4>Preset Timer Options</h4>
              <ul>
                <li><strong>15 minutes:</strong> Quick nap or settling period</li>
                <li><strong>30 minutes:</strong> Short nap or sleep induction</li>
                <li><strong>1 hour:</strong> Medium nap or partial night sleep</li>
                <li><strong>2 hours:</strong> Long nap or early night sleep</li>
                <li><strong>All night:</strong> Continuous play until morning</li>
                <li><strong>Custom:</strong> Set any specific duration you prefer</li>
              </ul>

              <h3>Advanced Timer Configuration</h3>
              
              <h4>Fade Settings</h4>
              <ul>
                <li><strong>Fade duration:</strong> Choose how long the volume reduction takes</li>
                <li><strong>Fade curve:</strong> Linear, exponential, or custom volume reduction</li>
                <li><strong>Final volume:</strong> Set minimum volume before complete silence</li>
                <li><strong>Fade start:</strong> Begin fading immediately or after set delay</li>
                <li><strong>Smart fade:</strong> Adapt fade speed based on baby's sleep depth</li>
              </ul>

              <h4>Multiple Timer Sequences</h4>
              <ul>
                <li><strong>Stage 1:</strong> Lullaby for 15 minutes to help settle</li>
                <li><strong>Stage 2:</strong> Transition to white noise for 30 minutes</li>
                <li><strong>Stage 3:</strong> Fade to silence or continue at low volume</li>
                <li><strong>Custom sequences:</strong> Create up to 5 timer stages</li>
                <li><strong>Repeat options:</strong> Loop entire sequence or single stages</li>
              </ul>

              <h3>Timer Scheduling</h3>
              
              <h4>Nap Timer Scheduling</h4>
              <ul>
                <li><strong>Morning nap:</strong> Set timer for typical morning sleep duration</li>
                <li><strong>Afternoon nap:</strong> Adjust for longer afternoon sleep periods</li>
                <li><strong>Evening catnap:</strong> Shorter timer for brief evening rest</li>
                <li><strong>Flexible scheduling:</strong> Adjust timers based on previous night's sleep</li>
                <li><strong>Multiple baby support:</strong> Different timer settings for different children</li>
              </ul>

              <h4>Bedtime Timer Automation</h4>
              <ul>
                <li><strong>Routine integration:</strong> Timer starts automatically with bedtime routine</li>
                <li><strong>Sleep schedule sync:</strong> Adjusts duration based on planned sleep time</li>
                <li><strong>Weekend variations:</strong> Different timer settings for weekends</li>
                <li><strong>Seasonal adjustments:</strong> Longer timers during daylight saving transitions</li>
                <li><strong>Travel mode:</strong> Adapt timers for different time zones</li>
              </ul>

              <h3>Smart Timer Features</h3>
              
              <h4>Sleep Tracking Integration</h4>
              <ul>
                <li><strong>Movement detection:</strong> Extends timer if baby is still restless</li>
                <li><strong>Sound monitoring:</strong> Continues playing if baby is fussing</li>
                <li><strong>Sleep stage awareness:</strong> Adjusts volume based on deep vs. light sleep</li>
                <li><strong>Wake-up prevention:</strong> Maintains sound during typical wake periods</li>
                <li><strong>Learning algorithm:</strong> Improves timer accuracy over time</li>
              </ul>

              <h4>Environmental Adaptations</h4>
              <ul>
                <li><strong>Noise level monitoring:</strong> Extends timer during noisy periods</li>
                <li><strong>Temperature awareness:</strong> Adjusts sound duration for comfort</li>
                <li><strong>Light sensitivity:</strong> Coordinates with room lighting changes</li>
                <li><strong>Activity detection:</strong> Responds to household activity levels</li>
                <li><strong>Weather integration:</strong> Adapts to storms or unusual weather</li>
              </ul>

              <h3>Troubleshooting Timer Issues</h3>
              
              <h4>Timer Not Working Properly</h4>
              <ul>
                <li><strong>Check device settings:</strong> Ensure app isn't being closed by power management</li>
                <li><strong>Background app refresh:</strong> Enable for SleepyBabyy in device settings</li>
                <li><strong>Do not disturb mode:</strong> Configure to allow SleepyBabyy notifications</li>
                <li><strong>Battery optimization:</strong> Exempt SleepyBabyy from battery saving modes</li>
                <li><strong>Update app:</strong> Ensure you have the latest version for best performance</li>
              </ul>

              <h4>Timer Stopping Unexpectedly</h4>
              <ul>
                <li><strong>Phone calls:</strong> Audio pauses for calls, may not resume timer</li>
                <li><strong>Other apps:</strong> Music or video apps can interrupt SleepyBabyy</li>
                <li><strong>Low battery:</strong> Device may close apps to conserve power</li>
                <li><strong>Network issues:</strong> Streaming sounds may stop with poor connection</li>
                <li><strong>App crashes:</strong> Restart app and check for updates</li>
              </ul>

              <h3>Timer Best Practices</h3>
              
              <h4>Age-Appropriate Timer Use</h4>
              <ul>
                <li><strong>Newborns:</strong> Longer timers or continuous play for consistent environment</li>
                <li><strong>3-6 months:</strong> Begin experimenting with fade timers</li>
                <li><strong>6-12 months:</strong> Shorter timers as sleep consolidates</li>
                <li><strong>Toddlers:</strong> Smart timers that adapt to sleep patterns</li>
                <li><strong>Multiple ages:</strong> Customize timer profiles for each child</li>
              </ul>

              <h4>Routine Integration</h4>
              <ul>
                <li><strong>Consistency:</strong> Use same timer settings every night</li>
                <li><strong>Gradual changes:</strong> Adjust timer duration slowly over weeks</li>
                <li><strong>Backup plans:</strong> Have manual override options ready</li>
                <li><strong>Travel preparation:</strong> Test timer settings before trips</li>
                <li><strong>Caregiver training:</strong> Teach others how to use timer features</li>
              </ul>

              <h3>Premium Timer Features</h3>
              
              <h4>Advanced Scheduling</h4>
              <ul>
                <li><strong>Weekly patterns:</strong> Different timer settings for each day</li>
                <li><strong>Seasonal schedules:</strong> Automatic adjustments for changing seasons</li>
                <li><strong>Holiday modes:</strong> Special timer settings for disrupted routines</li>
                <li><strong>Growth phase adaptation:</strong> Timers adjust for developmental changes</li>
                <li><strong>Multiple location support:</strong> Different settings for home, daycare, travel</li>
              </ul>

              <h4>Analytics and Optimization</h4>
              <ul>
                <li><strong>Timer effectiveness tracking:</strong> See which durations work best</li>
                <li><strong>Sleep quality correlation:</strong> Compare timer settings to sleep outcomes</li>
                <li><strong>Recommendation engine:</strong> AI suggests optimal timer settings</li>
                <li><strong>A/B testing:</strong> Automatically test different timer configurations</li>
                <li><strong>Report integration:</strong> Timer data included in sleep analysis reports</li>
              </ul>
            `
          },
          '3': {
            title: 'Creating custom sound playlists',
            readTime: '5 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Build Perfect Sound Playlists for Every Occasion</h2>
              <p>Custom sound playlists allow you to create personalized audio experiences tailored to your baby's unique preferences and different situations throughout the day.</p>
              
              <h3>Understanding Playlist Types</h3>
              
              <h4>Sleep Playlists</h4>
              <ul>
                <li><strong>Bedtime sequence:</strong> Gentle transition from active to sleep sounds</li>
                <li><strong>Nap time mix:</strong> Shorter sequences for daytime rest</li>
                <li><strong>Night recovery:</strong> Sounds to help baby return to sleep after waking</li>
                <li><strong>Early riser:</strong> Gentle sounds to encourage longer morning sleep</li>
                <li><strong>Weekend routine:</strong> Relaxed schedule with flexible sound timing</li>
              </ul>

              <h4>Activity Playlists</h4>
              <ul>
                <li><strong>Tummy time:</strong> Engaging sounds to encourage motor development</li>
                <li><strong>Play time:</strong> Stimulating but not overwhelming audio</li>
                <li><strong>Feeding background:</strong> Calm sounds during meal times</li>
                <li><strong>Bath time:</strong> Water-themed sounds for relaxation</li>
                <li><strong>Car rides:</strong> Portable playlists for travel comfort</li>
              </ul>

              <h4>Mood-Based Playlists</h4>
              <ul>
                <li><strong>Fussy baby calm-down:</strong> Immediately soothing sounds</li>
                <li><strong>Happy play:</strong> Upbeat but gentle audio for good moods</li>
                <li><strong>Sick day comfort:</strong> Extra gentle sounds for when baby isn't feeling well</li>
                <li><strong>Growth spurt support:</strong> Longer, more consistent sound sequences</li>
                <li><strong>Teething relief:</strong> Specially selected calming audio</li>
              </ul>

              <h3>Creating Your First Playlist</h3>
              
              <h4>Step-by-Step Playlist Creation</h4>
              <ol>
                <li><strong>Navigate to Sounds:</strong> Open the Sounds section from your dashboard</li>
                <li><strong>Access playlist creator:</strong> Tap "Create New Playlist" button</li>
                <li><strong>Name your playlist:</strong> Choose descriptive name like "Bedtime Routine"</li>
                <li><strong>Select sounds:</strong> Browse library and add sounds to playlist</li>
                <li><strong>Arrange order:</strong> Drag and drop to arrange sound sequence</li>
                <li><strong>Set durations:</strong> Specify how long each sound should play</li>
                <li><strong>Configure transitions:</strong> Choose fade, crossfade, or direct cuts</li>
                <li><strong>Save and test:</strong> Save playlist and test the full sequence</li>
              </ol>

              <h4>Playlist Naming Conventions</h4>
              <ul>
                <li><strong>Time-based:</strong> "Morning Routine," "Afternoon Nap," "Bedtime"</li>
                <li><strong>Activity-based:</strong> "Feeding Time," "Play Session," "Tummy Time"</li>
                <li><strong>Mood-based:</strong> "Calm Down," "Happy Time," "Comfort Sounds"</li>
                <li><strong>Situation-based:</strong> "Travel Playlist," "Rainy Day," "Sick Day"</li>
                <li><strong>Personal:</strong> "Emma's Favorites," "What Works for Jake"</li>
              </ul>

              <h3>Advanced Playlist Features</h3>
              
              <h4>Sound Transitions</h4>
              <ul>
                <li><strong>Crossfade:</strong> Smoothly blend from one sound to the next</li>
                <li><strong>Fade out/in:</strong> Brief silence between sounds</li>
                <li><strong>Direct cut:</strong> Immediate transition with no overlap</li>
                <li><strong>Smart transition:</strong> AI chooses best transition method</li>
                <li><strong>Custom duration:</strong> Set exact length of transition period</li>
              </ul>

              <h4>Dynamic Duration Settings</h4>
              <ul>
                <li><strong>Fixed duration:</strong> Each sound plays for exact time specified</li>
                <li><strong>Minimum/maximum:</strong> Allow natural variation within set ranges</li>
                <li><strong>Smart duration:</strong> Adjusts based on baby's response</li>
                <li><strong>Loop individual:</strong> Repeat single sounds before moving to next</li>
                <li><strong>Percentage-based:</strong> Allocate time as percentages of total playlist</li>
              </ul>

              <h3>Optimizing Playlists by Age</h3>
              
              <h4>Newborn Playlists (0-3 months)</h4>
              <ul>
                <li><strong>Womb sounds:</strong> Start with familiar heartbeat and whooshing</li>
                <li><strong>Consistent volume:</strong> Maintain steady sound level throughout</li>
                <li><strong>Longer durations:</strong> 20-30 minutes per sound minimum</li>
                <li><strong>Simple transitions:</strong> Avoid complex crossfades</li>
                <li><strong>Repetitive elements:</strong> Use similar sounds in sequence</li>
              </ul>

              <h4>Infant Playlists (3-6 months)</h4>
              <ul>
                <li><strong>Gentle variety:</strong> Introduce 2-3 different sound types</li>
                <li><strong>Shorter segments:</strong> 10-15 minutes per sound</li>
                <li><strong>Smooth transitions:</strong> Use crossfades between different sounds</li>
                <li><strong>Volume variation:</strong> Slightly vary volume for interest</li>
                <li><strong>Natural progression:</strong> Move from active to calm sounds</li>
              </ul>

              <h4>Older Baby Playlists (6-12 months)</h4>
              <ul>
                <li><strong>More complexity:</strong> 4-6 different sounds in sequence</li>
                <li><strong>Themed playlists:</strong> Forest sounds, ocean themes, etc.</li>
                <li><strong>Interactive elements:</strong> Sounds that respond to movement</li>
                <li><strong>Seasonal adaptation:</strong> Match sounds to time of year</li>
                <li><strong>Educational integration:</strong> Subtle learning elements</li>
              </ul>

              <h3>Playlist Customization</h3>
              
              <h4>Volume Mapping</h4>
              <ul>
                <li><strong>Individual sound levels:</strong> Set different volumes for each sound</li>
                <li><strong>Gradual adjustment:</strong> Slowly increase or decrease throughout playlist</li>
                <li><strong>Peak management:</strong> Ensure no sound is too loud or startling</li>
                <li><strong>Consistent perception:</strong> Balance different sound types for equal perceived volume</li>
                <li><strong>Night vs. day settings:</strong> Different volume curves for different times</li>
              </ul>

              <h4>Repeat and Shuffle Options</h4>
              <ul>
                <li><strong>Playlist loop:</strong> Repeat entire playlist continuously</li>
                <li><strong>Single sound repeat:</strong> Loop one favorite sound</li>
                <li><strong>Smart shuffle:</strong> Vary order while maintaining flow</li>
                <li><strong>Weighted shuffle:</strong> Play favorites more often</li>
                <li><strong>Time-based shuffle:</strong> Different sound orders for different times</li>
              </ul>

              <h3>Sharing and Collaboration</h3>
              
              <h4>Family Playlist Sharing</h4>
              <ul>
                <li><strong>Share with partner:</strong> Both parents can edit and use playlists</li>
                <li><strong>Caregiver access:</strong> Give babysitters access to tested playlists</li>
                <li><strong>Grandparent copies:</strong> Share favorite playlists for visits</li>
                <li><strong>Export options:</strong> Save playlists for use in other apps</li>
                <li><strong>Collaboration notes:</strong> Add comments about what works</li>
              </ul>

              <h4>Community Features</h4>
              <ul>
                <li><strong>Public sharing:</strong> Share successful playlists with SleepyBabyy community</li>
                <li><strong>Browse popular:</strong> Find playlists that work for other parents</li>
                <li><strong>Age-specific collections:</strong> Playlists curated by baby's age</li>
                <li><strong>Expert recommendations:</strong> Playlists created by sleep specialists</li>
                <li><strong>Seasonal collections:</strong> Holiday and seasonal themed playlists</li>
              </ul>

              <h3>Troubleshooting Playlist Issues</h3>
              
              <h4>Playback Problems</h4>
              <ul>
                <li><strong>Skipping sounds:</strong> Check internet connection for streaming sounds</li>
                <li><strong>Uneven volume:</strong> Adjust individual sound levels in playlist</li>
                <li><strong>Poor transitions:</strong> Experiment with different transition types</li>
                <li><strong>Playlist stops:</strong> Ensure app has permission to run in background</li>
                <li><strong>Wrong order:</strong> Double-check playlist sequence and save changes</li>
              </ul>

              <h4>Baby Not Responding</h4>
              <ul>
                <li><strong>Too complex:</strong> Simplify playlist with fewer sounds</li>
                <li><strong>Wrong timing:</strong> Adjust duration of each sound</li>
                <li><strong>Volume issues:</strong> Test different volume levels</li>
                <li><strong>Sound mismatch:</strong> Replace sounds that seem to disturb baby</li>
                <li><strong>Timing problems:</strong> Use playlist at different times of day</li>
              </ul>

              <h3>Playlist Analytics and Optimization</h3>
              
              <h4>Performance Tracking</h4>
              <ul>
                <li><strong>Success rates:</strong> Track how often playlists help baby sleep</li>
                <li><strong>Duration analysis:</strong> See which sounds keep baby asleep longest</li>
                <li><strong>Skip patterns:</strong> Identify sounds that aren't working</li>
                <li><strong>Time correlation:</strong> Find optimal times to use each playlist</li>
                <li><strong>Mood correlation:</strong> Match playlists to baby's emotional state</li>
              </ul>

              <h4>AI Optimization</h4>
              <ul>
                <li><strong>Smart suggestions:</strong> AI recommends sounds to add or remove</li>
                <li><strong>Auto-ordering:</strong> Optimal sound sequence based on success data</li>
                <li><strong>Duration optimization:</strong> AI suggests best length for each sound</li>
                <li><strong>Seasonal adjustments:</strong> Automatic playlist updates for different seasons</li>
                <li><strong>Growth adaptation:</strong> Playlists evolve as baby develops</li>
              </ul>

              <h3>Advanced Playlist Strategies</h3>
              
              <h4>Multi-Stage Sleep Playlists</h4>
              <ul>
                <li><strong>Pre-sleep (30 min):</strong> Gentle music or lullabies</li>
                <li><strong>Sleep induction (15 min):</strong> White or pink noise</li>
                <li><strong>Deep sleep (continuous):</strong> Consistent background sound</li>
                <li><strong>Light sleep protection:</strong> Slightly louder during typical wake times</li>
                <li><strong>Morning transition:</strong> Gradual volume reduction for wake-up</li>
              </ul>

              <h4>Situation-Specific Playlists</h4>
              <ul>
                <li><strong>Travel adaptation:</strong> Familiar sounds in new environments</li>
                <li><strong>Daylight saving:</strong> Playlists to help adjust to time changes</li>
                <li><strong>Illness recovery:</strong> Extra comforting sounds for sick days</li>
                <li><strong>Milestone periods:</strong> Supportive sounds during developmental leaps</li>
                <li><strong>Regression management:</strong> Proven effective sounds for difficult periods</li>
              </ul>
            `
          }
        }
      },
      'account-settings': {
        title: 'Account Settings',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        articles: {
          '1': {
            title: 'Setting up smart notifications',
            readTime: '5 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Master Smart Notifications for Better Baby Care</h2>
              <p>Smart notifications in SleepyBabyy help you stay on top of your baby's routine without being overwhelming. Learn how to configure notifications that work for your family's lifestyle.</p>
              
              <h3>Understanding Notification Types</h3>
              
              <h4>Routine Reminders</h4>
              <ul>
                <li><strong>Feeding alerts:</strong> Remind you when it's time for next feeding</li>
                <li><strong>Sleep time notifications:</strong> Alert when baby should go down for nap or bedtime</li>
                <li><strong>Diaper check reminders:</strong> Prompt for regular diaper changes</li>
                <li><strong>Medicine reminders:</strong> Never miss medication doses</li>
                <li><strong>Activity suggestions:</strong> Prompt for tummy time, play, or interaction</li>
              </ul>

              <h4>Pattern-Based Alerts</h4>
              <ul>
                <li><strong>Sleep regression warnings:</strong> Alert to potential sleep disruptions</li>
                <li><strong>Growth spurt indicators:</strong> Notify when feeding patterns suggest growth</li>
                <li><strong>Schedule drift alerts:</strong> Warn when routines are shifting</li>
                <li><strong>Milestone readiness:</strong> Suggest when baby might reach new developments</li>
                <li><strong>Health pattern changes:</strong> Alert to significant pattern deviations</li>
              </ul>

              <h4>Emergency and Safety Alerts</h4>
              <ul>
                <li><strong>Fever monitoring:</strong> Immediate alerts for temperature concerns</li>
                <li><strong>Appointment reminders:</strong> Never miss pediatrician visits</li>
                <li><strong>Vaccination schedules:</strong> Timely reminders for immunizations</li>
                <li><strong>Safety check prompts:</strong> Regular infant safety reminders</li>
                <li><strong>Emergency contact notifications:</strong> Family alerts during concerns</li>
              </ul>

              <h3>Configuring Basic Notifications</h3>
              
              <h4>Accessing Notification Settings</h4>
              <ul>
                <li>Open Settings from your dashboard menu</li>
                <li>Tap "Notifications" section</li>
                <li>Enable device notifications for SleepyBabyy if prompted</li>
                <li>Choose notification categories to customize</li>
                <li>Set your preferred notification times and frequencies</li>
              </ul>

              <h4>Essential Notification Setup</h4>
              <ul>
                <li><strong>Feeding schedule:</strong> Set intervals based on baby's age (2-4 hours)</li>
                <li><strong>Sleep reminders:</strong> 15-30 minutes before scheduled nap/bedtime</li>
                <li><strong>Wake windows:</strong> Alert when baby has been awake too long</li>
                <li><strong>Activity tracking:</strong> Remind to log activities if forgotten</li>
                <li><strong>Daily summary:</strong> End-of-day progress report</li>
              </ul>

              <h3>Age-Specific Notification Strategies</h3>
              
              <h4>Newborn Stage (0-3 months)</h4>
              <ul>
                <li><strong>Frequent feeding alerts:</strong> Every 2-3 hours, including night</li>
                <li><strong>Diaper reminders:</strong> Every 2 hours or after feeding</li>
                <li><strong>Sleep opportunity alerts:</strong> When baby shows tired signs</li>
                <li><strong>Weight gain tracking:</strong> Weekly reminders to monitor growth</li>
                <li><strong>Gentle routine building:</strong> Gradual schedule establishment</li>
              </ul>

              <h4>Infant Stage (3-6 months)</h4>
              <ul>
                <li><strong>Schedule consolidation:</strong> Reminders for emerging routine</li>
                <li><strong>Sleep training support:</strong> Consistency reminders</li>
                <li><strong>Solid food introduction:</strong> Alerts for trying new foods</li>
                <li><strong>Development milestones:</strong> Motor skill encouragement reminders</li>
                <li><strong>Social interaction prompts:</strong> Play and bonding time alerts</li>
              </ul>

              <h4>Mobile Baby Stage (6-12 months)</h4>
              <ul>
                <li><strong>Meal planning alerts:</strong> Variety in food introduction</li>
                <li><strong>Safety check reminders:</strong> Baby-proofing updates</li>
                <li><strong>Active play prompts:</strong> Encourage movement and exploration</li>
                <li><strong>Language development:</strong> Reading and talking reminders</li>
                <li><strong>Schedule flexibility:</strong> Adapt to changing nap patterns</li>
              </ul>

              <h3>Smart Notification Features</h3>
              
              <h4>AI-Powered Predictions</h4>
              <ul>
                <li><strong>Pattern learning:</strong> AI learns your baby's unique patterns</li>
                <li><strong>Predictive alerts:</strong> Notifications based on historical data</li>
                <li><strong>Anomaly detection:</strong> Alert to unusual patterns or behaviors</li>
                <li><strong>Optimal timing:</strong> Suggest best times for activities</li>
                <li><strong>Personalized recommendations:</strong> Custom advice based on your data</li>
              </ul>

              <h4>Context-Aware Notifications</h4>
              <ul>
                <li><strong>Location-based:</strong> Different alerts for home vs. daycare</li>
                <li><strong>Time-sensitive:</strong> Adjust for weekends vs. weekdays</li>
                <li><strong>Weather-adapted:</strong> Indoor activity suggestions on bad weather days</li>
                <li><strong>Family schedule integration:</strong> Coordinate with partner's availability</li>
                <li><strong>Event-aware:</strong> Adjust for holidays, travel, or special occasions</li>
              </ul>

              <h3>Customization Options</h3>
              
              <h4>Notification Timing</h4>
              <ul>
                <li><strong>Quiet hours:</strong> Set times when notifications should be silent</li>
                <li><strong>Urgency levels:</strong> Different timing for different priority alerts</li>
                <li><strong>Snooze options:</strong> Delay notifications for 5-30 minutes</li>
                <li><strong>Repeat settings:</strong> How often to repeat missed alerts</li>
                <li><strong>Lead time adjustment:</strong> More or less warning time for activities</li>
              </ul>

              <h4>Notification Styles</h4>
              <ul>
                <li><strong>Sound selection:</strong> Choose different tones for different alert types</li>
                <li><strong>Vibration patterns:</strong> Custom vibration for silent alerts</li>
                <li><strong>Visual alerts:</strong> Banner, badge, or full-screen options</li>
                <li><strong>Text customization:</strong> Personalize notification messages</li>
                <li><strong>Icon options:</strong> Different icons for different notification types</li>
              </ul>

              <h3>Family Coordination</h3>
              
              <h4>Multi-Parent Notifications</h4>
              <ul>
                <li><strong>Shared alerts:</strong> Both parents receive routine reminders</li>
                <li><strong>Task distribution:</strong> Alternate who gets feeding/diaper alerts</li>
                <li><strong>Handoff notifications:</strong> Alert when one parent takes over</li>
                <li><strong>Sync confirmations:</strong> Confirm when activities are completed</li>
                <li><strong>Priority parent:</strong> Primary recipient with backup notifications</li>
              </ul>

              <h4>Caregiver Integration</h4>
              <ul>
                <li><strong>Babysitter alerts:</strong> Important routine information for caregivers</li>
                <li><strong>Emergency notifications:</strong> Critical alerts sent to multiple people</li>
                <li><strong>Daycare coordination:</strong> Share routine information with providers</li>
                <li><strong>Grandparent updates:</strong> Optional notifications for extended family</li>
                <li><strong>Professional communication:</strong> Alerts for pediatrician visits</li>
              </ul>

              <h3>Advanced Notification Management</h3>
              
              <h4>Notification Grouping</h4>
              <ul>
                <li><strong>Category bundling:</strong> Group similar notifications together</li>
                <li><strong>Priority ordering:</strong> Most important alerts shown first</li>
                <li><strong>Time-based grouping:</strong> Bundle notifications by time period</li>
                <li><strong>Smart summarization:</strong> Combine related alerts into single notification</li>
                <li><strong>Expandable alerts:</strong> Quick view with option for detailed information</li>
              </ul>

              <h4>Notification Analytics</h4>
              <ul>
                <li><strong>Response tracking:</strong> See which notifications you act on quickly</li>
                <li><strong>Effectiveness measurement:</strong> Analyze which alerts improve routine adherence</li>
                <li><strong>Timing optimization:</strong> Adjust alert timing based on your response patterns</li>
                <li><strong>Frequency adjustment:</strong> Reduce or increase alerts based on effectiveness</li>
                <li><strong>Personalization improvement:</strong> Continuously refine notification relevance</li>
              </ul>

              <h3>Troubleshooting Notifications</h3>
              
              <h4>Not Receiving Notifications</h4>
              <ul>
                <li><strong>Device permissions:</strong> Check notification settings for SleepyBabyy</li>
                <li><strong>Do not disturb:</strong> Configure exceptions for baby care alerts</li>
                <li><strong>Battery optimization:</strong> Prevent system from closing SleepyBabyy</li>
                <li><strong>App updates:</strong> Ensure latest version for best notification reliability</li>
                <li><strong>Network connectivity:</strong> Check internet connection for cloud notifications</li>
              </ul>

              <h4>Too Many Notifications</h4>
              <ul>
                <li><strong>Priority adjustment:</strong> Disable less critical alert categories</li>
                <li><strong>Frequency reduction:</strong> Increase intervals between similar alerts</li>
                <li><strong>Smart bundling:</strong> Enable notification grouping to reduce clutter</li>
                <li><strong>Time restrictions:</strong> Set quiet hours or specific active periods</li>
                <li><strong>Custom profiles:</strong> Different notification levels for weekends/weekdays</li>
              </ul>

              <h3>Privacy and Security</h3>
              
              <h4>Notification Privacy</h4>
              <ul>
                <li><strong>Lock screen display:</strong> Choose what information shows when phone is locked</li>
                <li><strong>Sensitive information:</strong> Hide detailed baby information from notifications</li>
                <li><strong>Public device settings:</strong> Minimize information when others might see screen</li>
                <li><strong>Family sharing boundaries:</strong> Control who sees which notifications</li>
                <li><strong>Professional privacy:</strong> Separate work and personal notification settings</li>
              </ul>

              <h4>Data Security</h4>
              <ul>
                <li><strong>Encrypted notifications:</strong> All alert data is securely transmitted</li>
                <li><strong>Local vs. cloud:</strong> Choose where notification data is stored</li>
                <li><strong>Temporary storage:</strong> Notifications automatically deleted after set time</li>
                <li><strong>Access control:</strong> Notifications only sent to authorized family members</li>
                <li><strong>Emergency protocols:</strong> Secure sharing of critical information when needed</li>
              </ul>
            `
          },
          '2': {
            title: 'Customizing your dashboard',
            readTime: '4 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Personalize Your SleepyBabyy Dashboard</h2>
              <p>Your dashboard is your command center for baby care. Learn how to customize it to show the most relevant information and arrange features for your workflow.</p>
              
              <h3>Understanding Dashboard Components</h3>
              
              <h4>Widget Types Available</h4>
              <ul>
                <li><strong>Quick action cards:</strong> One-tap logging for common activities</li>
                <li><strong>Summary widgets:</strong> Today's overview of sleep, feeding, diapers</li>
                <li><strong>Timeline displays:</strong> Recent activity chronological view</li>
                <li><strong>Chart widgets:</strong> Visual graphs of patterns and trends</li>
                <li><strong>Photo memories:</strong> Recent pictures and milestone images</li>
                <li><strong>Alert panels:</strong> Upcoming reminders and notifications</li>
                <li><strong>Weather integration:</strong> Current conditions affecting baby's comfort</li>
                <li><strong>Family activity feed:</strong> What other caregivers have logged</li>
              </ul>

              <h4>Layout Options</h4>
              <ul>
                <li><strong>Grid view:</strong> Equal-sized widgets in organized rows</li>
                <li><strong>List view:</strong> Stacked widgets in priority order</li>
                <li><strong>Carousel view:</strong> Swipeable horizontal widget arrangement</li>
                <li><strong>Mixed layout:</strong> Different sized widgets for different priorities</li>
                <li><strong>Minimal view:</strong> Only essential information displayed</li>
              </ul>

              <h3>Basic Dashboard Customization</h3>
              
              <h4>Accessing Customization Settings</h4>
              <ul>
                <li>Tap the "Edit Dashboard" button in top right corner</li>
                <li>Long-press any widget to enter edit mode</li>
                <li>Access through Settings > Dashboard Preferences</li>
                <li>Use the widget customization wizard for guided setup</li>
              </ul>

              <h4>Adding and Removing Widgets</h4>
              <ul>
                <li><strong>Add widgets:</strong> Tap the "+" button and browse available options</li>
                <li><strong>Remove widgets:</strong> Long-press and drag to trash icon</li>
                <li><strong>Resize widgets:</strong> Drag corner handles to adjust size</li>
                <li><strong>Move widgets:</strong> Drag to rearrange position on dashboard</li>
                <li><strong>Widget categories:</strong> Browse by function (Sleep, Feeding, Health, etc.)</li>
              </ul>

              <h3>Widget Configuration Options</h3>
              
              <h4>Quick Action Card Customization</h4>
              <ul>
                <li><strong>Activity selection:</strong> Choose which activities to show as quick buttons</li>
                <li><strong>Button order:</strong> Arrange by frequency of use or personal preference</li>
                <li><strong>Color coding:</strong> Assign colors to different activity types</li>
                <li><strong>Icon customization:</strong> Select preferred icons for each activity</li>
                <li><strong>Size options:</strong> Large buttons for easy tapping or compact for more options</li>
              </ul>

              <h4>Summary Widget Settings</h4>
              <ul>
                <li><strong>Time range:</strong> Show data for last 24 hours, week, or custom period</li>
                <li><strong>Metrics displayed:</strong> Choose which statistics are most important</li>
                <li><strong>Visual style:</strong> Numbers, progress bars, or charts</li>
                <li><strong>Comparison options:</strong> Show changes from previous period</li>
                <li><strong>Target tracking:</strong> Display progress toward daily goals</li>
              </ul>

              <h4>Chart Widget Customization</h4>
              <ul>
                <li><strong>Chart type:</strong> Line graphs, bar charts, pie charts, or heat maps</li>
                <li><strong>Data selection:</strong> Choose which activities to visualize</li>
                <li><strong>Time scale:</strong> Hourly, daily, weekly, or monthly views</li>
                <li><strong>Color schemes:</strong> Select colors that are easy to read</li>
                <li><strong>Interactive options:</strong> Enable tap-to-drill-down functionality</li>
              </ul>

              <h3>Age-Specific Dashboard Layouts</h3>
              
              <h4>Newborn Dashboard (0-3 months)</h4>
              <ul>
                <li><strong>Priority widgets:</strong> Feeding tracker, diaper log, sleep timer</li>
                <li><strong>Quick actions:</strong> Start feeding, log diaper, begin sleep</li>
                <li><strong>Essential info:</strong> Last feeding time, diaper count, total sleep</li>
                <li><strong>Minimal complexity:</strong> Focus on survival basics</li>
                <li><strong>Large buttons:</strong> Easy to use during sleep-deprived moments</li>
              </ul>

              <h4>Infant Dashboard (3-6 months)</h4>
              <ul>
                <li><strong>Routine tracking:</strong> Schedule adherence, pattern recognition</li>
                <li><strong>Development focus:</strong> Milestone tracking, tummy time reminders</li>
                <li><strong>Growth monitoring:</strong> Weight tracking, feeding amounts</li>
                <li><strong>Sleep optimization:</strong> Sleep quality charts, wake window tracking</li>
                <li><strong>Photo integration:</strong> Daily milestone photo widget</li>
              </ul>

              <h4>Mobile Baby Dashboard (6-12 months)</h4>
              <ul>
                <li><strong>Activity variety:</strong> Play time, learning activities, social interaction</li>
                <li><strong>Safety tracking:</strong> Childproofing reminders, hazard awareness</li>
                <li><strong>Meal planning:</strong> Solid food introduction, variety tracking</li>
                <li><strong>Independence support:</strong> Self-feeding progress, mobility milestones</li>
                <li><strong>Communication development:</strong> Word tracking, gesture recognition</li>
              </ul>

              <h3>Advanced Customization Features</h3>
              
              <h4>Conditional Widget Display</h4>
              <ul>
                <li><strong>Time-based visibility:</strong> Show different widgets for day vs. night</li>
                <li><strong>Activity-dependent:</strong> Display relevant widgets based on current activity</li>
                <li><strong>Schedule-aware:</strong> Emphasize upcoming routine items</li>
                <li><strong>Location-based:</strong> Different widgets for home, daycare, travel</li>
                <li><strong>Emergency mode:</strong> Simplified interface for urgent situations</li>
              </ul>

              <h4>Multi-Profile Dashboard</h4>
              <ul>
                <li><strong>Multiple babies:</strong> Quick switching between child profiles</li>
                <li><strong>Sibling comparison:</strong> Side-by-side widgets for multiple children</li>
                <li><strong>Age-appropriate automatic:</strong> Widgets adapt as baby grows</li>
                <li><strong>Family member views:</strong> Different dashboard for different caregivers</li>
                <li><strong>Professional mode:</strong> Healthcare provider optimized view</li>
              </ul>

              <h3>Theme and Visual Customization</h3>
              
              <h4>Color Themes</h4>
              <ul>
                <li><strong>Light theme:</strong> Clean, bright interface for daytime use</li>
                <li><strong>Dark theme:</strong> Easy on eyes for nighttime feeding sessions</li>
                <li><strong>Auto-switching:</strong> Automatically change theme based on time</li>
                <li><strong>High contrast:</strong> Improved visibility for accessibility</li>
                <li><strong>Custom colors:</strong> Choose your preferred color palette</li>
              </ul>

              <h4>Layout Density</h4>
              <ul>
                <li><strong>Compact view:</strong> More widgets visible on screen</li>
                <li><strong>Comfortable view:</strong> Balanced spacing and readability</li>
                <li><strong>Spacious view:</strong> Larger widgets with more white space</li>
                <li><strong>Accessibility mode:</strong> Extra large text and buttons</li>
                <li><strong>One-handed mode:</strong> Optimize for single-hand operation</li>
              </ul>

              <h3>Dashboard Templates</h3>
              
              <h4>Pre-Made Templates</h4>
              <ul>
                <li><strong>"First-Time Parent":</strong> Essential widgets with helpful tips</li>
                <li><strong>"Experienced Parent":</strong> Advanced tracking and analytics focus</li>
                <li><strong>"Working Parent":</strong> Quick logging and caregiver coordination</li>
                <li><strong>"Data Enthusiast":</strong> Charts, graphs, and detailed analytics</li>
                <li><strong>"Minimalist":</strong> Only the most essential information</li>
              </ul>

              <h4>Custom Template Creation</h4>
              <ul>
                <li><strong>Save current layout:</strong> Turn your customizations into reusable template</li>
                <li><strong>Share templates:</strong> Send your dashboard setup to partner or friends</li>
                <li><strong>Import templates:</strong> Use layouts shared by other parents</li>
                <li><strong>Backup configurations:</strong> Save multiple layouts for different situations</li>
                <li><strong>Template scheduling:</strong> Automatically switch layouts at different times</li>
              </ul>

              <h3>Mobile vs. Desktop Customization</h3>
              
              <h4>Mobile-Specific Options</h4>
              <ul>
                <li><strong>Swipe navigation:</strong> Configure swipe gestures between widgets</li>
                <li><strong>One-thumb operation:</strong> Optimize widget placement for thumb reach</li>
                <li><strong>Notification integration:</strong> Widgets that expand from notifications</li>
                <li><strong>Lock screen widgets:</strong> Quick access without unlocking phone</li>
                <li><strong>Voice activation:</strong> Control widgets with voice commands</li>
              </ul>

              <h4>Desktop Advantages</h4>
              <ul>
                <li><strong>Multi-column layout:</strong> More widgets visible simultaneously</li>
                <li><strong>Drag and drop:</strong> Easier widget rearrangement</li>
                <li><strong>Keyboard shortcuts:</strong> Quick access to common functions</li>
                <li><strong>Multiple windows:</strong> Different views open simultaneously</li>
                <li><strong>Export options:</strong> Easy data export and printing</li>
              </ul>

              <h3>Performance and Optimization</h3>
              
              <h4>Dashboard Performance</h4>
              <ul>
                <li><strong>Widget limits:</strong> Optimal number of widgets for smooth performance</li>
                <li><strong>Refresh rates:</strong> Balance real-time updates with battery life</li>
                <li><strong>Data caching:</strong> Store frequently accessed information locally</li>
                <li><strong>Background updates:</strong> Keep dashboard current without draining battery</li>
                <li><strong>Connection optimization:</strong> Efficient data syncing across devices</li>
              </ul>

              <h4>Accessibility Features</h4>
              <ul>
                <li><strong>Screen reader support:</strong> Compatible with accessibility tools</li>
                <li><strong>Voice navigation:</strong> Control dashboard with voice commands</li>
                <li><strong>High contrast mode:</strong> Enhanced visibility for visual impairments</li>
                <li><strong>Large text options:</strong> Scalable fonts for better readability</li>
                <li><strong>Motor accessibility:</strong> Switch control and assistive touch support</li>
              </ul>

              <h3>Backing Up and Syncing</h3>
              
              <h4>Cross-Device Synchronization</h4>
              <ul>
                <li><strong>Cloud sync:</strong> Dashboard layout syncs across all your devices</li>
                <li><strong>Family sync:</strong> Share dashboard configurations with partner</li>
                <li><strong>Backup restoration:</strong> Restore dashboard after app reinstall</li>
                <li><strong>Version control:</strong> Keep multiple dashboard versions</li>
                <li><strong>Export/import:</strong> Transfer dashboard settings between accounts</li>
              </ul>
            `
          },
          '3': {
            title: 'Privacy and security settings',
            readTime: '6 min read',
            author: 'SleepyBabyy Team',
            content: `
              <h2>Protect Your Family's Data and Privacy</h2>
              <p>Your baby's information is precious and private. Learn how to configure SleepyBabyy's security features to protect your family's data while still getting the benefits of connected features.</p>
              
              <h3>Understanding Data Privacy</h3>
              
              <h4>Types of Data We Collect</h4>
              <ul>
                <li><strong>Baby activity data:</strong> Sleep, feeding, diaper changes, and developmental milestones</li>
                <li><strong>Photos and videos:</strong> Images you upload of your baby</li>
                <li><strong>Health information:</strong> Growth measurements, medical appointments, symptoms</li>
                <li><strong>Account information:</strong> Your name, email, and app usage patterns</li>
                <li><strong>Family data:</strong> Information about family members and caregivers</li>
                <li><strong>Device information:</strong> Technical data needed for app functionality</li>
              </ul>

              <h4>How Your Data Is Used</h4>
              <ul>
                <li><strong>Personalized experience:</strong> Customizing app features for your baby's age and needs</li>
                <li><strong>Analytics and insights:</strong> Generating reports and pattern recognition</li>
                <li><strong>Feature improvement:</strong> Enhancing app functionality based on usage patterns</li>
                <li><strong>Family sharing:</strong> Enabling collaboration with authorized family members</li>
                <li><strong>Customer support:</strong> Providing help and troubleshooting when needed</li>
              </ul>

              <h3>Account Security Fundamentals</h3>
              
              <h4>Strong Password Requirements</h4>
              <ul>
                <li><strong>Minimum 12 characters:</strong> Longer passwords are significantly more secure</li>
                <li><strong>Mix of character types:</strong> Upper/lowercase letters, numbers, symbols</li>
                <li><strong>Avoid personal information:</strong> No names, birthdays, or obvious patterns</li>
                <li><strong>Unique for SleepyBabyy:</strong> Don't reuse passwords from other accounts</li>
                <li><strong>Regular updates:</strong> Change password every 6-12 months</li>
              </ul>

              <h4>Two-Factor Authentication Setup</h4>
              <ul>
                <li><strong>SMS verification:</strong> Receive codes via text message</li>
                <li><strong>Authentication apps:</strong> Use Google Authenticator or similar apps</li>
                <li><strong>Email backup:</strong> Secondary email for account recovery</li>
                <li><strong>Recovery codes:</strong> Save backup codes in secure location</li>
                <li><strong>Biometric options:</strong> Use fingerprint or face recognition where available</li>
              </ul>

              <h3>Privacy Control Settings</h3>
              
              <h4>Data Sharing Preferences</h4>
              <ul>
                <li><strong>Analytics opt-out:</strong> Prevent anonymous usage data collection</li>
                <li><strong>Research participation:</strong> Control whether data can be used for studies</li>
                <li><strong>Third-party integration:</strong> Manage connections with other apps and services</li>
                <li><strong>Marketing communications:</strong> Control promotional emails and notifications</li>
                <li><strong>Data export rights:</strong> Request copies of all your personal data</li>
              </ul>

              <h4>Photo and Media Privacy</h4>
              <ul>
                <li><strong>Upload restrictions:</strong> Control who can add photos to your baby's profile</li>
                <li><strong>Sharing permissions:</strong> Set rules for who can view and download images</li>
                <li><strong>Cloud storage options:</strong> Choose between local and cloud photo storage</li>
                <li><strong>Automatic deletion:</strong> Set photos to delete after specified time periods</li>
                <li><strong>Watermarking:</strong> Add protection to shared images</li>
              </ul>

              <h3>Family Access Controls</h3>
              
              <h4>Permission Levels Management</h4>
              <ul>
                <li><strong>Admin privileges:</strong> Full control over account settings and data</li>
                <li><strong>Editor access:</strong> Can add and modify baby information</li>
                <li><strong>Viewer permissions:</strong> Read-only access to specified information</li>
                <li><strong>Time-limited access:</strong> Grant temporary permissions to caregivers</li>
                <li><strong>Activity-specific access:</strong> Limit access to certain data types</li>
              </ul>

              <h4>Family Member Verification</h4>
              <ul>
                <li><strong>Email verification:</strong> Confirm identity before granting access</li>
                <li><strong>Security questions:</strong> Additional verification for sensitive access</li>
                <li><strong>Device registration:</strong> Approve new devices for family members</li>
                <li><strong>Access auditing:</strong> Review who accessed what information when</li>
                <li><strong>Emergency contacts:</strong> Designate trusted contacts for account recovery</li>
              </ul>

              <h3>Data Encryption and Storage</h3>
              
              <h4>Encryption Standards</h4>
              <ul>
                <li><strong>End-to-end encryption:</strong> Data encrypted from your device to our servers</li>
                <li><strong>AES-256 encryption:</strong> Military-grade encryption for stored data</li>
                <li><strong>TLS 1.3 transmission:</strong> Secure data transfer protocols</li>
                <li><strong>Encrypted backups:</strong> All backup data is fully encrypted</li>
                <li><strong>Zero-knowledge architecture:</strong> Even we can't read your encrypted data</li>
              </ul>

              <h4>Storage Location Options</h4>
              <ul>
                <li><strong>Cloud storage:</strong> Secure servers with automatic backup</li>
                <li><strong>Local storage:</strong> Keep sensitive data only on your device</li>
                <li><strong>Hybrid approach:</strong> Essential data in cloud, sensitive data local</li>
                <li><strong>Geographic preferences:</strong> Choose data center locations</li>
                <li><strong>Retention policies:</strong> Control how long data is stored</li>
              </ul>

              <h3>Advanced Security Features</h3>
              
              <h4>Device Security</h4>
              <ul>
                <li><strong>Device authorization:</strong> Approve each device that accesses your account</li>
                <li><strong>Session management:</strong> View and terminate active sessions</li>
                <li><strong>Login alerts:</strong> Notifications for new device logins</li>
                <li><strong>Automatic logout:</strong> End sessions after period of inactivity</li>
                <li><strong>Suspicious activity alerts:</strong> Immediate notification of potential security issues</li>
              </ul>

              <h4>Network Security</h4>
              <ul>
                <li><strong>VPN detection:</strong> Enhanced security when using VPNs</li>
                <li><strong>Public Wi-Fi protection:</strong> Extra encryption on unsecured networks</li>
                <li><strong>IP whitelisting:</strong> Restrict access to specific networks</li>
                <li><strong>Geographic restrictions:</strong> Limit access to certain countries/regions</li>
                <li><strong>Network anomaly detection:</strong> Alert to unusual connection patterns</li>
              </ul>

              <h3>Child Privacy Protection</h3>
              
              <h4>COPPA Compliance</h4>
              <ul>
                <li><strong>No direct child interaction:</strong> Children cannot create accounts</li>
                <li><strong>Parental consent:</strong> All data collection authorized by parents</li>
                <li><strong>Limited data collection:</strong> Only collect necessary information</li>
                <li><strong>No behavioral advertising:</strong> Never use child data for marketing</li>
                <li><strong>Easy data deletion:</strong> Parents can delete child data anytime</li>
              </ul>

              <h4>Future Privacy Protection</h4>
              <ul>
                <li><strong>Age-based controls:</strong> Transition controls as child grows</li>
                <li><strong>Consent inheritance:</strong> Transfer control to child when appropriate</li>
                <li><strong>Data minimization:</strong> Regularly review and delete unnecessary data</li>
                <li><strong>Privacy education:</strong> Resources for teaching children about privacy</li>
                <li><strong>Right to be forgotten:</strong> Complete data deletion upon request</li>
              </ul>

              <h3>Emergency Security Procedures</h3>
              
              <h4>Account Compromise Response</h4>
              <ul>
                <li><strong>Immediate password reset:</strong> Quick password change if account is compromised</li>
                <li><strong>Session termination:</strong> End all active sessions on all devices</li>
                <li><strong>Access audit:</strong> Review all recent account activity</li>
                <li><strong>Family notification:</strong> Alert authorized family members of security issue</li>
                <li><strong>Recovery assistance:</strong> 24/7 support for security emergencies</li>
              </ul>

              <h4>Data Breach Protocols</h4>
              <ul>
                <li><strong>Immediate notification:</strong> Alert users within 72 hours of discovery</li>
                <li><strong>Impact assessment:</strong> Clear information about what data was affected</li>
                <li><strong>Remediation steps:</strong> Specific actions you should take to protect yourself</li>
                <li><strong>Prevention measures:</strong> Additional security features activated</li>
                <li><strong>Ongoing monitoring:</strong> Enhanced security monitoring after incidents</li>
              </ul>

              <h3>Regular Security Maintenance</h3>
              
              <h4>Monthly Security Checkups</h4>
              <ul>
                <li><strong>Review family access:</strong> Confirm all family members still need access</li>
                <li><strong>Check authorized devices:</strong> Remove old or unused devices</li>
                <li><strong>Update recovery information:</strong> Ensure backup email and phone are current</li>
                <li><strong>Review privacy settings:</strong> Confirm sharing preferences haven't changed</li>
                <li><strong>Password strength check:</strong> Verify password is still secure</li>
              </ul>

              <h4>Annual Security Audit</h4>
              <ul>
                <li><strong>Complete data review:</strong> Examine all stored information</li>
                <li><strong>Permission reassessment:</strong> Update family member access levels</li>
                <li><strong>Security feature updates:</strong> Enable new security features as available</li>
                <li><strong>Backup verification:</strong> Confirm all important data is properly backed up</li>
                <li><strong>Emergency plan update:</strong> Review and update account recovery procedures</li>
              </ul>

              <h3>Legal Rights and Compliance</h3>
              
              <h4>Your Data Rights</h4>
              <ul>
                <li><strong>Access rights:</strong> Request copies of all data we have about you</li>
                <li><strong>Correction rights:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion rights:</strong> Request complete removal of your data</li>
                <li><strong>Portability rights:</strong> Export your data to use elsewhere</li>
                <li><strong>Objection rights:</strong> Object to certain types of data processing</li>
              </ul>

              <h4>Regulatory Compliance</h4>
              <ul>
                <li><strong>GDPR compliance:</strong> European data protection standards</li>
                <li><strong>CCPA compliance:</strong> California consumer privacy protections</li>
                <li><strong>COPPA compliance:</strong> Children's online privacy protection</li>
                <li><strong>HIPAA awareness:</strong> Health information protection best practices</li>
                <li><strong>International standards:</strong> Compliance with privacy laws worldwide</li>
              </ul>

              <h3>Getting Help with Security</h3>
              
              <h4>Security Support Resources</h4>
              <ul>
                <li><strong>Security help center:</strong> Comprehensive guides and tutorials</li>
                <li><strong>Video tutorials:</strong> Step-by-step security setup instructions</li>
                <li><strong>Live chat support:</strong> Real-time help with security questions</li>
                <li><strong>Emergency security line:</strong> Immediate assistance for urgent security issues</li>
                <li><strong>Community forums:</strong> Learn from other parents' security experiences</li>
              </ul>

              <h4>Reporting Security Issues</h4>
              <ul>
                <li><strong>Bug bounty program:</strong> Reward security researchers who find vulnerabilities</li>
                <li><strong>Responsible disclosure:</strong> Secure channel for reporting security issues</li>
                <li><strong>User feedback:</strong> Report suspicious activity or potential security problems</li>
                <li><strong>Security advisory updates:</strong> Regular communication about security improvements</li>
                <li><strong>Transparency reports:</strong> Regular updates on security requests and incidents</li>
              </ul>
            `
          }
        }
      }
    };

    const category = articlesContent[category] || {
      title: 'Article Not Found',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      articles: {}
    };

    return {
      ...category,
      article: category.articles[id] || {
        title: 'Article not found',
        readTime: '0 min read',
        author: 'SleepyBabyy Team',
        content: '<p>This article could not be found. Please check the URL or return to the help center.</p>'
      }
    };
  };

  const articleData = getArticleContent(categoryName || '', articleId || '');

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Conditional Headers */}
      {user ? (
        <>
          <DesktopHeader />
          <MobileHeader />
        </>
      ) : (
        <>
          {/* Non-authenticated Desktop Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                    alt="SleepyBabyy Logo" 
                    className="h-12 w-auto"
                  />
                  <span className="text-xl font-bold text-gray-900">SleepyBabyy</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/')}>
                    Home
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/features')}>
                    Features
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/pricing')}>
                    Pricing
                  </Button>
                  <LanguageSelector />
                  <Button variant="outline" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Non-authenticated Mobile Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 lg:hidden">
            <div className="flex justify-between items-center h-16 px-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                  alt="SleepyBabyy Logo" 
                  className="h-10 w-auto"
                />
                <span className="text-lg font-bold text-gray-900">SleepyBabyy</span>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                <Button size="sm" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            </div>
          </header>
        </>
      )}

      {/* Article Content */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/help')} className="cursor-pointer">
                  Help Center
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate(`/help/category/${categoryName}`)} 
                  className="cursor-pointer"
                >
                  {articleData.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>
                {articleData.article.title}
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Back Button */}
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/help/category/${categoryName}`)} 
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to {articleData.title}</span>
            </Button>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className={`inline-flex p-3 rounded-2xl ${articleData.bgColor} mb-4`}>
              <Book className={`h-8 w-8 ${articleData.color}`} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {articleData.article.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{articleData.article.readTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{articleData.article.author}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: articleData.article.content }}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Need More Help Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')} className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Support
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/tutorial')} className="border-white text-white hover:bg-white hover:text-blue-600">
              Try Tutorial
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpArticle;
