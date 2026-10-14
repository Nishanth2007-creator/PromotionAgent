export interface WhatsAppRecipient {
  name?: string;
  phoneNumber: string; // E.164 formatted, e.g. +14155552671
}

export interface WhatsAppTemplatePayload {
  to: WhatsAppRecipient;
  templateName: string;
  languageCode: string;
  parameters: Array<{
    type: 'text' | 'image' | 'document';
    value: string;
  }>;
}

export interface WhatsAppTextMessagePayload {
  to: WhatsAppRecipient;
  text: string;
}

export type WhatsAppDeliveryState = 
  | 'queued' 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed';

export interface WhatsAppDispatchResult {
  success: boolean;
  state: WhatsAppDeliveryState;
  wamid?: string; // WhatsApp Message ID
  error?: {
    code: string;
    message: string;
    fbtraceId?: string;
  };
}

export interface IWhatsAppProvider {
  readonly providerName: string;

  /**
   * Verifies if WhatsApp Cloud API environment variables are present and format is valid.
   */
  verifyCredentials(): Promise<{ isValid: boolean; error?: string; phoneNumberId?: string }>;

  /**
   * Dispatches a WhatsApp message using Meta Graph API.
   * If credentials are not configured, returns clear error state.
   * Never fabricates fake delivery.
   */
  sendMessage(payload: WhatsAppTextMessagePayload | WhatsAppTemplatePayload): Promise<WhatsAppDispatchResult>;

  /**
   * Validates inbound Webhook verification handshake from Meta Graph API.
   */
  verifyWebhookChallenge(mode: string, token: string, challenge: string): string | null;

  /**
   * Handles delivery status updates received via WhatsApp Cloud webhook (sent, delivered, read, failed).
   */
  processWebhookEvent(body: unknown): Promise<{
    messageId?: string;
    status?: WhatsAppDeliveryState;
    timestamp?: string;
    errorReason?: string;
  }[]>;
}
