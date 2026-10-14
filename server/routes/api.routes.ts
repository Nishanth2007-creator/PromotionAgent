import { Router, Request, Response } from 'express';
import { GmailProvider } from '../providers/gmail.provider.js';
import { WhatsAppCloudProvider } from '../providers/whatsAppCloud.provider.js';

export const apiRouter = Router();

const gmailProvider = new GmailProvider();
const whatsAppProvider = new WhatsAppCloudProvider();

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Quantix Promotion Agent Backend',
    timestamp: new Date().toISOString(),
  });
});

// Check integration status safely (no API keys exposed)
apiRouter.get('/integrations/status', async (_req: Request, res: Response) => {
  const gmailStatus = await gmailProvider.verifyCredentials();
  const whatsAppStatus = await whatsAppProvider.verifyCredentials();

  res.json({
    gmail: {
      provider: gmailProvider.providerName,
      configured: gmailStatus.isValid,
      senderEmail: gmailStatus.senderEmail ? `${gmailStatus.senderEmail.substring(0, 3)}***@${gmailStatus.senderEmail.split('@')[1] || ''}` : undefined,
      mode: gmailStatus.isValid ? 'live_ready' : 'pending_setup',
      error: gmailStatus.error,
      lastChecked: new Date().toISOString(),
    },
    whatsapp: {
      provider: whatsAppProvider.providerName,
      configured: whatsAppStatus.isValid,
      phoneNumberId: whatsAppStatus.phoneNumberId ? `***${whatsAppStatus.phoneNumberId.slice(-4)}` : undefined,
      mode: whatsAppStatus.isValid ? 'live_ready' : 'pending_setup',
      error: whatsAppStatus.error,
      lastChecked: new Date().toISOString(),
    },
  });
});

// Safe validation endpoint before dispatch
apiRouter.post('/campaigns/validate-send', (req: Request, res: Response) => {
  const { campaignId, approvalConfirmed, channels } = req.body;

  if (!approvalConfirmed) {
    res.status(400).json({
      success: false,
      error: 'Campaign explicit approval signature required before dispatch verification.',
    });
    return;
  }

  res.json({
    success: true,
    campaignId,
    verifiedChannels: channels,
    readyForProviderQueue: true,
    note: 'Server validated payload. Live dispatch is safely guarded to prevent unauthorized sends.',
  });
});

// Meta WhatsApp Webhook verification handshake
apiRouter.get('/webhook/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const verifiedChallenge = whatsAppProvider.verifyWebhookChallenge(mode, token, challenge);
  if (verifiedChallenge) {
    res.status(200).send(verifiedChallenge);
  } else {
    res.status(403).send('Forbidden: Token mismatch');
  }
});

// Meta WhatsApp Webhook event receiver
apiRouter.post('/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    const events = await whatsAppProvider.processWebhookEvent(req.body);
    // In production, update Firestore delivery logs with confirmed status
    res.status(200).json({ received: true, eventsCount: events.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
