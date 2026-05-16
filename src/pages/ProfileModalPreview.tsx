import { Baby, Check, X, Settings, Sparkles, ChevronUp } from "lucide-react";

/**
 * Local-only preview for the Profile Switcher modal redesign options.
 * Open at /dev/profile-modal-preview.
 */
const ProfileModalPreview = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile switcher — 2 options</h1>
          <p className="text-gray-600">Both shown inside a phone frame to compare on mobile.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Wrapper title="Option A — Bottom Sheet (polished)" desc="Slides from bottom · best for mobile · iOS/Android native feel">
            <BottomSheetMock />
          </Wrapper>

          <Wrapper title="Option B — Centered Modal" desc="Floats in middle · classic desktop modal · feels more 'official'">
            <CenteredModalMock />
          </Wrapper>
        </div>

        <div className="text-center text-gray-600 mt-10 pb-8">
          Tell me: <span className="font-mono bg-white px-2 py-1 rounded">A</span> or <span className="font-mono bg-white px-2 py-1 rounded">B</span>
        </div>
      </div>
    </div>
  );
};

const Wrapper = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
    <div className="mx-auto bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ maxWidth: 400 }}>
      <div className="bg-white rounded-[2rem] overflow-hidden relative" style={{ height: 760 }}>
        {children}
      </div>
    </div>
  </div>
);

/* ============================================================== */
/* OPTION A — Bottom Sheet (polished)                              */
/* ============================================================== */
const BottomSheetMock = () => (
  <>
    {/* Faded dashboard behind */}
    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50">
      <div className="absolute top-20 left-5 right-5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl h-14" />
      <div className="absolute top-40 left-5 right-5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl h-12" />
      <div className="absolute top-60 left-5 right-5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl h-20" />
    </div>

    {/* Dark scrim */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    {/* Bottom sheet */}
    <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-[2rem] shadow-2xl overflow-hidden">
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="h-1.5 w-12 rounded-full bg-gray-300" />
      </div>

      {/* Header */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Switch profile</h3>
          <p className="text-xs text-gray-500 mt-0.5">4 profiles · tap one to switch</p>
        </div>
        <button className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Profile list */}
      <div className="px-5 space-y-2 pb-4 max-h-[420px] overflow-y-auto">
        <ProfileRowA name="SleepyBabyy" age="1 year, 2 months" date="7 Mar 2025" isActive />
        <ProfileRowA name="Baby 2" age="7 months" date="3 Oct 2025" />
        <ProfileRowA name="baby3" age="1 month" date="3 Apr 2026" />
        <ProfileRowA name="Test" age="3 months" date="14 Feb 2026" />
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-6 pt-2 border-t border-gray-100 bg-gradient-to-b from-white to-purple-50/30">
        <button className="w-full rounded-2xl py-3.5 px-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
          <Settings className="h-4 w-4" />
          Manage profiles
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    </div>
  </>
);

const ProfileRowA = ({ name, age, date, isActive }: { name: string; age: string; date: string; isActive?: boolean }) => (
  <button
    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
      isActive
        ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-purple-200'
        : 'bg-white border-gray-100 hover:border-purple-200'
    }`}
  >
    <div className="relative flex-shrink-0">
      {isActive && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 blur-[2px] opacity-60" />
      )}
      <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center ring-2 ring-white">
        <Baby className="h-6 w-6 text-purple-600" />
      </div>
      {isActive && (
        <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 ring-2 ring-white flex items-center justify-center">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </span>
      )}
    </div>
    <div className="flex-1 text-left min-w-0">
      <div className="flex items-center gap-1.5">
        <p className="font-bold text-sm text-gray-900 truncate">{name}</p>
        {isActive && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            Active
          </span>
        )}
      </div>
      <p className="text-xs text-purple-600 font-medium mt-0.5">{age}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{date} · Owner</p>
    </div>
  </button>
);

/* ============================================================== */
/* OPTION B — Centered Modal (Camera Focus)                        */
/* ============================================================== */
const CenteredModalMock = () => (
  <>
    {/* Dashboard behind — fully visible, will be blurred by the scrim */}
    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50">
      {/* Decorative blobs to make blur effect visible */}
      <div className="absolute top-0 left-0 w-60 h-60 rounded-full bg-pink-300/50 blur-3xl" />
      <div className="absolute top-40 right-0 w-60 h-60 rounded-full bg-purple-300/50 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-indigo-300/40 blur-3xl" />
      {/* Mock dashboard cards */}
      <div className="absolute top-16 left-5 right-5 bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl h-16 shadow-md" />
      <div className="absolute top-40 left-5 right-5 bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl h-20 shadow-md flex items-center px-4 gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-md" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-2 w-32 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="absolute top-64 left-5 right-5 bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl h-20 shadow-md flex items-center px-4 gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-2 w-28 bg-gray-100 rounded" />
        </div>
      </div>
    </div>

    {/* Camera focus scrim — gentle blur, dashboard remains clearly visible */}
    <div className="absolute inset-0 backdrop-blur-[3px] bg-white/5" />

    {/* Centered modal — sharp focus, lifted from blurred bg */}
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden"
        style={{
          boxShadow:
            '0 25px 50px -12px rgba(168, 85, 247, 0.45), 0 10px 30px -10px rgba(236, 72, 153, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Gradient header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500" />
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="relative px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Switch profile</h3>
              <p className="text-xs text-white/80 mt-0.5">4 profiles · tap to switch</p>
            </div>
            <button className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Profile list */}
        <div className="px-4 py-3 space-y-2 max-h-[380px] overflow-y-auto">
          <ProfileRowB name="SleepyBabyy" age="1 year, 2 months" date="7 Mar 2025" isActive />
          <ProfileRowB name="Baby 2" age="7 months" date="3 Oct 2025" />
          <ProfileRowB name="baby3" age="1 month" date="3 Apr 2026" />
          <ProfileRowB name="Test" age="3 months" date="14 Feb 2026" />
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <button className="w-full rounded-2xl py-3 px-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold shadow-md shadow-purple-500/30 flex items-center justify-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Manage profiles
          </button>
        </div>
      </div>
    </div>
  </>
);

const ProfileRowB = ({ name, age, date, isActive }: { name: string; age: string; date: string; isActive?: boolean }) => (
  <button
    className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all ${
      isActive
        ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-purple-200'
        : 'bg-white border-gray-100'
    }`}
  >
    <div className="relative flex-shrink-0">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center ring-1 ring-white">
        <Baby className="h-5 w-5 text-purple-600" />
      </div>
      {isActive && (
        <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 ring-2 ring-white flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        </span>
      )}
    </div>
    <div className="flex-1 text-left min-w-0">
      <div className="flex items-center gap-1.5">
        <p className="font-bold text-sm text-gray-900 truncate">{name}</p>
        {isActive && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-green-600">Active</span>
        )}
      </div>
      <p className="text-[11px] text-purple-600 font-medium">{age}</p>
      <p className="text-[10px] text-gray-500">{date}</p>
    </div>
  </button>
);

export default ProfileModalPreview;
