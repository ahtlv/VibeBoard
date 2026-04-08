import type { Plan, BillingStatus } from '@/shared/types/plan'

export interface Subscription {
  id: string
  userId: string
  plan: Plan
  status: BillingStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string
  stripeSubscriptionId: string | null
}
