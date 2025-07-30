
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const HelpArticle = () => {
  const { category, id } = useParams();
  const { t } = useTranslation();

  // Sample article data - in a real app, this would come from an API or database
  const getArticleContent = () => {
    // Getting Started Articles
    if (category === "getting-started" && id === "1") {
      return {
        title: "How to create your first baby profile",
        content: `
## Account Setup and Baby Profile Creation

Welcome to SleepyBaby! This comprehensive guide will help you get started with tracking your baby's sleep patterns and activities.

### Creating Your Baby Profile

Start by creating a detailed profile for your baby:

1. **Sign up** for your free SleepyBaby account using your email address
2. **Verify your email** and complete your profile information
3. **Create your baby's profile** with their name and birth date
4. **Explore the dashboard** to familiarize yourself with the main features

### Setting Up Sleep Tracking

Learn how to effectively track your baby's sleep:

- **Start a live sleep session** or log sleep manually with precise start and end times
- **Choose the sleep type** - distinguish between naps and night sleep for better insights
- **Add helpful notes** about sleep quality, environment, or any observations
- **Review patterns** in your daily and weekly sleep reports

## Essential Tracking Features

Understanding how to use SleepyBaby's core tracking capabilities will help you get the most out of the app.

### Activity Tracking Made Simple

**Track all important activities:**

- **Sleep Sessions**: Monitor naps and nighttime sleep with detailed timing
- **Feeding Times**: Record breastfeeding, formula, or combination feeding sessions
- **Diaper Changes**: Keep track of wet and soiled diapers throughout the day
- **Custom Activities**: Log tummy time, baths, play sessions, and walks

## Tips for Success

Following these best practices will help you establish effective tracking routines.

### Key Tips for Effective Tracking

**Essential habits for success:**

- **Consistency is key**: Try to log activities as they happen for the most accurate data
- **Use the quick log features**: Take advantage of one-tap logging for faster entry
- **Review patterns regularly**: Check your reports weekly to identify trends and improvements

## Troubleshooting Common Issues

If you encounter any problems, here are solutions to the most common issues.

### Common Issues and Solutions

**Having trouble with tracking?**
Make sure you have created a baby profile first. All tracking features require an active profile to function properly.

**Not seeing your data?**
Check that you have selected the correct baby profile if you have multiple children. Your data is organized by individual profiles.

**App running slowly?**
Try refreshing the page or clearing your browser cache. Make sure you have a stable internet connection for the best experience.
        `
      };
    }

    // Family Sharing Articles
    if (category === "family-sharing" && id === "1") {
      return {
        title: "Inviting family members to collaborate",
        content: `
## Getting Started with Family Sharing

Family sharing allows multiple caregivers to track and monitor your baby's activities together.

### How to Invite Family Members

**Step-by-step invitation process:**

1. **Navigate to Family Sharing** - Go to your account settings and select "Family Sharing"
2. **Enter email addresses** - Add the email addresses of family members you want to invite
3. **Set permissions** - Choose what each family member can view and edit
4. **Send invitations** - Family members will receive an email invitation to join

### Managing Family Access

**Control what family members can do:**

- **View Only**: Can see baby's data but cannot make changes
- **Editor**: Can add new activities and edit existing ones
- **Admin**: Full access including inviting other family members

### Best Practices for Family Collaboration

**Tips for successful family sharing:**

- **Communicate regularly** about who is logging what activities
- **Use consistent naming** for activities and notes
- **Review permissions** periodically to ensure appropriate access levels
- **Train all users** on how to use the app effectively

## Troubleshooting Family Sharing

**Common issues and solutions:**

**Invitation not received?**
Check spam folders and ensure the email address is correct. Resend the invitation if needed.

**Cannot see family member's entries?**
Verify that permissions are set correctly and that both users are logged into the correct account.

**Conflicts in data entry?**
Use the activity notes to communicate who logged what and when to avoid duplicate entries.
        `
      };
    }

    if (category === "family-sharing" && id === "2") {
      return {
        title: "Managing family member permissions",
        content: `
## Understanding Permission Levels

Control exactly what each family member can access and modify in your baby's profile.

### Permission Types

**Available permission levels:**

- **Owner**: Full control over all aspects of the baby profile
- **Admin**: Can invite others, manage permissions, and edit all data
- **Editor**: Can add and edit activities but cannot manage family members
- **Viewer**: Can only view data, cannot make any changes

### Setting Up Permissions

**How to assign permissions:**

1. **Access family settings** from your dashboard
2. **Select the family member** whose permissions you want to change
3. **Choose permission level** from the dropdown menu
4. **Save changes** to apply the new permissions

### Permission Best Practices

**Recommended permission assignments:**

- **Co-parents**: Admin level for full collaboration
- **Grandparents**: Editor level for when they babysit
- **Babysitters**: Viewer or limited Editor access
- **Daycare providers**: Editor access during care hours

## Managing Changes Over Time

**Adjusting permissions as needs change:**

- **Regular reviews** of who has access and at what level
- **Temporary permissions** for short-term caregivers
- **Removing access** when no longer needed
- **Emergency contacts** with appropriate access levels
        `
      };
    }

    if (category === "family-sharing" && id === "3") {
      return {
        title: "Setting up caregiver access",
        content: `
## Caregiver Access Setup

Give babysitters, daycare providers, and other caregivers the right level of access to help care for your baby.

### Types of Caregivers

**Different caregivers need different access:**

- **Regular babysitters**: Editor access for activity logging
- **Daycare providers**: Editor access with schedule visibility
- **Emergency contacts**: Viewer access for essential information
- **Temporary caregivers**: Limited time access

### Setting Up Temporary Access

**For short-term caregivers:**

1. **Create temporary invitations** with expiration dates
2. **Set limited permissions** for only necessary features
3. **Provide clear instructions** on what to log and how
4. **Review and revoke access** after the caregiving period

### Communication Guidelines

**Best practices for caregiver communication:**

- **Clear expectations** about what information to record
- **Contact information** for parents in case of questions
- **Emergency procedures** and important medical information
- **Regular check-ins** to ensure proper app usage

## Monitoring Caregiver Activity

**Keep track of caregiver entries:**

- **Review activity logs** regularly to see what was recorded
- **Check for completeness** of information entered
- **Provide feedback** to improve data quality
- **Adjust permissions** based on caregiver reliability and needs
        `
      };
    }

    // Reports & Analytics Articles
    if (category === "reports-analytics" && id === "1") {
      return {
        title: "Understanding sleep pattern charts",
        content: `
## Reading Your Baby's Sleep Analytics

Learn how to interpret the visual data and charts that show your baby's sleep patterns over time.

### Chart Types and What They Show

**Different chart formats available:**

- **Timeline charts**: Show sleep and wake periods throughout the day
- **Duration charts**: Display how long each sleep session lasted
- **Pattern charts**: Reveal trends over weeks and months
- **Comparison charts**: Compare different time periods

### Key Metrics to Monitor

**Important sleep indicators:**

- **Total sleep time**: How many hours your baby sleeps per day
- **Sleep efficiency**: Percentage of time spent actually sleeping vs. in bed
- **Night wakings**: Frequency and duration of nighttime awakenings
- **Nap patterns**: Number, timing, and length of daytime naps

### Identifying Healthy Patterns

**What to look for in the charts:**

- **Consistent bedtimes** and wake times
- **Age-appropriate total sleep duration**
- **Gradual consolidation** of nighttime sleep
- **Regular nap schedules** that support nighttime rest

## Using Data to Improve Sleep

**How to act on what you learn:**

- **Adjust bedtime** based on natural sleep onset patterns
- **Optimize nap timing** to support nighttime sleep
- **Identify sleep disruptors** like growth spurts or schedule changes
- **Track improvements** after making changes to routine
        `
      };
    }

    // Add more articles for other categories...
    if (category === "sounds-sleep" && id === "1") {
      return {
        title: "Choosing the right sounds for sleep",
        content: `
## Understanding Sleep Sounds

Different types of sounds can help your baby fall asleep and stay asleep longer.

### Types of Sleep Sounds

**Available sound categories:**

- **White noise**: Consistent, steady sound that masks other noises
- **Nature sounds**: Rain, ocean waves, forest sounds for a calming environment
- **Lullabies**: Gentle melodies designed specifically for babies
- **Instrumental music**: Soft classical or ambient music

### Choosing the Right Sound

**Factors to consider:**

- **Baby's age**: Newborns often prefer white noise, older babies may enjoy nature sounds
- **Time of day**: Different sounds for naps vs. nighttime sleep
- **Environment**: Louder sounds for noisy environments, softer for quiet rooms
- **Personal preference**: Every baby is different - experiment to find favorites

### Volume and Safety Guidelines

**Safe sound practices:**

- **Keep volume moderate**: Not too loud to damage hearing
- **Place speakers away** from baby's crib or bassinet
- **Use timers**: Sounds don't need to play all night
- **Monitor baby's response**: Stop if sounds seem to disturb rather than soothe

## Creating Effective Sound Routines

**Building sound into sleep routine:**

- **Start sounds before** putting baby down for sleep
- **Use consistently** for all sleep periods
- **Gradually reduce volume** as baby falls asleep
- **Create associations** between specific sounds and sleep time
        `
      };
    }

    // Default fallback for unknown articles
    return {
      title: "Article Not Found",
      content: "Sorry, we couldn't find the article you're looking for. Please check the URL or return to the help center to browse available articles."
    };
  };

  const article = getArticleContent();

  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Main headings (##)
      if (trimmedLine.startsWith('## ')) {
        return (
          <h2 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">
            {trimmedLine.substring(3)}
          </h2>
        );
      }
      
      // Sub headings (###)
      if (trimmedLine.startsWith('### ')) {
        return (
          <h3 key={index} className="text-base font-medium text-foreground mt-4 mb-2">
            {trimmedLine.substring(4)}
          </h3>
        );
      }
      
      // Bold standalone lines
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !trimmedLine.includes(':')) {
        return (
          <p key={index} className="font-medium text-foreground mt-3 mb-2 text-sm">
            {trimmedLine.substring(2, trimmedLine.length - 2)}
          </p>
        );
      }
      
      // Numbered list items
      if (/^\d+\.\s/.test(trimmedLine)) {
        return (
          <div key={index} className="ml-4 mb-1.5">
            <p className="text-muted-foreground leading-relaxed text-sm">
              {renderInlineFormatting(trimmedLine)}
            </p>
          </div>
        );
      }
      
      // Bullet list items
      if (trimmedLine.startsWith('- ')) {
        return (
          <div key={index} className="ml-4 mb-1.5">
            <p className="text-muted-foreground leading-relaxed text-sm">
              {renderInlineFormatting(trimmedLine.substring(2))}
            </p>
          </div>
        );
      }
      
      // Regular paragraphs
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-3 text-sm">
            {renderInlineFormatting(trimmedLine)}
          </p>
        );
      }
      
      return null;
    });
  };

  const renderInlineFormatting = (text: string) => {
    // Handle bold text with proper spacing
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={index} className="font-medium text-foreground">
            {part.substring(2, part.length - 2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 hover:bg-muted"
          >
            <Link to="/help" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("help.backToHelp")}
            </Link>
          </Button>
          
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {article.title}
          </h1>
          
          <div className="w-12 h-1 bg-primary rounded-full"></div>
        </div>

        <div className="prose prose-slate max-w-none">
          <div className="space-y-1">
            {renderContent(article.content)}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h3 className="text-base font-medium text-foreground mb-2">
                {t("help.wasHelpful")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("help.helpfulDescription")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                {t("help.yes")}
              </Button>
              <Button variant="outline" size="sm">
                {t("help.no")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpArticle;
