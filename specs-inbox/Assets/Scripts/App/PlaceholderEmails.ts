// Fictional demo inbox data used when AppController.usePlaceholderData is enabled.
//
// Keeping this in a separate file makes the demo data easy to review or replace.

import { EmailData } from '../Models/EmailData';

export const PLACEHOLDER_EMAILS: EmailData[] = [
  {
    id: 'placeholder-spam-001',
    subject: ' ✨ Your early access code expires tonight ✨',
    from: 'Luma Closet <offers@lumacloset.example>',
    date: 'Mon, 29 Jun 2026 9:12 AM',
    snippet: 'Use code GLOW25 by midnight for 25% off your saved summer picks.',
    body: `Hi there,

Your early access code GLOW25 is active until midnight. We saved the linen jacket, travel tote, and sandal set from your cart so you can check out quickly.

Order by 6 PM for free two-day shipping.

Luma Closet Rewards`,
  },
  {
    id: 'placeholder-social-003',
    subject: 'Facebook: Maya tagged you in 3 photos from Saturday',
    from: 'Facebook <notification@facebook.example>',
    date: 'Sun, 28 Jun 2026 4:41 PM',
    snippet: 'Maya added you to photos from Echo Park. Review tags before they appear on your profile.',
    body: `Maya tagged you in 3 new photos from Saturday at Echo Park.

You can review each tag before it appears on your profile. People in the album are already reacting to the sunset shot and the group photo near the mural.

Facebook`,
  },
  {
    id: 'placeholder-work-009',
    subject: 'Legal review: talent likeness language',
    from: 'Sasha Kim <sasha.kim@brightpath.example>',
    date: 'Thu, 25 Jun 2026 4:48 PM',
    snippet: 'Please avoid using the actor likeness placeholder in external recordings until approval.',
    body: `Hi team,

Legal is still reviewing the talent likeness language for the entertainment campaign. Please avoid using the actor likeness placeholder in external recordings until approval comes through.

Generic silhouettes and approved key art are fine for internal demo captures.

Sasha`,
  },
  {
    id: 'placeholder-social-004',
    subject: 'YouTube: Your latest Short has new comments',
    from: 'YouTube <noreply@youtube.example>',
    date: 'Sun, 28 Jun 2026 1:12 PM',
    snippet: 'Viewers are asking how you made the floating billboard effect.',
    body: `Your latest Short has 18 new comments.

Several viewers are asking how you made the floating billboard effect and whether the tutorial project file will be available.

Open YouTube Studio to reply and review performance.

YouTube`,
  },
  {
    id: 'placeholder-spam-004',
    subject: 'Congratulations 🎉 your reward balance increased',
    from: 'PrizePilot <rewards@prizepilot.example>',
    date: 'Sun, 28 Jun 2026 2:18 PM',
    snippet: 'Claim 8,500 bonus points before your promotional balance resets.',
    body: `Congratulations,

Your PrizePilot promotional balance has increased by 8,500 points. Confirm your reward preference today so we can match you with bonus offers from nearby partners.

This promotional balance expires soon.

PrizePilot Rewards Team`,
  },
  {
    id: 'placeholder-work-006',
    subject: 'XR pitch deck needs one more interaction concept',
    from: 'Marcus Hill <marcus.hill@northstar-labs.example>',
    date: 'Sat, 27 Jun 2026 3:27 PM',
    snippet: 'Can you add a lightweight fan participation mechanic for the studio pitch?',
    body: `Hey,

Can you add one more interaction concept to the XR pitch deck? The studio asked for a lightweight fan participation mechanic that can work in a lobby, at home, or inside a social camera effect.

A simple voting or collectible moment would be enough.

Marcus`,
  },
  {
    id: 'placeholder-spam-005',
    subject: 'Last chance: mystery tech bundle for $19',
    from: 'GadgetDrop Deals <deals@gadgetdrop.example>',
    date: 'Sat, 27 Jun 2026 8:54 PM',
    snippet: 'Today only: wireless accessories, travel chargers, and surprise add-ons.',
    body: `Your mystery tech bundle is waiting.

For $19, you could receive wireless accessories, travel chargers, phone stands, and surprise add-ons from our warehouse closeout event.

Quantities are limited and selections vary by region.

GadgetDrop Deals`,
  },
  {
    id: 'placeholder-spam-006',
    subject: 'Action required invoice payment failed',
    from: 'QuickBill Support <support@quickbill-alerts.example>',
    date: 'Sat, 27 Jun 2026 11:22 AM',
    snippet: 'We could not process invoice QB-6631. Update payment details to avoid interruption.',
    body: `Hello,

We could not process invoice QB-6631 using the payment method on file. Update your payment details today to avoid service interruption.

If you recently changed banks, this message may require immediate review.

QuickBill Support`,
  },
  {
    id: 'placeholder-spam-007',
    subject: '🌴 You have been selected for a travel voucher',
    from: 'Sunvale Getaways <promo@sunvalegetaways.example>',
    date: 'Fri, 26 Jun 2026 5:40 PM',
    snippet: 'Confirm your destination preferences to unlock a limited vacation voucher.',
    body: `Good news,

You have been selected for a limited Sunvale Getaways travel voucher. Confirm your destination preferences and preferred travel month to see available offers.

Voucher availability changes daily.

Sunvale Getaways`,
  },
  {
    id: 'placeholder-spam-008',
    subject: 'Your device protection trial is ending 🛡️',
    from: 'ShieldPlus Coverage <renewals@shieldplus.example>',
    date: 'Fri, 26 Jun 2026 9:15 AM',
    snippet: 'Renew now to keep accidental damage and express replacement benefits active.',
    body: `Your ShieldPlus device protection trial ends soon.

Renew today to keep accidental damage coverage, express replacement benefits, and priority support active for your registered devices.

ShieldPlus Coverage`,
  },
  {
    id: 'placeholder-spam-009',
    subject: 'Flash sale: creator gear up to 70% off ⚡',
    from: 'StudioShelf <sale@studioshelf.example>',
    date: 'Thu, 25 Jun 2026 7:06 PM',
    snippet: 'Save on ring lights, desk mounts, portable mics, and backdrop kits.',
    body: `The StudioShelf creator gear flash sale is live.

Save up to 70% on ring lights, desk mounts, portable microphones, backdrop kits, and mobile production accessories.

Sale pricing ends tonight.

StudioShelf`,
  },
  {
    id: 'placeholder-spam-010',
    subject: '📦 Confirm your shipping address for package release',
    from: 'ParcelNotice <tracking@parcelnotice.example>',
    date: 'Thu, 25 Jun 2026 8:31 AM',
    snippet: 'A package is pending address confirmation before final delivery.',
    body: `A package is pending address confirmation before final delivery.

Please confirm your shipping address and delivery window to release the package from the regional processing center.

ParcelNotice Tracking`,
  },
  {
    id: 'placeholder-social-001',
    subject: 'LinkedIn: New connection request from Jordan Lee',
    from: 'LinkedIn <notifications@linkedin.example>',
    date: 'Mon, 29 Jun 2026 10:04 AM',
    snippet: 'Jordan Lee wants to connect and included a note about your AR prototype demo.',
    body: `Jordan Lee sent you a connection request.

Note: I saw your AR prototype demo and would love to follow your future builds. Your hand tracking interaction looked incredibly polished.

Open LinkedIn to accept or ignore this request.`,
  },
  {
    id: 'placeholder-social-002',
    subject: 'TikTok: Your post is picking up momentum',
    from: 'TikTok Creator Updates <creators@tiktok.example>',
    date: 'Mon, 29 Jun 2026 7:26 AM',
    snippet: 'Your weekend recap reached 4,820 views and 312 saves overnight.',
    body: `Nice work — your weekend recap reached 4,820 views overnight.

Top audience response: the cafe transition at 0:18. Reply to comments in the first hour today to keep the conversation active.

TikTok Creator Updates`,
  },
  {
    id: 'placeholder-social-005',
    subject: 'LinkedIn: 9 people viewed your profile this week',
    from: 'LinkedIn <updates@linkedin.example>',
    date: 'Sat, 27 Jun 2026 6:45 PM',
    snippet: 'Creative directors and XR producers found your profile in search.',
    body: `Your LinkedIn profile appeared in more searches this week.

Creative directors, XR producers, and brand innovation leads viewed your profile after searching for immersive experience designers.

Review profile insights to see the full list.

LinkedIn`,
  },
  {
    id: 'placeholder-social-006',
    subject: 'TikTok: Weekly analytics are ready',
    from: 'TikTok Analytics <analytics@tiktok.example>',
    date: 'Sat, 27 Jun 2026 10:20 AM',
    snippet: 'Your XR breakdown videos gained 1,240 new profile visits this week.',
    body: `Your weekly TikTok analytics are ready.

XR breakdown videos gained 1,240 new profile visits, with the strongest retention on clips under 22 seconds.

Use this trend to plan your next creator post.

TikTok Analytics`,
  },
  {
    id: 'placeholder-social-007',
    subject: 'Facebook: Event reminder for Immersive Media Night',
    from: 'Facebook Events <events@facebook.example>',
    date: 'Fri, 26 Jun 2026 4:04 PM',
    snippet: 'Immersive Media Night starts tomorrow at 7:00 PM in Los Angeles.',
    body: `Reminder: Immersive Media Night starts tomorrow at 7:00 PM.

People in your network are attending, including designers, producers, and real-time artists from entertainment studios.

Open Facebook Events for details.

Facebook Events`,
  },
  {
    id: 'placeholder-social-008',
    subject: 'YouTube: Copyright check complete',
    from: 'YouTube Studio <studio@youtube.example>',
    date: 'Fri, 26 Jun 2026 11:37 AM',
    snippet: 'No issues found for your scheduled behind-the-scenes upload.',
    body: `Copyright check complete.

No issues were found for your scheduled behind-the-scenes upload. Your video is still set to publish at the selected time.

Review visibility and thumbnail settings in YouTube Studio.

YouTube Studio`,
  },
  {
    id: 'placeholder-social-009',
    subject: 'LinkedIn: Priya endorsed you for Interaction Design',
    from: 'LinkedIn <notifications@linkedin.example>',
    date: 'Thu, 25 Jun 2026 5:18 PM',
    snippet: 'Priya Raman endorsed your Interaction Design skill.',
    body: `Priya Raman endorsed you for Interaction Design.

Skills endorsements help people understand your creative and technical strengths across XR prototypes, spatial UX, and production-ready demos.

LinkedIn`,
  },
  {
    id: 'placeholder-social-010',
    subject: 'TikTok: A creator mentioned you in a video',
    from: 'TikTok <notifications@tiktok.example>',
    date: 'Thu, 25 Jun 2026 12:09 PM',
    snippet: 'A creator mentioned your breakdown of face tracking in Lens Studio.',
    body: `A creator mentioned you in a new video.

They referenced your breakdown of face tracking in Lens Studio and asked viewers to share other XR creators to follow.

Open TikTok to view the mention.

TikTok`,
  },
  {
    id: 'placeholder-work-001',
    subject: 'Agenda for Tuesday entertainment client review',
    from: 'Priya Raman <priya.raman@northstar-labs.example>',
    date: 'Mon, 29 Jun 2026 9:38 AM',
    snippet: `Please review the prototype notes before tomorrow's XR activation review.`,
    body: `Hi team,

Please review the prototype notes before tomorrow's XR activation review. We will cover onboarding, hand-menu discoverability, and the updated call-to-action flow for the entertainment client.

Please bring one blocker and one recommendation.

Priya`,
  },
  {
    id: 'placeholder-work-002',
    subject: 'Design QA: portal transition approved',
    from: 'Evan Brooks <evan.brooks@arcforge.example>',
    date: 'Mon, 29 Jun 2026 8:05 AM',
    snippet: 'The latest immersive portal build looks good. Only minor copy adjustments remain.',
    body: `The latest immersive portal build looks good. Portal timing, hover feedback, and detail panel readability are approved for the recording pass.

Remaining items:
- tighten the loading copy
- confirm the refresh icon scale
- record one pass with placeholder data

Evan`,
  },
  {
    id: 'placeholder-work-003',
    subject: 'Can you send the movie promo demo build by EOD?',
    from: 'Marisol Chen <marisol.chen@brightpath.example>',
    date: 'Mon, 29 Jun 2026 7:44 AM',
    snippet: 'The partner team wants to test the XR character reveal flow on device tomorrow morning.',
    body: `Hi,

Can you send the movie promo demo build by end of day? The partner team wants to test the XR character reveal flow on device tomorrow morning.

The current scope is read-only inbox, detail view, refresh, page controls, and the hero reveal moment. Placeholder content is fine for the video review.

Thanks,
Marisol`,
  },
  {
    id: 'placeholder-work-004',
    subject: 'Client notes from the streaming launch call',
    from: 'Ari Feldman <ari.feldman@pulseframe.example>',
    date: 'Sun, 28 Jun 2026 6:52 PM',
    snippet: 'The streaming team wants the interactive teaser to feel more cinematic in the first five seconds.',
    body: `Team,

The streaming client liked the core interaction but wants the teaser to feel more cinematic in the first five seconds. They asked for stronger sound-reactive motion, a cleaner title lockup, and a clearer payoff when the user completes the gesture.

Please fold this into the next prototype pass.

Ari`,
  },
  {
    id: 'placeholder-work-005',
    subject: 'Asset handoff: concert lens character pack',
    from: 'Nina Park <nina.park@stagecraftxr.example>',
    date: 'Sun, 28 Jun 2026 2:33 PM',
    snippet: 'The entertainment client approved the revised character textures and logo animation.',
    body: `Hi,

The entertainment client approved the revised character textures, logo animation, and stage particle pass for the concert lens.

Please use the latest compressed texture set for mobile performance testing and flag any shader issues before QA.

Nina`,
  },
  {
    id: 'placeholder-work-007',
    subject: 'Performance pass needed for TikTok Effect House build',
    from: 'Leah Stone <leah.stone@arcforge.example>',
    date: 'Fri, 26 Jun 2026 5:55 PM',
    snippet: 'The entertainment brand effect is close, but low-end Android devices are dropping frames.',
    body: `The TikTok Effect House build is close, but low-end Android devices are dropping frames during the confetti burst.

Can you review texture sizes, particle count, and any scripts running every frame? We need a stable capture for the client before the next review.

Leah`,
  },
  {
    id: 'placeholder-spam-003',
    subject: 'Final reminder: upgrade your cloud storage ☁️',
    from: 'Nimbus Drive <billing@nimbusdrive.example>',
    date: 'Sun, 28 Jun 2026 6:03 PM',
    snippet: 'You are using 92% of your 50 GB plan. Upgrade before backups pause.',
    body: `Your Nimbus Drive account is using 92% of the included 50 GB storage.

Backups will continue normally, but large video uploads may pause when your account reaches the limit. Upgrade to 200 GB today and keep automatic sync running across all devices.

Nimbus Drive Billing`,
  },
  {
    id: 'placeholder-work-008',
    subject: 'Lens Studio blocker: face mesh offset',
    from: 'Diego Alvarez <diego.alvarez@studioarc.example>',
    date: 'Fri, 26 Jun 2026 10:14 AM',
    snippet: 'The face mesh lines up in preview but shifts on device after the intro animation.',
    body: `I found one blocker in the Lens Studio build.

The face mesh lines up in preview but shifts on device after the intro animation. It looks like the anchor is being updated before the tracking state fully settles.

Can you take a look before we send the next build?

Diego`,
  },
  {
    id: 'placeholder-spam-002',
    subject: 'Security notice 🔒 unusual sign-in blocked',
    from: 'VaultPay Alerts <alerts@vaultpay.example>',
    date: 'Mon, 29 Jun 2026 8:47 AM',
    snippet: 'We blocked a sign-in attempt from a new browser near Denver, CO.',
    body: `VaultPay blocked a sign-in attempt from a new browser near Denver, CO.

No payment was sent and your balance is unchanged. If this was you, open VaultPay and review trusted devices. If not, change your password today.

Reference: VP-2048-91`,
  },
  {
    id: 'placeholder-work-010',
    subject: 'Tomorrow: capture session for XR trailer mockup',
    from: 'Owen Grant <owen.grant@pulseframe.example>',
    date: 'Thu, 25 Jun 2026 9:06 AM',
    snippet: 'We need three clean takes of the interaction flow for the trailer mockup.',
    body: `Reminder for tomorrow's capture session:

We need three clean takes of the interaction flow for the XR trailer mockup. Please bring the latest build, confirm the reset gesture works, and make sure the placeholder inbox data is loaded before recording.

Thanks,
Owen`,
  },

  {
    id: 'placeholder-work-011',
    subject: 'Sprint planning: inbox pagination polish',
    from: 'Talia Brooks <talia.brooks@arcforge.example>',
    date: 'Wed, 24 Jun 2026 5:22 PM',
    snippet: 'Can we lock the page count behavior before tomorrow morning\'s QA pass?',
    body: `Hi,

Can we lock the page count behavior before tomorrow morning's QA pass? The client liked the compact controls, but they want the disabled state to be clearer when the user reaches the first or last page.

Please also check the empty-state copy after refresh.

Talia`,
  },
  {
    id: 'placeholder-spam-011',
    subject: 'Exclusive invite: VIP warehouse clearance 🛒',
    from: 'MetroMark Deals <vip@metromark.example>',
    date: 'Wed, 24 Jun 2026 2:46 PM',
    snippet: 'Unlock private markdowns on tablets, headphones, and smart home bundles.',
    body: `You are invited to our private warehouse clearance.

Unlock limited markdowns on tablets, headphones, smart home bundles, and open-box accessories. VIP pricing is only available while regional inventory lasts.

MetroMark Deals`,
  },
  {
    id: 'placeholder-social-011',
    subject: 'Instagram: Camila replied to your story',
    from: 'Instagram <notifications@instagram.example>',
    date: 'Wed, 24 Jun 2026 12:18 PM',
    snippet: 'Camila reacted to your studio setup photo and asked about the lighting rig.',
    body: `Camila replied to your story.

She reacted to your studio setup photo and asked what lighting rig you used for the soft reflection on the acrylic display.

Open Instagram to reply.

Instagram`,
  },
  {
    id: 'placeholder-work-012',
    subject: 'Budget note for interactive premiere concept',
    from: 'Jonah Reed <jonah.reed@pulseframe.example>',
    date: 'Wed, 24 Jun 2026 9:35 AM',
    snippet: 'The premiere concept is approved creatively, but production wants a leaner asset list.',
    body: `Team,

The interactive premiere concept is approved creatively, but production wants a leaner asset list before they share the budget with the venue team.

Please identify which props can be procedural and which need final art.

Jonah`,
  },
  {
    id: 'placeholder-spam-012',
    subject: 'Your cashback match 💸 is waiting',
    from: 'Spendwise Rewards <bonus@spendwise.example>',
    date: 'Tue, 23 Jun 2026 7:58 PM',
    snippet: 'Activate your temporary cashback match before the offer window closes.',
    body: `Your temporary cashback match is waiting.

Activate the offer before the window closes to receive matched rewards on eligible shopping, travel, and dining purchases.

Spendwise Rewards`,
  },
  {
    id: 'placeholder-social-012',
    subject: 'Discord: New messages in XR Creators LA',
    from: 'Discord <noreply@discord.example>',
    date: 'Tue, 23 Jun 2026 6:11 PM',
    snippet: 'People are sharing notes from the latest Lens Studio meetup thread.',
    body: `You have new messages in XR Creators LA.

People are sharing notes from the latest Lens Studio meetup thread, including links to shader examples and event photos.

Discord`,
  },
  {
    id: 'placeholder-work-013',
    subject: 'Follow-up: hand tracking affordance test',
    from: 'Mei Tan <mei.tan@northstar-labs.example>',
    date: 'Tue, 23 Jun 2026 3:42 PM',
    snippet: 'The tap target is readable, but testers missed the hold gesture on first use.',
    body: `Hi,

The hand tracking affordance test went well overall. The tap target is readable, but testers missed the hold gesture on first use.

Can we add a short pulse animation or ghost hand cue before the next build?

Mei`,
  },
  {
    id: 'placeholder-spam-013',
    subject: 'Verify account ownership to avoid hold ✅',
    from: 'Account Center <notice@secure-accountcenter.example>',
    date: 'Tue, 23 Jun 2026 11:04 AM',
    snippet: 'Recent profile changes require ownership confirmation within 24 hours.',
    body: `We detected recent profile changes.

Please verify account ownership within 24 hours to avoid a temporary account hold. Confirmation helps us keep your profile and saved preferences active.

Account Center`,
  },
  {
    id: 'placeholder-social-013',
    subject: 'Threads: 12 new replies to your post',
    from: 'Threads <notifications@threads.example>',
    date: 'Mon, 22 Jun 2026 8:29 PM',
    snippet: 'Creators are discussing your take on practical AR onboarding patterns.',
    body: `Your post has 12 new replies.

Creators are discussing your take on practical AR onboarding patterns, especially the part about showing one instruction at a time.

Open Threads to join the conversation.

Threads`,
  },
  {
    id: 'placeholder-work-014',
    subject: 'QA notes: audio reactive particles',
    from: 'Riley Scott <riley.scott@stagecraftxr.example>',
    date: 'Mon, 22 Jun 2026 4:15 PM',
    snippet: 'The beat response feels strong, but particles clip through the title card.',
    body: `Hi,

QA reviewed the audio reactive particle pass. The beat response feels strong, but particles clip through the title card during the final chorus.

Please reduce the burst radius or move the title card forward in the scene.

Riley`,
  },
  {
    id: 'placeholder-spam-014',
    subject: '🧹 Trial upgrade approved for premium scan tools',
    from: 'CleanByte Utility <offers@cleanbyte.example>',
    date: 'Mon, 22 Jun 2026 1:33 PM',
    snippet: 'Your device may qualify for premium cleanup and duplicate file scanning.',
    body: `Your trial upgrade has been approved.

Your device may qualify for premium cleanup, duplicate file scanning, browser cache removal, and performance optimization tools.

CleanByte Utility`,
  },
  {
    id: 'placeholder-social-014',
    subject: 'Reddit: Your comment got 25 upvotes',
    from: 'Reddit <noreply@reddit.example>',
    date: 'Mon, 22 Jun 2026 10:07 AM',
    snippet: 'Your comment about mobile shader optimization is gaining attention.',
    body: `Your comment got 25 upvotes.

People in r/augmentedreality are responding to your explanation of mobile shader optimization and asking for more examples.

Reddit`,
  },
  {
    id: 'placeholder-work-015',
    subject: 'Need copy pass for onboarding tooltip set',
    from: 'Anika Patel <anika.patel@brightpath.example>',
    date: 'Fri, 19 Jun 2026 5:51 PM',
    snippet: 'The tooltips work visually, but the language still feels too technical.',
    body: `Hi,

The onboarding tooltip set works visually, but the language still feels too technical for the entertainment audience.

Can you simplify the hand menu, refresh, and inbox detail hints before we package the next review build?

Anika`,
  },
  {
    id: 'placeholder-spam-015',
    subject: 'Notice: loyalty credits expire this weekend ⏰',
    from: 'Everyday Perks <credits@everydayperks.example>',
    date: 'Fri, 19 Jun 2026 2:09 PM',
    snippet: 'Redeem your remaining loyalty credits for dining, travel, or gift card rewards.',
    body: `Your loyalty credits expire this weekend.

Redeem your remaining balance for dining, travel, or gift card rewards before the promotional period ends.

Everyday Perks`,
  },
  {
    id: 'placeholder-social-015',
    subject: 'Meetup: Reminder for Real-Time Design Jam',
    from: 'Meetup <messages@meetup.example>',
    date: 'Fri, 19 Jun 2026 11:20 AM',
    snippet: 'Real-Time Design Jam starts tonight with demos from local immersive teams.',
    body: `Reminder: Real-Time Design Jam starts tonight.

Local immersive teams will show prototypes, tools, and work-in-progress experiments. Bring a laptop if you want to join the open critique table.

Meetup`,
  },
  {
    id: 'placeholder-work-016',
    subject: 'Revised timeline for brand effect submission',
    from: 'Noah Price <noah.price@arcforge.example>',
    date: 'Thu, 18 Jun 2026 6:34 PM',
    snippet: 'Submission moved up by one day, so the test build needs to be ready Thursday morning.',
    body: `Heads up,

The brand effect submission moved up by one day. We now need the test build ready Thursday morning so review, capture, and final export can happen before the platform deadline.

Please flag anything that risks the timeline.

Noah`,
  },
  {
    id: 'placeholder-spam-016',
    subject: 'Limited survey 🎁 receive a bonus gift card',
    from: 'Consumer Panel <survey@consumerpanel.example>',
    date: 'Thu, 18 Jun 2026 3:27 PM',
    snippet: 'Complete a short product survey to qualify for a promotional gift card.',
    body: `You have been selected for a limited product survey.

Complete a short questionnaire about shopping habits and entertainment subscriptions to qualify for a promotional gift card.

Consumer Panel`,
  },
  {
    id: 'placeholder-social-016',
    subject: 'GitHub: New star on your demo repository',
    from: 'GitHub <noreply@github.example>',
    date: 'Thu, 18 Jun 2026 1:02 PM',
    snippet: 'Your placeholder inbox demo repository received a new star.',
    body: `Your repository received a new star.

A developer bookmarked your placeholder inbox demo repository after viewing the sample data and pagination logic.

GitHub`,
  },
  {
    id: 'placeholder-work-017',
    subject: 'Client feedback: make refresh feel more tactile',
    from: 'Grace Lee <grace.lee@pulseframe.example>',
    date: 'Thu, 18 Jun 2026 9:48 AM',
    snippet: 'The client wants the refresh action to feel more like a physical UI moment.',
    body: `Hi,

The client wants the refresh action to feel more tactile. They suggested a small bounce, haptic-style visual feedback, or a brief shimmer across the inbox cards.

Can you explore one lightweight option for the next review?

Grace`,
  },
  {
    id: 'placeholder-spam-017',
    subject: 'Final notice: premium domain reservation 🌐',
    from: 'Domain Registry Desk <renewals@domainregistrydesk.example>',
    date: 'Wed, 17 Jun 2026 5:16 PM',
    snippet: 'A premium domain matching your profile is available for reservation today only.',
    body: `Final notice,

A premium domain matching your public profile is available for reservation today only. Secure the domain before it is released to general availability.

Domain Registry Desk`,
  },
];
