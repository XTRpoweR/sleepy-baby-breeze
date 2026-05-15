import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useSmartBack } from '@/hooks/useSmartBack';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Baby,
  Activity,
  BarChart3,
  Calendar,
  Sparkles,
  PlayCircle,
  Trophy,
  MessageCircle,
} from 'lucide-react';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { LanguageSelector } from '@/components/LanguageSelector';

const Tutorial = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const goBack = useSmartBack(user ? '/dashboard' : '/');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleGetStarted = () => {
    navigate(user ? '/dashboard' : '/auth');
  };

  const tutorialSteps = [
    {
      id: 0,
      title: t('tutorial.steps.setup.title'),
      description: t('tutorial.steps.setup.description'),
      icon: Baby,
      gradient: 'from-pink-500 to-rose-500',
      ringColor: 'ring-pink-200/60',
      estimatedTime: '5 min',
      content: [
        t('tutorial.steps.setup.step1'),
        t('tutorial.steps.setup.step2'),
        t('tutorial.steps.setup.step3'),
        t('tutorial.steps.setup.step4'),
      ],
      actionText: t('tutorial.actions.createProfile'),
      actionRoute: '/dashboard',
    },
    {
      id: 1,
      title: t('tutorial.steps.tracking.title'),
      description: t('tutorial.steps.tracking.description'),
      icon: Activity,
      gradient: 'from-purple-500 to-fuchsia-500',
      ringColor: 'ring-purple-200/60',
      estimatedTime: '10 min',
      content: [
        t('tutorial.steps.tracking.step1'),
        t('tutorial.steps.tracking.step2'),
        t('tutorial.steps.tracking.step3'),
        t('tutorial.steps.tracking.step4'),
      ],
      actionText: t('tutorial.actions.startTracking'),
      actionRoute: '/track',
    },
    {
      id: 2,
      title: t('tutorial.steps.reports.title'),
      description: t('tutorial.steps.reports.description'),
      icon: BarChart3,
      gradient: 'from-indigo-500 to-blue-500',
      ringColor: 'ring-indigo-200/60',
      estimatedTime: '7 min',
      content: [
        t('tutorial.steps.reports.step1'),
        t('tutorial.steps.reports.step2'),
        t('tutorial.steps.reports.step3'),
        t('tutorial.steps.reports.step4'),
      ],
      actionText: t('tutorial.actions.viewReports'),
      actionRoute: '/reports',
    },
    {
      id: 3,
      title: t('tutorial.steps.advanced.title'),
      description: t('tutorial.steps.advanced.description'),
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-500',
      ringColor: 'ring-amber-200/60',
      estimatedTime: '8 min',
      content: [
        t('tutorial.steps.advanced.step1'),
        t('tutorial.steps.advanced.step2'),
        t('tutorial.steps.advanced.step3'),
        t('tutorial.steps.advanced.step4'),
      ],
      actionText: t('tutorial.actions.exploreFeatures'),
      actionRoute: '/sleep-schedule',
    },
  ];

  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorial = tutorialSteps[currentStep];
  const IconComponent = currentTutorial.icon;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const allDone = completedSteps.length === tutorialSteps.length;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/40 to-indigo-50 overflow-x-hidden">
      {/* Decorative blurred blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-pink-300/25 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-purple-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      {/* Conditional Headers */}
      {user ? (
        <>
          <DesktopHeader />
          <MobileHeader />
        </>
      ) : (
        <nav className="bg-white/70 backdrop-blur-md border-b border-white/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <img
                src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png"
                alt="SleepyBabyy"
                className="h-8 w-8 sm:h-9 sm:w-9"
              />
              <span className="text-base sm:text-lg font-bold text-gray-900">{t('app.name')}</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <Button
                size="sm"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 rounded-full px-4 sm:px-5 shadow-md shadow-purple-500/30"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </div>
          </div>
        </nav>
      )}

      {/* Hero section — Back button + Contact CTA on same row (Help Center pattern) */}
      <section className="relative pt-6 sm:pt-10 md:pt-14 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 touch-target"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] rounded-full px-6"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Need help?
            </Button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-purple-200/60 text-purple-700 text-xs sm:text-sm font-medium mb-5 shadow-sm">
              <PlayCircle className="h-3.5 w-3.5 text-purple-500" />
              <span>{t('tutorial.eyebrow', 'Step-by-step guide')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-5 leading-tight">
              {t('tutorial.title')}
              <span className="block mt-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                {t('tutorial.titleAccent', 'one calm step at a time')}
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-7 md:mb-9 leading-relaxed max-w-2xl mx-auto">
              {t('tutorial.subtitle')}
            </p>

            {/* Progress bar */}
            <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  {t('tutorial.progress')}
                </span>
                <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {currentStep + 1} / {tutorialSteps.length}
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-purple-100 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:via-purple-500 [&>div]:to-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Step pills */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {tutorialSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.includes(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`relative flex-shrink-0 flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-300 min-w-[120px] sm:min-w-[140px] ${
                    isActive
                      ? 'bg-white shadow-xl shadow-purple-500/10 ring-2 ring-purple-300 scale-[1.02]'
                      : 'bg-white/60 backdrop-blur-sm border border-white/80 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-md shadow-purple-500/20`}>
                    <StepIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    {isCompleted && (
                      <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 fill-green-100" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {step.title}
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs bg-purple-50 text-purple-700 border-purple-100 font-medium"
                    >
                      {step.estimatedTime}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current Step Content */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 bg-white/80 backdrop-blur-md shadow-xl shadow-purple-500/5 rounded-3xl overflow-hidden">
            {/* Gradient accent strip */}
            <div className={`h-1.5 bg-gradient-to-r ${currentTutorial.gradient}`} />

            <CardContent className="p-6 sm:p-8 lg:p-10">
              {/* Step header */}
              <div className="flex items-start gap-4 mb-7">
                <div className={`flex-shrink-0 p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${currentTutorial.gradient} shadow-lg shadow-purple-500/20`}>
                  <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-purple-600">
                      {t('tutorial.stepLabel', 'Step')} {currentStep + 1}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] sm:text-xs text-gray-500">{currentTutorial.estimatedTime}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5 leading-snug">
                    {currentTutorial.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {currentTutorial.description}
                  </p>
                </div>
              </div>

              {/* Step content list */}
              <div className="space-y-3.5 mb-8">
                {currentTutorial.content.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-50/60 to-pink-50/40 border border-purple-100/60 hover:border-purple-200 transition-all"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${currentTutorial.gradient} text-white flex items-center justify-center text-sm font-bold shadow-sm`}>
                      {index + 1}
                    </div>
                    <p className="flex-1 text-sm sm:text-base text-gray-700 leading-relaxed pt-1">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    markStepCompleted(currentTutorial.id);
                    navigate(currentTutorial.actionRoute);
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.01] rounded-full py-6 text-base font-semibold"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {currentTutorial.actionText}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => markStepCompleted(currentTutorial.id)}
                  className="w-full rounded-full border-purple-200 bg-white/60 hover:bg-white text-gray-700 hover:text-gray-900 py-6"
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  {t('tutorial.actions.markCompleted')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation footer */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="rounded-full border-purple-200 bg-white/60 hover:bg-white w-full sm:w-auto disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.previous')}
            </Button>

            <div className="text-center order-first sm:order-none">
              <p className="text-xs sm:text-sm text-gray-600 mb-1.5">
                {t('tutorial.completedSteps', {
                  completed: completedSteps.length,
                  total: tutorialSteps.length,
                })}
              </p>
              {allDone && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-xs font-semibold shadow-md">
                  <Trophy className="h-3.5 w-3.5" />
                  {t('tutorial.allCompleted')}
                </div>
              )}
            </div>

            <Button
              onClick={nextStep}
              disabled={currentStep === tutorialSteps.length - 1}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 rounded-full w-full sm:w-auto disabled:opacity-40 shadow-md shadow-purple-500/30"
            >
              {t('common.next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA when all done */}
      {allDone && (
        <section className="relative px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-8 sm:p-12 text-center shadow-2xl shadow-purple-500/30">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
              <Trophy className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-lg" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {t('tutorial.congrats.title', "You're all set! 🌙")}
              </h2>
              <p className="text-white/90 mb-6 max-w-lg mx-auto text-sm sm:text-base">
                {t(
                  'tutorial.congrats.subtitle',
                  'You just finished the tutorial. Now go enjoy calmer nights — we built every screen with you in mind.',
                )}
              </p>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-50 rounded-full px-8 shadow-lg font-semibold"
              >
                {user ? t('tutorial.congrats.goDashboard', 'Go to dashboard') : t('tutorial.congrats.start', 'Start free')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Tutorial;
