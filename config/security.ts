export const securityConfig = {
  tls: {
    required: true,
    minVersion: 'TLSv1.2',
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    certificateRenewalDaysBeforeExpiry: 30,
  },
  rateLimiting: {
    global: {
      windowMs: 60 * 1000,
      maxRequests: 120,
      message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
    },
    authEndpoints: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 20,
      message: 'Kimlik doğrulama istek sınırına ulaştınız.'
    }
  }
};

export default securityConfig;
