import React, { useState } from 'react';
import {
  Calendar, Clock, FileText, Save, Sparkles, Megaphone, Gift, Lightbulb,
  ChevronRight, Send, Edit3, Trash2, CheckCircle2,
  PauseCircle, AlertCircle, Image as ImageIcon, Upload,
  Link as LinkIcon,
} from 'lucide-react';

/**
 * /dev/newsletter-features-preview
 * Visual previews of Newsletter v2 features:
 *  - 1A: Scheduling (date/time picker)
 *  - 1B: Templates picker
 *  - 1C: Drafts list
 *  - Layout: how the new composer integrates these together
 */
const NewsletterFeaturesPreview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Newsletter v2 — Feature Mockups
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Three new features for the newsletter admin: Scheduling, Templates, Drafts.
          </p>
        </div>

        <div className="space-y-16">
          <Section
            tag="1A"
            title="Scheduling — Send later"
            description="Compose now, send at a specific date/time. Perfect for time-zone targeting or queuing weekend sends."
          >
            <SchedulingMock />
          </Section>

          <Section
            tag="1B"
            title="Templates — Start from a preset"
            description="One-click starting points so you don't write from a blank page every time."
          >
            <TemplatesMock />
          </Section>

          <Section
            tag="1C"
            title="Drafts — Save without sending"
            description="Save what you wrote, come back later to edit or send. Useful for multi-step reviews."
          >
            <DraftsMock />
          </Section>

          <Section
            tag="1D"
            title="Image Library — Upload & insert"
            description="Upload from device, paste URL, or pick from previously used images. Inline insertion into the body."
          >
            <ImageLibraryMock />
          </Section>

          <Section
            tag="LAYOUT"
            title="How it all fits together"
            description="The composer gets a top toolbar with Templates + Save Draft + Schedule + Image buttons next to the existing Send button."
          >
            <ComposerLayoutMock />
          </Section>
        </div>

        <div className="mt-16 text-center text-sm text-slate-500">
          Tell me which features to implement: 1A · 1B · 1C · 1D — pick any combination.
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{
  tag: string;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ tag, title, description, children }) => (
  <section>
    <div className="flex items-start gap-4 mb-6">
      <div className="px-3 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 bg-gradient-to-br from-pink-400 to-purple-500 text-white">
        {tag}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
    <div className="p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm">
      {children}
    </div>
  </section>
);

// ---------- 1A: Scheduling ----------
const SchedulingMock: React.FC = () => {
  const [mode, setMode] = useState<'now' | 'later'>('later');
  const [date, setDate] = useState('2026-05-20');
  const [time, setTime] = useState('09:00');

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <button
          onClick={() => setMode('now')}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
            mode === 'now'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-md shadow-purple-500/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          Send now
        </button>
        <button
          onClick={() => setMode('later')}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
            mode === 'later'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-md shadow-purple-500/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Schedule for later
        </button>
      </div>

      {mode === 'later' && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-500" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-600 bg-white/60 rounded-lg p-3">
            <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <span>
              Will send on <strong className="text-slate-800">{new Date(`${date}T${time}`).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</strong> (your local time)
            </span>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Scheduled queue
        </h4>
        <div className="space-y-2">
          <ScheduledRow subject="Weekly Sleep Tips" date="May 20 · 9:00 AM" status="pending" />
          <ScheduledRow subject="May Newsletter" date="May 25 · 7:00 PM" status="pending" />
          <ScheduledRow subject="Welcome Series #2" date="May 18 · 8:00 AM" status="sent" />
        </div>
      </div>
    </div>
  );
};

const ScheduledRow: React.FC<{ subject: string; date: string; status: 'pending' | 'sent' }> = ({ subject, date, status }) => (
  <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-purple-200 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
      }`}>
        {status === 'pending' ? <PauseCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-800">{subject}</div>
        <div className="text-xs text-slate-500">{date}</div>
      </div>
    </div>
    <div className="flex items-center gap-1">
      {status === 'pending' && (
        <>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
        status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
      }`}>
        {status === 'pending' ? 'SCHEDULED' : 'SENT'}
      </span>
    </div>
  </div>
);

// ---------- 1B: Templates ----------
const TemplatesMock: React.FC = () => {
  const templates = [
    {
      id: 'welcome',
      icon: Sparkles,
      color: 'from-pink-400 to-purple-500',
      bg: 'from-pink-50 to-purple-50',
      name: 'Welcome',
      tag: 'Onboarding',
      preview: 'Hi {{name}}! Thanks for joining SleepyBabyy. Here\'s how to get started...',
    },
    {
      id: 'update',
      icon: Megaphone,
      color: 'from-blue-400 to-indigo-500',
      bg: 'from-blue-50 to-indigo-50',
      name: 'Product Update',
      tag: 'News',
      preview: 'We just shipped {{feature}}! Here\'s what\'s new and how it helps you...',
    },
    {
      id: 'promo',
      icon: Gift,
      color: 'from-orange-400 to-amber-500',
      bg: 'from-orange-50 to-amber-50',
      name: 'Promo / Offer',
      tag: 'Marketing',
      preview: 'Limited time: get {{discount}} off Premium. Offer ends {{date}}...',
    },
    {
      id: 'tips',
      icon: Lightbulb,
      color: 'from-emerald-400 to-teal-500',
      bg: 'from-emerald-50 to-teal-50',
      name: 'Weekly Tips',
      tag: 'Content',
      preview: '5 sleep tips for this week: from creating routines to handling regressions...',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`group text-left p-5 rounded-2xl bg-gradient-to-br ${t.bg} border border-white hover:shadow-lg transition-all`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">{t.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-slate-600 font-medium uppercase tracking-wider">
                      {t.tag}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{t.preview}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-medium text-purple-600 group-hover:translate-x-1 transition-transform">
                Use this template <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center pt-2">
        <button className="text-xs text-slate-500 hover:text-purple-600 underline underline-offset-2">
          + Create custom template
        </button>
      </div>
    </div>
  );
};

// ---------- 1C: Drafts ----------
const DraftsMock: React.FC = () => {
  const drafts = [
    { id: '1', subject: 'May Newsletter — Sleep Regression Tips', updated: '2 hours ago', preview: 'This month we\'re tackling the dreaded 4-month sleep regression...', words: 320 },
    { id: '2', subject: 'New: Pediatrician Reports v2', updated: 'Yesterday', preview: 'We\'ve completely redesigned the pediatrician report PDF...', words: 145 },
    { id: '3', subject: 'Untitled draft', updated: '3 days ago', preview: '', words: 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FileText className="w-4 h-4 text-purple-500" />
          <span>{drafts.length} drafts saved</span>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
          <Save className="w-3 h-3" />
          Save current as draft
        </button>
      </div>
      <div className="space-y-2">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`text-sm font-medium truncate ${d.subject === 'Untitled draft' ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                  {d.subject}
                </h4>
                {d.words === 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">EMPTY</span>
                )}
              </div>
              {d.preview && (
                <p className="text-xs text-slate-500 line-clamp-1">{d.preview}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {d.updated}</span>
                {d.words > 0 && <span>{d.words} words</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm">
                Continue editing
              </button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- 1D: Image Library ----------
const ImageLibraryMock: React.FC = () => {
  const [tab, setTab] = useState<'upload' | 'url' | 'library'>('library');

  const libraryImages = [
    { id: 1, name: 'baby-sleeping.jpg', size: '124 KB', emoji: '👶', bg: 'from-pink-200 to-rose-200' },
    { id: 2, name: 'crib-night.jpg', size: '89 KB', emoji: '🌙', bg: 'from-indigo-200 to-purple-200' },
    { id: 3, name: 'mother-baby.jpg', size: '156 KB', emoji: '💕', bg: 'from-pink-200 to-purple-200' },
    { id: 4, name: 'stars-pattern.png', size: '45 KB', emoji: '⭐', bg: 'from-amber-200 to-orange-200' },
    { id: 5, name: 'cloud-bg.png', size: '72 KB', emoji: '☁️', bg: 'from-sky-200 to-blue-200' },
    { id: 6, name: 'app-screenshot.png', size: '203 KB', emoji: '📱', bg: 'from-violet-200 to-fuchsia-200' },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { key: 'library', label: 'Library', icon: ImageIcon },
          { key: 'upload', label: 'Upload', icon: Upload },
          { key: 'url', label: 'From URL', icon: LinkIcon },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as 'upload' | 'url' | 'library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'upload' && (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer">
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700 mb-1">Drag & drop or click to upload</p>
          <p className="text-xs text-slate-500">PNG, JPG, WebP — up to 5 MB</p>
        </div>
      )}

      {tab === 'url' && (
        <div className="space-y-3">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <div className="flex justify-end">
            <button className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500">
              Add image
            </button>
          </div>
        </div>
      )}

      {tab === 'library' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {libraryImages.map((img) => (
            <button
              key={img.id}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${img.bg} flex items-center justify-center text-4xl`}>
                {img.emoji}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                <div className="text-[10px] text-white font-medium truncate">{img.name}</div>
                <div className="text-[9px] text-white/70">{img.size}</div>
              </div>
              <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg px-3 py-1.5 text-xs font-medium text-purple-700 shadow-md">
                  Insert
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Inline preview in email body */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-700 mb-2">How it appears in the email:</div>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <div className="p-4 text-sm text-slate-700 leading-relaxed">
            <p className="mb-3">Hi there! 👋</p>
            <p className="mb-3">This week we're focusing on creating a calm bedtime environment for your little one.</p>
            <div className="my-3 rounded-lg overflow-hidden aspect-[16/9] bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 flex items-center justify-center text-5xl">
              🌙
            </div>
            <p className="mb-3">Notice how soft lighting and warm tones can make all the difference...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Layout: How it integrates ----------
const ComposerLayoutMock: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
    {/* Top toolbar */}
    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50">
          <FileText className="w-3.5 h-3.5 text-purple-500" />
          Templates
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50">
          <Save className="w-3.5 h-3.5 text-blue-500" />
          Save draft
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          Schedule
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
          Image
        </button>
      </div>
      <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 shadow-sm">
        <Send className="w-3.5 h-3.5" />
        Send now
      </button>
    </div>

    {/* Mock composer fields */}
    <div className="p-5 space-y-3">
      <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-400">Subject</div>
      <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-400">Subtitle (optional)</div>
      <div className="bg-slate-50 rounded-lg px-3 py-12 text-xs text-slate-400">Body — write your newsletter here...</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-400">CTA text</div>
        <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-400">CTA URL</div>
      </div>
    </div>

    {/* Status hint */}
    <div className="px-5 py-3 border-t border-slate-100 bg-amber-50/40 flex items-center gap-2 text-xs text-amber-700">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>Draft auto-saved 2 seconds ago</span>
    </div>
  </div>
);

export default NewsletterFeaturesPreview;
