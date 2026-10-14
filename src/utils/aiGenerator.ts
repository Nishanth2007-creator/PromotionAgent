import { MessageDrafts, MessageTone } from '../types';

export interface GenerationInput {
  eventName: string;
  eventType: string;
  description: string;
  dates: string;
  venue: string;
  registrationUrl: string;
  targetAudience: string;
  tone: MessageTone;
  flyerName?: string;
  customInstructions?: string;
}

export function generatePromotionalDrafts(input: GenerationInput): MessageDrafts {
  const {
    eventName,
    eventType,
    description,
    dates,
    venue,
    registrationUrl,
    targetAudience,
    tone,
    flyerName,
  } = input;

  const safeEventName = eventName || 'Quantix Hackathon 2026';
  const safeType = eventType || 'Hackathon & Tech Sprint';
  const safeDates = dates || 'Upcoming Weekend';
  const safeVenue = venue || 'Campus Auditorium & Virtual Discord';
  const safeUrl = registrationUrl || 'https://quantix.dev/register';
  const safeDesc = description || 'Join fellow innovators and tech leads to solve real-world problems and win prizes.';
  const safeAudience = targetAudience || 'College students and tech enthusiasts';

  const flyerMention = flyerName ? `\n(Flyer Attached: ${flyerName})\n` : '';

  if (tone === 'enthusiastic') {
    return {
      email: {
        subject: `🔥 Ready to Build? ${safeEventName} is Officially LIVE! 🚀`,
        body: `Hey {name}! ⚡\n\nBig news for innovators, developers, and creators! We are super excited to invite you to **${safeEventName}** (${safeType}) — specially curated for ${safeAudience}.\n\n${safeDesc}\n${flyerMention}\nHere is why you cannot miss this:\n✨ Collaborative sprint with mentorship from top tech leaders\n✨ Cash bounties, exclusive swags, and internship fast-tracks\n✨ Free high-energy snacks, networking & team building\n\n📌 **When:** ${safeDates}\n📍 **Where:** ${safeVenue}\n\nSquad slots fill up quickly. Secure your entry right now:\n👉 Register here: ${safeUrl}\n\nLet’s make something legendary together!\n\nBest energy,\nQuantix Organizing Committee\n\n---\nTo modify your outreach preferences or opt out, reply UNSUBSCRIBE.`,
      },
      whatsapp: {
        body: `⚡ *${safeEventName} is NOW OPEN!* 🚀\n\nHey *{name}*, gear up for the ultimate ${safeType}!\n\n${safeDesc}\n\n📅 *Dates:* ${safeDates}\n📍 *Venue:* ${safeVenue}\n🎯 *For:* ${safeAudience}\n${flyerName ? `📎 *Flyer:* ${flyerName}\n` : ''}\nAssemble your team and claim your spot today:\n🔗 *Register:* ${safeUrl}\n\n_See you at the arena!_ 💥`,
      },
    };
  }

  if (tone === 'concise') {
    return {
      email: {
        subject: `[Registration Open] ${safeEventName} - ${safeDates}`,
        body: `Hi {name},\n\nRegistrations are now open for ${safeEventName} (${safeType}).\n\n**Quick Details:**\n• Audience: ${safeAudience}\n• Dates: ${safeDates}\n• Venue: ${safeVenue}\n• Highlights: ${safeDesc}\n${flyerMention}\nSecure your registration here:\n${safeUrl}\n\nBest,\nQuantix Event Desk\n\n---\nReply UNSUBSCRIBE to opt out.`,
      },
      whatsapp: {
        body: `📌 *${safeEventName}* (${safeType})\n\nHi *{name}*,\n\n• *Dates:* ${safeDates}\n• *Venue:* ${safeVenue}\n• *Audience:* ${safeAudience}\n${flyerName ? `• *Flyer:* ${flyerName}\n` : ''}• *Details:* ${safeDesc}\n\n👉 *Direct Registration:* ${safeUrl}`,
      },
    };
  }

  // Professional tone (default)
  return {
    email: {
      subject: `Official Invitation: ${safeEventName} | ${safeDates}`,
      body: `Dear {name},\n\nOn behalf of the organizing committee, we are pleased to cordially invite you to participate in **${safeEventName}** (${safeType}).\n\nThis initiative is targeted at ${safeAudience} to foster hands-on technical excellence and collaborative problem solving.\n\n${safeDesc}\n${flyerMention}\n**Event Itinerary & Logistics:**\n• Schedule: ${safeDates}\n• Location: ${safeVenue}\n• Eligibility: Open to all registered students\n\nWe encourage early registration to guarantee participation slots and receive project orientation guidelines:\n🔗 ${safeUrl}\n\nShould you have any queries regarding participation or accommodations, please do not hesitate to contact our desk.\n\nSincerely,\nExecutive Committee, Quantix Promotion Agent\nOutreach & Campus Engagement Division\n\n---\nTo unsubscribe from future event notifications, click here or reply UNSUBSCRIBE.`,
    },
    whatsapp: {
      body: `*Official Invitation: ${safeEventName}*\n\nDear *{name}*,\n\nYou are invited to participate in *${safeEventName}* (${safeType}) designed for ${safeAudience}.\n\n📅 *Dates:* ${safeDates}\n📍 *Venue:* ${safeVenue}\n${flyerName ? `📎 *Flyer:* ${flyerName}\n` : ''}\n${safeDesc}\n\nKindly complete your registration using the official portal below:\n🔗 ${safeUrl}\n\n_Quantix Campus Engagement Desk_`,
    },
  };
}
