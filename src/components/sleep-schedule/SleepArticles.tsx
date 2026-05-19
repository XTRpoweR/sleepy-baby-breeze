import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Clock,
  Moon,
  Baby,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
} from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { cn } from '@/lib/utils';

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
    content:
      'Newborns typically sleep 14-17 hours per day in short bursts of 2-4 hours. Their sleep cycles are shorter than adults, lasting about 50-60 minutes compared to 90 minutes for adults. During the first 3 months, babies spend about 50% of their sleep time in REM sleep, which is crucial for brain development.',
    ageGroup: '0-3 months',
    topic: 'Sleep Development',
    readTime: 5,
    lastUpdated: '2024-01-15',
    tags: ['newborn', 'sleep cycles', 'development'],
  },
  {
    id: '2',
    title: 'Creating the Perfect Sleep Environment',
    excerpt: 'Essential tips for setting up a safe and comfortable sleep space for your baby.',
    content:
      "The ideal sleep environment should be cool (68-70°F), dark, and quiet. Use blackout curtains, a white noise machine, and ensure the crib meets safety standards. Remove loose bedding, toys, and bumpers to reduce SIDS risk. A firm mattress with a fitted sheet is all that's needed.",
    ageGroup: 'All Ages',
    topic: 'Sleep Environment',
    readTime: 4,
    lastUpdated: '2024-01-20',
    tags: ['safety', 'environment', 'SIDS prevention'],
  },
  {
    id: '3',
    title: 'Gentle Sleep Training Methods',
    excerpt: 'Evidence-based approaches to help your baby learn healthy sleep habits.',
    content:
      'The "Chair Method" involves gradually moving your chair further from the crib each night until you\'re outside the room. The "Pick-up/Put-down" method allows you to comfort your baby when they cry but put them back down awake. These methods typically show results within 1-2 weeks with consistency.',
    ageGroup: '4-12 months',
    topic: 'Sleep Training',
    readTime: 8,
    lastUpdated: '2024-01-18',
    tags: ['sleep training', 'gentle methods', 'consistency'],
  },
  {
    id: '4',
    title: 'Sleep Regression: What to Expect',
    excerpt: 'Common sleep regressions and how to navigate them with confidence.',
    content:
      "Sleep regressions typically occur at 4 months, 8-10 months, 12 months, and 18 months. The 4-month regression is developmental - babies' sleep cycles mature and become more like adults. During regressions, maintain consistent routines and remember that they usually last 2-6 weeks.",
    ageGroup: '4+ months',
    topic: 'Sleep Challenges',
    readTime: 6,
    lastUpdated: '2024-01-22',
    tags: ['regression', 'development', 'challenges'],
  },
  {
    id: '5',
    title: 'Nap Schedules by Age',
    excerpt: 'Age-appropriate nap schedules and wake windows to optimize daytime sleep.',
    content:
      'Newborns: Wake windows of 45-60 minutes. 3-4 months: 1.5-2 hour wake windows, 4-5 naps. 6 months: 2-3 hour wake windows, 3 naps. 12 months: 3-4 hour wake windows, 2 naps. 15-18 months: Transition to 1 afternoon nap of 1.5-3 hours.',
    ageGroup: 'All Ages',
    topic: 'Nap Schedules',
    readTime: 7,
    lastUpdated: '2024-01-25',
    tags: ['naps', 'schedule', 'wake windows'],
  },
  {
    id: '6',
    title: 'Toddler Sleep Challenges',
    excerpt: 'Managing bedtime battles, early wake-ups, and night fears in toddlers.',
    content:
      'Toddlers need 11-14 hours of sleep total. Common challenges include bedtime resistance, night wakings, and early rising. Use a consistent bedtime routine, consider a toddler clock for wake-up time, and address fears with comfort objects. Limit screen time 2 hours before bed.',
    ageGroup: '12+ months',
    topic: 'Sleep Challenges',
    readTime: 6,
    lastUpdated: '2024-01-28',
    tags: ['toddler', 'bedtime routine', 'night fears'],
  },
];

const ageGroups = ['All Ages', '0-3 months', '4-12 months', '12+ months'];
const topics = [
  'Sleep Development',
  'Sleep Environment',
  'Sleep Training',
  'Sleep Challenges',
  'Nap Schedules',
];

const TOPIC_STYLE: Record<string, { gradient: string; emoji: string; icon: typeof Moon }> = {
  'Sleep Development': { gradient: 'from-pink-500 to-rose-500',     emoji: '👶', icon: Baby },
  'Sleep Environment': { gradient: 'from-emerald-500 to-teal-500',  emoji: '🛏️', icon: Moon },
  'Sleep Training':    { gradient: 'from-purple-600 to-pink-600',   emoji: '😴', icon: BookOpen },
  'Sleep Challenges':  { gradient: 'from-amber-500 to-orange-500',  emoji: '💡', icon: Lightbulb },
  'Nap Schedules':     { gradient: 'from-indigo-500 to-violet-500', emoji: '💤', icon: Clock },
};

// Pick a default age group from an active baby's birth_date.
const ageGroupFromBirthDate = (birthDate: string | null | undefined): string => {
  if (!birthDate) return 'All Ages';
  const months = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.4),
  );
  if (months < 4) return '0-3 months';
  if (months < 13) return '4-12 months';
  return '12+ months';
};

const formatBabyAge = (birthDate: string | null | undefined): string => {
  if (!birthDate) return '';
  const months = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.4),
  );
  if (months < 1) return '< 1 mo';
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 yr' : `${years} yrs`;
};

const READ_STORAGE_KEY = 'sleepy.articles.read';
const BOOKMARK_STORAGE_KEY = 'sleepy.articles.bookmarks';

const loadSet = (key: string): Set<string> => {
  try {
    const v = localStorage.getItem(key);
    return v ? new Set(JSON.parse(v)) : new Set();
  } catch {
    return new Set();
  }
};

const persistSet = (key: string, set: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
};

export const SleepArticles = () => {
  const { t, i18n } = useTranslation();
  const { activeProfile } = useBabyProfile();

  const defaultAge = useMemo(
    () => ageGroupFromBirthDate(activeProfile?.birth_date),
    [activeProfile?.birth_date],
  );

  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>(defaultAge);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [expandedArticle, setExpandedArticle] = useState<string>('');
  const [readSet, setReadSet] = useState<Set<string>>(() => loadSet(READ_STORAGE_KEY));
  const [bookmarkSet, setBookmarkSet] = useState<Set<string>>(() => loadSet(BOOKMARK_STORAGE_KEY));

  // Re-sync the default filter whenever the active baby changes.
  useEffect(() => {
    setSelectedAgeGroup(defaultAge);
  }, [defaultAge]);

  const matchesAge = (article: Article, group: string) => {
    if (group === 'All Ages') return true;
    if (article.ageGroup === group || article.ageGroup === 'All Ages') return true;
    // 4+ months bucket: include under both 4-12 and 12+
    if (article.ageGroup === '4+ months' && (group === '4-12 months' || group === '12+ months')) {
      return true;
    }
    return false;
  };

  const filteredArticles = articles.filter((a) => {
    const ageOk = matchesAge(a, selectedAgeGroup);
    const topicOk = !selectedTopic || a.topic === selectedTopic;
    return ageOk && topicOk;
  });

  // Featured article — first match in the user's filter, or first overall.
  const featured = filteredArticles[0] || articles[0];
  const rest = filteredArticles.filter((a) => a.id !== featured.id);

  const toggleRead = (id: string) => {
    setReadSet((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persistSet(READ_STORAGE_KEY, next);
      return next;
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarkSet((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persistSet(BOOKMARK_STORAGE_KEY, next);
      return next;
    });
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(i18n.language || 'en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const ageLabel = (group: string) => t(`sleepArticles.ageGroups.${group}`, group);
  const topicLabel = (topic: string) => t(`sleepArticles.topics.${topic}`, topic);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          {t('sleepArticles.title')}
        </h2>
        <p className="text-sm text-slate-600 mt-1">{t('sleepArticles.subtitle')}</p>
      </div>

      {/* Personalization banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border border-purple-100 p-4 sm:p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
            👶
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm sm:text-base">
              {activeProfile?.name
                ? t('sleepArticles.personalization.forBaby', {
                    name: activeProfile.name,
                    age: formatBabyAge(activeProfile.birth_date),
                  })
                : t('sleepArticles.personalization.forBabyGeneric')}
            </p>
            <p className="text-xs text-slate-600 mt-1">{t('sleepArticles.personalization.hint')}</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {t('sleepArticles.progress', { read: readSet.size, total: articles.length })}
            </span>
            <div className="w-20 h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                style={{ width: `${(readSet.size / articles.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured hero */}
      {featured && (
        <div>
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {t('sleepArticles.featured.eyebrow')}
          </p>
          <article
            className={cn(
              'rounded-2xl overflow-hidden text-white relative shadow-xl bg-gradient-to-br cursor-pointer',
              TOPIC_STYLE[featured.topic]?.gradient || 'from-purple-600 to-pink-600',
            )}
            onClick={() => setExpandedArticle(expandedArticle === featured.id ? '' : featured.id)}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-5 left-10 text-3xl">🌙</div>
              <div className="absolute bottom-6 right-12 text-4xl">
                {TOPIC_STYLE[featured.topic]?.emoji || '😴'}
              </div>
              <div className="absolute top-10 right-1/3 text-2xl">⭐</div>
            </div>
            <div className="relative p-6 sm:p-8 md:p-10">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-white/20 backdrop-blur text-[11px] px-2.5 py-1 rounded-full font-semibold">
                  {ageLabel(featured.ageGroup)}
                </span>
                <span className="bg-white/20 backdrop-blur text-[11px] px-2.5 py-1 rounded-full font-semibold">
                  {topicLabel(featured.topic)}
                </span>
                <span className="text-[11px] opacity-80">
                  ⏱ {t('sleepArticles.minRead', { count: featured.readTime })}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 leading-tight">
                {featured.title}
              </h3>
              <p className="text-white/90 text-sm sm:text-base mb-4 max-w-2xl">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedArticle(expandedArticle === featured.id ? '' : featured.id);
                    if (!readSet.has(featured.id)) toggleRead(featured.id);
                  }}
                  className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
                >
                  {t('sleepArticles.read')} →
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(featured.id);
                  }}
                  className="bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-2.5 rounded-full text-sm flex items-center gap-2 hover:bg-white/20"
                >
                  {bookmarkSet.has(featured.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" /> {t('sleepArticles.saved')}
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" /> {t('sleepArticles.save')}
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* expanded body */}
            {expandedArticle === featured.id && (
              <div className="relative bg-white text-slate-700 px-6 sm:px-8 md:px-10 py-6 border-t border-white/20">
                <p className="text-sm leading-relaxed">{featured.content}</p>
              </div>
            )}
          </article>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500">{t('sleepArticles.filters.ageLabel')}:</span>
          {ageGroups.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedAgeGroup(g)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                selectedAgeGroup === g
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-200',
              )}
            >
              {ageLabel(g)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500">{t('sleepArticles.filters.topicLabel')}:</span>
          <button
            onClick={() => setSelectedTopic('')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
              !selectedTopic
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300',
            )}
          >
            {t('sleepArticles.topics.All Topics')}
          </button>
          {topics.map((tp) => (
            <button
              key={tp}
              onClick={() => setSelectedTopic(tp)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                selectedTopic === tp
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300',
              )}
            >
              {topicLabel(tp)}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {rest.length === 0 && !featured ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {t('sleepArticles.empty.title')}
            </h3>
            <p className="text-sm text-slate-600">{t('sleepArticles.empty.hint')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map((article) => {
            const style = TOPIC_STYLE[article.topic] || TOPIC_STYLE['Sleep Development'];
            const isRead = readSet.has(article.id);
            const isBookmarked = bookmarkSet.has(article.id);
            const isExpanded = expandedArticle === article.id;
            return (
              <article
                key={article.id}
                onClick={() => {
                  setExpandedArticle(isExpanded ? '' : article.id);
                  if (!isRead) toggleRead(article.id);
                }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                <div
                  className={cn(
                    'h-28 sm:h-32 relative flex items-center justify-center text-5xl sm:text-6xl bg-gradient-to-br',
                    style.gradient,
                  )}
                >
                  <span className="drop-shadow-md">{style.emoji}</span>
                  {isRead && (
                    <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('sleepArticles.markedRead')}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(article.id);
                    }}
                    className={cn(
                      'absolute top-2 left-2 rtl:left-auto rtl:right-2 w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-colors',
                      isBookmarked
                        ? 'bg-white text-purple-700'
                        : 'bg-white/30 text-white hover:bg-white/50',
                    )}
                    aria-label="bookmark"
                  >
                    {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">
                      {ageLabel(article.ageGroup)}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {topicLabel(article.topic)}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1 leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                    <span>⏱ {t('sleepArticles.minRead', { count: article.readTime })}</span>
                    <span>{t('sleepArticles.updated', { date: formatDate(article.lastUpdated) })}</span>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-700 leading-relaxed">{article.content}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
