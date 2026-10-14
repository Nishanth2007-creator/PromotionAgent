export interface EmailRecipient {
  name?: string;
  email: string;
}

export interface EmailMessagePayload {
  to: EmailRecipient;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  replyTo?: string;
  metadata?: Record<string, string>;
}

export type EmailDeliveryState = 
  | 'queued' 
  | 'submitted' 
  | 'delivered' 
  | 'bounced' 
  | 'rejected' 
  | 'failed';

export interface EmailDispatchResult {
  success: boolean;
  state: EmailDeliveryState;
  providerMessageId?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface IEmailProvider {
  readonly providerName: string;

  /**
   * Validates if the required server credentials exist and are well-formed.
   * Does not send messages.
   */
  verifyCredentials(): Promise<{ isValid: boolean; error?: string; senderEmail?: string }>;

  /**
   * Prepares and dispatches an email message via the provider.
   * Note: If credentials are not configured, rejects or returns a configuration error.
   * Never fabricates successful delivery.
   */
  sendEmail(payload: EmailMessagePayload): Promise<EmailDispatchResult>;

  /**
   * Fetches the delivery state directly from the provider API.
   */
  fetchDeliveryStatus?(providerMessageId: string): Promise<{
    state: EmailDeliveryState;
    rawResponse?: unknown;
  }>;
}
