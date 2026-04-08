import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all users with push subscriptions and notification settings
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('user_id');

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscribers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uniqueUserIds = [...new Set(subscriptions.map(s => s.user_id))];
    let scheduledCount = 0;

    for (const userId of uniqueUserIds) {
      // Get user notification settings
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Use defaults if no settings
      const userSettings = settings || {
        feeding_reminders: true,
        sleep_reminders: true,
        milestone_reminders: true,
        feeding_interval: 180,
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
      };

      // Check quiet hours
      if (userSettings.quiet_hours_enabled) {
        const now = new Date();
        const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
        const startParts = String(userSettings.quiet_hours_start).split(':');
        const endParts = String(userSettings.quiet_hours_end).split(':');
        const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

        if (startMin > endMin) {
          if (currentMinutes >= startMin || currentMinutes <= endMin) continue;
        } else {
          if (currentMinutes >= startMin && currentMinutes <= endMin) continue;
        }
      }

      // Get user's baby profiles
      const { data: babies } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', userId);

      // Also check family member babies
      const { data: familyBabies } = await supabase
        .from('family_members')
        .select('baby_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      let allBabyIds = (babies || []).map(b => b.id);
      if (familyBabies) {
        allBabyIds = [...allBabyIds, ...familyBabies.map(fb => fb.baby_id)];
      }
      allBabyIds = [...new Set(allBabyIds)];

      for (const babyId of allBabyIds) {
        const baby = babies?.find(b => b.id === babyId);
        const babyName = baby?.name || 'Baby';

        // Check for existing unsent notifications to avoid duplicates
        const { data: existing } = await supabase
          .from('scheduled_notifications')
          .select('notification_type')
          .eq('user_id', userId)
          .eq('baby_id', babyId)
          .is('sent_at', null);

        const existingTypes = new Set((existing || []).map(e => e.notification_type));

        // FEEDING REMINDERS
        if (userSettings.feeding_reminders && !existingTypes.has('feeding')) {
          const { data: lastFeeding } = await supabase
            .from('baby_activities')
            .select('start_time')
            .eq('baby_id', babyId)
            .eq('activity_type', 'feeding')
            .order('start_time', { ascending: false })
            .limit(1);

          if (lastFeeding && lastFeeding.length > 0) {
            const lastTime = new Date(lastFeeding[0].start_time);
            const now = new Date();
            const minutesSince = (now.getTime() - lastTime.getTime()) / (1000 * 60);

            if (minutesSince >= userSettings.feeding_interval) {
              const hours = Math.floor(minutesSince / 60);
              const mins = Math.floor(minutesSince % 60);
              const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

              await supabase.from('scheduled_notifications').insert({
                user_id: userId,
                baby_id: babyId,
                notification_type: 'feeding',
                title: '🍼 Feeding Time!',
                body: `It's been ${timeStr} since ${babyName}'s last feeding`,
              });
              scheduledCount++;
            }
          }
        }

        // SLEEP REMINDERS
        if (userSettings.sleep_reminders && !existingTypes.has('sleep')) {
          const now = new Date();
          const currentHour = now.getUTCHours();

          // Check age-appropriate sleep windows
          let shouldRemind = false;
          let reminderType = '';

          if (baby?.birth_date) {
            const birthDate = new Date(baby.birth_date);
            const ageWeeks = Math.floor((now.getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

            if (ageWeeks <= 12 && [9, 12, 15, 18].includes(currentHour)) {
              shouldRemind = true;
              reminderType = 'nap time';
            } else if (ageWeeks <= 24 && [10, 14].includes(currentHour)) {
              shouldRemind = true;
              reminderType = 'nap time';
            } else if (ageWeeks > 24 && currentHour === 13) {
              shouldRemind = true;
              reminderType = 'nap time';
            }
          }

          if (currentHour === 19) {
            shouldRemind = true;
            reminderType = 'bedtime';
          }

          if (shouldRemind) {
            const icon = reminderType === 'bedtime' ? '🌙' : '😴';
            await supabase.from('scheduled_notifications').insert({
              user_id: userId,
              baby_id: babyId,
              notification_type: 'sleep',
              title: `${icon} Sleep Time!`,
              body: `It might be ${reminderType} for ${babyName}`,
            });
            scheduledCount++;
          }
        }

        // MILESTONE REMINDERS
        if (userSettings.milestone_reminders && !existingTypes.has('milestone') && baby?.birth_date) {
          const birthDate = new Date(baby.birth_date);
          const ageWeeks = Math.floor((new Date().getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

          const milestones: Record<number, string> = {
            2: 'First smile might appear soon! 😊',
            6: 'Baby might start sleeping longer stretches 💤',
            12: 'Time for 3-month checkup and vaccinations 🏥',
            16: 'Baby might start showing interest in solid foods 🍎',
            24: 'Time for 6-month checkup 👩‍⚕️',
            26: 'Baby might start sitting without support 👶',
            36: 'Baby might start crawling 🚼',
            52: 'Happy first birthday! Time for 1-year checkup 🎂',
          };

          if (milestones[ageWeeks]) {
            await supabase.from('scheduled_notifications').insert({
              user_id: userId,
              baby_id: babyId,
              notification_type: 'milestone',
              title: '🎯 Milestone Alert!',
              body: milestones[ageWeeks],
            });
            scheduledCount++;
          }
        }
      }
    }

    return new Response(JSON.stringify({ scheduledCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in schedule-notifications:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});