import { prisma } from "@/lib/db/prisma";
import { excludeDeleted } from "@/lib/db/soft-delete"; 
import { SubscriptionStatus } from "@prisma/client";

/**
 * Checks if a user has an active subscription or trial
 */
export async function checkUserSubscription(userClerkId: string): Promise<{
  isSubscribed: boolean;
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
}> {
  // Get the user from the database, excluding deleted users
  const user = await prisma.user.findFirst({
    where: {
      clerk_user_id: userClerkId,
      ...excludeDeleted(),
    },
    select: {
      subscription_status: true,
      trial_ends_at: true,
      current_subscription_period_end: true,
    },
  });

  if (!user) {
    return {
      isSubscribed: false,
      status: "FREE_TIER_POST_TRIAL" as SubscriptionStatus,
      trialEndsAt: null,
      currentPeriodEnd: null,
    };
  }

  // Check if the user has an active subscription
  const isActive = user.subscription_status === "ACTIVE";

  // Check if the user is in an active trial period
  const isTrialing =
    user.subscription_status === "TRIALING" &&
    user.trial_ends_at &&
    new Date(user.trial_ends_at) > new Date();

  return {
    isSubscribed: isActive || isTrialing,
    status: user.subscription_status,
    trialEndsAt: user.trial_ends_at,
    currentPeriodEnd: user.current_subscription_period_end,
  };
}

/**
 * Returns UI modes based on subscription status
 */
export function getUIModeFromSubscription(
  isSubscribed: boolean,
  status: SubscriptionStatus,
): {
  isLimited: boolean;
  shouldPromptForUpgrade: boolean;
  shouldDisableChartContext: boolean;
} {
  // Determine UI modes based on subscription status
  const isLimited = !isSubscribed;
  const shouldPromptForUpgrade = isLimited || status === 'TRIALING';
  const shouldDisableChartContext = isLimited;

  return {
    isLimited,
    shouldPromptForUpgrade,
    shouldDisableChartContext,
  };
}