-- ============================================
-- InkAI 社区帖子填充脚本（完整版）
-- 执行方式：Supabase后台 → SQL Editor → 粘贴执行
-- ============================================

-- Step 1: 创建测试用户（在 auth.users 和 profiles 表）
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 检查用户是否已存在
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'inkai@official.com' LIMIT 1;
  
  IF new_user_id IS NULL THEN
    -- 创建一个用户
    INSERT INTO auth.users (id, email, created_at, updated_at, role, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'inkai@official.com',
      NOW(),
      NOW(),
      'authenticated',
      '{"username": "inkai_official", "display_name": "InkAI官方"}'::jsonb
    )
    RETURNING id INTO new_user_id;
    
    RAISE NOTICE '创建用户成功: %', new_user_id;
  ELSE
    RAISE NOTICE '用户已存在: %', new_user_id;
  END IF;

  -- Step 2: 创建对应的profile
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = new_user_id) THEN
    INSERT INTO profiles (id, username, display_name, bio)
    VALUES (new_user_id, 'inkai_official', 'InkAI官方', 'InkAI纹身社区官方账号，分享最新纹身设计灵感');
    RAISE NOTICE '创建Profile成功';
  ELSE
    RAISE NOTICE 'Profile已存在';
  END IF;

  -- Step 3: 插入10条社区帖子
  INSERT INTO tattoo_posts (user_id, title, description, image_url, image_urls, style, visibility, is_ai_generated, likes_count, comments_count, saves_count, views_count)
  VALUES
    (new_user_id, '传统艺术精髓：日式传统龙纹身设计', '探索日式传统龙纹身的秘密，这种设计融合了日本的神话故事和文化意象。传统龙纹身以其流畅的线条和丰富的色彩层次而闻名，象征着力量、智慧和好运。', '', ARRAY[]::text[], ARRAY['日式纹身', '传统龙纹身', '日本文化', '纹身设计', '神话象征'], 'public', false, 42, 0, 15, 328),
    (new_user_id, '极简线条纹身：探索小清新的艺术魅力', '在这个追求简约和自然的时代，极简线条纹身以其简洁的设计和清新的风格受到越来越多人的喜爱。线条流畅自然，既能够突出个人特色。', '', ARRAY[]::text[], ARRAY['极简纹身', '线条艺术', '小清新风格', '纹身设计', '简约美学'], 'public', false, 38, 0, 22, 256),
    (new_user_id, '水彩风纹身：肌肤上的诗意画作', '探索水彩纹身的艺术魅力，这种纹身风格将传统水彩画的流动性与纹身的永久性完美融合。水彩纹身以其柔和的色彩过渡和细腻的线条，实现了如画作一般的视觉效果。', '', ARRAY[]::text[], ARRAY['水彩纹身', '艺术纹身', '肌肤艺术', '个性纹身', '水彩风格'], 'public', false, 56, 0, 31, 412),
    (new_user_id, '黑灰写实纹身：永恒的经典艺术', '探索黑灰写实纹身的魅力，这种风格以其精细的线条和阴影处理而著称，能够真实地再现所选图像的细节。无论是人物肖像、动物，还是自然景观，都能通过艺术家的巧手转化为皮肤上的艺术杰作。', '', ARRAY[]::text[], ARRAY['黑灰纹身', '写实风格', '经典纹身', '纹身设计', '艺术纹身'], 'public', false, 47, 0, 19, 389),
    (new_user_id, '探索新传统纹身：古今融合的艺术魅力', '新传统纹身风格，打破传统束缚，融入现代元素，创造出独特的视觉语言。它将经典图案与现代设计相融合，呈现出强烈对比和新颖感。', '', ARRAY[]::text[], ARRAY['新传统纹身', '纹身设计', '传统与现代', '艺术融合', '文化传承'], 'public', false, 51, 0, 27, 367),
    (new_user_id, '纹身护理秘籍：如何让你的纹身色彩持久鲜艳', '纹身不仅仅是皮肤上的图案，它更是个人独特的艺术表达。本文将详细介绍纹身护理的重要性，包括正确的清洁、保湿、避免晒伤等专业建议，让你的纹身保持鲜艳。', '', ARRAY[]::text[], ARRAY['纹身护理', '纹身保养', '纹身色彩', '纹身风格', '纹身保护'], 'public', false, 73, 0, 45, 524),
    (new_user_id, '清新脱俗！超可爱小清新纹身合集', '探索InkAI纹身社区的「小清新纹身合集」，我们精选了一系列独特的设计，从迷你花卉、可爱动物图案到细腻的几何图形，每一种都体现了简约而不简单的设计理念。', '', ARRAY[]::text[], ARRAY['小清新纹身', '可爱纹身', '简约风格', '迷你纹身', '柔和色调'], 'public', false, 61, 0, 33, 445),
    (new_user_id, '手臂纹身创意集：从手腕至肩膀的艺术之旅', '探索手臂纹身的无限可能！本合集精选从手腕延伸至肩膀的纹身设计，展现多种风格与创意。无论是精致的小型图案还是覆盖整个手臂的大幅作品，每款设计都独具匠心。', '', ARRAY[]::text[], ARRAY['手臂纹身', '创意纹身', '日式纹身', '抽象纹身', '几何纹身'], 'public', false, 55, 0, 28, 398),
    (new_user_id, '如何挑选纹身风格？纹身艺术与个性的完美融合', '寻找适合你的纹身风格是一段自我探索的旅程。从传统到现代，从写实到抽象，每一种风格都有其独特的设计理念和艺术表现。这篇指南将带你深入了解纹身风格背后的艺术。', '', ARRAY[]::text[], ARRAY['纹身风格', '艺术选择', '个性化纹身', '风格指南', '纹身设计'], 'public', false, 89, 0, 52, 612),
    (new_user_id, '纹身艺术：旧纹身遮盖技巧与新图案设计', '探索如何巧妙地用新纹身覆盖旧纹身，从设计理念到风格选择，发现最适合您的方法。包括利用颜色对比、图案大小和设计元素来隐藏不想要的纹身。', '', ARRAY[]::text[], ARRAY['纹身遮盖', '纹身设计', '旧纹身覆盖', '纹身艺术', '纹身风格'], 'public', false, 44, 0, 18, 336);

  RAISE NOTICE '✅ 成功插入 10 条社区帖子！';
END $$;

-- 验证结果
SELECT '帖子总数:' as info, COUNT(*) as count FROM tattoo_posts
UNION ALL
SELECT '用户总数:', COUNT(*) FROM profiles;
