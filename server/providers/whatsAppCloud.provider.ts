import { 
  IWhatsAppProvider, 
  WhatsAppTextMessagePayload, 
  WhatsAppTemplatePayload, 
  WhatsAppDispatchResult, 
  WhatsAppDeliveryState 
} from '../interfaces/whatsAppProvider.interface.js';

/**
 * Server-side WhatsApp Cloud API Provider implementation (Meta Graph API).
 * Uses Phone Number ID, Permanent System User Access Token, and Webhook Verify Token.
 * 
 * Safety Guarantee:
 * - Credentials are kept strictly on the backend.
 * - Does NOT dispatch real messages until enabled.
 * - Never fabricates fake delivery statuses.
 */
export class WhatsAppCloudProvider implements IWhatsAppProvider {
  public readonly providerName = 'WhatsApp Cloud API (Meta)';

  private phoneNumberId: string | undefined;
  private accessToken: string | undefined;
  private webhookVerifyToken: string | undefined;

  constructor() {
    this.reloadEnvironment();
  }

  public reloadEnvironment(): void {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  }

  public async verifyCredentials(): Promise<{ isValid: boolean; error?: string; phoneNumberId?: string }> {
    this.reloadEnvironment();

    if (!this.phoneNumberId || !this.accessToken) {
      return {
        isValid: false,
        error: 'Missing WhatsApp Cloud credentials in server environment (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN).',
      };
    }

    return {
      isValid: true,
      phoneNumberId: this.phoneNumberId,
    };
  }

  public async sendMessage(
    payload: WhatsAppTextMessagePayload | WhatsAppTemplatePayload
  ): Promise<WhatsAppDispatchResult> {
    const credCheck = await this.verifyCredentials();

    if (!credCheck.isValid) {
      return {
        success: false,
        state: 'failed',
        error: {
          code: 'CREDENTIALS_NOT_CONFIGURED',
          message: credCheck.error || 'Server is not yet configured with valid WhatsApp Cloud API credentials.',
        },
      };
    }

    // Safety rule: Do not send real messages or simulate fake success.
    return {
      success: false,
      state: 'queued',
      error: {
        code: 'SENDING_PAUSED_BY_DESIGN',
        message: 'WhatsApp Cloud API interface is modularly prepared, but live dispatch is disabled by safe architecture policy.',
      },
    };
  }

  public verifyWebhookChallenge(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  public async processWebhookEvent(body: any): Promise<Array<{
    messageId?: string;
    status?: WhatsAppDeliveryState;
    timestamp?: string;
    errorReason?: string;
  }>> {
    const results: Array<{
      messageId?: string;
      status?: WhatsAppDeliveryState;
      timestamp?: string;
      errorReason?: string;
    }> = [];

    try {
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const statuses = changes?.value?.statuses;

      if (Array.isArray(statuses)) {
        for (const st of statuses) {
          const wamid = st.id;
          const statusStr = st.status; // 'sent' | 'delivered' | 'read' | 'failed'
          let mappedStatus: WhatsAppDeliveryState = 'queued';

          if (statusStr === 'sent') mappedStatus = 'sent';
          else if (statusStr === 'delivered') mappedStatus = 'delivered';
          else if (statusStr === 'read') mappedStatus = 'read';
          else if (statusStr === 'failed') mappedStatus = 'failed';

          results.push({
            messageId: wamid,
            status: mappedStatus,
            timestamp: st.timestamp,
            errorReason: st.errors?.[0]?.message,
          });
        }
      }
    } catch {
      // Ignore malformed webhooks
    }

    return results;
  }
}
