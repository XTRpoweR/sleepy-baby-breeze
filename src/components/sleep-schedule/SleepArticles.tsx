
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Moon, 
  Baby, 
  Lightbulb,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  ageGroup: string;
  topic: string;
  readTime: number;
  lastUpdated: string;
  tags: string[];
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Understanding Newborn Sleep Patterns',
    excerpt: 'Learn about the natural sleep cycles of newborns and what to expect in the first few months.',
    content: 'Newborns typically sleep 14-17 hours per day in short bursts of 2-4 hours. Their sleep cycles are shorter than adults, lasting about 50-60 minutes compared to 90 minutes for adults. During the first 3 months, babies spend about 50% of their sleep time in REM sleep, which is crucial for brain development.',
    ageGroup: '0-3 months',
    topic: 'Sleep Development',
    readTime: 5,
    lastUpdated: '2024-01-15',
    tags: ['newborn', 'sleep cycles', 'development']
  },
  {
    id: '2',
    title: 'Creating the Perfect Sleep Environment',
    excerpt: 'Essential tips for setting up a safe and comfortable sleep space for your baby.',
    content: 'The ideal sleep environment should be cool (68-70°F), dark, and quiet. Use blackout curtains, a white noise machine, and ensure the crib meets safety standards. Remove loose bedding, toys, and bumpers to reduce SIDS risk. A firm mattress with a fitted sheet is all that\'s needed.',
    ageGroup: 'All Ages',
    topic: 'Sleep Environment',
    readTime: 4,
    lastUpdated: '2024-01-20',
    tags: ['safety', 'environment', 'SIDS prevention']
  },
  {
    id: '3',
    title: 'Gentle Sleep Training Methods',
    excerpt: 'Evidence-based approaches to help your baby learn healthy sleep habits.',
    content: 'The "Chair Method" involves gradually moving your chair further from the crib each night until you\'re outside the room. The "Pick-up/Put-down" method allows you to comfort your baby when they cry but put them back down awake. These methods typically show results within 1-2 weeks with consistency.',
    ageGroup: '4-12 months',
    topic: 'Sleep Training',
    readTime: 8,
    lastUpdated: '2024-01-18',
    tags: ['sleep training', 'gentle methods', 'consistency']
  },
  {
    id: '4',
    title: 'Sleep Regression: What to Expect',
    excerpt: 'Common sleep regressions and how to navigate them with confidence.',
    content: 'Sleep regressions typically occur at 4 months, 8-10 months, 12 months, and 18 months. The 4-month regression is developmental - babies\' sleep cycles mature and become more like adults. During regressions, maintain consistent routines and remember that they usually last 2-6 weeks.',
    ageGroup: '4+ months',
    topic: 'Sleep Challenges',
    readTime: 6,
    lastUpdated: '2024-01-22',
    tags: ['regression', 'development', 'challenges']
  },
  {
    id: '5',
    title: 'Nap Schedules by Age',
    excerpt: 'Age-appropriate nap schedules and wake windows to optimize daytime sleep.',
    content: 'Newborns: Wake windows of 45-60 minutes. 3-4 months: 1.5-2 hour wake windows, 4-5 naps. 6 months: 2-3 hour wake windows, 3 naps. 12 months: 3-4 hour wake windows, 2 naps. 15-18 months: Transition to 1 afternoon nap of 1.5-3 hours.',
    ageGroup: 'All Ages',
    topic: 'Nap Schedules',
    readTime: 7,
    lastUpdated: '2024-01-25',
    tags: ['naps', 'schedule', 'wake windows']
  },
  {
    id: '6',
    title: 'Toddler Sleep Challenges',
    excerpt: 'Managing bedtime battles, early wake-ups, and night fears in toddlers.',
    content: 'Toddlers need 11-14 hours of sleep total. Common challenges include bedtime resistance, night wakings, and early rising. Use a consistent bedtime routine, consider a toddler clock for wake-up time, and address fears with comfort objects. Limit screen time 2 hours before bed.',
    ageGroup: '12+ months',
    topic: 'Sleep Challenges',
    readTime: 6,
    lastUpdated: '2024-01-28',
    tags: ['toddler', 'bedtime routine', 'night fears']
  }
];

const ageGroups = ['All Ages', '0-3 months', '4-12 months', '12+ months'];
const topics = ['Sleep Development', 'Sleep Environment', 'Sleep Training', 'Sleep Challenges', 'Nap Schedules'];

export const SleepArticles = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('All Ages');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [expandedArticle, setExpandedArticle] = useState<string>('');

  const filteredArticles = articles.filter(article => {
    const ageMatch = selectedAgeGroup === 'All Ages' || article.ageGroup === selectedAgeGroup;
    const topicMatch = !selectedTopic || article.topic === selectedTopic;
    return ageMatch && topicMatch;
  });

  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case 'Sleep Development': return <Baby className="h-4 w-4" />;
      case 'Sleep Environment': return <Moon className="h-4 w-4" />;
      case 'Sleep Training': return <BookOpen className="h-4 w-4" />;
      case 'Sleep Challenges': return <Lightbulb className="h-4 w-4" />;
      case 'Nap Schedules': return <Clock className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Sleep Articles & Tips</h2>
        </div>
        <p className="text-gray-600">
          Evidence-based information to help you understand and improve your baby's sleep patterns.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="h-4 w-4 inline mr-1" />
            Age Group
          </label>
          <div className="flex flex-wrap gap-2">
            {ageGroups.map((age) => (
              <Button
                key={age}
                variant={selectedAgeGroup === age ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAgeGroup(age)}
                className="text-xs"
              >
                {age}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedTopic ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTopic('')}
              className="text-xs"
            >
              All Topics
            </Button>
            {topics.map((topic) => (
              <Button
                key={topic}
                variant={selectedTopic === topic ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTopic(topic)}
                className="text-xs"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 flex items-center space-x-2">
                    {getTopicIcon(article.topic)}
                    <span>{article.title}</span>
                  </CardTitle>
                  <p className="text-gray-600 text-sm mb-3">{article.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {article.ageGroup}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {article.topic}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {article.readTime} min read
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated {new Date(article.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedArticle(expandedArticle === article.id ? '' : article.id)}
                  className="ml-4"
                >
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedArticle === article.id ? 'rotate-90' : ''
                    }`} 
                  />
                </Button>
              </div>
            </CardHeader>
            
            {expandedArticle === article.id && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {article.content}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              Try adjusting your filters to see more articles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
