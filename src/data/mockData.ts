import type { Contact, Campaign, DeliveryLog, Template } from '../types';

export const INITIAL_CONTACTS: Contact[] = [];

export const INITIAL_CAMPAIGNS: Campaign[] = [];

export const INITIAL_DELIVERY_LOGS: DeliveryLog[] = [];

export const PROMOTIONAL_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    title: 'Hackathon Grand Launch',
    category: 'Hackathons',
    description: 'High-energy launch announcement highlighting tracks, bounties, and registration link.',
    defaultTone: 'enthusiastic',
    sampleEmailSubject: '🚀 Registration is NOW OPEN for {eventName}!',
    sampleEmailBody: `Hi {name},\n\nThe wait is over! We are thrilled to officially announce {eventName}.\n\n{description}\n\nKey Details:\n📅 Dates: {dates}\n📍 Venue: {venue}\n🏆 Prizes & Perks: Cash bounties, sponsor swags, and direct interview fast-tracks!\n\nSpots are limited to 100 teams. Secure yours today:\n👉 {registrationUrl}\n\nSee you at the hackathon,\nTeam Quantix`,
    sampleWhatsAppBody: `🚀 *{eventName} is officially LIVE!* 🚀\n\nHey *{name}*, ready to build something incredible?\n\n📅 *Dates:* {dates}\n📍 *Venue:* {venue}\n\n{description}\n\nRegister your squad right away:\n🔗 *Link:* {registrationUrl}\n\n_Team Quantix_`,
  },
  {
    id: 'tpl-2',
    title: 'Final 24 Hours Countdown',
    category: 'Urgency & Reminders',
    description: 'Creates urgency for hackathon and event registrations before portal closure.',
    defaultTone: 'concise',
    sampleEmailSubject: '⏳ Last 24 Hours to Register for {eventName}',
    sampleEmailBody: `Dear {name},\n\nThis is a quick reminder that registrations for {eventName} close in exactly 24 hours.\n\nEvent Dates: {dates}\nVenue: {venue}\n\nIf you haven't finalized your team yet, submit your details now:\n{registrationUrl}\n\nDon't miss out,\nQuantix Organizing Team`,
    sampleWhatsAppBody: `⏳ *CLOSING IN 24 HOURS!* ⏳\n\nHey *{name}*, registrations for *{eventName}* are closing soon!\n\n📅 *Dates:* {dates}\n📍 *Venue:* {venue}\n\nSubmit your team before the deadline:\n🔗 {registrationUrl}`,
  },
  {
    id: 'tpl-3',
    title: 'Keynote & Workshop Reveal',
    category: 'Speaker Highlights',
    description: 'Announce high-profile industry speakers, tech workshops, or mentor panels.',
    defaultTone: 'professional',
    sampleEmailSubject: 'Keynote Speaker Announcement: {eventName}',
    sampleEmailBody: `Dear {name},\n\nWe are proud to unveil our keynote speakers and mentors for {eventName}.\n\n{description}\n\nJoin us on {dates} at {venue} to learn directly from leading practitioners in the industry.\n\nReserve your seat:\n{registrationUrl}\n\nWarm regards,\nAcademic & Tech Outreach Committee`,
    sampleWhatsAppBody: `🎙️ *Speaker Announcement for {eventName}*\n\nHello *{name}*,\nDiscover our industry keynote mentors and hands-on tracks.\n\n📅 {dates} | 📍 {venue}\n\nConfirm attendance here:\n🔗 {registrationUrl}`,
  },
  {
    id: 'tpl-4',
    title: 'Post-Event Thank You & Certificates',
    category: 'Follow-ups',
    description: 'Distribute participation certificates, results, and thank the attendees.',
    defaultTone: 'professional',
    sampleEmailSubject: 'Thank you for attending {eventName} - Certificate & Highlights',
    sampleEmailBody: `Dear {name},\n\nThank you for participating in {eventName}. Your passion and project submissions made this event truly memorable.\n\nYou can access the final photo gallery, project showcases, and your official Certificate of Participation below:\n{registrationUrl}\n\nWe hope to see you again at our upcoming editions!\n\nWith gratitude,\nTeam Quantix`,
    sampleWhatsAppBody: `🏆 *Thank you for participating in {eventName}!* 🏆\n\nHey *{name}*,\nCongratulations on completing the event! Access your certificates and winning submissions here:\n🔗 {registrationUrl}\n\n_Team Quantix_`,
  }
];
