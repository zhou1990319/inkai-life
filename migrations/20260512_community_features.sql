-- ============================================
-- InkAI 社区功能数据库迁移
-- 日期：2026-05-12
-- ============================================

-- ============================================
-- 1. 扩展 tattoo_posts 表（多图支持、权限、位置）
-- ============================================
ALTER TABLE tattoo_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
ALTER TABLE tattoo_posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private'));
ALTER TABLE tattoo_posts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE tattoo_posts ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE tattoo_posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

-- 将单图迁移到 image_urls 数组（兼容旧数据）
UPDATE tattoo_posts SET image_urls = ARRAY[image_url] WHERE image_urls IS NULL OR array_length(image_urls, 1) IS NULL;

-- ============================================
-- 2. 创建 post_reports 表（举报功能）
-- ============================================
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES tattoo_posts(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 创建 comment_likes 表（评论点赞）
-- ============================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- ============================================
-- 4. 创建话题标签表
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  posts_count INTEGER DEFAULT 0,
  trending_score FLOAT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 帖子-标签关联表
CREATE TABLE IF NOT EXISTS post_tag_relations (
  post_id UUID REFERENCES tattoo_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES post_tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================
-- 5. 创建通知设置表
-- ============================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  likes_notifications BOOLEAN DEFAULT TRUE,
  comments_notifications BOOLEAN DEFAULT TRUE,
  follows_notifications BOOLEAN DEFAULT TRUE,
  mentions_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. 索引优化
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tattoo_posts_user_id ON tattoo_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_posts_created_at ON tattoo_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tattoo_posts_likes_count ON tattoo_posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_tattoo_posts_visibility ON tattoo_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_post_id ON post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_post_saves_user_id ON post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_posts_count ON post_tags(posts_count DESC);
CREATE INDEX IF NOT EXISTS idx_post_tags_trending ON post_tags(trending_score DESC);

-- ============================================
-- 7. 完善 RLS 策略
-- ============================================

-- tattoo_posts RLS
ALTER TABLE tattoo_posts ENABLE ROW LEVEL SECURITY;

-- 公开帖子对所有人可见
CREATE POLICY "Public posts are viewable by everyone" ON tattoo_posts
  FOR SELECT USING (visibility = 'public');

-- 粉丝可见帖子：发布者的粉丝可以看
CREATE POLICY "Followers can view followers-only posts" ON tattoo_posts
  FOR SELECT USING (
    visibility = 'followers'
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM follows
        WHERE follows.following_id = tattoo_posts.user_id
        AND follows.follower_id = auth.uid()
      )
    )
  );

-- 私人帖子：只有发布者自己可见
CREATE POLICY "Users can view own private posts" ON tattoo_posts
  FOR SELECT USING (visibility = 'private' AND user_id = auth.uid());

-- 登录用户可以创建帖子
CREATE POLICY "Authenticated users can create posts" ON tattoo_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的帖子
CREATE POLICY "Users can update own posts" ON tattoo_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的帖子
CREATE POLICY "Users can delete own posts" ON tattoo_posts
  FOR DELETE USING (auth.uid() = user_id);

-- comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- post_likes RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- post_saves RLS
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saves are viewable by everyone" ON post_saves
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create saves" ON post_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves" ON post_saves
  FOR DELETE USING (auth.uid() = user_id);

-- follows RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- post_reports RLS
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create reports" ON post_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Reporters can view own reports" ON post_reports
  FOR SELECT USING (reporter_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage reports" ON post_reports
  FOR ALL USING (true);

-- comment_likes RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment likes are viewable by everyone" ON comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like comments" ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- post_tags RLS
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone" ON post_tags
  FOR SELECT USING (true);

-- post_tag_relations RLS
ALTER TABLE post_tag_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tag relations are viewable by everyone" ON post_tag_relations
  FOR SELECT USING (true);

CREATE POLICY "Post owners can manage tag relations" ON post_tag_relations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tattoo_posts
      WHERE tattoo_posts.id = post_tag_relations.post_id
      AND tattoo_posts.user_id = auth.uid()
    )
  );

-- notification_settings RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notification settings" ON notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 8. 插入热门话题初始数据
-- ============================================
INSERT INTO post_tags (tag, description, is_featured) VALUES
  ('BlackAndGrey', '经典黑白纹身风格', TRUE),
  ('Traditional', '美式传统纹身', TRUE),
  ('WatercolorTattoo', '水彩风格纹身', TRUE),
  ('JapaneseTattoo', '日式纹身/浮世绘', TRUE),
  ('ChineseTattoo', '中式传统纹身', TRUE),
  ('Minimalist', '简约小清新纹身', TRUE),
  ('GeometricTattoo', '几何图形纹身', TRUE),
  ('RealisticTattoo', '写实风格纹身', TRUE),
  ('DragonTattoo', '龙纹身', TRUE),
  ('ScriptTattoo', '文字/字母纹身', TRUE),
  ('FloralTattoo', '花卉纹身', FALSE),
  ('SkullTattoo', '骷髅纹身', FALSE),
  ('AnimalTattoo', '动物纹身', FALSE),
  ('NeoTraditional', '新传统风格', FALSE),
  ('FineLineTattoo', '细线纹身', FALSE)
ON CONFLICT (tag) DO NOTHING;

-- ============================================
-- 9. 触发器：自动更新计数器
-- ============================================

-- 更新评论数触发器
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tattoo_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tattoo_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comments_count ON comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- 更新帖子点赞数触发器
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tattoo_posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tattoo_posts SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_likes_count ON post_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- 更新收藏数触发器
CREATE OR REPLACE FUNCTION update_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tattoo_posts SET saves_count = COALESCE(saves_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tattoo_posts SET saves_count = GREATEST(0, COALESCE(saves_count, 0) - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_saves_count ON post_saves;
CREATE TRIGGER trigger_update_saves_count
  AFTER INSERT OR DELETE ON post_saves
  FOR EACH ROW EXECUTE FUNCTION update_saves_count();

-- 更新粉丝/关注数触发器
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(0, COALESCE(followers_count, 0) - 1) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(0, COALESCE(following_count, 0) - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_follow_counts ON follows;
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- 更新标签帖子数触发器
CREATE OR REPLACE FUNCTION update_tag_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_tags SET posts_count = posts_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_tags SET posts_count = GREATEST(0, posts_count - 1) WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tag_posts_count ON post_tag_relations;
CREATE TRIGGER trigger_update_tag_posts_count
  AFTER INSERT OR DELETE ON post_tag_relations
  FOR EACH ROW EXECUTE FUNCTION update_tag_posts_count();

-- 评论点赞数触发器
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();
