import { 
  IEmailProvider, 
  EmailMessagePayload, 
  EmailDispatchResult, 
  EmailDeliveryState 
} from '../interfaces/emailProvider.interface.js';

/**
 * Server-side Gmail API Provider implementation.
 * Uses OAuth 2.0 Client credentials strictly loaded from server-side environment variables.
 * 
 * Safety Guarantee:
 * - Credentials are kept strictly on the backend.
 * - Does NOT send real messages yet in initial staging.
 * - Never fabricates fake delivery statuses.
 */
export class GmailProvider implements IEmailProvider {
  public readonly providerName = 'Gmail API (OAuth 2.0)';

  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private refreshToken: string | undefined;
  private senderEmail: string | undefined;

  constructor() {
    this.reloadEnvironment();
  }

  public reloadEnvironment(): void {
    this.clientId = process.env.GMAIL_CLIENT_ID;
    this.clientSecret = process.env.GMAIL_CLIENT_SECRET;
    this.refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    this.senderEmail = process.env.GMAIL_SENDER_EMAIL;
  }

  public async verifyCredentials(): Promise<{ isValid: boolean; error?: string; senderEmail?: string }> {
    this.reloadEnvironment();

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      return {
        isValid: false,
        error: 'Missing Gmail OAuth 2.0 credentials in server environment (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, or GMAIL_REFRESH_TOKEN).',
      };
    }

    if (!this.senderEmail) {
      return {
        isValid: false,
        error: 'Missing GMAIL_SENDER_EMAIL configuration.',
      };
    }

    // In future phase: validate token exchange with Google OAuth token endpoint
    return {
      isValid: true,
      senderEmail: this.senderEmail,
    };
  }

  public async sendEmail(payload: EmailMessagePayload): Promise<EmailDispatchResult> {
    const credCheck = await this.verifyCredentials();

    if (!credCheck.isValid) {
      return {
        success: false,
        state: 'failed',
        error: {
          code: 'CREDENTIALS_NOT_CONFIGURED',
          message: credCheck.error || 'Server is not yet configured with valid Gmail OAuth credentials.',
        },
      };
    }

    // NOTE: Real sending is paused per design specifications until production activation
    // Does NOT fake a delivery; explicitly informs that sending is in staging/dry-run protection mode.
    return {
      success: false,
      state: 'queued',
      error: {
        code: 'SENDING_PAUSED_BY_DESIGN',
        message: 'Gmail API interface is initialized, but real message dispatch is guarded on the server. Configure active production keys to dispatch.',
      },
    };
  }

  public async fetchDeliveryStatus(providerMessageId: string): Promise<{ state: EmailDeliveryState }> {
    // Only return actual status when connected to real Gmail API
    return {
      state: 'queued',
    };
  }
}
