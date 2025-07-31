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
    "circadian-rhythms-newborns": {
      title: "Understanding Circadian Rhythms in Newborns",
      excerpt: "Discover how your baby's internal clock develops and how you can support healthy circadian rhythm establishment from birth.",
      author: "Dr. Rachel Martinez",
      date: "December 12, 2024",
      readTime: "6 min read",
      category: "Sleep Science",
      content: `
        <h2>What Are Circadian Rhythms?</h2>
        <p>Circadian rhythms are our body's internal clock that regulates sleep-wake cycles over a 24-hour period. These biological processes are controlled by a master clock in the brain called the suprachiasmatic nucleus (SCN), which responds to light and darkness signals.</p>

        <h3>How Circadian Rhythms Develop in Babies</h3>
        <p>Unlike adults who have well-established circadian rhythms, newborns are born without this internal clock fully developed. Here's how it evolves:</p>
        <ul>
          <li><strong>Birth to 6 weeks:</strong> No clear circadian rhythm exists. Babies sleep in short bursts throughout day and night</li>
          <li><strong>6-12 weeks:</strong> The first signs of rhythm begin to emerge, with slightly longer sleep periods at night</li>
          <li><strong>3-6 months:</strong> More defined patterns develop, with consolidated nighttime sleep becoming more common</li>
          <li><strong>6-12 months:</strong> Circadian rhythms become more established and predictable</li>
        </ul>

        <h2>The Science Behind Circadian Development</h2>
        <p>Several factors influence how quickly and effectively a baby's circadian rhythm develops:</p>

        <h3>Light Exposure</h3>
        <p>Light is the most powerful cue for circadian rhythm development. The SCN receives information about light and darkness through the eyes, even when they're closed. This is why:</p>
        <ul>
          <li>Bright light during the day helps establish the "awake" period</li>
          <li>Dim lighting in the evening signals it's time to prepare for sleep</li>
          <li>Complete darkness at night reinforces the sleep phase</li>
        </ul>

        <h3>Melatonin Production</h3>
        <p>Melatonin, often called the "sleep hormone," plays a crucial role in circadian rhythm regulation:</p>
        <ul>
          <li>Newborns don't produce significant amounts of melatonin initially</li>
          <li>Production begins around 2-3 months of age</li>
          <li>Peak production typically occurs between 1-3 AM</li>
          <li>Light exposure suppresses melatonin production</li>
        </ul>

        <h2>Supporting Healthy Circadian Rhythm Development</h2>

        <h3>Light Management Strategies</h3>
        <p>Help your baby's internal clock by managing light exposure:</p>
        <ul>
          <li><strong>Morning:</strong> Open curtains and expose baby to natural daylight</li>
          <li><strong>Daytime:</strong> Keep living spaces bright during awake periods</li>
          <li><strong>Evening:</strong> Dim lights 1-2 hours before bedtime</li>
          <li><strong>Night:</strong> Use minimal lighting for feeds and diaper changes</li>
        </ul>

        <h3>Consistent Daily Routines</h3>
        <p>Regular daily activities help reinforce circadian timing:</p>
        <ul>
          <li>Feed at consistent times throughout the day</li>
          <li>Establish regular wake-up and bedtime routines</li>
          <li>Create distinct differences between day and night activities</li>
          <li>Maintain consistent sleep environments</li>
        </ul>

        <h3>Temperature Regulation</h3>
        <p>Body temperature naturally fluctuates with circadian rhythms:</p>
        <ul>
          <li>Keep the nursery slightly cooler at night (68-70°F)</li>
          <li>Dress baby appropriately for the ambient temperature</li>
          <li>Avoid overheating, which can disrupt sleep</li>
        </ul>

        <h2>Common Challenges and Solutions</h2>

        <h3>Day-Night Confusion</h3>
        <p>Some babies seem to have their days and nights mixed up. To address this:</p>
        <ul>
          <li>Maximize light exposure during daytime hours</li>
          <li>Keep nighttime interactions minimal and boring</li>
          <li>Be patient - this typically resolves by 12-16 weeks</li>
          <li>Maintain consistent routines even when it feels futile</li>
        </ul>

        <h3>Premature Babies</h3>
        <p>Premature infants may take longer to develop circadian rhythms because:</p>
        <ul>
          <li>Their nervous systems are less mature</li>
          <li>They missed the final weeks of in-utero development</li>
          <li>Hospital environments often lack natural light cues</li>
          <li>Medical needs may interrupt natural sleep patterns</li>
        </ul>

        <h2>Environmental Factors That Influence Circadian Rhythms</h2>

        <h3>Seasonal Considerations</h3>
        <p>The time of year can affect circadian development:</p>
        <ul>
          <li><strong>Winter babies:</strong> May need extra light exposure due to shorter days</li>
          <li><strong>Summer babies:</strong> Benefit from longer natural light periods</li>
          <li><strong>Light therapy:</strong> Consider bright light boxes in extreme cases</li>
        </ul>

        <h3>Family Lifestyle</h3>
        <p>Your family's routine impacts your baby's rhythm development:</p>
        <ul>
          <li>Shift workers may need to be extra intentional about light cues</li>
          <li>Travel across time zones can temporarily disrupt established rhythms</li>
          <li>Siblings' schedules can provide helpful routine structure</li>
        </ul>

        <h2>Signs of Developing Circadian Rhythms</h2>
        <p>Watch for these positive indicators:</p>
        <ul>
          <li>Longer sleep stretches at night (4-6 hours)</li>
          <li>More predictable wake times</li>
          <li>Increased alertness during specific daytime periods</li>
          <li>More settled behavior in the evening</li>
          <li>Decreased confusion between day and night</li>
        </ul>

        <h2>When to Seek Professional Help</h2>
        <p>Consult your pediatrician if:</p>
        <ul>
          <li>No improvement in day-night distinction by 4 months</li>
          <li>Extreme sleep disturbances persist beyond typical newborn phase</li>
          <li>Baby seems excessively sleepy or lethargic during expected wake periods</li>
          <li>Family functioning is severely impacted by sleep issues</li>
        </ul>

        <h2>The Long-Term Benefits</h2>
        <p>Supporting healthy circadian rhythm development provides lasting benefits:</p>
        <ul>
          <li><strong>Better sleep quality:</strong> Throughout childhood and beyond</li>
          <li><strong>Improved mood regulation:</strong> More stable emotional patterns</li>
          <li><strong>Enhanced cognitive function:</strong> Better attention and learning capacity</li>
          <li><strong>Stronger immune function:</strong> Better resistance to illness</li>
          <li><strong>Healthy growth patterns:</strong> Optimal hormone production for development</li>
        </ul>

        <p>Remember, every baby develops at their own pace. While these guidelines provide a framework, trust your instincts and be patient with the process. Establishing healthy circadian rhythms is one of the best gifts you can give your baby for lifelong sleep health.</p>
      `
    },
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
          <li>Maintain consistent response patterns</li>
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
    },
    "white-noise-benefits": {
      title: "The Benefits of White Noise for Baby Sleep",
      excerpt: "Discover how different types of sound can help your baby fall asleep faster and sleep more soundly.",
      author: "Lisa Rodriguez",
      date: "December 3, 2024",
      readTime: "4 min read",
      category: "Sleep Tips",
      content: `
        <h2>Understanding White Noise and Your Baby's Sleep</h2>
        <p>White noise has become increasingly popular among parents seeking better sleep solutions for their babies. But what exactly is white noise, and how can it benefit your little one's sleep patterns?</p>

        <h3>What is White Noise?</h3>
        <p>White noise is a consistent sound that contains all frequencies at equal intensity. Think of it as a steady "shhhh" sound that masks other noises in the environment. For babies, this consistent sound can be incredibly soothing and sleep-promoting.</p>

        <h2>The Science Behind White Noise</h2>
        <p>Research shows that white noise can benefit baby sleep in several ways:</p>
        <ul>
          <li><strong>Mimics the Womb:</strong> The constant sound environment babies experience in utero is similar to white noise</li>
          <li><strong>Masks Disruptive Sounds:</strong> Helps block out household noises, traffic, or other disturbances</li>
          <li><strong>Triggers Sleep Associations:</strong> Becomes a consistent cue that signals sleep time</li>
          <li><strong>Reduces Startle Reflex:</strong> The consistent sound can help minimize the Moro reflex that often wakes babies</li>
        </ul>

        <h2>Types of Sleep Sounds</h2>
        <p>While white noise is most common, there are several types of beneficial sounds for baby sleep:</p>

        <h3>White Noise</h3>
        <p>The classic "shhhh" sound or static-like noise that's consistent across all frequencies.</p>

        <h3>Pink Noise</h3>
        <p>A deeper, more balanced sound like rainfall or ocean waves. Some studies suggest pink noise may be even more effective than white noise.</p>

        <h3>Brown Noise</h3>
        <p>An even deeper, rumbling sound similar to thunder or a waterfall.</p>

        <h3>Nature Sounds</h3>
        <p>Gentle sounds like rain, ocean waves, or forest ambiance can be very soothing for some babies.</p>

        <h2>Best Practices for Using White Noise</h2>

        <h3>Volume Guidelines</h3>
        <p>Keep the volume at a safe level - around 50 decibels (about as loud as a quiet conversation). The sound should be audible but not overwhelming.</p>

        <h3>Placement Tips</h3>
        <ul>
          <li>Place the sound machine across the room, not directly next to your baby's crib</li>
          <li>Ensure the device is out of reach of curious little hands</li>
          <li>Consider portable options for travel and consistency</li>
        </ul>

        <h3>Timing Considerations</h3>
        <p>You can run white noise throughout the entire sleep period, including naps and nighttime sleep. Many babies benefit from having it on continuously during sleep times.</p>

        <h2>Choosing the Right White Noise Machine</h2>
        <p>When selecting a white noise machine for your baby, consider:</p>
        <ul>
          <li><strong>Sound Quality:</strong> Look for machines that produce true white noise, not looped recordings</li>
          <li><strong>Volume Control:</strong> Ensure you can adjust the volume to appropriate levels</li>
          <li><strong>Timer Options:</strong> Some parents prefer machines with auto-shut-off timers</li>
          <li><strong>Portability:</strong> Consider whether you need something travel-friendly</li>
          <li><strong>Additional Features:</strong> Some machines offer multiple sound options, nightlights, or app connectivity</li>
        </ul>

        <h2>Safety Considerations</h2>
        <p>While white noise is generally safe when used properly, keep these safety tips in mind:</p>
        <ul>
          <li>Never exceed 50 decibels in volume</li>
          <li>Place the machine at least 7 feet away from your baby's crib</li>
          <li>Ensure the device is secure and cannot fall into the crib</li>
          <li>Choose machines with automatic shut-off features for added safety</li>
        </ul>

        <h2>Common Concerns and Solutions</h2>

        <h3>"Will My Baby Become Dependent on White Noise?"</h3>
        <p>While some babies do become accustomed to white noise, this isn't necessarily problematic. If you're concerned about dependency, you can gradually reduce the volume over time.</p>

        <h3>"What If We're Traveling?"</h3>
        <p>Portable white noise machines or smartphone apps can help maintain consistency when away from home.</p>

        <p>White noise can be a valuable tool in your baby's sleep toolkit. When used safely and consistently, it can help create a more peaceful sleep environment for the whole family.</p>
      `
    },
    "consult-sleep-specialist": {
      title: "When to Consult a Pediatric Sleep Specialist",
      excerpt: "Learn the warning signs that indicate it might be time to seek professional help for your baby's sleep issues.",
      author: "Dr. Jennifer Kim",
      date: "November 30, 2024",
      readTime: "6 min read",
      category: "Medical",
      content: `
        <h2>Recognizing When Professional Help is Needed</h2>
        <p>While many sleep challenges are normal parts of infant development, some situations warrant professional evaluation. Understanding when to seek help from a pediatric sleep specialist can make a significant difference in your family's wellbeing.</p>

        <h2>Red Flag Signs That Require Immediate Attention</h2>
        <p>Contact a pediatric sleep specialist immediately if you notice:</p>

        <h3>Breathing-Related Concerns</h3>
        <ul>
          <li><strong>Sleep Apnea Signs:</strong> Pauses in breathing during sleep, gasping, or choking sounds</li>
          <li><strong>Loud Snoring:</strong> Persistent, loud snoring in infants (unusual for babies under 2)</li>
          <li><strong>Blue Coloring:</strong> Any blue tint around lips or face during sleep</li>
          <li><strong>Restless Sleep:</strong> Constant movement or inability to stay asleep due to breathing issues</li>
        </ul>

        <h3>Severe Sleep Disruptions</h3>
        <ul>
          <li><strong>Chronic Insomnia:</strong> Consistent inability to fall asleep after 6 months of age</li>
          <li><strong>Frequent Night Terrors:</strong> Intense crying episodes during sleep that don't respond to comfort</li>
          <li><strong>Extreme Sleep Resistance:</strong> Persistent refusal to sleep despite appropriate routines</li>
        </ul>

        <h2>Developmental and Behavioral Concerns</h2>
        
        <h3>When Sleep Issues Affect Development</h3>
        <p>Consider professional help if sleep problems are impacting:</p>
        <ul>
          <li><strong>Growth Patterns:</strong> Falling off growth curves or failure to thrive</li>
          <li><strong>Cognitive Development:</strong> Delays in reaching developmental milestones</li>
          <li><strong>Behavioral Issues:</strong> Extreme irritability, aggression, or mood changes</li>
          <li><strong>Feeding Problems:</strong> Difficulty eating due to exhaustion</li>
        </ul>

        <h3>Family Impact Indicators</h3>
        <p>Seek help when sleep issues significantly affect:</p>
        <ul>
          <li>Parental mental health and wellbeing</li>
          <li>Family relationships and functioning</li>
          <li>Parents' ability to work or care for other children</li>
          <li>Overall family safety due to exhaustion</li>
        </ul>

        <h2>Age-Specific Concerns</h2>

        <h3>Newborns (0-3 months)</h3>
        <p>While frequent waking is normal, consult a specialist if:</p>
        <ul>
          <li>Your baby sleeps less than 8 hours total in 24 hours</li>
          <li>Extreme difficulty staying asleep even for short periods</li>
          <li>Signs of colic that don't improve with standard interventions</li>
        </ul>

        <h3>Older Infants (4-12 months)</h3>
        <p>Consider professional help for:</p>
        <ul>
          <li>Inability to sleep for 3-4 hour stretches by 6 months</li>
          <li>Regression in sleep skills that lasts more than 4 weeks</li>
          <li>Complete resistance to sleep training methods</li>
        </ul>

        <h3>Toddlers (12+ months)</h3>
        <p>Red flags include:</p>
        <ul>
          <li>Persistent bedtime battles lasting hours</li>
          <li>Frequent nightmares or night terrors</li>
          <li>Early morning wakings (before 5 AM) that resist schedule adjustments</li>
        </ul>

        <h2>Medical Conditions That Affect Sleep</h2>
        <p>Certain medical conditions may require specialized sleep intervention:</p>
        <ul>
          <li><strong>Reflux:</strong> Severe GERD that disrupts sleep despite treatment</li>
          <li><strong>Allergies:</strong> Environmental or food allergies causing sleep disruption</li>
          <li><strong>Neurological Conditions:</strong> Any diagnosed neurological issues</li>
          <li><strong>Respiratory Issues:</strong> Chronic congestion, asthma, or breathing problems</li>
        </ul>

        <h2>What to Expect from a Pediatric Sleep Specialist</h2>

        <h3>Initial Consultation</h3>
        <p>Your specialist will likely:</p>
        <ul>
          <li>Review detailed sleep history and patterns</li>
          <li>Examine your child's medical history</li>
          <li>Assess current sleep environment and routines</li>
          <li>Rule out underlying medical conditions</li>
        </ul>

        <h3>Diagnostic Tools</h3>
        <p>Depending on concerns, they may recommend:</p>
        <ul>
          <li><strong>Sleep Study:</strong> Overnight monitoring in a sleep lab</li>
          <li><strong>Sleep Diary:</strong> Detailed tracking of sleep patterns at home</li>
          <li><strong>Medical Tests:</strong> Blood work or other tests to rule out medical issues</li>
        </ul>

        <h3>Treatment Plans</h3>
        <p>Treatment may include:</p>
        <ul>
          <li>Customized sleep training approaches</li>
          <li>Environmental modifications</li>
          <li>Medical interventions if needed</li>
          <li>Family support and counseling</li>
        </ul>

        <h2>Preparing for Your Appointment</h2>
        <p>To make the most of your consultation:</p>

        <h3>Document Everything</h3>
        <ul>
          <li>Keep a detailed sleep log for 1-2 weeks before your appointment</li>
          <li>Note feeding times, nap schedules, and bedtime routines</li>
          <li>Record any concerning behaviors or symptoms</li>
        </ul>

        <h3>Prepare Questions</h3>
        <ul>
          <li>What could be causing these sleep issues?</li>
          <li>Are there any medical concerns to rule out?</li>
          <li>What treatment options are available?</li>
          <li>How long should we expect treatment to take?</li>
        </ul>

        <h2>Finding the Right Specialist</h2>
        <p>When choosing a pediatric sleep specialist:</p>
        <ul>
          <li>Look for board certification in sleep medicine</li>
          <li>Seek specialists with pediatric experience</li>
          <li>Ask for referrals from your pediatrician</li>
          <li>Consider their approach and treatment philosophy</li>
        </ul>

        <p>Remember, seeking help for persistent sleep issues is not a sign of failure as a parent. Professional guidance can provide the tools and support needed to help your entire family get the rest you need and deserve.</p>
      `
    },
    "co-parenting-night-duties": {
      title: "Co-Parenting Night Duties: Strategies That Actually Work",
      excerpt: "Practical tips for sharing nighttime responsibilities fairly and effectively between partners.",
      author: "Mark Thompson",
      date: "November 28, 2024",
      readTime: "5 min read",
      category: "Parenting",
      content: `
        <h2>The Importance of Sharing Night Duties</h2>
        <p>Nighttime parenting responsibilities can be overwhelming when shouldered by one person alone. Effective co-parenting during night hours not only ensures better care for your baby but also protects both parents' mental and physical health.</p>

        <h2>Understanding Each Parent's Needs</h2>
        <p>Before establishing a night routine, it's crucial to understand that each parent may have different:</p>
        <ul>
          <li><strong>Sleep Patterns:</strong> Some people are natural night owls, others are early birds</li>
          <li><strong>Work Schedules:</strong> Consider who has early meetings or demanding days</li>
          <li><strong>Physical Recovery:</strong> Birthing parents may need additional rest initially</li>
          <li><strong>Stress Tolerance:</strong> Some handle sleep deprivation better than others</li>
        </ul>

        <h2>Effective Night Duty Strategies</h2>

        <h3>The Shift System</h3>
        <p>Divide the night into shifts, allowing each parent uninterrupted sleep blocks:</p>
        <ul>
          <li><strong>Early Shift (7 PM - 1 AM):</strong> One parent handles bedtime and early night wakings</li>
          <li><strong>Late Shift (1 AM - 7 AM):</strong> Other parent takes over for the rest of the night</li>
          <li><strong>Benefits:</strong> Each parent gets a guaranteed 6-hour sleep block</li>
        </ul>

        <h3>The Alternating Nights Approach</h3>
        <p>Take turns being the "on-duty" parent for entire nights:</p>
        <ul>
          <li>One parent handles all night duties on their assigned nights</li>
          <li>The other parent gets completely uninterrupted sleep</li>
          <li>Switch every other night or every few nights</li>
          <li>Best for families with unpredictable wake patterns</li>
        </ul>

        <h3>The Skills-Based Division</h3>
        <p>Assign duties based on each parent's strengths:</p>
        <ul>
          <li><strong>Feeding Parent:</strong> Handles milk/formula preparation and feeding</li>
          <li><strong>Comfort Parent:</strong> Manages diaper changes, soothing, and settling</li>
          <li><strong>Tag Team:</strong> Work together but with defined roles</li>
        </ul>

        <h2>Special Considerations for Breastfeeding Families</h2>

        <h3>Creative Solutions</h3>
        <p>Even when breastfeeding, the non-breastfeeding parent can contribute:</p>
        <ul>
          <li><strong>Diaper Duty:</strong> Handle all diaper changes during night feedings</li>
          <li><strong>Burp and Settle:</strong> Take over after feeding to burp and put baby back to sleep</li>
          <li><strong>Pump Support:</strong> Handle pumped milk or formula for some feeds</li>
          <li><strong>Morning Shift:</strong> Take over early morning duties so the breastfeeding parent can sleep in</li>
        </ul>

        <h3>The Breastfeeding Support System</h3>
        <ul>
          <li>Non-breastfeeding parent brings baby to bed for feeds</li>
          <li>Handles all settling and diaper changes</li>
          <li>Takes over if baby won't settle after feeding</li>
          <li>Manages older children's nighttime needs</li>
        </ul>

        <h2>Communication Strategies</h2>

        <h3>Establish Clear Agreements</h3>
        <p>Before sleep deprivation sets in, agree on:</p>
        <ul>
          <li><strong>Duty Distribution:</strong> Who does what and when</li>
          <li><strong>Emergency Protocols:</strong> When to wake the "off-duty" parent</li>
          <li><strong>Schedule Flexibility:</strong> How to handle changes due to illness or work</li>
          <li><strong>Review Periods:</strong> Regular check-ins to adjust the system</li>
        </ul>

        <h3>Middle-of-the-Night Communication</h3>
        <ul>
          <li>Use quiet signals to indicate when help is needed</li>
          <li>Avoid detailed conversations during night duties</li>
          <li>Save discussions for daytime when both are alert</li>
          <li>Use apps or notes to track feeding times and patterns</li>
        </ul>

        <h2>Practical Tools and Tips</h2>

        <h3>Environmental Setup</h3>
        <ul>
          <li><strong>Separate Sleep Spaces:</strong> Consider temporarily sleeping in different rooms</li>
          <li><strong>Baby Stations:</strong> Set up changing and feeding stations in multiple rooms</li>
          <li><strong>Red Light:</strong> Use red nightlights to preserve night vision</li>
          <li><strong>White Noise:</strong> Machines in each room to mask sounds</li>
        </ul>

        <h3>Technology Helpers</h3>
        <ul>
          <li><strong>Baby Monitors:</strong> Allow the off-duty parent to sleep elsewhere</li>
          <li><strong>Apps:</strong> Track feedings, diapers, and sleep patterns</li>
          <li><strong>Smart Watches:</strong> Silent alarms for shift changes</li>
          <li><strong>Meal Prep:</strong> Pre-made snacks and drinks for night duties</li>
        </ul>

        <h2>Handling Challenges</h2>

        <h3>When One Parent Does More</h3>
        <p>If the division feels unequal:</p>
        <ul>
          <li>Track duties objectively for a week</li>
          <li>Discuss specific concerns without blame</li>
          <li>Consider non-night ways to balance responsibilities</li>
          <li>Acknowledge that equal doesn't always mean identical</li>
        </ul>

        <h3>Dealing with Resentment</h3>
        <ul>
          <li>Regular appreciation expressions</li>
          <li>Acknowledgment of each other's contributions</li>
          <li>Scheduled breaks for each parent</li>
          <li>Professional support if needed</li>
        </ul>

        <h2>Adjusting the System</h2>
        <p>Your night duty system should evolve as:</p>
        <ul>
          <li><strong>Baby's Sleep Patterns Change:</strong> Longer stretches mean different strategies</li>
          <li><strong>Work Schedules Shift:</strong> New jobs or schedules require adjustments</li>
          <li><strong>Additional Children:</strong> More kids mean more complex logistics</li>
          <li><strong>Health Changes:</strong> Illness or stress may temporarily alter arrangements</li>
        </ul>

        <h2>Self-Care for Both Parents</h2>
        <p>Remember that taking care of yourselves is essential:</p>
        <ul>
          <li>Schedule individual downtime</li>
          <li>Maintain some personal routines</li>
          <li>Ask for help from family and friends</li>
          <li>Consider professional support when needed</li>
        </ul>

        <p>Effective co-parenting during nighttime hours requires patience, communication, and flexibility. The goal isn't perfect equality but rather a sustainable system that supports your baby's needs while preserving both parents' wellbeing. Remember, this phase is temporary, and finding what works for your family is more important than following any prescribed formula.</p>
      `
    },
    "sleep-data-understanding": {
      title: "Understanding Your Baby's Sleep Data: Making Sense of the Numbers",
      excerpt: "How to interpret sleep tracking data to make informed decisions about your baby's sleep schedule.",
      author: "Anna Phillips",
      date: "November 25, 2024",
      readTime: "8 min read",
      category: "Data & Analytics",
      content: `
        <h2>The Power of Sleep Data</h2>
        <p>In today's digital age, many parents have access to detailed sleep tracking data through apps, wearables, and smart monitors. But raw numbers alone don't tell the whole story. Understanding how to interpret and act on this data can transform your approach to your baby's sleep health.</p>

        <h2>Key Sleep Metrics to Track</h2>

        <h3>Total Sleep Duration</h3>
        <p>This includes both nighttime sleep and daytime naps:</p>
        <ul>
          <li><strong>Newborns (0-3 months):</strong> 14-17 hours per day</li>
          <li><strong>Infants (4-11 months):</strong> 12-15 hours per day</li>
          <li><strong>Toddlers (1-2 years):</strong> 11-14 hours per day</li>
        </ul>
        <p><em>Remember:</em> These are averages. Some babies naturally need more or less sleep.</p>

        <h3>Sleep Efficiency</h3>
        <p>This measures the percentage of time spent actually sleeping versus time spent in bed:</p>
        <ul>
          <li><strong>Good Efficiency:</strong> 85% or higher</li>
          <li><strong>Fair Efficiency:</strong> 75-84%</li>
          <li><strong>Poor Efficiency:</strong> Below 75%</li>
        </ul>

        <h3>Number of Night Wakings</h3>
        <p>Track how many times your baby wakes during the night:</p>
        <ul>
          <li><strong>Newborns:</strong> 2-6 wakings are normal</li>
          <li><strong>3-6 months:</strong> 1-3 wakings are typical</li>
          <li><strong>6+ months:</strong> 0-2 wakings are expected</li>
        </ul>

        <h3>Time to Fall Asleep</h3>
        <p>Also called "sleep onset latency":</p>
        <ul>
          <li><strong>Healthy Range:</strong> 10-20 minutes for babies</li>
          <li><strong>Concerning:</strong> Consistently over 30 minutes</li>
          <li><strong>Too Fast:</strong> Under 5 minutes may indicate overtiredness</li>
        </ul>

        <h2>Understanding Sleep Patterns</h2>

        <h3>Circadian Rhythm Development</h3>
        <p>Your data should show:</p>
        <ul>
          <li><strong>0-6 weeks:</strong> Irregular patterns, no clear day/night distinction</li>
          <li><strong>6-12 weeks:</strong> Longer sleep stretches begin to emerge at night</li>
          <li><strong>3-6 months:</strong> More predictable patterns, longer nighttime sleep</li>
          <li><strong>6+ months:</strong> Established circadian rhythms</li>
        </ul>

        <h3>Sleep Cycle Patterns</h3>
        <p>Look for:</p>
        <ul>
          <li><strong>Cycle Length:</strong> Gradually increasing from 50-60 minutes to 90 minutes</li>
          <li><strong>Deep Sleep Periods:</strong> Longer stretches without movement or awakening</li>
          <li><strong>REM Sleep:</strong> Periods of movement and dreaming (normal and healthy)</li>
        </ul>

        <h2>Analyzing Your Data Effectively</h2>

        <h3>Look for Trends, Not Single Nights</h3>
        <p>Focus on patterns over 7-14 days rather than individual nights:</p>
        <ul>
          <li>Calculate weekly averages for total sleep</li>
          <li>Note patterns in wake times and bedtimes</li>
          <li>Track improvement or regression trends</li>
          <li>Identify days of the week with different patterns</li>
        </ul>

        <h3>Context is Everything</h3>
        <p>Always consider external factors:</p>
        <ul>
          <li><strong>Growth Spurts:</strong> May cause temporary sleep disruption</li>
          <li><strong>Illness:</strong> Can significantly alter sleep patterns</li>
          <li><strong>Schedule Changes:</strong> Travel, daycare, or routine changes</li>
          <li><strong>Developmental Milestones:</strong> Learning new skills often disrupts sleep</li>
        </ul>

        <h2>Common Data Interpretation Mistakes</h2>

        <h3>Over-Reacting to Single Bad Nights</h3>
        <p>One poor night doesn't indicate a problem. Look for sustained patterns instead.</p>

        <h3>Comparing to Other Babies</h3>
        <p>Every baby is unique. Use age-appropriate ranges as guides, not strict rules.</p>

        <h3>Ignoring Daytime Sleep</h3>
        <p>Daytime naps directly impact nighttime sleep. Track both for the complete picture.</p>

        <h3>Focusing Only on Quantity</h3>
        <p>Sleep quality is as important as quantity. A baby who sleeps 10 hours soundly may be better rested than one who sleeps 12 hours with frequent wakings.</p>

        <h2>Using Data to Optimize Sleep</h2>

        <h3>Identifying Optimal Bedtime</h3>
        <p>Use your data to find the "sweet spot":</p>
        <ul>
          <li>Compare sleep onset times with different bedtimes</li>
          <li>Note which bedtimes result in longer sleep stretches</li>
          <li>Track mood and behavior the next day</li>
          <li>Adjust gradually (15-minute increments)</li>
        </ul>

        <h3>Perfecting Nap Timing</h3>
        <p>Data can help optimize nap schedules:</p>
        <ul>
          <li><strong>Wake Windows:</strong> Track time between sleep periods</li>
          <li><strong>Nap Duration:</strong> Find the ideal length for your baby</li>
          <li><strong>Last Nap Timing:</strong> Ensure it doesn't interfere with bedtime</li>
        </ul>

        <h2>Red Flags in Your Data</h2>
        <p>Consult your pediatrician if you consistently see:</p>
        <ul>
          <li><strong>Total Sleep:</strong> Significantly below age-appropriate ranges</li>
          <li><strong>Frequent Wakings:</strong> More than expected for age with no improvement</li>
          <li><strong>Very Long Sleep Onset:</strong> Consistently over 45 minutes to fall asleep</li>
          <li><strong>Irregular Patterns:</strong> No discernible routine after 4-6 months</li>
          <li><strong>Daytime Impact:</strong> Excessive fussiness or developmental concerns</li>
        </ul>

        <h2>Tools for Data Collection</h2>

        <h3>Manual Tracking</h3>
        <ul>
          <li><strong>Sleep Diaries:</strong> Simple pen and paper logs</li>
          <li><strong>Apps:</strong> User-friendly mobile applications</li>
          <li><strong>Benefits:</strong> Complete control, detailed notes possible</li>
          <li><strong>Drawbacks:</strong> Requires consistency, potential for human error</li>
        </ul>

        <h3>Automated Tracking</h3>
        <ul>
          <li><strong>Smart Monitors:</strong> Camera-based sleep tracking</li>
          <li><strong>Wearable Devices:</strong> Baby-safe sleep monitors</li>
          <li><strong>Benefits:</strong> Accurate, consistent data collection</li>
          <li><strong>Drawbacks:</strong> Cost, potential technical issues</li>
        </ul>

        <h2>Making Data-Driven Decisions</h2>

        <h3>The Scientific Approach</h3>
        <ol>
          <li><strong>Establish Baseline:</strong> Track current patterns for 1-2 weeks</li>
          <li><strong>Identify Issues:</strong> What needs improvement?</li>
          <li><strong>Make One Change:</strong> Adjust only one variable at a time</li>
          <li><strong>Monitor Results:</strong> Track for another 1-2 weeks</li>
          <li><strong>Evaluate:</strong> Did the change help or hurt?</li>
          <li><strong>Adjust Accordingly:</strong> Keep, modify, or reverse the change</li>
        </ol>

        <h3>Sample Changes to Test</h3>
        <ul>
          <li>Adjusting bedtime by 15-30 minutes</li>
          <li>Modifying nap timing or duration</li>
          <li>Changing the bedtime routine</li>
          <li>Altering the sleep environment</li>
        </ul>

        <h2>Beyond the Numbers</h2>
        <p>While data is valuable, remember to also consider:</p>
        <ul>
          <li><strong>Your Baby's Mood:</strong> Happy, alert babies may need less sleep than average</li>
          <li><strong>Family Lifestyle:</strong> Your schedule and needs matter too</li>
          <li><strong>Developmental Appropriateness:</strong> Some sleep challenges are normal phases</li>
          <li><strong>Individual Variation:</strong> Your baby's unique temperament and needs</li>
        </ul>

        <h2>Creating Actionable Reports</h2>
        <p>Turn your data into useful insights:</p>
        <ul>
          <li><strong>Weekly Summaries:</strong> Average sleep duration, efficiency, and wake times</li>
          <li><strong>Trend Analysis:</strong> Are things improving, worsening, or stable?</li>
          <li><strong>Correlation Notes:</strong> What environmental factors affect sleep?</li>
          <li><strong>Goal Setting:</strong> Specific, measurable improvements to work toward</li>
        </ul>

        <p>Remember, sleep data is a tool to help you understand your baby's patterns and make informed decisions. The numbers should support your parenting, not create additional stress. Use this information as a guide, but always trust your instincts and consider your baby's individual needs alongside the data.</p>
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
