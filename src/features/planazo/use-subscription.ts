import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';
import { usePlanazo } from './context';
import { isPremiumActive } from './subscription-access';

export function useSubscription() {
  const { user, authReady } = usePlanazo();
  const environment = getStripeEnvironment();
  const query = useQuery({
    queryKey: ['subscription', user?.id, environment],
    enabled: authReady && !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('environment', environment)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });
  const subscription = query.data ?? null;
  return { ...query, subscription, isPremium: isPremiumActive(subscription), environment };
}
