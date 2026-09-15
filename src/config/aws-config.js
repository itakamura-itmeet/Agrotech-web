
export const awsConfig = {
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_AWS_ENDPOINT,
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      defaultAuthMode: process.env.NEXT_PUBLIC_AWS_DEFAULTAUTHMODE,
      apiKey: process.env.NEXT_PUBLIC_AWS_API_KEY,
      // Explicitly set the realtime endpoint from env if available
      realtimeEndpoint: process.env.NEXT_PUBLIC_AWS_WSS_ENDPOINT,
      apiKey: process.env.NEXT_PUBLIC_AWS_API_KEY
    }
  }
};
