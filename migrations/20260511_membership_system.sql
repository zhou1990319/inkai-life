-- ============================================
-- 墨纹AI会员系统数据库迁移
-- 日期：2026-05-11
-- ============================================

-- 会员订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('free', 'monthly', 'yearly', 'lifetime')) NOT NULL DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'trial')) NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_early_bird BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  payment_id TEXT,
  payment_provider TEXT,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 生成记录表（用于限制免费用户生成次数）
CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT,
  style TEXT,
  resolution TEXT,
  image_url TEXT,
  has_watermark BOOLEAN DEFAULT TRUE,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 促销活动表
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'trial')) NOT NULL,
  discount_value INTEGER,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_user_id ON generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);

-- 更新 profiles 表添加会员相关字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_available BOOLEAN DEFAULT TRUE;

-- RLS 策略
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的订阅记录
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的订阅记录
CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的订阅记录
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能查看自己的生成记录
CREATE POLICY "Users can view own generation logs" ON generation_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的生成记录
CREATE POLICY "Users can insert own generation logs" ON generation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有促销信息
CREATE POLICY "Anyone can view active promotions" ON promotions
  FOR SELECT USING (is_active = TRUE);

-- 管理员可以管理促销
CREATE POLICY "Admin can manage promotions" ON promotions
  FOR ALL USING (true);

-- 更新 profiles 表的 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 插入默认促销活动
INSERT INTO promotions (code, name, description, discount_type, discount_value, max_uses, valid_until) VALUES
  ('WELCOME7', '新用户7天体验', '注册即送7天王者年卡体验', 'trial', 7, NULL, NOW() + INTERVAL '365 days'),
  ('EARLYBIRD', '早鸟年卡优惠', '年卡限时优惠价', 'fixed', 1000, 1000, NOW() + INTERVAL '90 days'),
  ('VIPEARLY', 'VIP早鸟优惠', '终身VIP早鸟价', 'fixed', 4000, 200, NOW() + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
