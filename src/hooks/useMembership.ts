import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import { PLANS } from '../services/subscription';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Unified PlanType - consistent with subscription.ts
export type PlanType = 'free' | 'starter' | 'basic_monthly' | 'basic_yearly' | 'pro_monthly' | 'pro_yearly' | 'unlimited';

// Plan benefits config - synced with subscription.ts PLANS
export const PLAN_BENEFITS: Record<PlanType, {
  dailyGenerations: number | null;
  monthlyGenerations: number | null;
  totalGenerations: number | null;
  maxResolution: string;
  watermark: boolean;
  stylesLimit: number;
  premiumStyles: boolean;
  commercialUse: boolean;
  adFree: boolean;
  priorityQueue: boolean;
  cloudStorage: number;
  isUnlimited: boolean;
}> = {
  free: {
    dailyGenerations: 10,
    monthlyGenerations: null,
    totalGenerations: null,
    maxResolution: '512',
    watermark: true,
    stylesLimit: 8,
    premiumStyles: false,
    commercialUse: false,
    adFree: false,
    priorityQueue: false,
    cloudStorage: 30,
    isUnlimited: false,
  },
  starter: {
    dailyGenerations: null,
    monthlyGenerations: null,
    totalGenerations: 30,
    maxResolution: '1024',
    watermark: false,
    stylesLimit: 999,
    premiumStyles: false,
    commercialUse: false,
    adFree: false,
    priorityQueue: false,
    cloudStorage: 100,
    isUnlimited: false,
  },
  basic_monthly: {
    dailyGenerations: null,
    monthlyGenerations: 150,
    totalGenerations: null,
    maxResolution: '1024',
    watermark: false,
    stylesLimit: 999,
    premiumStyles: true,
    commercialUse: false,
    adFree: true,
    priorityQueue: true,
    cloudStorage: 200,
    isUnlimited: false,
  },
  basic_yearly: {
    dailyGenerations: null,
    monthlyGenerations: 150,
    totalGenerations: null,
    maxResolution: '1024',
    watermark: false,
    stylesLimit: 999,
    premiumStyles: true,
    commercialUse: false,
    adFree: true,
    priorityQueue: true,
    cloudStorage: 999999,
    isUnlimited: false,
  },
  pro_monthly: {
    dailyGenerations: null,
    monthlyGenerations: 500,
    totalGenerations: null,
    maxResolution: '2048',
    watermark: false,
    stylesLimit: 999,
    premiumStyles: true,
    commercialUse: true,
    adFree: true,
    priorityQueue: true,
    cloudStorage: 999999,
    isUnlimited: false,
  },
  pro_yearly: {
    dailyGenerations: null,
    monthlyGenerations: 500,
    totalGenerations: null,
    maxResolution: '2048',
    watermark: false,
    stylesLimit: 999,
    premiumStyles: true,
    commercialUse: true,
    adFree: true,
    priorityQueue: true,
    cloudStorage: 999999,
    isUnlimited: false,
  },
  unlimited: {
    dailyGenerations: null,
    monthlyGenerations: null,
    totalGenerations: null,
    maxResolution: '2048',
    watermark: false,
    stylesLimit: 999999,
    premiumStyles: true,
    commercialUse: true,
    adFree: true,
    priorityQueue: true,
    cloudStorage: 999999,
    isUnlimited: true,
  },
};

export function useMembership(user: Profile | null) {
  const [loading, setLoading] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [canGenerate, setCanGenerate] = useState(true);
  const [message, setMessage] = useState('');

  const currentPlan: PlanType = (user?.current_plan as PlanType) || 'free';
  const benefits = PLAN_BENEFITS[currentPlan] || PLAN_BENEFITS.free;

  const checkGenerationLimit = useCallback(async () => {
    if (!user) {
      setCanGenerate(true);
      return;
    }

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const { count: todayGen } = await supabase
        .from('generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      const { count: monthGen } = await supabase
        .from('generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString());

      const { count: totalGen } = await supabase
        .from('generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setTodayCount(todayGen || 0);
      setMonthCount(monthGen || 0);
      setTotalCount(totalGen || 0);

      if (benefits.isUnlimited) {
        setCanGenerate(true);
        setMessage('');
      } else if (benefits.totalGenerations) {
        if ((totalGen || 0) >= benefits.totalGenerations) {
          setCanGenerate(false);
          setMessage(`Starter pack used up (${totalGen}/${benefits.totalGenerations}). Upgrade for more designs!`);
        } else {
          setCanGenerate(true);
          setMessage(`${benefits.totalGenerations - (totalGen || 0)} designs remaining`);
        }
      } else if (benefits.monthlyGenerations) {
        if ((monthGen || 0) >= benefits.monthlyGenerations) {
          setCanGenerate(false);
          setMessage(`Monthly limit reached (${monthGen}/${benefits.monthlyGenerations}). Upgrade your plan!`);
        } else {
          setCanGenerate(true);
          setMessage(`${benefits.monthlyGenerations - (monthGen || 0)} designs remaining this month`);
        }
      } else if (benefits.dailyGenerations) {
        if ((todayGen || 0) >= benefits.dailyGenerations) {
          setCanGenerate(false);
          setMessage(`Daily limit reached (${todayGen}/${benefits.dailyGenerations}). Upgrade for more!`);
        } else {
          setCanGenerate(true);
          setMessage(`${benefits.dailyGenerations - (todayGen || 0)} designs remaining today`);
        }
      }
    } catch (error) {
      console.error('Check generation limit failed:', error);
      setCanGenerate(true);
    } finally {
      setLoading(false);
    }
  }, [user, benefits]);

  const recordGeneration = useCallback(async (imageUrl: string, resolution: string) => {
    if (!user) return;

    try {
      await supabase.from('generation_logs').insert({
        user_id: user.id,
        image_url: imageUrl,
        resolution,
        has_watermark: benefits.watermark,
        credits_used: 1,
      });

      checkGenerationLimit();
    } catch (error) {
      console.error('Record generation failed:', error);
    }
  }, [user, benefits.watermark, checkGenerationLimit]);

  const getWatermarkText = useCallback(() => {
    if (benefits.watermark) {
      return 'inkai.life';
    }
    return null;
  }, [benefits.watermark]);

  const getResolution = useCallback((requested: string): string => {
    const requestedPx = parseInt(requested) || 1024;
    const maxPx = parseInt(benefits.maxResolution) || 512;

    if (requestedPx <= maxPx) {
      return requested;
    }
    return benefits.maxResolution;
  }, [benefits.maxResolution]);

  useEffect(() => {
    checkGenerationLimit();
  }, [checkGenerationLimit]);

  return {
    currentPlan,
    benefits,
    loading,
    todayCount,
    monthCount,
    totalCount,
    canGenerate,
    message,
    recordGeneration,
    getWatermarkText,
    getResolution,
    checkGenerationLimit,
  };
}

export function getPlanDescription(plan: PlanType): string {
  const planDetail = PLANS[plan];
  return planDetail ? planDetail.nameEn : 'Free';
}