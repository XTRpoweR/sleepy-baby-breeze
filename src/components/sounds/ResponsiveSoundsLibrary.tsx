import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  Music,
  Waves,
  Wind,
  Loader2,
  Search,
  Heart,
  Clock,
  Coffee,
  BrainCircuit,
  Baby,
  AlertCircle,
  Timer,
  SkipForward,
  SkipBack,
  Moon,
  Sparkles,
  X,
} from 'lucide-react';
import { useMobileAudioPlayer } from '@/hooks/useMobileAudioPlayer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAudioTimerDialog } from './MobileAudioTimerDialog';
import { cn } from '@/lib/utils';

interface ResponsiveSoundsLibraryProps {
  onSoundSelect?: (sound: any) => void;
}

// Visual style per track: gradient backdrop and emoji glyph used in the card
// header. Keyed by the static track ids exported from useMobileAudioPlayer.
const TRACK_VISUALS: Record<string, { gradient: string; emoji: string }> = {
  'heavy-rain-drops':       { gradient: 'from-blue-500 to-cyan-500',     emoji: '🌧️' },
  'water-fountain-healing': { gradient: 'from-emerald-500 to-cyan-500',  emoji: '⛲' },
  'waves-sad-piano':        { gradient: 'from-purple-500 to-pink-500',   emoji: '🌊' },
  'dark-atmosphere-rain':   { gradient: 'from-slate-700 to-indigo-800',  emoji: '🌑' },
  'nature-investigation':   { gradient: 'from-amber-500 to-rose-500',    emoji: '🌲' },
  'soft-birds-sound':       { gradient: 'from-sky-400 to-indigo-500',    emoji: '🐦' },
};
const fallbackVisual = { gradient: 'from-slate-500 to-slate-700', emoji: '🎵' };

export const ResponsiveSoundsLibrary = ({ onSoundSelect }: ResponsiveSoundsLibraryProps) => {
  const { t } = useTranslation();
  const {
    audioTracks,
    favoriteTracks,
    recentTracks,
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isLooping,
    isLoading,
    isBuffering,
    error,
    searchQuery,
    favorites,
    timer,
    timeRemaining,
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    changeVolume,
    toggleLoop,
    skipForward,
    skipBackward,
    playNextTrack,
    playPreviousTrack,
    setSearchQuery,
    toggleFavorite,
    formatTime,
    setAudioTimer,
    setAudioCustomTimer,
    clearTimer,
  } = useMobileAudioPlayer();

  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'favorites' | 'recent'>('browse');
  const [showTimerDialog, setShowTimerDialog] = useState(false);

  const categories = [
    { id: 'all',         icon: Music,        label: t('pages.sounds.categories.all') },
    { id: 'nature',      icon: Waves,        label: t('pages.sounds.categories.nature') },
    { id: 'ambient',     icon: Coffee,       label: t('pages.sounds.categories.ambient') },
    { id: 'lullaby',     icon: Baby,         label: t('pages.sounds.categories.lullaby') },
    { id: 'sleep',       icon: BrainCircuit, label: t('pages.sounds.categories.sleep') },
    { id: 'white-noise', icon: Wind,         label: t('pages.sounds.categories.whiteNoise') },
  ];

  const filteredTracks = selectedCategory === 'all'
    ? audioTracks
    : audioTracks.filter((track) => track.category === selectedCategory);

  // Sleep timer quick-pick. 0 means "no timer / off".
  const timerPresets: Array<{ minutes: number; key: 'm15' | 'm30' | 'm60' | 'off' }> = [
    { minutes: 15, key: 'm15' },
    { minutes: 30, key: 'm30' },
    { minutes: 60, key: 'm60' },
    { minutes: 0,  key: 'off' },
  ];

  const handleTimerPreset = (minutes: number) => {
    if (minutes === 0) {
      clearTimer();
    } else {
      setAudioTimer(minutes);
    }
  };

  const handleTrackClick = async (track: any) => {
    if (onSoundSelect) {
      onSoundSelect(track);
      return;
    }
    if (currentTrack?.id === track.id) {
      isPlaying ? pauseAudio() : await playAudio(track);
    } else {
      await playAudio(track);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    seekTo((clickX / rect.width) * duration);
  };

  const renderTrackCard = (track: any) => {
    const isCurrent = currentTrack?.id === track.id;
    const isFavorite = favorites.includes(track.id);
    const visual = TRACK_VISUALS[track.id] || fallbackVisual;
    const playingNow = isCurrent && isPlaying;

    return (
      <div
        key={track.id}
        onClick={() => handleTrackClick(track)}
        className={cn(
          'group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden',
          'bg-white border',
          isCurrent
            ? 'border-purple-300 ring-2 ring-purple-200 shadow-lg bg-gradient-to-br from-purple-50/60 to-pink-50/60'
            : 'border-slate-200 hover:border-purple-200 hover:shadow-md',
        )}
      >
        {/* Now-playing badge */}
        {isCurrent && (
          <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide z-10">
            {t('pages.sounds.nowPlaying')}
          </span>
        )}

        {/* Favorite */}
        {!onSoundSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(track.id);
            }}
            className={cn(
              'absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
              isFavorite ? 'bg-pink-100 text-pink-500' : 'bg-white/70 text-slate-300 hover:text-pink-500',
            )}
            aria-label="favorite"
          >
            <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
          </button>
        )}

        {/* Visual */}
        <div
          className={cn(
            'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md mb-3 bg-gradient-to-br',
            visual.gradient,
            isCurrent && 'mt-7',
          )}
        >
          <span className="drop-shadow-sm">{visual.emoji}</span>
        </div>

        {/* Title + description */}
        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{track.name}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {track.description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
            {track.category.replace('-', ' ')}
          </span>
          {track.subcategory && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {track.subcategory}
            </span>
          )}
        </div>

        {/* Bottom row: waveform if playing, play button */}
        <div className="mt-4 flex items-center justify-between">
          {playingNow ? (
            <div className="flex items-end gap-0.5 h-5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-purple-500"
                  style={{
                    height: '8px',
                    animation: `sb-wave 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400">{track.duration > 0 ? formatTime(track.duration) : ''}</span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTrackClick(track);
            }}
            className={cn(
              'w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-md transition-colors',
              isCurrent
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                : 'bg-slate-900 hover:bg-purple-600 text-white',
            )}
            aria-label={playingNow ? t('pages.sounds.playerPause') : t('pages.sounds.playerPlay')}
            disabled={isLoading && isCurrent}
          >
            {isLoading && isCurrent ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : playingNow ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderEmpty = (Icon: any, titleKey: string, hintKey: string) => (
    <div className="text-center py-16 text-slate-500">
      <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <h3 className="text-base font-semibold mb-1">{t(titleKey)}</h3>
      <p className="text-sm">{t(hintKey)}</p>
    </div>
  );

  const tracksToShow =
    activeTab === 'favorites' ? favoriteTracks : activeTab === 'recent' ? recentTracks : filteredTracks;

  const showEmptyFavorites = activeTab === 'favorites' && tracksToShow.length === 0;
  const showEmptyRecent = activeTab === 'recent' && tracksToShow.length === 0;

  return (
    <>
      {/* Inline keyframes for waveform animation */}
      <style>{`@keyframes sb-wave { 0%,100% { height: 8px } 50% { height: 20px } }`}</style>

      {/* Hero with sleep timer */}
      <div className="rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-6 left-10 text-2xl">⭐</div>
          <div className="absolute top-14 right-1/4 text-xl">🌙</div>
          <div className="absolute top-1/2 left-1/3 text-lg">✨</div>
          <div className="absolute bottom-6 right-12 text-2xl">☁️</div>
        </div>
        <div className="relative p-5 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-purple-200 text-[11px] uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              {t('pages.sounds.hero.eyebrow')}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
              {t('pages.sounds.hero.title')}
            </h2>
            <p className="text-purple-200 text-xs sm:text-sm mt-2 max-w-md">
              {t('pages.sounds.hero.subtitle')}
            </p>
          </div>

          {/* Sleep timer preset */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 flex items-center gap-3">
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-purple-200 uppercase tracking-wider flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {t('pages.sounds.timer.label')}
              </span>
              {timeRemaining && (
                <span className="text-xs font-bold text-white mt-0.5">{formatTime(timeRemaining)}</span>
              )}
            </div>
            <div className="flex gap-1">
              {timerPresets.map((p) => {
                const active = p.minutes > 0 ? timer === p.minutes : !timer;
                return (
                  <button
                    key={p.key}
                    onClick={() => handleTimerPreset(p.minutes)}
                    className={cn(
                      'px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors',
                      active
                        ? 'bg-white text-purple-700'
                        : 'bg-white/15 text-white hover:bg-white/25',
                    )}
                  >
                    {t(`pages.sounds.timer.${p.key}`)}
                  </button>
                );
              })}
              <button
                onClick={() => setShowTimerDialog(true)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/15 text-white hover:bg-white/25"
                aria-label={t('pages.sounds.timer.custom')}
              >
                ···
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={t('pages.sounds.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rtl:pl-3 rtl:pr-10 h-11 rounded-xl bg-white border-slate-200"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
        {([
          { id: 'browse',    icon: Music, label: t('pages.sounds.tabs.browse') },
          { id: 'favorites', icon: Heart, label: t('pages.sounds.tabs.favorites') },
          { id: 'recent',    icon: Clock, label: t('pages.sounds.tabs.recent') },
        ] as const).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category pills (only in browse tab) */}
      {activeTab === 'browse' && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map((c) => {
            const active = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-200',
                )}
              >
                <c.icon className="w-3 h-3" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cards grid */}
      {showEmptyFavorites ? (
        renderEmpty(Heart, 'pages.sounds.noFavoritesTitle', 'pages.sounds.noFavoritesHint')
      ) : showEmptyRecent ? (
        renderEmpty(Clock, 'pages.sounds.noRecentTitle', 'pages.sounds.noRecentHint')
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-32 md:pb-24">
          {tracksToShow.map(renderTrackCard)}
        </div>
      )}

      {/* Sticky now-playing bar */}
      {currentTrack && !onSoundSelect && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
            {/* Track visual */}
            <div
              className={cn(
                'w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br',
                (TRACK_VISUALS[currentTrack.id] || fallbackVisual).gradient,
              )}
            >
              {(TRACK_VISUALS[currentTrack.id] || fallbackVisual).emoji}
            </div>

            {/* Info + progress */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate flex items-center gap-2">
                {currentTrack.name}
                {isBuffering && <Loader2 className="w-3 h-3 animate-spin text-purple-300" />}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400 hidden sm:inline tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 cursor-pointer py-1" onClick={handleProgressClick}>
                  <Progress value={duration ? (currentTime / duration) * 100 : 0} className="h-1" />
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  {duration ? formatTime(duration) : '--:--'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={skipBackward}
                className="text-slate-300 hover:text-white p-1.5 hidden sm:block"
                aria-label={t('pages.sounds.playerPrev')}
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => (isPlaying ? pauseAudio() : playAudio(currentTrack))}
                className="bg-white text-slate-900 w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow"
                aria-label={isPlaying ? t('pages.sounds.playerPause') : t('pages.sounds.playerPlay')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>
              <button
                onClick={skipForward}
                className="text-slate-300 hover:text-white p-1.5 hidden sm:block"
                aria-label={t('pages.sounds.playerNext')}
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={toggleLoop}
                className={cn(
                  'p-1.5 transition-colors hidden sm:block',
                  isLooping ? 'text-purple-400' : 'text-slate-400 hover:text-white',
                )}
                aria-label={t('pages.sounds.playerLoop')}
              >
                <Repeat className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowTimerDialog(true)}
                className={cn(
                  'p-1.5 transition-colors',
                  timer ? 'text-purple-400' : 'text-slate-400 hover:text-white',
                )}
                aria-label={t('pages.sounds.timer.label')}
              >
                <Timer className="w-4 h-4" />
              </button>
              <button
                onClick={stopAudio}
                className="text-slate-400 hover:text-red-400 p-1.5"
                aria-label={t('pages.sounds.playerStop')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileAudioTimerDialog
        open={showTimerDialog}
        onOpenChange={setShowTimerDialog}
        onSetTimer={setAudioTimer}
        onSetCustomTimer={setAudioCustomTimer}
        onClearTimer={clearTimer}
        currentTimer={timer}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        isPlaying={isPlaying}
      />
    </>
  );
};
