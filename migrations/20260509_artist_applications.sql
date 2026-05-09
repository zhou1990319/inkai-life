-- =============================================
-- Artist Applications Table
-- 纹身师入驻申请表
-- =============================================

CREATE TABLE IF NOT EXISTS public.artist_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    portfolio_urls TEXT[] DEFAULT '{}',
    styles TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    price_range TEXT,
    location TEXT,
    instagram TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_artist_applications_user_id ON public.artist_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_applications_status ON public.artist_applications(status);

-- RLS (Row Level Security)
ALTER TABLE public.artist_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
    ON public.artist_applications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications"
    ON public.artist_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin policy: Users with admin role can view all applications
-- (Note: You need to create an admin role/policy in your auth system)

COMMENT ON TABLE public.artist_applications IS 'Tattoo artist applications for verification';
COMMENT ON COLUMN public.artist_applications.status IS 'Application status: pending, approved, rejected';
