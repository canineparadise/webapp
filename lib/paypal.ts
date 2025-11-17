import { PayPalHttpClient, core } from '@paypal/checkout-server-sdk'

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || ''
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''

  if (process.env.NODE_ENV === 'production') {
    return new core.LiveEnvironment(clientId, clientSecret)
  }
  return new core.SandboxEnvironment(clientId, clientSecret)
}

// PayPal HTTP client
export function paypalClient() {
  return new PayPalHttpClient(environment())
}
