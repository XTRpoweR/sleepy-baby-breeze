import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Brain, Save, Plus, X, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminRole } from '@/hooks/useAdminRole';
import { format } from 'date-fns';

interface Plan {
  key: string;
  name: string;
  price: number;
  interval: string;
  equivalent_per_month?: number;
  badge?: string;
  highlights: string[];
}

interface Pricing {
  currency: string;
  billing_note: string;
  plans: Plan[];
  trial_available: boolean;
}

interface KnowledgeRow {
  pricing: Pricing;
  features: string[];
  latest_news: string;
  extra_notes: string;
  updated_at: string;
}

const AdminKnowledge = () => {
  const { isCeo, role, loading: roleLoading } = useAdminRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState<Pricing>({
    currency: 'USD',
    billing_note: '',
    plans: [],
    trial_available: true,
  });
  const [features, setFeatures] = useState<string[]>([]);
  const [latestNews, setLatestNews] = useState('');
  const [extraNotes, setExtraNotes] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('app_knowledge' as any)
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (!error && data) {
        const row = data as unknown as KnowledgeRow;
        setPricing(row.pricing);
        setFeatures(row.features || []);
        setLatestNews(row.latest_news || '');
        setExtraNotes(row.extra_notes || '');
        setUpdatedAt(row.updated_at);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('app_knowledge' as any)
      .update({
        pricing,
        features,
        latest_news: latestNews,
        extra_notes: extraNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    setSaving(false);
    if (error) {
      toast.error(error.message || 'Failed to save');
      return;
    }
    toast.success('Knowledge saved — AI Assistant will use the new info immediately');
    setUpdatedAt(new Date().toISOString());
  };

  const updatePlan = (idx: number, patch: Partial<Plan>) => {
    setPricing((p) => ({
      ...p,
      plans: p.plans.map((plan, i) => (i === idx ? { ...plan, ...patch } : plan)),
    }));
  };

  const addPlan = () => {
    setPricing((p) => ({
      ...p,
      plans: [
        ...p.plans,
        { key: 'new', name: 'New plan', price: 0, interval: 'month', highlights: [] },
      ],
    }));
  };

  const removePlan = (idx: number) => {
    setPricing((p) => ({ ...p, plans: p.plans.filter((_, i) => i !== idx) }));
  };

  const updatePlanHighlight = (planIdx: number, hIdx: number, value: string) => {
    setPricing((p) => ({
      ...p,
      plans: p.plans.map((plan, i) =>
        i === planIdx
          ? { ...plan, highlights: plan.highlights.map((h, j) => (j === hIdx ? value : h)) }
          : plan,
      ),
    }));
  };

  const addPlanHighlight = (planIdx: number) => {
    setPricing((p) => ({
      ...p,
      plans: p.plans.map((plan, i) =>
        i === planIdx ? { ...plan, highlights: [...plan.highlights, ''] } : plan,
      ),
    }));
  };

  const removePlanHighlight = (planIdx: number, hIdx: number) => {
    setPricing((p) => ({
      ...p,
      plans: p.plans.map((plan, i) =>
        i === planIdx
          ? { ...plan, highlights: plan.highlights.filter((_, j) => j !== hIdx) }
          : plan,
      ),
    }));
  };

  if (!roleLoading && !isCeo) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto pt-8">
          <Card className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">CEO only</h2>
            <p className="text-sm text-muted-foreground">
              As a <strong>{role || 'guest'}</strong> you can't edit the AI Assistant's
              knowledge base. Only the CEO has access to this section.
            </p>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Brain className="h-7 w-7 text-purple-600" />
              AI Knowledge Base
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              The AI Assistant reads these values on every chat. Edits apply immediately — no
              redeploy needed.
            </p>
            {updatedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {format(new Date(updatedAt), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {loading ? (
          <Card className="p-12 text-center text-muted-foreground">Loading...</Card>
        ) : (
          <>
            {/* Pricing */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Pricing</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Currency</Label>
                  <Input
                    value={pricing.currency}
                    onChange={(e) => setPricing({ ...pricing, currency: e.target.value })}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pricing.trial_available}
                      onChange={(e) =>
                        setPricing({ ...pricing, trial_available: e.target.checked })
                      }
                    />
                    Free trial available
                  </label>
                </div>
              </div>
              <div>
                <Label className="text-xs">Billing note (shown to users)</Label>
                <Textarea
                  rows={2}
                  value={pricing.billing_note}
                  onChange={(e) => setPricing({ ...pricing, billing_note: e.target.value })}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Plans</h3>
                  <Button variant="outline" size="sm" onClick={addPlan}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add plan
                  </Button>
                </div>

                {pricing.plans.map((plan, idx) => (
                  <Card key={idx} className="p-4 bg-muted/30 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">Key</Label>
                        <Input
                          value={plan.key}
                          onChange={(e) => updatePlan(idx, { key: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={plan.name}
                          onChange={(e) => updatePlan(idx, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price ({pricing.currency})</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={plan.price}
                          onChange={(e) =>
                            updatePlan(idx, { price: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Interval</Label>
                        <Input
                          value={plan.interval}
                          onChange={(e) => updatePlan(idx, { interval: e.target.value })}
                          placeholder="month / year / 3 months"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Badge (optional)</Label>
                        <Input
                          value={plan.badge || ''}
                          onChange={(e) => updatePlan(idx, { badge: e.target.value })}
                          placeholder="e.g. Most Popular"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">~/month equiv (optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={plan.equivalent_per_month ?? ''}
                          onChange={(e) =>
                            updatePlan(idx, {
                              equivalent_per_month: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs">Highlights</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addPlanHighlight(idx)}
                          className="h-6 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {plan.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-1">
                            <Input
                              value={h}
                              onChange={(e) => updatePlanHighlight(idx, hIdx, e.target.value)}
                            />
                            <button
                              onClick={() => removePlanHighlight(idx, hIdx)}
                              className="p-1 text-muted-foreground hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlan(idx)}
                        className="text-red-500 hover:text-red-600 h-7 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" /> Remove plan
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Features */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">App features</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeatures([...features, ''])}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add feature
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                One feature per line. The AI mentions these when users ask "what can your app do".
              </p>
              <div className="space-y-1.5">
                {features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Input
                      value={f}
                      onChange={(e) =>
                        setFeatures(features.map((v, i) => (i === idx ? e.target.value : v)))
                      }
                    />
                    <button
                      onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                      className="p-1 text-muted-foreground hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Latest news */}
            <Card className="p-6 space-y-2">
              <h2 className="text-lg font-semibold">Latest news / announcements</h2>
              <p className="text-xs text-muted-foreground">
                Anything new the AI should proactively mention (price changes, new features,
                promotions).
              </p>
              <Textarea
                rows={4}
                value={latestNews}
                onChange={(e) => setLatestNews(e.target.value)}
                placeholder="e.g. We just launched photo memories — premium users get unlimited storage..."
              />
            </Card>

            {/* Extra notes */}
            <Card className="p-6 space-y-2">
              <h2 className="text-lg font-semibold">Extra notes for the AI</h2>
              <p className="text-xs text-muted-foreground">
                Background context, FAQ answers, or anything the AI should know but isn't a
                feature or price.
              </p>
              <Textarea
                rows={6}
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
              />
            </Card>

            <div className="flex justify-end pb-8">
              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminKnowledge;
