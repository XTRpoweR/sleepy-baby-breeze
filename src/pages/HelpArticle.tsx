
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const HelpArticle = () => {
  const { category, id } = useParams();
  const { t } = useTranslation();

  // Sample article data - in a real app, this would come from an API or database
  const getArticleContent = () => {
    // Fix the URL parameter matching
    if (category === "getting-started" && id === "1") {
      return {
        title: "Getting Started with SleepyBaby",
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

**Getting started with sleep tracking:**

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
    
    // Add more articles as needed
    if (category === "sleep-tips" && id === "1") {
      return {
        title: "Sleep Tips for Better Rest",
        content: `
## Creating the Perfect Sleep Environment

A comfortable sleep environment is crucial for your baby's rest and development.

### Room Setup

**Essential elements for good sleep:**

- **Temperature control**: Keep the room between 68-70°F (20-21°C)
- **Darkness**: Use blackout curtains or shades to minimize light
- **Sound management**: Consider white noise to mask household sounds
- **Safety first**: Ensure the crib meets current safety standards

## Age-Appropriate Sleep Schedules

Different ages require different approaches to sleep timing and duration.

### Newborn to 3 Months

**Sleep patterns at this stage:**

- **Total sleep needed**: 14-17 hours per day
- **Night sleep**: 8-9 hours (with frequent wakings)
- **Daytime naps**: 4-5 short naps throughout the day
- **Feeding schedule**: Every 2-3 hours around the clock

### 3 to 6 Months

**Developing more regular patterns:**

- **Total sleep needed**: 12-15 hours per day
- **Night sleep**: 10-11 hours (longer stretches developing)
- **Daytime naps**: 3-4 naps, becoming more predictable
- **Sleep training**: Can begin gentle methods if desired
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
