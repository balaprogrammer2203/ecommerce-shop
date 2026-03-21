type FeatureFlagKey = 'enableReviews' | 'enableWishlist' | 'enableSubscriptions';

const featureFlags: Record<FeatureFlagKey, boolean> = {
  enableReviews: true,
  enableWishlist: true,
  enableSubscriptions: false,
};

export const isFeatureEnabled = (flag: FeatureFlagKey) => featureFlags[flag];
