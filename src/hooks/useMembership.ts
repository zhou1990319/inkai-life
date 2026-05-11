import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export type PlanType = 'free' | 'monthly' | 'yearly' | 'lifetime';

// 会员权益配置
export const PLAN_BENEFITS = {
  free: {
    dailyGenerations: 10,
    monthlyGenerations: null, // 按天计算
    maxResolution: '1024px',
    watermark: true,
    stylesLimit: 20,
    premiumStyles: false,
    commercialUse: false,
    adFree: false,
    priorityQueue: false,
    cloudStorage: 30,
    isUnlimited: false,
  },
  monthly: {
    dailyGenerations: null,
    monthlyGenerations: 100,
    maxResolution: '2048px',
    watermark: false,
    stylesLimit: 50,
    premiumStyles: true,
    commercialUse: false,
    adFree: true,
    priorityQueue: true,
    cloudStorage: 200,
    isUnlimited: false,
  },
  yearly: {
    dailyGenerations: null,
    monthlyGenerations: null,
    maxResolution: '4096px',
    watermark: false,
    stylesLimit: 999,
    premiumStyles: true,
    commercialUse: true,
    adFree: true,
    priorityQueue: true,
    cloudStorage: 999999,
    isUnlimited: true,
  },
  lifetime: {
    dailyGenerations: null,
    monthlyGenerations: null,
    maxResolution: '4096px',
    watermark: false,
    stylesLimit: 999999,
    premiumStyles: true,
    commercialUse: true,
    adFree: true,
    priorityQueue: true,
    cloudStorage: 999999,
    isUnlimited: true,
    lifetimeAccess: true,
  },
};

export function useMembership(user: Profile | null) {
  const [loading, setLoading] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [canGenerate, setCanGenerate] = useState(true);
  const [message, setMessage] = useState('');

  // 获取用户当前方案
  const currentPlan: PlanType = user?.current_plan as PlanType || 'free';
  const benefits = PLAN_BENEFITS[currentPlan] || PLAN_BENEFITS.free;

  // 检查生成次数
  const checkGenerationLimit = useCallback(async () => {
    if (!user) {
      setCanGenerate(true);
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // 获取今日生成次数
      const { count: todayGen } = await supabase
        .from('generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      // 获取本月生成次数
      const { count: monthGen } = await supabase
        .from('generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString());

      setTodayCount(todayGen || 0);
      setMonthCount(monthGen || 0);

      // 判断是否可以生成
      if (benefits.isUnlimited) {
        setCanGenerate(true);
        setMessage('');
      } else if (benefits.monthlyGenerations) {
        // 月卡用户
        if ((monthGen || 0) >= benefits.monthlyGenerations) {
          setCanGenerate(false);
          setMessage(`本月生成次数已用完（${monthGen}/${benefits.monthlyGenerations}），升级年卡享无限生成！`);
        } else {
          setCanGenerate(true);
          setMessage(`本月剩余 ${benefits.monthlyGenerations - (monthGen || 0)} 次生成`);
        }
      } else {
        // 免费用户 - 按天计算
        if ((todayGen || 0) >= benefits.dailyGenerations) {
          setCanGenerate(false);
          setMessage(`今日生成次数已用完（${todayGen}/${benefits.dailyGenerations}），明天刷新或升级月卡！`);
        } else {
          setCanGenerate(true);
          setMessage(`今日剩余 ${benefits.dailyGenerations - (todayGen || 0)} 次生成`);
        }
      }
    } catch (error) {
      console.error('检查生成限制失败:', error);
      setCanGenerate(true); // 出错时默认允许
    }
  }, [user, benefits]);

  // 记录生成
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

      // 刷新计数
      checkGenerationLimit();
    } catch (error) {
      console.error('记录生成失败:', error);
    }
  }, [user, benefits.watermark, checkGenerationLimit]);

  // 获取水印设置
  const getWatermarkText = useCallback(() => {
    if (benefits.watermark) {
      return 'inkai.life';
    }
    return null;
  }, [benefits.watermark]);

  // 获取分辨率设置
  const getResolution = useCallback((requested: string): string => {
    const requestedPx = parseInt(requested);
    const maxPx = parseInt(benefits.maxResolution);

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
    canGenerate,
    message,
    recordGeneration,
    getWatermarkText,
    getResolution,
    checkGenerationLimit,
  };
}

// 升级提示组件使用的权益描述
export function getPlanDescription(plan: PlanType): string {
  const descriptions: Record<PlanType, string> = {
    free: '免费体验',
    monthly: '月卡会员',
    yearly: '年卡会员',
    lifetime: '终身VIP',
  };
  return descriptions[plan];
}
