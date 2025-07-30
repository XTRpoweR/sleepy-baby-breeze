
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ArrowLeft, Book, Clock, User } from "lucide-react";

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

  // Article data structure
  const getArticleData = (categoryKey: string, articleIdStr: string) => {
    const articlesData = {
      'getting-started': {
        title: 'Getting Started',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        articles: {
          '1': {
            title: 'How to create your first baby profile',
            content: `Creating your baby's profile is the first step to getting the most out of SleepyBabyy. Here's how to set it up properly:

## Step 1: Basic Information
Start by entering your baby's basic details:
- **Name**: Choose a name that's easy for all family members to recognize
- **Date of Birth**: This helps us calculate age-appropriate sleep recommendations
- **Gender**: Optional, but helps personalize the experience
- **Current Weight**: Useful for tracking growth over time

## Step 2: Sleep Preferences
Set up your baby's current sleep patterns:
- **Typical bedtime**: When does your baby usually go to sleep?
- **Wake-up time**: What time do they typically wake up?
- **Number of naps**: How many naps does your baby take per day?
- **Sleep environment**: Room temperature, lighting preferences, etc.

## Step 3: Feeding Schedule
If you're tracking feeding:
- **Feeding type**: Breastfeeding, bottle feeding, or mixed
- **Typical feeding intervals**: How often does your baby eat?
- **Amount per feeding**: For bottle feeding

## Step 4: Photo and Personalization
- Add a cute profile photo of your baby
- Choose a theme color for their profile
- Set up any special notes or medical considerations

## Tips for Success:
- Keep information updated as your baby grows
- Add multiple photos to track growth
- Use the notes section for important reminders
- Share the profile with family members who help with care

Once your profile is complete, you'll have access to personalized recommendations and tracking features tailored to your baby's needs.`,
            readTime: '3 min read',
            author: 'SleepyBabyy Team'
          },
          '2': {
            title: 'Quick setup guide for new parents',
            content: `Welcome to SleepyBabyy! This quick setup guide will have you tracking your baby's activities in under 5 minutes.

## Before You Start
Make sure you have:
- Your baby's basic information ready
- Your phone or device handy for the mobile app
- A few minutes of quiet time to focus

## Quick Setup Steps

### 1. Create Your Account (30 seconds)
- Download the SleepyBabyy app or visit our website
- Sign up with your email address
- Verify your email when prompted

### 2. Set Up Baby Profile (2 minutes)
- Enter baby's name and date of birth
- Add a profile photo (optional but recommended)
- Choose your primary tracking goals (sleep, feeding, diapers)

### 3. Configure Basic Settings (1 minute)
- Set your timezone
- Choose your preferred units (metric/imperial)
- Enable push notifications for reminders

### 4. Add Family Members (1 minute)
- Invite your partner or other caregivers
- Set permission levels for each family member
- Share the invitation link

### 5. Start Your First Log (30 seconds)
- Try logging a diaper change or feeding
- Explore the quick-log buttons on your dashboard
- Familiarize yourself with the interface

## Pro Tips for New Users:
- Start with just one or two activity types to avoid overwhelm
- Use the quick-log feature for faster entries
- Set up smart notifications to remind you to log activities
- Check out the tutorial section for detailed walkthroughs

## What's Next?
After setup, consider:
- Exploring sleep schedule features
- Setting up your first sleep routine
- Checking out our sounds library
- Reading about family sharing features

Remember, you don't need to track everything at once. Start with what matters most to you and gradually add more features as you get comfortable with the app.`,
            readTime: '5 min read',
            author: 'SleepyBabyy Team'
          },
          '3': {
            title: 'Understanding the dashboard layout',
            content: `Your SleepyBabyy dashboard is designed to give you a quick overview of your baby's day. Here's how to navigate and customize it effectively.

## Dashboard Overview
The dashboard is divided into several key sections:

### Quick Stats Section
At the top, you'll see:
- **Last feeding time and amount**
- **Current sleep status** (awake/asleep)
- **Time since last diaper change**
- **Today's total sleep hours**

### Quick Log Buttons
Large, easy-to-tap buttons for common activities:
- Sleep (start/end sleep tracking)
- Feeding (log feeding sessions)
- Diaper (record diaper changes)
- Custom activities (medicine, tummy time, etc.)

### Recent Activity Feed
A chronological list showing:
- Today's logged activities
- Time stamps for each entry
- Quick edit options
- Visual icons for easy identification

### Weekly Summary Cards
- Sleep patterns overview
- Feeding trends
- Growth tracking
- Milestone achievements

## Customizing Your Dashboard

### Widget Arrangement
- Long-press any widget to move it
- Drag to reorder based on your priorities
- Hide widgets you don't use regularly

### Quick Actions Setup
- Customize quick-log buttons
- Add shortcuts to frequently used features
- Set up one-tap actions for common routines

### Notification Preferences
- Choose which activities trigger alerts
- Set reminder intervals
- Customize quiet hours for notifications

## Navigation Tips

### Mobile Navigation
- Swipe left/right between baby profiles (if you have multiple)
- Pull down to refresh data
- Long-press for context menus

### Desktop Features
- Use keyboard shortcuts for quick logging
- Multiple windows for detailed analysis
- Larger charts and detailed views

## Making the Most of Your Dashboard
1. **Start simple**: Focus on 2-3 key metrics initially
2. **Regular updates**: Keep information current for accurate insights
3. **Use favorites**: Pin most-used features to the top
4. **Check daily summaries**: Review patterns at the end of each day

The dashboard learns from your usage patterns and will suggest optimizations to make tracking even easier over time.`,
            readTime: '4 min read',
            author: 'SleepyBabyy Team'
          },
          '4': {
            title: 'Setting up your first sleep schedule',
            content: `Creating a consistent sleep schedule is one of the most valuable features in SleepyBabyy. Here's how to set up your first schedule that works for your family.

## Understanding Sleep Schedules
A good sleep schedule includes:
- **Consistent bedtime and wake-up time**
- **Appropriate nap times and durations**
- **Buffer time for routines**
- **Flexibility for growth spurts and changes**

## Step-by-Step Schedule Creation

### 1. Assess Current Patterns (Week 1)
Before creating a schedule, track your baby's natural patterns:
- Note when they naturally get sleepy
- Record current nap and bedtime patterns
- Observe sleep duration preferences
- Track feeding relationships to sleep

### 2. Choose a Schedule Template
SleepyBabyy offers several evidence-based templates:
- **Newborn (0-3 months)**: Frequent, shorter sleep periods
- **Infant (3-6 months)**: Transitioning to longer stretches
- **Baby (6-12 months)**: 2-3 naps plus overnight sleep
- **Toddler (12+ months)**: 1-2 naps plus overnight sleep

### 3. Customize for Your Baby
Adjust the template based on:
- Your baby's natural rhythms
- Family schedule constraints
- Childcare or work requirements
- Individual sleep needs

### 4. Set Up Sleep Environment
Configure environmental factors:
- **Room temperature**: 68-70°F (20-21°C)
- **Lighting**: Dim for naps, dark for nighttime
- **Sounds**: White noise or lullabies
- **Comfort items**: Sleep sacks, pacifiers, etc.

## Schedule Implementation Tips

### Week 1-2: Gradual Introduction
- Start with one consistent element (like bedtime)
- Gradually adjust other sleep times
- Be patient with resistance
- Track progress and adjust as needed

### Week 3-4: Refinement
- Fine-tune timing based on observed patterns
- Address any persistent issues
- Celebrate small victories
- Maintain consistency even when traveling

## Common Challenges and Solutions

### Early Wake-ups
- Gradually push bedtime later
- Ensure room is dark enough
- Check for hunger or discomfort

### Nap Resistance
- Watch for overtiredness signs
- Adjust nap timing
- Create consistent pre-nap routine
- Use soothing sounds or activities

### Schedule Disruptions
- Maintain core elements when possible
- Return to schedule as soon as feasible
- Don't abandon progress due to temporary setbacks

## Advanced Features

### Smart Adjustments
- Enable automatic schedule suggestions
- Use growth milestone adaptations
- Set up seasonal time changes
- Configure sick day modifications

### Family Coordination
- Share schedules with all caregivers
- Set up notification reminders
- Create backup caregiver instructions
- Sync with partner's devices

## Measuring Success
Track improvements in:
- Sleep quality and duration
- Ease of falling asleep
- Reduced night wakings
- Better daytime mood and alertness
- Family stress levels

Remember, every baby is unique. Use our schedule as a starting point and adapt it to work best for your family's needs.`,
            readTime: '6 min read',
            author: 'SleepyBabyy Team'
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
            content: `Family sharing makes caring for your baby a team effort. Here's how to invite and manage family members in SleepyBabyy.

## Why Family Sharing Matters
- **Consistent tracking**: All caregivers can log activities
- **Real-time updates**: Everyone stays informed
- **Reduced communication gaps**: Less "Did you feed the baby?" questions
- **Shared responsibility**: Multiple people can contribute to care

## Getting Started with Invitations

### Step 1: Access Family Settings
- Go to your baby's profile
- Tap on "Family Sharing" or "Manage Family"
- Select "Invite Family Member"

### Step 2: Choose Invitation Method
**Email Invitation** (Recommended)
- Enter the family member's email address
- Add a personal message
- Choose their permission level
- Send the invitation

**Invitation Link**
- Generate a shareable link
- Copy and send via text, messaging app, or email
- Set expiration date for security
- Monitor who uses the link

### Step 3: Set Permission Levels
**Full Access**
- View and edit all baby data
- Invite other family members
- Modify baby profile settings
- Access premium features (if subscribed)

**Caregiver Access**
- Log daily activities (feeding, sleep, diapers)
- View baby's schedules and routines
- Receive notifications and reminders
- Cannot modify major settings

**View Only**
- See baby's activities and progress
- Access reports and analytics
- Receive important notifications
- Cannot log or edit information

## Best Practices for Family Invitations

### Who to Invite
- **Primary caregivers**: Parents, guardians
- **Regular helpers**: Grandparents, nannies, babysitters
- **Occasional caregivers**: Relatives, close friends
- **Healthcare providers**: Pediatricians (view-only)

### Setting Expectations
Before inviting, discuss:
- Who logs what activities
- Preferred notification settings
- Privacy boundaries
- How to handle disagreements about data

### Managing Multiple Caregivers
- Assign primary responsibilities to avoid duplicate logging
- Use the activity feed to see who logged what
- Set up smart notifications to prevent over-notification
- Regular family meetings to review baby's progress

## Troubleshooting Common Issues

### Invitation Not Received
- Check spam/junk folders
- Verify email address is correct
- Try sending invitation link instead
- Contact support if issues persist

### Permission Conflicts
- Clearly define roles and responsibilities
- Use appropriate permission levels
- Regular check-ins about access needs
- Adjust permissions as needed

### Over-logging Activities
- Assign specific activities to specific people
- Use the "Who logged this?" feature
- Set up notifications to prevent duplicates
- Create a family logging schedule

## Advanced Family Features

### Multiple Baby Profiles
- Each family member can be added to multiple babies
- Different permission levels per baby
- Separate notification settings
- Individual access to premium features

### Family Analytics
- See which family member logs most activities
- Track caregiver patterns and preferences
- Identify who's most active during different times
- Generate family contribution reports

### Communication Tools
- Leave notes for other caregivers
- Send quick messages through the app
- Share photos and milestones
- Create shared to-do lists

## Privacy and Security
- All family members must create their own accounts
- Data is encrypted and secure
- Remove family members instantly if needed
- Audit trail shows all account access
- Regular security updates and monitoring

Family sharing transforms baby care from a solo effort into a coordinated team approach, ensuring your baby gets consistent, well-documented care from everyone involved.`,
            readTime: '4 min read',
            author: 'SleepyBabyy Team'
          },
          '2': {
            title: 'Managing family member permissions',
            content: `Understanding and managing family member permissions ensures everyone has the right level of access while maintaining privacy and control.

## Permission Levels Explained

### Owner Level
**Who gets this**: Primary account holder (usually main parent)
- Full control over all settings and data
- Can delete baby profiles
- Manages subscription and billing
- Can remove any family member
- Access to all premium features

### Admin Level
**Who gets this**: Co-parents, primary caregivers
- View and edit all baby activities
- Invite and remove other family members (except Owner)
- Modify baby profile information
- Adjust notification settings
- Cannot delete profiles or manage billing

### Caregiver Level
**Who gets this**: Babysitters, nannies, regular helpers
- Log daily activities (feeding, sleep, diapers, etc.)
- View schedules and current baby status
- Receive care-related notifications
- Cannot invite others or change major settings
- Time-limited access options available

### Viewer Level
**Who gets this**: Grandparents, extended family, healthcare providers
- View baby's progress and activities
- Access reports and milestones
- Receive milestone notifications
- Cannot log activities or make changes
- Perfect for those who want to stay informed

## Setting Up Permissions

### During Invitation
1. Choose the appropriate level based on involvement
2. Consider the person's technical comfort level
3. Think about privacy preferences
4. Set expectations about responsibilities

### Adjusting Permissions Later
- Access Family Settings from baby profile
- Select the family member to modify
- Change permission level instantly
- Changes take effect immediately
- Notify the family member of changes

## Permission-Specific Features

### What Caregivers Can Do
**Daily Logging**
- Record feeding times and amounts
- Track sleep start/end times
- Log diaper changes and details
- Add notes about baby's mood or behavior

**Schedule Access**
- View upcoming nap times
- See feeding schedules
- Check medication reminders
- Access bedtime routines

**Limited Customization**
- Adjust personal notification preferences
- Choose which activities they want to be notified about
- Set quiet hours for their device
- Customize quick-log buttons for their use

### What Viewers Can See
**Progress Tracking**
- Growth charts and milestones
- Sleep pattern summaries
- Feeding trend analysis
- Photo galleries and memories

**Reports Access**
- Weekly and monthly summaries
- Pediatrician-ready reports
- Activity timelines
- Statistical overviews

## Advanced Permission Management

### Temporary Access
**Babysitter Mode**
- Grant temporary caregiver access
- Set automatic expiration dates
- Limit to specific timeframes
- Revoke access instantly when needed

**Emergency Access**
- Provide temporary full access during emergencies
- Include emergency contact information
- Access to medical information and allergies
- Automatic notifications to primary caregivers

### Time-Based Restrictions
- Set active hours for different permission levels
- Restrict access during nighttime hours
- Allow access only during scheduled care times
- Weekend vs. weekday different permissions

### Activity-Specific Permissions
**Granular Control**
- Allow feeding logs but not sleep tracking
- Grant access to diaper changes only
- Permit photo uploads but not profile edits
- Custom combinations based on caregiver role

## Privacy Considerations

### What to Share
**Always Consider**
- Baby's safety and security
- Family privacy preferences
- Sensitive medical information
- Personal family routines

**Best Practices**
- Regular permission audits
- Remove inactive family members
- Update permissions as relationships change
- Clear communication about data use

### Protecting Sensitive Information
- Medical conditions and allergies (limited to trusted caregivers)
- Sleep location and security details
- Family schedule and location patterns
- Personal family photos and videos

## Troubleshooting Permission Issues

### Common Problems
**"I can't log activities"**
- Check if user has Caregiver level or above
- Verify account is active and confirmed
- Ensure app is updated to latest version

**"Family member can see too much"**
- Review and adjust their permission level
- Consider moving to Viewer level
- Check if they were accidentally given Admin access

**"Notifications aren't working"**
- Verify permission level includes notification rights
- Check individual notification preferences
- Ensure app permissions are enabled on their device

### Regular Maintenance
- Monthly permission reviews
- Remove family members who are no longer involved
- Update permissions as baby's needs change
- Check for any unauthorized access

Remember, permission management is about finding the right balance between collaboration and privacy. Start with more restrictive permissions and gradually increase access as trust and need develop.`,
            readTime: '3 min read',
            author: 'SleepyBabyy Team'
          },
          '3': {
            title: 'Setting up caregiver access',
            content: `Whether you're working with a babysitter, nanny, or daycare provider, setting up proper caregiver access ensures continuity of care and peace of mind.

## Types of Caregiver Arrangements

### Professional Caregivers
**Nannies and Au Pairs**
- Full-time care providers
- Need comprehensive access to daily routines
- Should be able to log all activities
- May need emergency contact information

**Babysitters**
- Part-time or occasional care
- Limited access during specific hours
- Quick reference to important information
- Temporary access that can be easily revoked

**Daycare Providers**
- Group care settings
- May need to track multiple children
- Often have their own systems to integrate
- Focus on sharing rather than logging

### Family-Based Caregivers
**Grandparents**
- Regular or occasional care
- May need simpler interface
- Often want to see progress over time
- Varying comfort levels with technology

**Other Family Members**
- Siblings, aunts, uncles, close friends
- Occasional care providers
- May only need basic information
- Focus on safety and emergency info

## Setting Up Professional Caregiver Access

### Pre-Setup Preparation
**Information to Gather**
- Caregiver's email address and phone number
- Days and times they'll be providing care
- Specific responsibilities they'll handle
- Their experience with similar apps

**Privacy Discussion**
- What information they need vs. want to see
- How data will be used and protected
- Expectations about logging activities
- Communication preferences with parents

### Step-by-Step Setup Process

**1. Create Caregiver Profile**
- Send invitation to caregiver's email
- Set initial permission level to "Caregiver"
- Include welcome message with expectations
- Provide tutorial resources if needed

**2. Configure Access Hours**
- Set active hours matching their care schedule
- Enable/disable access for weekends or holidays
- Configure automatic activation/deactivation
- Set up notifications for schedule changes

**3. Customize Available Features**
- Choose which activities they can log
- Provide access to relevant schedules
- Share emergency contact information
- Include any special care instructions

### Essential Information for Caregivers

**Daily Care Basics**
- Current feeding schedule and preferences
- Nap times and sleep routines
- Diaper changing supplies and procedures
- Favorite activities and soothing techniques

**Safety Information**
- Emergency contact numbers
- Pediatrician contact information
- Location of first aid supplies
- Any allergies or medical conditions

**House Rules**
- Screen time policies
- Allowed activities and locations
- Meal and snack guidelines
- Visitors and outing policies

## Managing Multiple Caregivers

### Coordination Strategies
**Shift Handoffs**
- Use activity log to communicate what happened
- Leave notes about baby's mood and needs
- Update any schedule changes or concerns
- Confirm next caregiver has been notified

**Avoiding Duplicate Entries**
- Assign specific logging responsibilities
- Use timestamps to identify overlaps
- Set up notifications to prevent double-logging
- Regular review of activity logs for accuracy

### Communication Tools
**In-App Messaging**
- Quick updates about baby's day
- Questions about routines or procedures
- Photo sharing of activities or concerns
- Coordination of schedule changes

**Daily Summaries**
- Automatic reports of caregiver's time
- Activity summaries for parent review
- Any notes or concerns raised
- Photos and milestone moments captured

## Specialized Caregiver Situations

### Overnight Care
**Extended Access Needs**
- Full access to nighttime routines
- Emergency medical information
- Contact information for parents
- Clear instructions for urgent situations

**Night Nanny Setup**
- Access limited to nighttime hours
- Focus on sleep tracking and feeding logs
- Minimal daytime access needed
- Integration with daytime caregiver logs

### Medical Care Needs
**Special Circumstances**
- Access to medication schedules
- Permission to log medical activities
- Direct communication with healthcare providers
- Documentation requirements for medical needs

### Temporary Care (Date Nights, etc.)
**Quick Setup Options**
- Generate temporary access codes
- Provide essential information only
- Time-limited access (2-6 hours)
- Emergency contacts and procedures

## Training and Support for Caregivers

### Initial Orientation
**App Tutorial**
- Walk through basic logging procedures
- Show how to access schedules and information
- Practice with sample entries
- Ensure comfort with core features

**Baby-Specific Training**
- Review baby's current routines
- Discuss preferences and dislikes
- Share successful soothing techniques
- Explain any unique needs or behaviors

### Ongoing Support
**Regular Check-ins**
- Weekly reviews of logged activities
- Address any questions or concerns
- Update access as needs change
- Provide additional training if needed

**Feedback Integration**
- Ask for caregiver input on routines
- Incorporate their observations into planning
- Value their professional experience
- Adjust access based on their suggestions

## Ending Caregiver Access

### Planned Transitions
- Give notice about access ending
- Export any important data they contributed
- Thank them for their care and documentation
- Provide references or recommendations as appropriate

### Immediate Removal
- Instantly revoke access if needed
- Secure any shared information
- Review logs for any concerns
- Update emergency contacts and procedures

Setting up proper caregiver access creates a seamless care environment where your baby receives consistent, well-documented care regardless of who's providing it.`,
            readTime: '5 min read',
            author: 'SleepyBabyy Team'
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
            content: `SleepyBabyy's sleep analytics provide valuable insights into your baby's sleep patterns. Here's how to read and interpret these powerful visualizations.

## Types of Sleep Charts

### Sleep Timeline Chart
**What it shows**: Hour-by-hour sleep/wake periods
- **Blue bars**: Sleep periods
- **White spaces**: Awake periods
- **Darker blue**: Deeper sleep phases
- **Lighter blue**: Light sleep or restless periods

**How to read it**:
- Horizontal axis shows time (24-hour view)
- Vertical bars show sleep duration
- Gaps indicate wake periods
- Multiple days can be overlaid for pattern comparison

### Weekly Sleep Summary
**Visual Elements**:
- **Total sleep bars**: Daily sleep totals
- **Average line**: Weekly sleep average
- **Nap vs. night breakdown**: Color-coded segments
- **Consistency indicators**: Pattern stability metrics

### Sleep Quality Metrics
**Sleep Efficiency**: Percentage of time in bed actually sleeping
- **90-100%**: Excellent sleep efficiency
- **80-89%**: Good sleep efficiency  
- **70-79%**: Fair sleep efficiency
- **Below 70%**: May need attention

**Sleep Latency**: Time taken to fall asleep
- **0-15 minutes**: Normal range
- **15-30 minutes**: Slightly elevated
- **30+ minutes**: May indicate overtiredness or other issues

## Reading Your Baby's Patterns

### Healthy Sleep Patterns by Age

**Newborn (0-3 months)**
- 14-18 hours total sleep per day
- 2-4 hour sleep stretches
- No clear day/night distinction initially
- Frequent feeding interruptions

**Infant (3-6 months)**
- 12-15 hours total sleep per day
- Longer nighttime stretches (4-6 hours)
- 3-4 naps during the day
- Beginning to show circadian rhythm

**Baby (6-12 months)**
- 11-14 hours total sleep per day
- 6-8 hour nighttime stretches
- 2-3 regular naps
- More predictable schedule

**Toddler (12+ months)**
- 10-13 hours total sleep per day
- 10-12 hour nighttime sleep
- 1-2 naps (transitioning to one)
- Consistent schedule important

### Identifying Patterns and Trends

**Positive Indicators**
- Consistent bedtime and wake-up times
- Gradual increase in nighttime sleep duration
- Decreasing number of night wakings
- Regular nap times and durations

**Areas for Attention**
- Frequent night wakings increasing over time
- Very early morning wake-ups (before 6 AM)
- Difficulty falling asleep (long sleep latency)
- Irregular nap schedules

**Red Flags**
- Sudden dramatic changes in sleep patterns
- Consistently getting much less sleep than age-appropriate
- Signs of sleep regression lasting more than 2-3 weeks
- Sleep difficulties affecting daytime mood significantly

## Using Analytics for Improvements

### Correlation Analysis
**Sleep vs. Feeding**
- Look for patterns between feeding times and sleep quality
- Identify optimal timing for last feeding before bed
- Notice if certain foods affect sleep (for older babies)

**Sleep vs. Activity**
- Compare active days with sleep quality
- Find optimal balance of stimulation and rest
- Identify activities that promote better sleep

**Environmental Factors**
- Track room temperature, noise levels, lighting
- Correlate environmental changes with sleep quality
- Identify optimal sleep environment conditions

### Making Data-Driven Adjustments

**Bedtime Optimization**
- Use sleep latency data to find optimal bedtime
- Adjust gradually based on falling asleep patterns
- Monitor impact of changes over 1-2 weeks

**Nap Schedule Refinement**
- Analyze nap timing vs. nighttime sleep quality
- Identify if naps are too long, too short, or poorly timed
- Adjust based on total sleep needs and night sleep priority

**Wake Window Analysis**
- Track time between sleep periods
- Identify optimal wake windows for your baby's age
- Adjust activities and timing to match natural rhythms

## Advanced Analytics Features

### Predictive Insights
**Sleep Trend Forecasting**
- Algorithms predict likely sleep patterns based on history
- Identify approaching developmental sleep changes
- Suggest proactive schedule adjustments

**Optimal Schedule Suggestions**
- AI-powered recommendations based on your baby's data
- Personalized schedule modifications
- Integration with growth spurts and developmental leaps

### Comparative Analytics
**Peer Comparisons** (Anonymous)
- See how your baby's sleep compares to others of same age
- Identify if patterns are within normal ranges
- Access evidence-based recommendations

**Historical Comparisons**
- Track improvements over time
- Compare different time periods
- Celebrate progress and identify successful strategies

## Sharing Analytics with Healthcare Providers

### Pediatrician Reports
**What to Include**:
- 2-4 week sleep pattern summaries
- Any concerning trends or changes
- Questions about sleep development
- Correlation with growth and feeding

**Report Features**:
- Professional formatting for medical review
- Key metrics highlighted
- Trend analysis and concerns noted
- Recommendations requested from data

### Family Sharing
**What Family Members See**:
- Simplified charts focusing on key metrics
- Progress celebrations and milestones
- Easy-to-understand summaries
- Options to share specific insights

Remember, every baby is unique. Use these analytics as a guide to understand your baby's individual patterns and needs, not as rigid standards they must meet. The goal is to optimize sleep for your family's wellbeing and your baby's healthy development.`,
            readTime: '7 min read',
            author: 'SleepyBabyy Team'
          },
          '2': {
            title: 'Exporting your baby\'s data',
            content: `Exporting your baby's data from SleepyBabyy allows you to share comprehensive reports with pediatricians, backup your information, or analyze patterns in other tools.

## Why Export Data?

### Medical Appointments
- **Pediatrician visits**: Comprehensive activity summaries
- **Specialist consultations**: Sleep, feeding, or growth concerns
- **Medical records**: Personal health documentation
- **Insurance claims**: Activity-based medical needs

### Personal Use
- **Data backup**: Secure copy of baby's information
- **Scrapbooking**: Print-friendly formats for baby books
- **Extended analysis**: Use in spreadsheets or other tools
- **Family sharing**: Send to relatives who don't use the app

### Transition Periods
- **Childcare providers**: Detailed routines and preferences
- **Moving or traveling**: Portable care information
- **App changes**: Backup before switching services
- **Emergency situations**: Quick access to critical information

## Export Formats Available

### PDF Reports
**Professional Medical Reports**
- Formatted for healthcare provider review
- Includes charts, trends, and statistical analysis
- Medical terminology and standard metrics
- Ready to print or share digitally

**Family-Friendly Summaries**
- Easy-to-read format for family members
- Visual charts and milestone celebrations
- Photo integration when available
- Personalized messaging and notes

### Excel/CSV Spreadsheets
**Raw Data Export**
- Complete activity logs with timestamps
- All tracked metrics and measurements
- Notes and observations included
- Customizable for further analysis

**Filtered Data Sets**
- Specific date ranges or activity types
- Custom fields and measurements
- Analysis-ready formatting
- Integration with other tools

### Photo and Video Archives
**Memory Collections**
- Organized by date or milestone
- High-resolution image downloads
- Video compilation options
- Shareable formats for family

## Step-by-Step Export Process

### Accessing Export Features
1. **Navigate to Reports Section**
   - From dashboard, select "Reports & Analytics"
   - Choose "Data Export" or "Generate Report"
   - Select your baby's profile if multiple babies

2. **Choose Export Type**
   - Medical report for healthcare providers
   - Personal summary for family use
   - Raw data for detailed analysis
   - Photo/memory collection

### Customizing Your Export

**Date Range Selection**
- **Last week**: Recent patterns for immediate concerns
- **Last month**: Comprehensive recent overview
- **Last 3 months**: Developmental trend analysis
- **All time**: Complete history since starting app
- **Custom range**: Specific periods of interest

**Activity Type Selection**
- **All activities**: Comprehensive overview
- **Sleep only**: Focus on sleep patterns and issues
- **Feeding only**: Nutrition and feeding analysis
- **Growth tracking**: Weight, height, development
- **Medical**: Symptoms, medications, appointments

**Detail Level Options**
- **Summary**: High-level trends and averages
- **Detailed**: All logged activities and notes
- **Analytics**: Statistical analysis and insights
- **Raw data**: Every data point collected

### Report Customization Features

**Medical Report Customization**
- **Healthcare provider information**: Include doctor details
- **Specific concerns**: Highlight areas of interest
- **Comparison periods**: Before/after changes
- **Recommendations requested**: Specific questions for provider

**Personal Report Options**
- **Include photos**: Visual documentation
- **Family notes**: Personal observations and milestones
- **Growth celebrations**: Positive achievements
- **Future goals**: Plans and aspirations

## Export Quality and Security

### Data Security
**Privacy Protection**
- All exports are encrypted during transfer
- No data stored on external servers during export
- Personal information can be anonymized if requested
- Secure deletion of temporary export files

**Access Control**
- Only account holders can export data
- Family member permissions apply to exports
- Audit trail of all export activities
- Notification to primary account holder

### Quality Assurance
**Data Accuracy**
- All exported data matches app database exactly
- Timestamps preserved in original timezone
- Photos and videos maintain original quality
- Notes and observations included verbatim

**Format Reliability**
- PDF reports are printer-friendly
- Spreadsheets open correctly in all major programs
- Photos maintain metadata and organization
- Charts and graphs remain readable

## Using Exported Data

### For Medical Appointments
**Preparation Tips**
- Export 2-4 weeks before appointment
- Highlight specific concerns or questions
- Include both summary and detailed views
- Bring both digital and printed copies

**During Appointments**
- Use charts to illustrate patterns
- Reference specific dates and incidents
- Show progress or concerning trends
- Ask for interpretation and recommendations

### Personal Analysis
**Spreadsheet Analysis**
- Create pivot tables for pattern recognition
- Calculate custom averages and trends
- Compare different time periods
- Identify correlations between activities

**Backup Storage**
- Save to cloud storage for accessibility
- Organize by date and baby
- Include export date in file names
- Regular backup schedule (monthly recommended)

## Advanced Export Features

### Automated Exports
**Scheduled Reports**
- Weekly summaries sent to email
- Monthly comprehensive reports
- Pediatrician appointment prep (configurable timing)
- Family update distributions

**Trigger-Based Exports**
- Milestone achievement reports
- Concerning pattern alerts
- Growth tracking updates
- Medical event documentation

### Integration Options
**Healthcare Systems**
- Compatible formats for medical record systems
- HL7 FHIR standard compliance for interoperability
- Direct sharing with healthcare provider portals
- Integration with popular medical apps

**Third-Party Tools**
- Import formats for other baby tracking apps
- Compatibility with health monitoring platforms
- Nutrition analysis tool integration
- Sleep study data preparation

## Troubleshooting Export Issues

### Common Problems
**Large File Sizes**
- Consider shorter date ranges
- Exclude photos/videos if not needed
- Choose summary instead of detailed format
- Split exports by activity type

**Missing Data**
- Verify date range includes desired period
- Check family member permissions
- Ensure all activity types are selected
- Contact support for data recovery if needed

**Format Issues**
- Try different export formats
- Update apps that will open the files
- Check device storage and compatibility
- Use web browser for download if app fails

Your baby's data is valuable information that can provide insights for years to come. Regular exports ensure you always have access to this precious record of your baby's growth and development.`,
            readTime: '3 min read',
            author: 'SleepyBabyy Team'
          },
          '3': {
            title: 'Weekly and monthly report summaries',
            content: `SleepyBabyy's automated report summaries provide valuable insights into your baby's patterns and progress over time. Here's how to understand and use these comprehensive overviews.

## Understanding Report Types

### Weekly Summary Reports
**Generated**: Every Monday morning for the previous week
**Key Metrics Include**:
- Total sleep hours and sleep efficiency
- Feeding frequency and volume trends
- Diaper change patterns and consistency
- Growth measurements (if logged)
- Milestone achievements and developments
- Notable pattern changes from previous weeks

**Visual Elements**:
- Day-by-day activity charts
- Sleep/wake pattern visualization
- Feeding trend graphs
- Weekly averages with comparison to previous week
- Progress indicators and achievements

### Monthly Comprehensive Reports
**Generated**: First day of each month for the previous month
**Detailed Analysis**:
- Monthly sleep pattern evolution
- Feeding development and changes
- Growth tracking and percentile progress
- Developmental milestone tracking
- Health and wellness indicators
- Month-over-month comparisons

**Advanced Analytics**:
- Seasonal pattern recognition
- Growth velocity calculations
- Sleep maturation indicators
- Feeding efficiency improvements
- Pattern consistency scoring

## Reading Your Weekly Reports

### Sleep Analysis Section
**Total Sleep Hours**
- Daily totals with weekly average
- Comparison to age-appropriate recommendations
- Night sleep vs. daytime nap breakdown
- Sleep consistency score (how regular patterns are)

**Sleep Quality Indicators**
- **Sleep efficiency**: Time asleep vs. time in bed
- **Sleep latency**: Average time to fall asleep
- **Night wakings**: Frequency and duration
- **Early wake-ups**: Consistency of morning wake times

### Feeding Progress Tracking
**Volume and Frequency**
- Average feeding amounts per session
- Feeding intervals and timing patterns
- Growth in appetite and intake
- Feeding duration trends (for breastfeeding)

**Nutritional Milestones**
- Introduction of new foods
- Reaction tracking and tolerance
- Feeding independence development
- Mealtime behavior and preferences

### Development Highlights
**Physical Development**
- Growth measurements and trends
- Motor skill achievements
- Physical activity levels
- Coordination improvements

**Cognitive and Social Development**
- Communication milestones
- Social interaction patterns
- Learning and recognition skills
- Emotional regulation development

## Monthly Report Deep Dive

### Growth and Development Analysis
**Growth Trajectory**
- Weight, height, and head circumference tracking
- Growth percentile trends
- Comparison to standardized growth charts
- Velocity of growth over time

**Developmental Progression**
- Milestone achievement timeline
- Age-appropriate skill development
- Areas of strength and areas needing attention
- Recommendations for stimulation activities

### Pattern Recognition and Trends
**Long-term Pattern Analysis**
- Seasonal sleep variations
- Growth spurt correlations with behavior
- Feeding pattern maturation
- Environmental factor impacts

**Predictive Insights**
- Upcoming developmental windows
- Potential schedule adjustment needs
- Growth spurt predictions
- Sleep transition preparations

## Customizing Your Reports

### Personalization Options
**Focus Areas**
- Emphasize specific concerns (sleep, feeding, growth)
- Include or exclude certain activities
- Highlight positive achievements
- Address specific questions or worries

**Report Recipients**
- Customize for different audiences (parents, grandparents, pediatrician)
- Adjust detail level based on recipient needs
- Include or exclude personal notes and observations
- Format for specific uses (medical, family sharing, personal)

### Notification Preferences
**Report Delivery**
- Email delivery timing and frequency
- Push notification for important insights
- Shared access with family members
- Integration with calendar reminders

**Alert Thresholds**
- Notify when patterns change significantly
- Alert for missed milestones or concerning trends
- Celebrate achievements and positive progress
- Warning for potential health or development concerns

## Using Reports for Better Care

### Identifying Opportunities
**Schedule Optimization**
- Use sleep data to refine nap and bedtime schedules
- Adjust feeding times based on hunger patterns
- Plan activities during optimal alert periods
- Coordinate care routines with natural rhythms

**Development Support**
- Focus activities on areas showing readiness
- Provide appropriate challenges for growing skills
- Support areas that may need extra attention
- Celebrate and build on strengths

### Problem-Solving with Data
**Pattern Disruptions**
- Identify what might be causing sleep regressions
- Understand feeding challenges or changes
- Recognize environmental factors affecting behavior
- Track the impact of interventions or changes

**Medical Consultation Preparation**
- Use reports to prepare specific questions for pediatrician
- Highlight concerning trends or sudden changes
- Provide comprehensive data for medical assessment
- Track progress on medical recommendations

## Advanced Report Features

### Comparative Analytics
**Peer Comparisons** (Anonymous)
- Compare your baby's patterns to others of similar age
- Understand normal variation ranges
- Identify if patterns warrant attention
- Access evidence-based recommendations

**Historical Comparisons**
- Track improvement over time
- Compare similar periods (month-to-month, season-to-season)
- Celebrate progress and identify successful strategies
- Learn from past experiences and patterns

### Family Insights
**Caregiver Analysis**
- Track which caregivers are most successful with different activities
- Identify patterns based on caregiver involvement
- Optimize care team coordination
- Recognize individual caregiver strengths

**Family Pattern Recognition**
- Understand how family schedules affect baby's routines
- Identify optimal times for family activities
- Coordinate care responsibilities based on patterns
- Plan family time around baby's natural rhythms

## Acting on Report Insights

### Immediate Actions
**This Week Improvements**
- Adjust one element of daily routine based on insights
- Try a recommended schedule modification
- Focus on one area showing opportunity for improvement
- Implement a suggested environmental change

### Long-term Planning
**Monthly Goals**
- Set specific, measurable targets based on trends
- Plan for anticipated developmental changes
- Prepare for seasonal adjustments
- Build on positive patterns and achievements

### Sharing with Healthcare Providers
**Medical Appointments**
- Bring relevant monthly reports to pediatrician visits
- Highlight specific concerns or questions raised by data
- Use visual charts to illustrate patterns or problems
- Request professional interpretation of concerning trends

**Specialist Consultations**
- Provide specialized reports for sleep consultants, nutritionists, or developmental specialists
- Focus on specific areas of concern
- Include detailed data relevant to their expertise
- Ask for professional recommendations based on your baby's patterns

Regular review of these reports helps you stay informed about your baby's development and ensures you're providing the best possible care based on actual data rather than just memory or perception.`,
            readTime: '5 min read',
            author: 'SleepyBabyy Team'
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
            content: `SleepyBabyy's premium subscription unlocks advanced features designed to provide deeper insights and enhanced functionality for your baby's care.

## Premium Features Overview

### Advanced Analytics and Reports
**Comprehensive Sleep Analysis**
- Detailed sleep pattern recognition and trends
- Sleep quality scoring and improvement recommendations
- Predictive sleep pattern insights
- Advanced correlation analysis (sleep vs. feeding, growth, etc.)
- Sleep regression detection and guidance

**Growth and Development Tracking**
- Growth percentile tracking with WHO/CDC standards
- Developmental milestone predictions and guidance
- Photo-based growth comparison tools
- Pediatrician-ready growth reports
- Early intervention recommendations when appropriate

**Custom Report Generation**
- Detailed reports for any date range
- Customizable report templates
- Medical-grade reports for healthcare providers
- Family-friendly progress summaries
- Automated weekly and monthly insights

### Enhanced Family Collaboration
**Unlimited Family Members**
- Add as many caregivers as needed
- Granular permission controls
- Individual notification preferences
- Family activity analytics
- Caregiver performance insights

**Advanced Communication Tools**
- In-app messaging between family members
- Photo and video sharing with automatic organization
- Collaborative note-taking
- Shared calendar for appointments and activities
- Real-time activity notifications

### Smart Scheduling and Automation
**AI-Powered Schedule Optimization**
- Personalized sleep schedule recommendations
- Automatic schedule adjustments based on growth
- Smart nap time predictions
- Feeding schedule optimization
- Travel and time zone adjustment assistance

**Intelligent Notifications**
- Context-aware reminders
- Predictive notifications (hunger, tiredness, etc.)
- Smart quiet hours that learn your preferences
- Emergency alert systems
- Integration with smart home devices

### Premium Data and Storage
**Unlimited Photo and Video Storage**
- High-resolution photo storage
- Video milestone documentation
- Automatic backup and organization
- Advanced search and filtering
- Memory timeline creation

**Extended Data Retention**
- Unlimited historical data storage
- Advanced data export options
- Multiple backup formats
- Priority data recovery support
- Cross-platform synchronization

## Premium vs. Free Comparison

### Free Account Features
**Basic Tracking**
- Sleep, feeding, and diaper logging
- Simple charts and summaries
- 3 family members maximum
- 30-day data retention
- Basic photo storage (50 photos)

**Limited Analytics**
- Weekly summary reports
- Basic sleep pattern recognition
- Simple growth tracking
- Standard notification system

### Premium Account Benefits
**Advanced Tracking**
- All basic features plus custom activities
- Detailed analytics and predictions
- Unlimited family members
- Unlimited data retention
- Unlimited photo/video storage

**Professional Tools**
- Medical-grade reports
- Advanced pattern recognition
- Predictive insights
- Priority customer support
- Beta feature access

## Subscription Plans

### Monthly Premium ($9.99/month)
**Best for**: Trying premium features or short-term needs
- All premium features included
- Cancel anytime
- No long-term commitment
- Immediate feature activation

### Annual Premium ($79.99/year - Save 33%)
**Best for**: Long-term users wanting maximum value
- All premium features included
- 2 months free compared to monthly
- Priority customer support
- Early access to new features

### Family Plan ($119.99/year - Up to 3 babies)
**Best for**: Families with multiple children
- All premium features for up to 3 baby profiles
- Shared family member access across all profiles
- Bulk reporting and analytics
- Family milestone timeline

## Getting the Most from Premium

### Optimization Strategies
**Sleep Enhancement**
- Use AI recommendations to optimize sleep schedules
- Track sleep regressions with detailed analytics
- Export sleep data for pediatric consultations
- Utilize predictive insights for schedule planning

**Growth Monitoring**
- Regular growth percentile tracking
- Photo-based progress documentation
- Medical report generation for checkups
- Early milestone identification

**Family Coordination**
- Set up all caregivers with appropriate permissions
- Use advanced notifications to coordinate care
- Share reports with extended family
- Utilize messaging for seamless communication

### Advanced Features Usage
**Custom Analytics**
- Create reports focusing on specific concerns
- Track correlations between activities and behaviors
- Monitor intervention effectiveness
- Identify patterns for different caregivers

**Smart Automation**
- Set up intelligent reminder systems
- Use predictive notifications to stay ahead of needs
- Automate routine documentation
- Integration with smart home systems

## Premium Support Benefits

### Priority Customer Service
**Response Times**
- 24-hour response for premium subscribers
- Live chat support during business hours
- Priority email support queue
- Direct access to technical specialists

**Enhanced Support Features**
- Personalized onboarding consultation
- Custom feature training sessions
- Data migration assistance
- Advanced troubleshooting support

### Exclusive Access
**Beta Features**
- Early access to new features before public release
- Opportunity to provide feedback on development
- Exclusive feature previews
- Beta testing community access

**Educational Resources**
- Premium-only webinars and tutorials
- Expert consultations on baby care topics
- Advanced user community access
- Personalized recommendations based on data

## Making the Premium Decision

### Who Benefits Most from Premium?
**Ideal Premium Users**
- Parents tracking multiple aspects of baby's development
- Families with multiple caregivers
- Parents with specific concerns requiring detailed monitoring
- Users who value advanced analytics and predictions
- Families planning for multiple children

**Consider Premium If You**
- Want detailed reports for pediatrician visits
- Have multiple family members involved in care
- Need unlimited photo and video storage
- Value predictive insights and recommendations
- Want priority customer support

### Return on Investment
**Value Considerations**
- Time saved through automation and smart features
- Improved care quality through better insights
- Enhanced communication with family and healthcare providers
- Peace of mind through comprehensive monitoring
- Professional-quality documentation for medical needs

**Cost Comparison**
- Less than the cost of a single pediatrician consultation per month
- Comparable to other baby care apps with fewer features
- Significant savings with annual subscription
- Family plan offers excellent value for multiple children

Premium features are designed to grow with your family and provide increasing value as your baby develops and your tracking needs become more sophisticated.`,
            readTime: '4 min read',
            author: 'SleepyBabyy Team'
          },
          '2': {
            title: 'Managing your subscription',
            content: `Managing your SleepyBabyy subscription is straightforward, whether you need to upgrade, downgrade, update payment methods, or cancel your service.

## Accessing Subscription Management

### Through the App
1. **Navigate to Account Settings**
   - Tap your profile icon in the top right
   - Select "Account & Settings"
   - Choose "Subscription & Billing"

2. **View Current Subscription**
   - See your current plan and billing cycle
   - Check renewal date and payment method
   - Review feature usage and limits

### Through the Website
1. **Login to Your Account**
   - Visit sleepybabyy.com and sign in
   - Go to "Account Dashboard"
   - Select "Billing & Subscription"

## Subscription Plan Changes

### Upgrading Your Plan

**From Free to Premium**
1. Go to Subscription settings
2. Choose "Upgrade to Premium"
3. Select Monthly ($9.99) or Annual ($79.99) plan
4. Enter payment information
5. Confirm upgrade

**Benefits Take Effect Immediately**
- All premium features unlock instantly
- Previous data remains accessible
- No interruption in service
- Pro-rated billing for mid-cycle upgrades

**From Individual to Family Plan**
1. Select "Change Plan" in subscription settings
2. Choose "Family Plan" option
3. Add additional baby profiles if needed
4. Confirm plan change and billing adjustment

### Downgrading Your Plan

**From Premium to Free**
⚠️ **Important Considerations Before Downgrading**:
- Premium features will be disabled
- Data older than 30 days may become inaccessible
- Photo storage limited to 50 photos
- Family members beyond 3 will lose access
- Advanced reports and analytics will be disabled

**Downgrade Process**:
1. Go to Subscription settings
2. Select "Change Plan"
3. Choose "Downgrade to Free"
4. Review what features you'll lose
5. Confirm downgrade (takes effect at end of billing cycle)

**Data Retention During Downgrade**
- Recent 30 days of data remains accessible
- Older data is preserved but not accessible on free plan
- Photos beyond the 50-photo limit are hidden but not deleted
- Re-upgrading restores access to all data

### Changing Payment Methods

**Adding a New Payment Method**
1. Go to "Payment Methods" in subscription settings
2. Select "Add Payment Method"
3. Enter new credit card or PayPal information
4. Verify the payment method
5. Set as primary if desired

**Updating Existing Payment Method**
1. Select the payment method to update
2. Choose "Edit Payment Method"
3. Update card number, expiration date, or billing address
4. Save changes and verify update

**Setting Default Payment Method**
1. View all payment methods
2. Select the method you want as default
3. Choose "Set as Primary"
4. Confirm the change

## Billing Cycle Management

### Understanding Billing Cycles

**Monthly Subscriptions**
- Billed on the same date each month
- Automatic renewal unless cancelled
- Pro-rated charges for mid-cycle changes
- Can cancel anytime before next billing date

**Annual Subscriptions**
- Billed once per year on renewal date
- Automatic renewal for continued service
- Significant savings compared to monthly billing
- 30-day refund period for new subscribers

### Changing Billing Frequency

**Monthly to Annual**
1. Select "Change Billing Cycle"
2. Choose "Switch to Annual"
3. Review cost savings and new billing date
4. Confirm change (immediate charge for annual plan minus remaining monthly credits)

**Annual to Monthly**
1. Choose "Change Billing Cycle"
2. Select "Switch to Monthly"
3. Change takes effect at end of current annual cycle
4. Monthly billing begins after annual subscription expires

## Payment Issues and Resolution

### Common Payment Problems

**Declined Credit Card**
- Verify card information is correct
- Check with bank for transaction blocks
- Ensure sufficient funds available
- Try alternative payment method

**Expired Payment Method**
- Update card expiration date
- Add new payment method if needed
- Set up automatic billing updates if available

**Billing Address Mismatch**
- Ensure billing address matches card account
- Update address in payment settings
- Contact customer support for assistance

### Failed Payment Recovery

**Automatic Retry Process**
- System automatically retries failed payments
- Multiple retry attempts over 7 days
- Email notifications sent for each attempt
- Account remains active during retry period

**Manual Payment Update**
1. Receive failed payment notification
2. Go to subscription settings immediately
3. Update payment method or fix issue
4. Select "Retry Payment Now"
5. Confirm successful payment processing

## Subscription Cancellation

### Cancelling Your Subscription

**Through the App/Website**
1. Go to Subscription settings
2. Select "Cancel Subscription"
3. Choose cancellation reason (optional feedback)
4. Confirm cancellation

**Important Cancellation Details**
- Service continues until end of current billing period
- No refunds for partial months (except within 30 days of new subscription)
- Account automatically downgrades to free plan
- All data is preserved but premium features are disabled

### What Happens After Cancellation

**Immediate Changes**
- Subscription set to not renew
- Confirmation email sent
- Account remains premium until billing period ends

**At End of Billing Period**
- Account automatically downgrades to free
- Premium features become unavailable
- Data access limited to free plan restrictions
- Family members beyond limit lose access

### Reactivating Cancelled Subscriptions

**Before End of Billing Period**
1. Go to Subscription settings
2. Select "Reactivate Subscription"
3. Confirm reactivation
4. Automatic renewal resumes

**After End of Billing Period**
1. Choose "Upgrade to Premium" from free account
2. Select desired plan
3. All previous data becomes accessible again
4. Premium features restored immediately

## Customer Support for Billing

### When to Contact Support

**Billing Disputes**
- Unexpected charges
- Failed refund requests
- Billing cycle confusion
- Payment processing errors

**Technical Issues**
- Payment methods not saving
- Subscription changes not taking effect
- App not recognizing premium status
- Cross-platform sync issues

### Contact Information
- **Email**: billing@sleepybabyy.com
- **Live Chat**: Available during business hours for premium subscribers
- **Phone**: Premium subscribers receive priority phone support
- **Response Time**: 24-48 hours for billing inquiries

### Information to Provide
- Account email address
- Subscription plan details
- Payment method used (last 4 digits only)
- Error messages received
- Screenshots if applicable

Managing your subscription should be hassle-free. If you encounter any issues or need assistance with any aspect of billing or subscription management, our customer support team is ready to help ensure your experience with SleepyBabyy continues smoothly.`,
            readTime: '3 min read',
            author: 'SleepyBabyy Team'
          },
          '3': {
            title: 'Billing and payment issues',
            content: `Resolving billing and payment issues quickly ensures uninterrupted access to SleepyBabyy's features. Here's how to troubleshoot and resolve common billing problems.

## Common Payment Issues

### Credit Card Declined
**Most Common Causes**:
- **Insufficient funds**: Check account balance
- **Expired card**: Verify expiration date
- **Incorrect information**: Double-check card number, CVV, and billing address
- **International restrictions**: Some cards block international transactions
- **Fraud protection**: Banks may block unfamiliar subscription charges

**Immediate Solutions**:
1. **Verify Card Information**
   - Check card number for typos
   - Confirm CVV code (3-4 digit security code)
   - Ensure expiration date is current
   - Verify billing address matches bank records exactly

2. **Contact Your Bank**
   - Ask about blocks on subscription services
   - Verify if transaction was flagged as fraudulent
   - Request pre-approval for SleepyBabyy charges
   - Check daily/monthly spending limits

3. **Try Alternative Payment Method**
   - Use different credit or debit card
   - Try PayPal if available
   - Consider using bank account for direct payment

### Payment Processing Delays
**What This Means**:
- Payment submitted but not yet processed
- Can take 1-3 business days to complete
- Account remains active during processing
- You'll receive confirmation once payment clears

**During Processing Period**:
- Premium features remain accessible
- No action needed from you
- Monitor email for payment confirmation
- Contact support if delay exceeds 3 business days

### Failed Recurring Payments
**Why This Happens**:
- Card expired since last successful payment
- Bank changed fraud protection rules
- Account closed or payment method removed
- Technical issues with payment processor

**Automatic Recovery Process**:
1. **Day 1**: First retry attempt automatically
2. **Day 3**: Second retry with email notification
3. **Day 5**: Third retry with urgent email notification
4. **Day 7**: Final retry before suspension warning
5. **Day 10**: Account downgrade to free plan if not resolved

## Resolving Billing Disputes

### Unexpected Charges
**First Steps**:
1. **Check Your Subscription Settings**
   - Verify current plan and billing frequency
   - Look for recent plan changes
   - Check if annual renewal occurred
   - Review family member additions

2. **Review Email Notifications**
   - Check for upgrade confirmations
   - Look for plan change notifications
   - Verify renewal date communications
   - Check spam folder for billing emails

### Duplicate Charges
**Common Causes**:
- Browser refresh during payment processing
- Multiple payment methods on file
- System processing delays
- User error (multiple submission attempts)

**Resolution Process**:
1. **Document the Issue**
   - Screenshot of duplicate charges
   - Note exact amounts and dates
   - Gather transaction IDs if available

2. **Contact Customer Support**
   - Provide duplicate charge evidence
   - Include account information
   - Request immediate credit or refund

3. **Temporary Resolution**
   - Duplicate charges are typically refunded within 3-5 business days
   - Account remains active during resolution
   - Future payments not affected

### Refund Requests

**Eligible Refund Situations**:
- **New subscribers**: 30-day money-back guarantee
- **Billing errors**: System mistakes or overcharges
- **Duplicate charges**: Accidental multiple payments
- **Technical issues**: App malfunction preventing feature use

**Refund Process**:
1. **Submit Refund Request**
   - Contact customer support within 30 days
   - Provide reason for refund
   - Include relevant documentation

2. **Review Period**
   - Support team reviews request within 2 business days
   - May request additional information
   - Account usage and payment history verified

3. **Processing Timeline**
   - Approved refunds processed within 5-7 business days
   - Credit appears on original payment method
   - Email confirmation sent when refund is issued

## Payment Method Management

### Updating Expired Cards
**Before Card Expires**:
- System sends email reminders 30 days before expiration
- Update card information in account settings
- Verify new information saves correctly
- Test with small transaction if concerned

**After Card Expires**:
- Failed payment notifications begin
- Account remains active during grace period
- Add new payment method immediately
- Contact support if unable to update

### Changing Payment Methods
**Switching Between Cards**:
1. Add new payment method in account settings
2. Set new method as primary
3. Remove old payment method if desired
4. Verify next billing cycle uses new method

**Payment Method Security**:
- Card information encrypted and secure
- No full card numbers stored in app
- PCI DSS compliant payment processing
- Regular security audits and updates

## International Payment Issues

### Currency and Exchange Rates
**How Billing Works**:
- All prices displayed in USD
- Bank converts to local currency
- Exchange rates set by your bank
- May include foreign transaction fees

**Reducing Currency Issues**:
- Use card with no foreign transaction fees
- Consider PayPal for consistent currency handling
- Annual subscriptions reduce frequency of currency conversions

### Regional Payment Restrictions
**Common Restrictions**:
- Some countries restrict subscription services
- Bank policies on international payments
- Local regulations on app purchases
- Payment processor limitations

**Alternative Solutions**:
- Use PayPal if credit cards are restricted
- Try different card issuer
- Consider VPN if regional restrictions apply
- Contact support for region-specific payment options

## Technical Payment Issues

### App Payment Integration Problems
**Symptoms**:
- Payment appears to process but premium features don't activate
- Subscription shows as cancelled but was charged
- Cross-platform sync issues with subscription status

**Troubleshooting Steps**:
1. **Force Close and Restart App**
2. **Log Out and Log Back In**
3. **Check Internet Connection**
4. **Update App to Latest Version**
5. **Contact Support if Issues Persist**

### Website Payment Issues
**Browser-Related Problems**:
- Clear browser cache and cookies
- Disable browser extensions that might interfere
- Try different browser or incognito mode
- Ensure JavaScript is enabled

## Getting Help with Billing Issues

### When to Contact Support
**Immediate Support Needed**:
- Unable to access premium features after payment
- Multiple failed attempts to update payment method
- Suspicious or unauthorized charges
- Account locked due to payment issues

### How to Contact Support
**Premium Subscribers**:
- Live chat during business hours (9 AM - 6 PM EST)
- Priority email support (billing@sleepybabyy.com)
- Phone support for urgent billing issues
- 24-hour response time guarantee

**Free Account Users**:
- Email support for billing inquiries
- Community forums for general questions
- 48-hour response time for billing issues

### Information to Provide
**Always Include**:
- Account email address
- Last 4 digits of payment method
- Exact error messages received
- Screenshots of issues
- Date and time of problems
- Device and browser information

**For Billing Disputes**:
- Bank statement showing charges
- Transaction confirmation numbers
- Previous successful payment history
- Specific amounts and dates in question

Most billing and payment issues can be resolved quickly with the right information and approach. Don't hesitate to contact customer support - we're here to help ensure your SleepyBabyy experience remains smooth and uninterrupted.`,
            readTime: '5 min read',
            author: 'SleepyBabyy Team'
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
            content: `SleepyBabyy's extensive sound library includes scientifically-backed audio designed to promote better sleep for babies of all ages. Here's how to choose the most effective sounds for your baby's sleep needs.

## Understanding Baby Sleep Sounds

### Types of Sleep-Promoting Sounds

**White Noise**
- **What it is**: Consistent sound across all frequencies
- **Best for**: Newborns and very young babies
- **Benefits**: Mimics womb environment, masks household noises
- **Examples**: Fan noise, static, vacuum cleaner sounds

**Pink Noise**
- **What it is**: Lower frequency emphasis, softer than white noise
- **Best for**: Babies 3+ months, light sleepers
- **Benefits**: More natural sounding, promotes deeper sleep
- **Examples**: Rainfall, ocean waves, rustling leaves

**Brown Noise**
- **What it is**: Even lower frequencies, very deep and rumbling
- **Best for**: Babies who need strong sound masking
- **Benefits**: Excellent for blocking sudden noises
- **Examples**: Thunder, waterfall, heavy rain

**Nature Sounds**
- **What it is**: Natural environmental sounds
- **Best for**: Older babies and toddlers
- **Benefits**: Calming and familiar, promotes relaxation
- **Examples**: Birds chirping, flowing water, forest sounds

### Lullabies and Musical Sounds
**Traditional Lullabies**
- **Best for**: Bedtime routines, bonding time
- **Benefits**: Familiar melodies, cultural connection
- **Volume**: Soft and gentle, around 50 decibels

**Instrumental Music**
- **Best for**: Calm, alert time and pre-sleep routine
- **Benefits**: Stimulates brain development while soothing
- **Examples**: Classical music, soft piano, gentle strings

**Heartbeat Sounds**
- **Best for**: Newborns and fussy babies
- **Benefits**: Mimics mother's heartbeat from womb
- **Usage**: Particularly effective during transitions

## Age-Appropriate Sound Selection

### Newborns (0-3 months)
**Recommended Sounds**:
- White noise at 65-70 decibels
- Heartbeat rhythms
- Shushing sounds
- Vacuum cleaner or hair dryer recordings

**Why These Work**:
- Recreate familiar womb environment
- Provide consistent auditory input
- Help establish sleep associations
- Block startling household noises

**Usage Tips**:
- Play continuously during sleep
- Position speaker 3-7 feet from baby
- Use consistent volume every time
- Start during awake time to create positive association

### Infants (3-6 months)
**Recommended Sounds**:
- Pink noise (rainfall, ocean waves)
- Soft nature sounds
- Gentle lullabies
- Consistent mechanical sounds

**Developmental Considerations**:
- Hearing is more developed
- Beginning to prefer varied sounds
- Can distinguish between different audio types
- Sleep patterns becoming more regular

**Advanced Techniques**:
- Gradual volume reduction as baby falls asleep
- Combine sounds (e.g., rain with soft music)
- Use different sounds for naps vs. nighttime
- Introduce variety while maintaining favorites

### Babies (6-12 months)
**Recommended Sounds**:
- Nature sounds with gentle variation
- Soft instrumental music
- Combination soundscapes
- Rhythmic sounds like trains or windchimes

**Sleep Development**:
- Longer sleep stretches possible
- More aware of environment
- Can develop sound preferences
- May resist new sounds

**Customization Strategies**:
- Observe which sounds work best
- Create custom playlists
- Use familiar sounds for comfort during sleep regressions
- Introduce new sounds gradually during wake times

### Toddlers (12+ months)
**Recommended Sounds**:
- Story-based audio (for quiet time)
- Complex nature soundscapes
- Soft music with simple melodies
- Familiar character voices (for comfort)

**Considerations**:
- May have strong preferences
- Can request specific sounds
- Understands routine associations
- May use sounds for self-soothing

## Optimizing Sound Usage

### Volume Guidelines
**Safe Volume Levels**:
- **Newborns**: 50-70 decibels (softer than shower)
- **Infants**: 50-65 decibels (conversation level)
- **Toddlers**: 45-60 decibels (quiet office level)

**Measuring Volume**:
- Use smartphone decibel apps
- Position meter at baby's ear level
- Check volume regularly as speakers age
- Consider room acoustics and sound reflection

**Safety Considerations**:
- Never exceed 70 decibels for extended periods
- Use timer functions to prevent all-night exposure at high volumes
- Monitor baby for signs of hearing discomfort
- Regular hearing checkups with pediatrician

### Timing and Duration

**Continuous vs. Timed Play**:
**Continuous** (All night):
- Best for: Consistent sleepers, noisy environments
- Benefits: Prevents wake-ups from sound changes
- Considerations: Ensure safe volume levels

**Timed Play** (30-60 minutes):
- Best for: Babies learning to sleep independently
- Benefits: Helps with sleep initiation, reduces dependency
- Usage: Set timer to turn off after baby is in deep sleep

**Gradual Fade-Out**:
- Start at normal volume
- Gradually reduce over 20-30 minutes
- Helps baby transition to sleeping without sound
- Good for reducing sound dependency

### Environmental Factors

**Room Acoustics**:
- Hard surfaces amplify sound
- Soft furnishings absorb and muffle sound
- Speaker placement affects sound distribution
- Consider neighbor noise policies

**Speaker Placement**:
- 3-7 feet from baby's sleep area
- Not directly above crib for safety
- Away from baby's head to prevent startle
- Consider portable speakers for travel

## Creating Effective Sound Routines

### Building Sleep Associations
**Consistency is Key**:
- Use same sounds for same activities
- Play sounds 15-30 minutes before sleep time
- Maintain routine even when traveling
- Include sounds in bedtime routine

**Positive Associations**:
- Introduce sounds during happy, calm times
- Never use as punishment or when baby is distressed
- Pair with other soothing activities (massage, rocking)
- Allow baby to see and explore speaker safely

### Troubleshooting Sound Issues

**Baby Doesn't Respond to Sounds**:
- Try different types (white noise vs. nature sounds)
- Adjust volume (might be too loud or too soft)
- Change timing (earlier in routine or different duration)
- Combine with other soothing techniques

**Baby Becomes Dependent on Sounds**:
- Gradually reduce volume over several nights
- Introduce silent periods during naps
- Use sounds only for difficult sleep times
- Practice sleeping without sounds occasionally

**Sounds Stop Working**:
- Rotate between different favorite sounds
- Check if baby has outgrown current sounds
- Combine familiar sounds with new elements
- Consider if other sleep issues are developing

### Travel and Consistency

**Portable Sound Solutions**:
- Download sounds to phone for offline use
- Invest in small, portable speakers
- Use sound apps with timer functions
- Bring familiar sounds to new environments

**Maintaining Routines Away from Home**:
- Keep sound routine consistent
- Adjust volume for different room sizes
- Respect noise policies in hotels/family homes
- Have backup sound options available

The right sounds can significantly improve your baby's sleep quality and duration. Experiment with different options, observe your baby's responses, and remember that preferences may change as your baby grows and develops.`,
            readTime: '6 min read',
            author: 'SleepyBabyy Team'
          },
          '2': {
            title: 'Setting up audio timers',
            content: `Audio timers in SleepyBabyy help you create automated sound schedules that support your baby's sleep routine without requiring constant manual control.

## Understanding Audio Timers

### What Audio Timers Do
**Automated Sound Control**:
- Start playing sounds at specific times
- Stop sounds after set durations
- Gradually fade volume in or out
- Repeat patterns automatically
- Sync with baby's sleep schedule

**Benefits of Using Timers**:
- Consistent routine without manual intervention
- Prevents overnight sound dependency
- Saves battery life on devices
- Allows parents to sleep without worrying about turning off sounds
- Creates predictable audio environment for baby

### Types of Timer Functions

**Start Timers**
- Begin playing sounds at scheduled times
- Perfect for nap time or bedtime routines
- Can be set for daily, weekly, or custom schedules
- Works with any sound in your library

**Stop Timers**
- Automatically end sound playback after set duration
- Useful for preventing all-night sound exposure
- Helps baby learn to sleep without continuous audio
- Customizable from 15 minutes to 8 hours

**Fade Timers**
- Gradually increase or decrease volume over time
- Smooth transitions that don't startle baby
- Fade-in for gentle wake-ups
- Fade-out for natural sleep onset

**Repeat Timers**
- Cycle sounds on and off throughout sleep period
- Play for set duration, pause, then repeat
- Useful for babies who wake between sleep cycles
- Customizable intervals and repetitions

## Setting Up Basic Audio Timers

### Creating Your First Timer

**Step 1: Choose Your Sound**
1. Navigate to the Sounds Library
2. Select the sound you want to schedule
3. Tap the "Timer" or "Schedule" icon
4. Choose "Create New Timer"

**Step 2: Set the Schedule**
1. Select start time for the sound
2. Choose which days to repeat (daily, weekdays, specific days)
3. Set the duration or end time
4. Configure fade in/out options if desired

**Step 3: Configure Advanced Options**
1. Set volume level for this timer
2. Choose repeat patterns if needed
3. Enable/disable notifications
4. Name your timer for easy identification

**Step 4: Activate and Test**
1. Save your timer settings
2. Enable the timer
3. Test during non-sleep times to verify settings
4. Adjust timing based on baby's response

### Common Timer Configurations

**Bedtime Timer Setup**
- **Start Time**: 30 minutes before desired sleep time
- **Duration**: 45-60 minutes (or until baby is in deep sleep)
- **Fade**: Gradual fade-out over final 15 minutes
- **Sound**: White noise or familiar lullaby
- **Volume**: Start at 60 decibels, fade to 45 decibels

**Nap Time Timer Setup**
- **Start Time**: 15 minutes before nap time
- **Duration**: 30-45 minutes for short naps, longer for extended naps
- **Sound**: Pink noise or nature sounds
- **Volume**: Consistent at 55 decibels
- **Repeat**: Daily during established nap times

**Wake-Up Timer Setup**
- **Start Time**: 15 minutes before desired wake time
- **Fade**: Gradual volume increase over 10-15 minutes
- **Sound**: Gentle nature sounds or soft music
- **Volume**: Start at 30 decibels, increase to 50 decibels

## Advanced Timer Features

### Multiple Timer Coordination

**Layered Sound Timers**
- Combine different sounds with overlapping timers
- Example: Start with heartbeat, add white noise after 10 minutes
- Create complex soundscapes that evolve during sleep
- Useful for babies who need varying audio stimulation

**Schedule Integration**
- Sync timers with feeding schedules
- Coordinate with family member care shifts
- Automatic adjustments for daylight saving time
- Integration with baby's growth and changing sleep needs

**Smart Timer Suggestions**
- AI-powered recommendations based on baby's patterns
- Automatic timer adjustments for sleep regressions
- Seasonal adjustments for changing daylight hours
- Growth milestone-based timer modifications

### Conditional Timers

**Activity-Based Triggers**
- Start timers when baby is put down for sleep
- Stop timers when baby wakes up (using app integration)
- Adjust based on logged feeding or diaper change times
- Coordinate with other family members' activities

**Environmental Triggers**
- Adjust volume based on ambient noise levels
- Change sounds based on time of year or weather
- Respond to household activity levels
- Integration with smart home systems

### Customizing Timer Behavior

**Volume Control Options**
- **Consistent Volume**: Same level throughout timer duration
- **Fade In**: Start quiet, gradually increase to set level
- **Fade Out**: Start at normal level, gradually decrease to silence
- **Variable**: Different volume levels at different times
- **Responsive**: Adjust based on ambient noise (premium feature)

**Sound Transition Options**
- **Hard Stop**: Sound ends abruptly when timer expires
- **Fade Out**: Gradual volume reduction over 1-10 minutes
- **Loop Fade**: Complete current sound loop before stopping
- **Cross Fade**: Blend into different sound or silence

## Timer Management and Organization

### Creating Timer Categories

**By Sleep Type**
- **Bedtime Timers**: Evening and overnight schedules
- **Nap Timers**: Daytime sleep periods
- **Rest Time Timers**: Quiet time without full sleep
- **Travel Timers**: Adjusted for different time zones

**By Baby's Age**
- **Newborn Timers**: Frequent, shorter durations
- **Infant Timers**: Longer sleep periods, fewer timers
- **Toddler Timers**: Scheduled around activities
- **Growth Transition Timers**: For changing sleep needs

### Timer Library Management

**Organizing Your Timers**
- Use descriptive names ("Bedtime - 7 PM Start")
- Create folders for different types or babies
- Archive old timers instead of deleting
- Export timer settings for backup

**Sharing Timers with Family**
- Copy timer settings to other family members
- Create shared timer templates
- Coordinate timer schedules across caregivers
- Synchronize changes and updates

## Troubleshooting Timer Issues

### Common Problems and Solutions

**Timer Doesn't Start**
- Check device volume and sound settings
- Verify timer is enabled and scheduled correctly
- Ensure app has necessary permissions
- Check internet connection for cloud-based timers

**Sound Stops Unexpectedly**
- Check battery optimization settings on device
- Verify app isn't being closed by system
- Ensure sufficient storage space for sound files
- Check for app updates that might fix issues

**Timer Conflicts**
- Review overlapping timer schedules
- Prioritize timers by importance
- Use timer groups to manage multiple schedules
- Set up backup timers for critical sleep times

### Optimization Tips

**Battery Conservation**
- Use local sound files instead of streaming
- Enable low-power mode during timer operation
- Close unnecessary apps while timers are running
- Consider dedicated device for sound timers

**Reliability Improvements**
- Set up backup timers 5-10 minutes after primary
- Use multiple devices for critical sleep times
- Test timers regularly during non-sleep periods
- Keep app and device software updated

## Advanced Timer Strategies

### Adaptive Timer Systems

**Learning from Baby's Patterns**
- Analyze sleep logs to optimize timer schedules
- Adjust timer duration based on actual sleep times
- Modify start times based on baby's natural rhythms
- Create seasonal adjustment schedules

**Responsive Timer Modifications**
- Longer timers during sleep regressions
- Shorter timers when establishing independence
- Modified timers during illness or disruptions
- Travel-adapted timer schedules

### Integration with Other Features

**Sleep Schedule Coordination**
- Sync timers with recommended sleep schedules
- Automatic adjustments when schedule changes
- Coordination with feeding and activity timers
- Integration with family member schedules

**Analytics Integration**
- Track effectiveness of different timer configurations
- Analyze sleep quality with and without timers
- Generate reports on timer usage and success
- Use data to optimize future timer settings

Audio timers transform your baby care routine from reactive to proactive, ensuring consistent, supportive sound environments that promote better sleep for the whole family.`,
            readTime: '4 min read',
            author: 'SleepyBabyy Team'
          },
          '3': {
            title: 'Creating custom sound playlists',
            content: `Custom sound playlists in SleepyBabyy allow you to create personalized audio experiences tailored to your baby's preferences and different activities throughout the day.

## Understanding Custom Playlists

### What Custom Playlists Offer
**Personalized Audio Experiences**:
- Combine multiple sounds into seamless sequences
- Create different moods for different activities
- Build routines around specific audio combinations
- Develop unique soundscapes for your baby's preferences

**Flexibility and Control**:
- Mix and match any sounds from the library
- Set individual durations for each sound
- Control transitions between sounds
- Create unlimited playlists for different situations

### Types of Playlists to Create

**Sleep Progression Playlists**
- Start with active sounds, gradually transition to calming
- Begin with familiar sounds, move to sleep-promoting audio
- Layer different types of noise for comprehensive coverage
- End with minimal or no sound for independent sleep

**Activity-Specific Playlists**
- **Tummy Time**: Engaging but not overstimulating sounds
- **Feeding Time**: Gentle, consistent background audio
- **Play Time**: Varied, stimulating sounds that encourage interaction
- **Calm Down**: Soothing progression from active to restful

**Mood-Based Playlists**
- **Fussy Baby**: Sounds specifically chosen for soothing distressed babies
- **Alert and Happy**: Audio that maintains positive energy
- **Sleepy but Fighting**: Gentle but persistent sleep-promoting sounds
- **Overtired**: Immediate calming sounds for overstimulated babies

## Creating Your First Custom Playlist

### Step-by-Step Playlist Creation

**Step 1: Plan Your Playlist**
1. Identify the purpose (sleep, play, calming, etc.)
2. Consider the total duration needed
3. Think about the progression of moods/energy
4. List your baby's favorite sounds to include

**Step 2: Access Playlist Creator**
1. Go to Sounds Library in SleepyBabyy
2. Tap "Create Custom Playlist" or "+" icon
3. Name your playlist descriptively
4. Choose category (Sleep, Play, Calm, etc.)

**Step 3: Add Sounds to Playlist**
1. Browse sound library categories
2. Preview sounds before adding
3. Drag sounds into desired order
4. Set individual sound duration (30 seconds to 20 minutes)
5. Configure transition settings between sounds

**Step 4: Customize Transitions**
1. **Seamless**: Sounds blend into each other smoothly
2. **Fade**: Previous sound fades out as next fades in
3. **Pause**: Brief silence between sounds
4. **Cross-fade**: Sounds overlap for specified duration

**Step 5: Test and Refine**
1. Play complete playlist during non-sleep time
2. Observe baby's reactions to different segments
3. Adjust sound order, duration, or transitions as needed
4. Save multiple versions for different circumstances

### Essential Playlist Templates

**The Perfect Bedtime Playlist (45 minutes)**
1. **Familiar Lullaby** (5 minutes) - Comfort and routine
2. **Heartbeat Sounds** (8 minutes) - Deep comfort and security
3. **Pink Noise/Rain** (15 minutes) - Sleep promotion
4. **Soft White Noise** (12 minutes) - Consistent background
5. **Very Soft White Noise** (5 minutes) - Fade to minimal sound

**Nap Time Progression (30 minutes)**
1. **Gentle Nature Sounds** (10 minutes) - Birds, soft breeze
2. **Ocean Waves** (15 minutes) - Rhythmic, sleep-inducing
3. **Minimal White Noise** (5 minutes) - Maintain sleep environment

**Soothing for Fussy Baby (20 minutes)**
1. **Shushing Sounds** (3 minutes) - Immediate comfort
2. **Vacuum Cleaner** (7 minutes) - Strong masking noise
3. **Rhythmic Heartbeat** (5 minutes) - Security and comfort
4. **Soft Rain** (5 minutes) - Calming transition

## Advanced Playlist Features

### Dynamic Playlist Elements

**Responsive Volume Control**
- Start louder for attention, gradually decrease
- Increase volume if baby becomes restless
- Maintain consistent volume for deep sleep portions
- Emergency volume boost for sudden wake-ups

**Intelligent Looping**
- Repeat entire playlist for extended sleep
- Loop only certain sections (like middle sleep sounds)
- Gradually reduce volume with each loop iteration
- Stop after predetermined number of loops

**Conditional Branching**
- Different playlist paths based on baby's response
- "If restless" alternatives for each playlist segment
- Quick-switch options for different moods
- Emergency calm-down sound insertions

### Seasonal and Growth Adaptations

**Age-Appropriate Modifications**
**Newborn Versions** (0-3 months):
- Shorter individual sound segments
- More womb-like sounds (heartbeat, white noise)
- Consistent volume throughout
- Focus on comfort over sleep independence

**Infant Adaptations** (3-6 months):
- Longer sound segments
- Introduction of gentle music and nature sounds
- Beginning of volume variations
- More complex sound layering

**Baby and Toddler Versions** (6+ months):
- Story elements or simple melodies
- Environmental sounds for learning
- Interactive elements (when appropriate)
- Preparation for independent sleep

**Seasonal Adjustments**
- **Winter Playlists**: Cozy, warm sounds (fireplace, gentle wind)
- **Spring Playlists**: Fresh nature sounds, birds, gentle rain
- **Summer Playlists**: Ocean sounds, soft breezes, evening crickets
- **Fall Playlists**: Rustling leaves, gentle rain, cozy indoor sounds

## Playlist Management and Organization

### Organizing Your Playlist Library

**Category-Based Organization**
- **Sleep Playlists**: Bedtime, nap, middle-of-night
- **Activity Playlists**: Tummy time, feeding, play, travel
- **Mood Playlists**: Calming, energizing, comforting
- **Special Situation**: Illness, travel, visiting others

**Naming Conventions**
- Use descriptive names: "Bedtime - Winter Version"
- Include duration: "Quick Calm (10 min)"
- Note effectiveness: "Naptime - Works Great"
- Version control: "Sleep Playlist v3 - Improved"

**Playlist Maintenance**
- Regular review of playlist effectiveness
- Update based on baby's changing preferences
- Archive playlists that no longer work
- Create backup copies of successful playlists

### Sharing and Collaboration

**Family Playlist Sharing**
- Share successful playlists with caregivers
- Create collaborative playlists with partner input
- Export playlists for babysitters or family members
- Synchronized playlist updates across devices

**Community Sharing** (Premium Feature)
- Share anonymous playlist templates with other parents
- Download popular playlist structures
- Rate and review community-created playlists
- Contribute to age-specific playlist collections

## Troubleshooting Playlist Issues

### Common Playlist Problems

**Playlist Doesn't Flow Well**
- Review transitions between sounds
- Check individual sound volumes
- Ensure sounds complement rather than conflict
- Test complete playlist several times

**Baby Loses Interest**
- Vary the order of sounds occasionally
- Create multiple versions of successful playlists
- Introduce new sounds gradually
- Monitor for signs of playlist fatigue

**Technical Issues**
- Ensure all sounds download properly
- Check device storage for large playlists
- Verify internet connection for streaming elements
- Update app for latest playlist features

### Optimization Strategies

**Data and Battery Management**
- Download playlist sounds for offline use
- Optimize sound quality for storage vs. battery use
- Create shorter backup versions for low battery situations
- Use device power-saving modes compatible with audio playback

**Performance Improvement**
- Limit playlist length to prevent memory issues
- Use consistent audio formats when possible
- Regular app restarts for long playlist sessions
- Monitor device temperature during extended use

## Creative Playlist Ideas

### Theme-Based Playlists

**Around the World**: Gentle sounds from different cultures and environments
**Seasonal Journey**: Sounds that represent different times of year
**Day to Night**: Natural progression of environmental sounds
**Growth Timeline**: Sounds that evolve with baby's development

### Interactive Elements

**Call and Response**: Alternating familiar and new sounds
**Musical Learning**: Simple melodies with educational elements
**Language Exposure**: Soft sounds from different languages/cultures
**Nature Education**: Realistic animal and environmental sounds

### Special Occasion Playlists

**Travel Playlists**: Familiar sounds for comfort away from home
**Holiday Themes**: Gentle, seasonal celebration sounds
**Recovery Playlists**: Extra-soothing sounds for sick days
**Celebration Playlists**: Happy, gentle sounds for special milestones

Custom playlists transform your baby's audio environment from random sound selection to intentional, progressive experiences that support their development and your parenting goals. Experiment with different combinations, observe your baby's responses, and don't be afraid to create multiple versions until you find what works best for your family.`,
            readTime: '5 min read',
            author: 'SleepyBabyy Team'
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
            content: `Smart notifications in SleepyBabyy help you stay on top of your baby's routine without overwhelming you with constant alerts. Here's how to configure intelligent notification systems that adapt to your family's needs.

## Understanding Smart Notifications

### What Makes Notifications "Smart"
**Context-Aware Alerts**:
- Notifications adjust based on your baby's patterns
- Time-sensitive alerts for feeding, sleep, and diaper changes
- Predictive notifications based on historical data
- Reduced notifications during established routines

**Family-Friendly Features**:
- Coordinate notifications among multiple caregivers
- Quiet hours and sleep mode configurations
- Priority levels for different types of alerts
- Location-based notification adjustments

### Types of Smart Notifications

**Routine Reminders**
- Feeding time approaches based on typical schedule
- Nap time alerts when baby shows sleepy signs
- Diaper change reminders based on usual patterns
- Medicine or vitamin reminders for scheduled doses

**Pattern Recognition Alerts**
- Sleep regression early warning systems
- Growth spurt indicators
- Unusual activity pattern notifications
- Health and wellness trend alerts

**Collaborative Notifications**
- Real-time updates when partner logs activities
- Caregiver handoff information sharing
- Emergency alert systems for family members
- Achievement and milestone celebrations

## Setting Up Basic Smart Notifications

### Initial Configuration

**Step 1: Access Notification Settings**
1. Go to Account Settings in SleepyBabyy
2. Select "Notifications & Alerts"
3. Choose "Smart Notifications Setup"
4. Review current notification permissions

**Step 2: Configure Core Activity Reminders**

**Feeding Notifications**
- Enable feeding time predictions based on patterns
- Set minimum and maximum alert intervals
- Choose notification style (gentle reminder vs. urgent alert)
- Configure different settings for breast vs. bottle feeding

**Sleep Notifications**
- Nap time reminders based on wake windows
- Bedtime preparation alerts
- Overnight wake-up logging reminders
- Sleep schedule deviation warnings

**Diaper Change Alerts**
- Time-based reminders (every 2-3 hours typical)
- Post-feeding diaper change suggestions
- Overnight diaper check reminders
- Pattern-based wetness predictions

**Step 3: Set Notification Priorities**

**High Priority** (Always notify):
- Safety concerns or unusual patterns
- Medical reminders (medicine, appointments)
- Emergency situations requiring immediate attention
- Critical feeding or sleep schedule disruptions

**Medium Priority** (Notify during active hours):
- Routine reminders and upcoming activities
- Pattern changes and trend notifications
- Family member activity updates
- Achievement and milestone alerts

**Low Priority** (Batch notifications):
- Weekly summary reminders
- Analytics and report availability
- Feature updates and tips
- Community updates and social features

### Advanced Smart Features

**Predictive Notifications**
- **Hunger Prediction**: Alerts 15-30 minutes before typical feeding times
- **Sleepiness Detection**: Notifications when wake windows approach optimal lengths
- **Growth Spurt Alerts**: Early indicators of increased feeding or sleep needs
- **Developmental Leap Warnings**: Preparation for fussy periods and regression

**Learning Notifications**
- System learns from your response patterns
- Reduces notifications for activities you consistently handle proactively
- Increases alert frequency during challenging periods
- Adapts to your family's unique rhythm and preferences

## Customizing Notifications for Your Family

### Multi-Caregiver Coordination

**Primary Caregiver Settings**
- Receive all notifications by default
- Override capabilities for all alert types
- Master control over family notification settings
- Emergency contact for all family members

**Secondary Caregiver Settings**
- Filtered notifications based on responsibility areas
- Shift-based notification schedules
- Backup notifications when primary caregiver unavailable
- Specialized alerts for their caregiving focus areas

**Occasional Caregiver Settings** (Babysitters, Grandparents)
- Essential notifications only during care periods
- Emergency contact information prominently featured
- Simplified notification categories
- Temporary notification permissions

### Time-Based Notification Management

**Quiet Hours Configuration**
- **Nighttime Quiet Hours**: Reduce non-essential notifications from 10 PM - 6 AM
- **Nap Time Silence**: Pause notifications during baby's typical nap times
- **Family Dinner Hours**: Minimize interruptions during evening family time
- **Weekend Modifications**: Different notification patterns for non-workdays

**Smart Quiet Hour Features**
- Emergency notifications always allowed through quiet hours
- Gradual notification resumption after quiet periods
- Partner coordination (one parent gets urgent notifications)
- Travel time zone automatic adjustments

### Location-Based Intelligence

**Home vs. Away Settings**
- **At Home**: Full notification suite with routine reminders
- **Away from Home**: Essential notifications only with location context
- **At Work**: Professional-friendly notification timing and style
- **Traveling**: Adjusted notifications for different time zones and schedules

**Geofencing Features** (Premium)
- Automatic notification profile switching based on location
- Daycare pickup/dropoff reminder notifications
- Pediatrician appointment arrival notifications
- Home arrival routine preparation alerts

## Notification Content and Style

### Customizing Notification Messages

**Tone and Style Options**
- **Gentle Reminders**: Soft, suggestion-based language
- **Urgent Alerts**: Clear, action-oriented messages
- **Educational**: Include tips and context with reminders
- **Minimal**: Brief, essential information only

**Personalization Features**
- Use baby's name in notifications
- Include relevant context (last feeding time, sleep duration)
- Customize message templates for different activities
- Add personal notes and reminders to standard notifications

### Visual and Audio Customization

**Visual Notification Settings**
- Choose notification badge styles and colors
- Select icon designs for different alert types
- Configure lock screen notification appearance
- Customize in-app notification banners

**Audio Alert Options**
- Different sounds for different notification types
- Volume control separate from device volume
- Silent notification options with vibration patterns
- Custom ringtones for emergency notifications

## Advanced Notification Analytics

### Understanding Notification Effectiveness

**Response Tracking**
- Monitor which notifications you respond to quickly
- Identify notifications that are consistently ignored
- Track optimal timing for different types of alerts
- Measure notification impact on care routine compliance

**Pattern Recognition**
- System learns your response patterns over time
- Adapts notification frequency based on effectiveness
- Identifies optimal notification timing for your schedule
- Suggests notification improvements based on usage data

### Notification Optimization

**AI-Powered Improvements**
- Automatic reduction of ineffective notifications
- Smart timing adjustments based on your response history
- Predictive notification scheduling around your routine
- Continuous learning from family patterns and preferences

**Manual Optimization Tools**
- Notification effectiveness ratings
- Custom notification scheduling
- A/B testing different notification approaches
- Export notification analytics for review

## Troubleshooting Notification Issues

### Common Problems and Solutions

**Not Receiving Notifications**
- Check device notification permissions for SleepyBabyy
- Verify app notification settings are enabled
- Check Do Not Disturb or Focus mode settings
- Ensure app is updated to latest version

**Too Many Notifications**
- Review and adjust notification priorities
- Enable smart filtering to reduce redundant alerts
- Configure appropriate quiet hours
- Customize notification frequency settings

**Notifications at Wrong Times**
- Verify time zone settings in app and device
- Check quiet hours configuration
- Review family member notification schedules
- Adjust predictive notification timing

### Device-Specific Considerations

**iOS Optimization**
- Configure Focus modes to work with SleepyBabyy
- Set up Screen Time exceptions for baby care apps
- Use Shortcuts app for custom notification responses
- Configure Lock Screen widgets for quick access

**Android Optimization**
- Add SleepyBabyy to battery optimization exceptions
- Configure notification channels and priorities
- Use Do Not Disturb custom rules
- Set up tasker automation for advanced notification control

## Privacy and Security in Notifications

### Data Protection
- All notifications use encrypted data transmission
- Personal information never included in notification previews
- Option to disable notification content on lock screen
- Regular security audits of notification systems

### Family Privacy Controls
- Control what information different family members see in notifications
- Separate notification streams for different babies/profiles
- Option to limit sensitive information in shared notifications
- Individual privacy controls for each family member

Smart notifications should enhance your parenting experience by providing helpful, timely information without creating stress or information overload. Regular review and adjustment of your notification settings ensures they continue to serve your family's evolving needs effectively.`,
            readTime: '5 min read',
            author: 'SleepyBabyy Team'
          },
          '2': {
            title: 'Customizing your dashboard',
            content: `Your SleepyBabyy dashboard is your command center for baby care. Customizing it to match your priorities and workflow makes daily tracking more efficient and intuitive.

## Understanding Dashboard Components

### Core Dashboard Elements

**Quick Stats Bar**
- Current status indicators (last feeding, sleep state, diaper status)
- Time since last major activities
- Today's totals and key metrics
- Alert indicators for overdue activities

**Quick Action Buttons**
- One-tap logging for frequent activities
- Customizable button layout and priorities
- Color-coding for different activity types
- Easy access to emergency functions

**Activity Feed**
- Chronological list of recent activities
- Visual timeline of daily patterns
- Quick edit capabilities for recent entries
- Family member activity attribution

**Summary Cards**
- Weekly and daily pattern overviews
- Growth tracking displays
- Sleep quality indicators
- Feeding trend summaries

### Widget Categories

**Essential Widgets** (Always Visible)
- Baby's current status and needs
- Emergency contact information
- Critical health information
- Last activity timestamps

**Monitoring Widgets**
- Growth charts and measurements
- Sleep pattern visualizations
- Feeding volume and frequency graphs
- Development milestone trackers

**Analytical Widgets**
- Weekly summary cards
- Trend analysis displays
- Comparative analytics
- Prediction and recommendation panels

**Family Widgets**
- Multi-caregiver activity logs
- Family member status updates
- Shared notes and communications
- Collaborative tracking tools

## Customizing Your Dashboard Layout

### Getting Started with Customization

**Step 1: Access Dashboard Settings**
1. Navigate to your main dashboard
2. Tap the "Customize" or gear icon (usually top right)
3. Select "Dashboard Layout" or "Customize Dashboard"
4. Enter editing mode

**Step 2: Identify Your Priorities**
Consider these questions:
- Which activities do you track most frequently?
- What information do you check multiple times per day?
- Which family members need quick access to specific features?
- What are your biggest daily challenges or concerns?

**Step 3: Layout Planning**
- **Top Section**: Most critical, frequently accessed information
- **Middle Section**: Daily tracking tools and quick actions
- **Bottom Section**: Analytics, summaries, and less frequently used features
- **Hidden/Secondary**: Archive rarely used widgets

### Widget Management

**Adding Widgets**
1. In customization mode, tap "Add Widget" or "+"
2. Browse widget categories (Tracking, Analytics, Family, etc.)
3. Preview widget appearance and functionality
4. Drag to desired position on dashboard
5. Configure widget-specific settings

**Removing Widgets**
1. Long-press on widget you want to remove
2. Select "Remove" or drag to trash area
3. Confirm removal (widgets can be re-added later)
4. Reorganize remaining widgets as needed

**Resizing and Positioning**
- **Small Widgets**: Quick stats, single metrics
- **Medium Widgets**: Charts, recent activity lists
- **Large Widgets**: Detailed analytics, comprehensive summaries
- **Full-Width**: Major features, detailed timelines

### Creating Custom Widget Groups

**Activity-Based Groups**
- **Sleep Focus**: Sleep tracking, schedules, analytics
- **Feeding Focus**: Nutrition tracking, volume charts, timing
- **Health Focus**: Growth, symptoms, medication tracking
- **Family Focus**: Multi-caregiver tools, communication, sharing

**Time-Based Layouts**
- **Morning Dashboard**: Overnight summaries, day planning, schedules
- **Daytime Dashboard**: Active tracking, quick logging, real-time stats
- **Evening Dashboard**: Day summaries, bedtime preparation, tomorrow planning

**Role-Based Customization**
- **Primary Caregiver**: Full access to all widgets and analytics
- **Working Parent**: Essential stats, quick logging, summary information
- **Babysitter**: Safety info, basic logging, emergency contacts
- **Grandparent**: Baby's status, photos, milestone tracking

## Advanced Customization Features

### Smart Widget Behaviors

**Context-Sensitive Display**
- Widgets automatically adjust based on time of day
- Priority changes based on baby's current needs
- Seasonal adjustments for different activities
- Growth stage-appropriate widget recommendations

**Predictive Widget Arrangement**
- Frequently used widgets move higher in layout
- Rarely accessed widgets minimize or hide
- Emergency widgets become prominent when needed
- Learning algorithms optimize based on usage patterns

**Conditional Widget Visibility**
- Show feeding widgets only around meal times
- Display sleep widgets during nap and bedtime hours
- Highlight health widgets when symptoms are logged
- Surface family widgets when multiple caregivers are active

### Multi-Profile Dashboard Management

**Single Baby, Multiple Caregivers**
- Each family member can have personalized dashboard layouts
- Shared widgets for coordination
- Individual widgets for specific responsibilities
- Unified data with personalized presentation

**Multiple Baby Profiles**
- Switch between baby dashboards with simple swipe or tap
- Shared widgets that work across all profiles
- Individual customization for each baby's unique needs
- Family overview dashboard showing all babies

**Profile-Specific Optimizations**
- **Newborn Dashboard**: Focus on basic needs, frequent feeding/diaper changes
- **Infant Dashboard**: Sleep schedule emphasis, developmental milestones
- **Toddler Dashboard**: Activity tracking, behavioral patterns, nutrition

### Advanced Widget Configuration

**Widget-Specific Settings**
- **Time Ranges**: Choose data periods for charts and summaries
- **Metric Focus**: Select which measurements to highlight
- **Alert Thresholds**: Customize when widgets show warnings or concerns
- **Visual Themes**: Match widget colors to baby's profile theme

**Data Source Selection**
- Choose which family members' data appears in widgets
- Filter by date ranges or specific activities
- Include or exclude certain types of entries
- Real-time vs. summary data preferences

**Interactive Features**
- Quick-edit capabilities directly from widgets
- Drill-down to detailed views from summary widgets
- One-tap actions from status widgets
- Sharing options for specific widget data

## Dashboard Themes and Visual Customization

### Visual Theme Options

**Color Schemes**
- **Soft Pastels**: Calming, easy on eyes during night feeding
- **High Contrast**: Clear visibility for quick information gathering
- **Seasonal Themes**: Adjust colors based on time of year
- **Personal Photos**: Use baby's photos as background elements

**Layout Styles**
- **Compact**: Maximum information in minimal space
- **Spacious**: Larger widgets with plenty of white space
- **Card-Based**: Individual cards for each widget type
- **Timeline**: Chronological layout emphasizing activity sequence

**Font and Text Options**
- **Font Size**: Adjustable for different vision needs and devices
- **Font Weight**: Bold for quick scanning, regular for detailed reading
- **Text Color**: High contrast options for accessibility
- **Label Customization**: Rename widgets and sections with personal terms

### Accessibility Features

**Visual Accessibility**
- High contrast mode for vision difficulties
- Large text options for easy reading
- Color-blind friendly color schemes
- Reduced motion options for sensitivity

**Motor Accessibility**
- Larger touch targets for easier interaction
- Voice control integration for hands-free operation
- One-handed operation optimizations
- Customizable gesture controls

**Cognitive Accessibility**
- Simplified layouts for reduced cognitive load
- Clear, consistent navigation patterns
- Essential information prioritization
- Reduced visual clutter options

## Dashboard Analytics and Optimization

### Usage Analytics

**Widget Interaction Tracking**
- Most frequently accessed widgets
- Time spent viewing different dashboard sections
- Peak usage hours and patterns
- Feature utilization rates

**Optimization Suggestions**
- Recommendations for widget placement based on usage
- Suggestions for widgets to add or remove
- Layout efficiency improvements
- Time-saving customization tips

**Performance Monitoring**
- Dashboard loading times
- Widget refresh rates and reliability
- Battery impact of different customization choices
- Network usage optimization

### Backup and Sync

**Dashboard Configuration Backup**
- Export dashboard layouts for backup
- Save multiple layout configurations for different situations
- Cloud sync across multiple devices
- Family member layout sharing

**Cross-Platform Consistency**
- Maintain customizations across phone, tablet, web
- Adapt layouts appropriately for different screen sizes
- Sync customization preferences in real-time
- Device-specific optimizations while maintaining core layout

## Troubleshooting Dashboard Issues

### Common Customization Problems

**Widgets Not Loading**
- Check internet connection for data-dependent widgets
- Verify app permissions for accessing required data
- Clear app cache and restart
- Update to latest app version

**Layout Changes Not Saving**
- Ensure you're in edit mode when making changes
- Confirm changes before exiting customization
- Check available storage space on device
- Verify account sync is working properly

**Performance Issues with Heavily Customized Dashboards**
- Reduce number of active widgets
- Choose less data-intensive widget options
- Adjust refresh rates for analytical widgets
- Consider device memory and processing limitations

### Optimization Tips

**Efficiency Improvements**
- Start with essential widgets, add others gradually
- Group related widgets together for workflow efficiency
- Use consistent layouts across different profiles
- Regular review and pruning of unused widgets

**Best Practices**
- Test layouts during typical care routines
- Get input from all family members who use the dashboard
- Adjust layouts based on baby's changing needs
- Maintain backup configurations for different life stages

Your dashboard should evolve with your baby's needs and your family's routine. Regular customization and optimization ensure it remains a valuable tool that saves time and provides the information most important to your family's daily care routine.`,
            readTime: '4 min read',
            author: 'SleepyBabyy Team'
          },
          '3': {
            title: 'Privacy and security settings',
            content: `Protecting your family's privacy and maintaining the security of your baby's data is a top priority in SleepyBabyy. Here's how to configure and understand all privacy and security features.

## Understanding Data Privacy in SleepyBabyy

### What Data We Collect
**Baby Information**:
- Basic profile data (name, birth date, photos)
- Activity logs (feeding, sleep, diaper changes)
- Growth measurements and health tracking
- Photos and videos you choose to upload
- Custom notes and observations

**Family Information**:
- Account holder contact information
- Family member names and email addresses (for sharing features)
- Device information for app optimization
- Usage patterns for feature improvement

**What We Don't Collect**:
- Location data (unless explicitly enabled for specific features)
- Contacts from your phone
- Other app usage or personal files
- Social media account information
- Financial information beyond subscription billing

### Data Storage and Security
**Encryption Standards**:
- All data encrypted in transit using TLS 1.3
- Data at rest encrypted using AES-256 standards
- Database encryption with regular security audits
- End-to-end encryption for sensitive communications

**Server Security**:
- SOC 2 Type II certified infrastructure
- Regular penetration testing and vulnerability assessments
- 24/7 security monitoring and threat detection
- Multi-factor authentication for all administrative access

**Backup and Recovery**:
- Daily encrypted backups with geographic redundancy
- Point-in-time recovery capabilities
- Disaster recovery plans tested quarterly
- Data integrity verification processes

## Configuring Privacy Settings

### Account Privacy Controls

**Step 1: Access Privacy Settings**
1. Navigate to Account Settings
2. Select "Privacy & Security"
3. Review current privacy configuration
4. Choose "Manage Privacy Settings"

**Step 2: Data Sharing Preferences**

**Anonymous Analytics Sharing**
- **Enabled** (Default): Help improve app features through anonymous usage data
- **Disabled**: Opt out of all analytics sharing
- **Custom**: Choose specific data types to share or withhold

**Research Participation**
- **General Research**: Anonymous data for baby care research
- **Product Development**: Feedback for new feature development
- **Medical Research**: Contribution to pediatric health studies (always anonymous)
- **Opt-Out**: Completely exclude data from all research initiatives

**Marketing Communications**
- **Product Updates**: Information about new features and improvements
- **Educational Content**: Baby care tips and expert advice
- **Promotional Offers**: Subscription deals and premium feature announcements
- **Community Updates**: Information about user community and social features

### Family Sharing Privacy

**Controlling Family Member Access**
- **Profile Information**: Choose what family members can see and edit
- **Activity History**: Control access to historical data
- **Photos and Videos**: Manage who can view and download media
- **Health Information**: Separate permissions for medical data

**Privacy Levels for Family Members**
**Full Family Access**:
- View all baby information and activities
- Access to photos, videos, and growth data
- Permission to invite additional family members
- Access to medical information and notes

**Limited Family Access**:
- View daily activities and current status
- Access to recent photos and basic information
- Cannot invite others or access medical data
- Time-limited access options available

**Caregiver Access**:
- View information relevant to care responsibilities
- Log activities during their care periods
- Access emergency contact and medical information
- Cannot modify baby profile or invite others

**Viewer Access**:
- See baby's progress and milestones
- Access to selected photos and growth updates
- Receive milestone notifications
- Cannot log activities or see detailed data

### Data Retention and Deletion

**Retention Policies**
- **Active Account Data**: Retained indefinitely while account is active
- **Deleted Content**: Removed from active systems within 30 days
- **Backup Data**: Deleted content purged from backups within 90 days
- **Analytics Data**: Anonymous usage data retained for 2 years maximum

**Account Deletion Process**
1. **Initiate Deletion**: Request account deletion in privacy settings
2. **Grace Period**: 30-day grace period to reactivate before permanent deletion
3. **Data Export**: Option to download all data before deletion
4. **Confirmation**: Final confirmation required after grace period
5. **Permanent Deletion**: All data permanently removed within 48 hours

**Partial Data Deletion**
- Delete specific photos or videos
- Remove particular activity entries
- Clear data from specific date ranges
- Delete family member access without removing their data contributions

## Security Settings and Features

### Account Security

**Password Security**
- **Strong Password Requirements**: Minimum 12 characters with mixed case, numbers, symbols
- **Password Strength Indicator**: Real-time feedback on password quality
- **Regular Password Updates**: Recommended every 90 days
- **Breach Monitoring**: Automatic notification if password appears in data breaches

**Two-Factor Authentication (2FA)**
- **SMS Verification**: Text message codes for login
- **Authenticator Apps**: Support for Google Authenticator, Authy, etc.
- **Backup Codes**: Emergency access codes for device loss
- **Biometric Options**: Fingerprint and face recognition where supported

**Login Security**
- **Session Management**: Control active login sessions across devices
- **Login Notifications**: Email alerts for new device logins
- **Suspicious Activity Monitoring**: Automatic detection of unusual login patterns
- **Device Authorization**: Approve new devices before access is granted

### Advanced Security Features

**Family Member Security**
- **Individual 2FA Requirements**: Require two-factor authentication for all family members
- **Permission Auditing**: Regular review of family member access levels
- **Access Logging**: Track when and how family members access data
- **Suspicious Activity Alerts**: Notifications for unusual family member activity

**Data Export Security**
- **Encrypted Exports**: All data downloads encrypted with user-provided password
- **Limited Download Windows**: Export links expire after 48 hours
- **Download Logging**: Track all data export activities
- **Watermarked Content**: Photos and documents include invisible security watermarks

### Privacy During Family Changes

**Divorce or Separation Considerations**
- **Emergency Access Removal**: Immediately revoke partner access
- **Data Ownership Clarification**: Understand who owns what data
- **Child Custody Integration**: Support for court-ordered access arrangements
- **Secure Communication**: Protected communication channels during transitions

**Family Member Departure**
- **Graceful Access Removal**: Remove access while preserving their data contributions
- **Data Attribution**: Maintain record of who contributed what information
- **Transition Planning**: Transfer responsibilities to remaining family members
- **Final Data Export**: Option for departing member to export their contributed data

## Monitoring and Auditing

### Security Monitoring Tools

**Account Activity Dashboard**
- **Login History**: Recent login attempts and locations
- **Data Access Logs**: Track when sensitive information is accessed
- **Permission Changes**: Log of family member permission modifications
- **Export Activities**: Record of all data downloads and sharing

**Suspicious Activity Detection**
- **Unusual Login Patterns**: Detection of logins from new locations or devices
- **Bulk Data Access**: Alerts for unusually large data downloads
- **Permission Escalation**: Notifications when family members request additional access
- **Account Sharing Detection**: Identification of potential account sharing

### Regular Security Reviews

**Monthly Security Checkups**
- Review active family member access
- Update passwords and security settings
- Check for new device authorizations
- Review privacy setting changes

**Annual Security Audits**
- Comprehensive review of all privacy settings
- Update emergency contacts and security questions
- Review data retention preferences
- Assess family sharing arrangements

**Breach Response Procedures**
- **Immediate Notification**: Real-time alerts for any security incidents
- **Response Guidance**: Step-by-step instructions for securing account
- **Impact Assessment**: Clear explanation of what data, if any, was affected
- **Follow-up Support**: Ongoing assistance with security improvements

## International Privacy Compliance

### GDPR Compliance (European Users)
- **Right to Access**: Full transparency about data collection and use
- **Right to Rectification**: Easy correction of incorrect data
- **Right to Erasure**: Complete data deletion upon request
- **Right to Portability**: Export data in standard, readable formats
- **Right to Object**: Opt-out of specific data processing activities

### CCPA Compliance (California Users)
- **Data Disclosure**: Clear information about data collection practices
- **Opt-Out Rights**: Easy opt-out from data sales (we don't sell data)
- **Non-Discrimination**: No penalties for exercising privacy rights
- **Authorized Agent**: Support for parents acting on behalf of minors

### Additional Protections
- **COPPA Compliance**: Special protections for children's data
- **PIPEDA Compliance**: Canadian privacy law adherence
- **Local Law Integration**: Automatic compliance with applicable local privacy laws

## Emergency Privacy Situations

### Immediate Account Security
**Compromised Account Steps**:
1. **Change Password Immediately**: Use account recovery if locked out
2. **Enable 2FA**: Add additional security layer
3. **Review Family Access**: Remove any unauthorized family members
4. **Check Recent Activity**: Look for suspicious data access or changes
5. **Contact Support**: Report security incident for additional assistance

**Lost or Stolen Device**:
1. **Remote Logout**: Sign out all devices from web account
2. **Change Passwords**: Update account credentials immediately
3. **Review Access Logs**: Check for unauthorized activity
4. **Notify Family**: Inform other caregivers of potential security issue

### Legal and Emergency Situations
- **Court Orders**: Compliance process for legal data requests
- **Emergency Access**: Procedures for family emergencies
- **Medical Access**: Healthcare provider data sharing with proper authorization
- **Law Enforcement**: Transparent process for legitimate legal requests

Your privacy and security are fundamental to SleepyBabyy's mission. These settings give you complete control over your family's data while ensuring it remains protected with industry-leading security measures. Regular review and updates of these settings help maintain optimal protection as your family's needs evolve.`,
            readTime: '6 min read',
            author: 'SleepyBabyy Team'
          }
        }
      }
    };

    return articlesData[categoryKey] || null;
  };

  const categoryData = getArticleData(categoryName || '', articleId || '');
  const articleData = categoryData?.articles?.[articleId || ''];

  if (!categoryData || !articleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/help')}>Return to Help Center</Button>
        </div>
      </div>
    );
  }

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/help/category/${categoryName}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {categoryData.title}</span>
          </Button>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className={`inline-flex p-3 rounded-xl ${categoryData.bgColor} mb-4`}>
            <Book className={`h-8 w-8 ${categoryData.color}`} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {articleData.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{articleData.readTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{articleData.author}</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              {articleData.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <p key={index} className="font-semibold text-gray-900 mb-3">
                      {paragraph.replace(/\*\*/g, '')}
                    </p>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  const listItems = paragraph.split('\n').filter(item => item.startsWith('- '));
                  return (
                    <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4">
                      {listItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-700">
                          {item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4" 
                     dangerouslySetInnerHTML={{
                       __html: paragraph
                         .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                         .replace(/\*(.*?)\*/g, '<em>$1</em>')
                     }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Was this article helpful?
              </h2>
              <p className="text-gray-600 mb-6">
                Need more help? Contact our support team or browse more articles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/contact')}>
                  Contact Support
                </Button>
                <Button variant="outline" onClick={() => navigate('/help')}>
                  Browse All Articles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpArticle;
