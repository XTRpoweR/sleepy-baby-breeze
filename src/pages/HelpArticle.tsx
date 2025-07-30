
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const HelpArticle = () => {
  const { category, id } = useParams();
  const { t } = useTranslation();

  // Sample article data - in a real app, this would come from an API or database
  const getArticleContent = () => {
    if (category === "getting-started" && id === "1") {
      return {
        title: t("help.articles.gettingStarted.title"),
        content: `
## ${t("help.articles.gettingStarted.setupTitle")}

${t("help.articles.gettingStarted.setupContent")}

### ${t("help.articles.gettingStarted.profileTitle")}

${t("help.articles.gettingStarted.profileContent")}

### ${t("help.articles.gettingStarted.trackingTitle")}

${t("help.articles.gettingStarted.trackingContent")}

**${t("help.articles.gettingStarted.trackingSteps")}:**

1. ${t("help.articles.gettingStarted.step1")}
2. ${t("help.articles.gettingStarted.step2")}
3. ${t("help.articles.gettingStarted.step3")}

## ${t("help.articles.gettingStarted.tipsTitle")}

${t("help.articles.gettingStarted.tipsContent")}

**${t("help.articles.gettingStarted.keyTips")}:**

- **${t("help.articles.gettingStarted.tip1Title")}**: ${t("help.articles.gettingStarted.tip1Content")}
- **${t("help.articles.gettingStarted.tip2Title")}**: ${t("help.articles.gettingStarted.tip2Content")}
- **${t("help.articles.gettingStarted.tip3Title")}**: ${t("help.articles.gettingStarted.tip3Content")}

## ${t("help.articles.gettingStarted.troubleshootTitle")}

${t("help.articles.gettingStarted.troubleshootContent")}

### ${t("help.articles.gettingStarted.commonIssues")}

**${t("help.articles.gettingStarted.issue1Title")}**
${t("help.articles.gettingStarted.issue1Content")}

**${t("help.articles.gettingStarted.issue2Title")}**
${t("help.articles.gettingStarted.issue2Content")}

**${t("help.articles.gettingStarted.issue3Title")}**
${t("help.articles.gettingStarted.issue3Content")}
        `
      };
    }
    return {
      title: t("help.articles.notFound.title"),
      content: t("help.articles.notFound.content")
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
          <h2 key={index} className="text-xl font-semibold text-foreground mt-8 mb-4 first:mt-0">
            {trimmedLine.substring(3)}
          </h2>
        );
      }
      
      // Sub headings (###)
      if (trimmedLine.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-medium text-foreground mt-6 mb-3">
            {trimmedLine.substring(4)}
          </h3>
        );
      }
      
      // Bold standalone lines
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !trimmedLine.includes(':')) {
        return (
          <p key={index} className="font-semibold text-foreground mt-4 mb-2">
            {trimmedLine.substring(2, trimmedLine.length - 2)}
          </p>
        );
      }
      
      // Numbered list items
      if (/^\d+\.\s/.test(trimmedLine)) {
        return (
          <div key={index} className="ml-4 mb-2">
            <p className="text-muted-foreground leading-relaxed">
              {renderInlineFormatting(trimmedLine)}
            </p>
          </div>
        );
      }
      
      // Bullet list items
      if (trimmedLine.startsWith('- ')) {
        return (
          <div key={index} className="ml-4 mb-2">
            <p className="text-muted-foreground leading-relaxed">
              {renderInlineFormatting(trimmedLine.substring(2))}
            </p>
          </div>
        );
      }
      
      // Regular paragraphs
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4">
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
          <span key={index} className="font-semibold text-foreground">
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
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
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
              <h3 className="text-lg font-medium text-foreground mb-2">
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
