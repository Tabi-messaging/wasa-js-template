export function getConfig() {
  return {
    apiKey: process.env.TABI_API_KEY || '',
    baseUrl: process.env.TABI_BASE_URL || 'https://api.c36.online/api/v1',
    channelId: process.env.TABI_CHANNEL_ID || '',
  };
}
