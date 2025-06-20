
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { 
  Moon, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Baby, 
  Heart, 
  Lightbulb,
  Stethoscope,
  Users,
  BookOpen
} from "lucide-react";

const BlogArticle = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { t } = useTranslation();

  // Article data - in a real app, this would come from an API or database
  const articlesData = {
    "science-behind-baby-sleep-cycles": {
      title: "The Science Behind Baby Sleep Cycles: What Every Parent Should Know",
      excerpt: "Understanding your baby's sleep patterns can transform your approach to bedtime routines. Learn about the latest research in pediatric sleep science and how to apply it to your daily routine.",
      author: "Dr. Sarah Johnson",
      date: "December 10, 2024",
      readTime: "8 min read",
      category: "Sleep Science",
      content: `
        <h2>Understanding Baby Sleep Architecture</h2>
        <p>Baby sleep is fundamentally different from adult sleep, and understanding these differences is crucial for establishing healthy sleep patterns. Newborns spend approximately 16-17 hours sleeping per day, but this sleep is distributed across multiple short periods rather than consolidated into long stretches.</p>

        <h3>The Two Types of Baby Sleep</h3>
        <p>Babies experience two main types of sleep:</p>
        <ul>
          <li><strong>Active Sleep (REM):</strong> This is when babies move, make sounds, and their eyes move rapidly under closed lids. This phase is crucial for brain development.</li>
          <li><strong>Quiet Sleep (Non-REM):</strong> During this phase, babies are still and breathe regularly. This is when physical growth and tissue repair occur.</li>
        </ul>

        <h3>Sleep Cycle Development</h3>
        <p>Unlike adults who have 90-minute sleep cycles, newborns have much shorter cycles of about 50-60 minutes. As babies grow, their sleep cycles gradually lengthen and mature:</p>
        <ul>
          <li><strong>0-3 months:</strong> 50-60 minute cycles</li>
          <li><strong>3-6 months:</strong> Cycles begin to lengthen</li>
          <li><strong>6-12 months:</strong> Cycles approach adult-like patterns</li>
        </ul>

        <h2>Practical Applications for Parents</h2>
        <p>Understanding these sleep patterns can help you:</p>
        <ul>
          <li>Time feedings and diaper changes appropriately</li>
          <li>Recognize when your baby is entering different sleep phases</li>
          <li>Avoid unnecessary wake-ups during deep sleep phases</li>
          <li>Plan your own rest periods more effectively</li>
        </ul>

        <h3>Creating Sleep-Conducive Environments</h3>
        <p>Research shows that consistent environmental cues help regulate baby sleep patterns. Consider these evidence-based strategies:</p>
        <ul>
          <li>Maintain consistent room temperature (68-70°F)</li>
          <li>Use blackout curtains for daytime naps</li>
          <li>Implement consistent bedtime routines</li>
          <li>Consider white noise to mask household sounds</li>
        </ul>

        <h2>When to Seek Professional Help</h2>
        <p>While every baby is different, consult your pediatrician if you notice:</p>
        <ul>
          <li>Persistent difficulty falling asleep after 6 months</li>
          <li>Frequent night wakings beyond expected developmental patterns</li>
          <li>Signs of sleep disorders such as sleep apnea</li>
          <li>Extreme fussiness during expected sleep times</li>
        </ul>

        <p>Remember, understanding your baby's sleep science is just the beginning. Every child is unique, and what works for one family may need adjustment for another. Be patient with yourself and your baby as you navigate this important aspect of early development.</p>
      `
    },
    "perfect-bedtime-routine-6-month-old": {
      title: "Creating the Perfect Bedtime Routine for Your 6-Month-Old",
      excerpt: "A step-by-step guide to establishing healthy sleep habits that will benefit your baby for years to come.",
      author: "Emily Chen",
      date: "December 8, 2024",
      readTime: "5 min read",
      category: "Sleep Training",
      content: `
        <h2>Why 6 Months is the Perfect Time</h2>
        <p>At 6 months, your baby's circadian rhythm is developing, making this an ideal time to establish consistent bedtime routines. Most babies at this age can sleep for longer stretches and are developmentally ready for more structured sleep patterns.</p>

        <h3>The Ideal Timeline</h3>
        <p>A successful bedtime routine should take 30-45 minutes and follow a consistent sequence:</p>

        <h4>6:30 PM - Bath Time</h4>
        <p>A warm bath signals the transition from day to night. Keep it short (5-10 minutes) and use gentle, calming products. The drop in body temperature after the bath naturally promotes sleepiness.</p>

        <h4>6:45 PM - Quiet Activities</h4>
        <p>Engage in calm activities like:</p>
        <ul>
          <li>Gentle massage with baby-safe lotion</li>
          <li>Quiet songs or lullabies</li>
          <li>Reading a short bedtime story</li>
        </ul>

        <h4>7:00 PM - Final Feed</h4>
        <p>Whether breastfeeding or bottle-feeding, this should be calm and quiet. Dim the lights and avoid stimulating activities.</p>

        <h4>7:15 PM - Bedtime</h4>
        <p>Place your baby in their crib awake but drowsy. This helps them learn to self-soothe and fall asleep independently.</p>

        <h2>Common Challenges and Solutions</h2>
        
        <h3>Baby Won't Settle</h3>
        <p>If your baby resists the routine:</p>
        <ul>
          <li>Stay consistent for at least 2 weeks</li>
          <li>Adjust timing by 15-minute increments if needed</li>
          <li>Ensure the room environment is optimal</li>
        </ul>

        <h3>Multiple Wake-ups</h3>
        <p>Night wakings are normal, but you can minimize them by:</p>
        <ul>
          <li>Ensuring adequate daytime feedings</li>
          <li>Keeping night interactions brief and boring</li>
          <li>Maintaining consistent response patterns</li>
        </ul>

        <h2>Customizing for Your Family</h2>
        <p>Remember, every family is different. Adjust the routine based on:</p>
        <ul>
          <li>Your baby's natural sleep cues</li>
          <li>Family schedule and lifestyle</li>
          <li>Seasonal changes in daylight</li>
          <li>Your baby's temperament and preferences</li>
        </ul>

        <p>Consistency is key, but flexibility within that structure will help you create a routine that works for your unique situation.</p>
      `
    },
    "managing-sleep-regressions": {
      title: "Managing Sleep Regressions: A Parent's Survival Guide",
      excerpt: "Sleep regressions are normal but challenging. Here's how to navigate them with confidence and patience.",
      author: "Dr. Michael Torres",
      date: "December 5, 2024",
      readTime: "7 min read",
      category: "Development",
      content: `
        <h2>What Are Sleep Regressions?</h2>
        <p>Sleep regressions are temporary periods when a baby who has been sleeping well suddenly begins waking frequently, fighting naps, or having difficulty falling asleep. These periods are actually signs of healthy brain development and growth.</p>

        <h3>Common Sleep Regression Ages</h3>
        <ul>
          <li><strong>4 months:</strong> The most significant regression due to major brain development</li>
          <li><strong>8-10 months:</strong> Linked to increased mobility and separation anxiety</li>
          <li><strong>12 months:</strong> Often coincides with walking milestones</li>
          <li><strong>18 months:</strong> Associated with language development and independence</li>
          <li><strong>2 years:</strong> Related to cognitive leaps and potential schedule changes</li>
        </ul>

        <h2>The 4-Month Regression: The Big One</h2>
        <p>The 4-month regression is often the most challenging because it represents a permanent change in how your baby sleeps. During this time:</p>
        <ul>
          <li>Sleep cycles mature and become more adult-like</li>
          <li>Babies spend less time in deep sleep</li>
          <li>They become more aware of their surroundings</li>
          <li>Self-soothing skills become crucial</li>
        </ul>

        <h3>Survival Strategies</h3>
        <p>During any sleep regression:</p>

        <h4>Maintain Consistency</h4>
        <p>Stick to your established routines as much as possible. This provides security and predictability during a confusing time for your baby.</p>

        <h4>Offer Extra Comfort (Temporarily)</h4>
        <p>It's okay to provide additional comfort during regressions, but be mindful not to create new sleep associations that will be hard to break later.</p>

        <h4>Focus on Nutrition</h4>
        <p>Growth spurts often accompany sleep regressions. Ensure your baby is getting adequate nutrition during the day.</p>

        <h4>Prioritize Daytime Sleep</h4>
        <p>Don't abandon naps even if nights are difficult. Overtired babies have even more trouble sleeping.</p>

        <h2>When to Ride It Out vs. Take Action</h2>
        
        <h3>Ride It Out If:</h3>
        <ul>
          <li>The regression has lasted less than 2 weeks</li>
          <li>Your baby was sleeping well before</li>
          <li>You can identify a clear developmental milestone</li>
        </ul>

        <h3>Take Action If:</h3>
        <ul>
          <li>The regression lasts more than 3-4 weeks</li>
          <li>Sleep was already problematic before</li>
          <li>The whole family is severely sleep-deprived</li>
        </ul>

        <h2>Preventing Future Regressions</h2>
        <p>While you can't prevent all regressions, you can minimize their impact:</p>
        <ul>
          <li>Teach independent sleep skills early</li>
          <li>Maintain consistent routines</li>
          <li>Create optimal sleep environments</li>
          <li>Stay flexible but structured</li>
        </ul>

        <h2>Taking Care of Yourself</h2>
        <p>Remember that sleep regressions are temporary. Take care of your own needs by:</p>
        <ul>
          <li>Accepting help from family and friends</li>
          <li>Napping when possible</li>
          <li>Maintaining perspective that this too shall pass</li>
          <li>Connecting with other parents for support</li>
        </ul>

        <p>Sleep regressions are a normal part of development. With patience, consistency, and the right strategies, you and your baby will get through this challenging but temporary phase.</p>
      `
    }
  };

  const relatedArticles = [
    {
      title: "White Noise Benefits for Baby Sleep",
      slug: "white-noise-benefits",
      category: "Sleep Tips"
    },
    {
      title: "When to Consult a Sleep Specialist",
      slug: "consult-sleep-specialist", 
      category: "Medical"
    },
    {
      title: "Co-Parenting Night Duties",
      slug: "co-parenting-night-duties",
      category: "Parenting"
    }
  ];

  const article = slug ? articlesData[slug as keyof typeof articlesData] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/blog')}
                className="flex items-center space-x-1 sm:space-x-2 p-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Blog</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Moon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <span className="text-lg sm:text-xl font-semibold text-gray-900">{t('app.name')}</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Article Header */}
        <header className="mb-8 sm:mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">{article.category}</Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
            {article.excerpt}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div 
          className="prose prose-lg max-w-none mb-12 sm:mb-16"
          dangerouslySetInnerHTML={{ __html: article.content }}
          style={{
            lineHeight: '1.7',
            fontSize: '1.1rem'
          }}
        />

        {/* Related Articles */}
        <section className="border-t border-gray-200 pt-8 sm:pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {relatedArticles.map((relatedArticle, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => navigate(`/blog/${relatedArticle.slug}`)}
              >
                <CardHeader className="p-4">
                  <Badge variant="secondary" className="text-xs w-fit mb-2">
                    {relatedArticle.category}
                  </Badge>
                  <CardTitle className="text-base leading-tight">
                    {relatedArticle.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};

export default BlogArticle;
