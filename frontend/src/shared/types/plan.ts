export type Plan = 'free' | 'pro' | 'team'

export type BillingStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
