class PaymentService {
  async initialize() {
    // Load Stripe/Adyen SDKs lazily here.
  }

  confirmPayment(sessionId: string): Promise<void> {
    console.info('Confirming payment session', sessionId);
    return Promise.resolve();
  }
}

export const paymentService = new PaymentService();
