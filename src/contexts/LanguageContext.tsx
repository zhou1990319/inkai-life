import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 支持的语言类型
export type Language = 'en' | 'ja' | 'zh' | 'pt' | 'es' | 'de';

// 语言配置
export const LANGUAGES: { id: Language; name: string; nativeName: string; flag: string }[] = [
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { id: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { id: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { id: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { id: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { id: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

// 翻译字典
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.community': 'Community',
    'nav.inspire': 'Inspire',
    'nav.artists': 'Artists',
    'nav.upgrade': 'Upgrade',
    'nav.apply_artist': 'Apply Artist',
    'nav.sign_in': 'Sign In',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications',

    // AI Generator
    'ai.title': 'AI Tattoo Generator',
    'ai.subtitle': 'Create stunning Chinese traditional tattoo designs with AI',
    'ai.style': 'Style',
    'ai.body_part': 'Body Part',
    'ai.prompt_placeholder': 'Describe your tattoo idea...',
    'ai.generate': 'Generate Tattoo',
    'ai.generating': 'Generating...',
    'ai.sign_in_to_generate': 'Sign In to Generate',
    'ai.preview': 'Preview',
    'ai.download': 'Download HD',
    'ai.share': 'Share',
    'ai.your_design': 'Your tattoo design will appear here',
    'ai.upload_image': 'Upload reference image',
    'ai.analyzing': 'Analyzing cultural meaning...',

    // Pricing (basic)
    'pricing.free': 'Free',
    'pricing.monthly': 'Monthly',
    'pricing.yearly': 'Yearly',
    'pricing.lifetime': 'Lifetime',
    'pricing.per_day': '/day',
    'pricing.per_month': '/month',
    'pricing.per_year': '/year',
    'pricing.generations': 'generations',
    'pricing.watermark': 'Watermark',
    'pricing.no_watermark': 'No Watermark',
    'pricing.upgrade': 'Upgrade Now',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',

    // Body Parts
    'body.arm': 'Arm',
    'body.back': 'Back',
    'body.chest': 'Chest',
    'body.wrist': 'Wrist',
    'body.collarbone': 'Collarbone',
    'body.thigh': 'Thigh',
    'body.calf': 'Calf',

    // Auth - Login
    'auth.welcome_back': 'Welcome Back',
    'auth.sign_in_to_continue': 'Sign in to continue your journey',
    'auth.sign_in': 'Sign In',
    'auth.signing_in': 'Signing in...',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.enter_email': 'Enter your email',
    'auth.enter_password': 'Enter your password',
    'auth.no_account': "Don't have an account?",
    'auth.sign_up_link': 'Sign up',
    'auth.forgot_password': 'Forgot password?',

    // Auth - Register
    'auth.create_account': 'Create Account',
    'auth.join_community': 'Join InkAI.life community',
    'auth.username': 'Username',
    'auth.choose_username': 'Choose a username',
    'auth.create_password': 'Create a password',
    'auth.creating': 'Creating...',
    'auth.has_account': 'Already have an account?',
    'auth.sign_in_link': 'Sign in',
    'auth.agree_terms': 'I agree to the',
    'auth.terms_of_service': 'Terms of Service',

    // Styles
    'style.oriental': 'Oriental',
    'style.japanese': 'Japanese',
    'style.american_traditional': 'American Traditional',
    'style.neo_traditional': 'Neo-Traditional',
    'style.blackwork': 'Dark & Blackwork',
    'style.watercolor': 'Watercolor',
    'style.minimalist': 'Minimalist',
    'style.realism': 'Realism',

    // Home Page
    'home.hero_title': 'Create Stunning Chinese Traditional Tattoos with AI',
    'home.hero_subtitle': 'Transform your ideas into unique tattoo designs in seconds. Powered by advanced AI technology.',
    'home.get_started': 'Get Started Free',
    'home.view_examples': 'View Examples',
    'home.features_title': 'Why Choose InkAI',
    'home.feature_ai_title': 'AI-Powered Design',
    'home.feature_ai_desc': 'Generate unique tattoo designs instantly with our advanced AI technology',
    'home.feature_style_title': 'Traditional Styles',
    'home.feature_style_desc': 'Explore authentic Chinese traditional tattoo styles and cultural elements',
    'home.feature_community_title': 'Community Gallery',
    'home.feature_community_desc': 'Share your designs and discover inspiration from our community',
    'home.feature_artist_title': 'Professional Artists',
    'home.feature_artist_desc': 'Connect with certified tattoo artists for your next ink',
    'home.how_it_works': 'How It Works',
    'home.step1_title': 'Describe Your Vision',
    'home.step1_desc': 'Tell us what tattoo style and design you want',
    'home.step2_title': 'AI Generates',
    'home.step2_desc': 'Our AI creates unique designs based on your description',
    'home.step3_title': 'Download & Share',
    'home.step3_desc': 'Get high-quality designs ready for your tattoo artist',

    // Explore Page
    'explore.title': 'Community',
    'explore.recommend': 'For You',
    'explore.latest': 'Latest',
    'explore.hot': 'Popular',
    'explore.following': 'Following',
    'explore.search_placeholder': 'Search posts...',
    'explore.no_results': 'No posts found',
    'explore.load_more': 'Load More',
    'explore.trending_tags': 'Trending Tags',

    // Inspire Page
    'inspire.title': 'Inspiration',
    'inspire.subtitle': 'Get inspired by these traditional Chinese tattoo prompts',
    'inspire.copy_prompt': 'Copy Prompt',
    'inspire.copied': 'Copied!',

    // Pricing Page
    'pricing.title': 'Membership Plans',
    'pricing.subtitle': 'Choose the plan that works best for you',
    'pricing.current_plan': 'Current Plan',
    'pricing.features': 'Features',
    'pricing.unlimited_generations': 'Unlimited Generations',
    'pricing.priority_support': 'Priority Support',
    'pricing.exclusive_styles': 'Exclusive Styles',
    'pricing.choose_plan': 'Choose Plan',

    // Profile Page
    'profile.posts': 'Posts',
    'profile.saved': 'Saved',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.edit_profile': 'Edit Profile',
    'profile.follow': 'Follow',
    'profile.unfollow': 'Unfollow',
    'profile.no_posts': 'No posts yet',

    // Create Page
    'create.title': 'Create Post',
    'create.select_images': 'Select Images',
    'create.drag_or_click': 'Drag and drop images here or click to select',
    'create.post_type': 'Post Type',
    'create.work': 'Tattoo Work',
    'create.idea': 'Idea',
    'create.tattoo_style': 'Tattoo Style',
    'create.tags': 'Tags',
    'create.visibility': 'Visibility',
    'create.public': 'Public',
    'create.followers_only': 'Followers Only',
    'create.private': 'Private',
    'create.post': 'Post',
    'create.posting': 'Posting...',

    // Post Detail
    'post.likes': 'Likes',
    'post.comments': 'Comments',
    'post.share': 'Share',
    'post.report': 'Report',
    'post.write_comment': 'Write a comment...',
    'post.send': 'Send',
    'post.delete': 'Delete',
    'post.edit': 'Edit',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Mark all as read',
    'notifications.no_notifications': 'No notifications yet',
    'notifications.liked': 'liked your post',
    'notifications.commented': 'commented on your post',
    'notifications.followed': 'started following you',
    'notifications.save': 'saved your post',

    // Artist
    'artist.apply': 'Apply as Artist',
    'artist.portfolio': 'Portfolio',
    'artist.specialties': 'Specialties',
    'artist.experience': 'Experience',
    'artist.book_appointment': 'Book Appointment',
    'artist.view_profile': 'View Profile',

    // Common Actions
    'action.like': 'Like',
    'action.unlike': 'Unlike',
    'action.save': 'Save',
    'action.unsave': 'Unsave',
    'action.share': 'Share',
    'action.report': 'Report',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.follow': 'Follow',
    'action.unfollow': 'Unfollow',

    // Legal
    'legal.terms': 'Terms of Service',
    'legal.privacy': 'Privacy Policy',
    'legal.disclaimer': 'Disclaimer',
  },

  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.community': 'コミュニティ',
    'nav.inspire': 'インスピレーション',
    'nav.artists': 'アーティスト',
    'nav.upgrade': 'アップグレード',
    'nav.apply_artist': 'アーティスト申請',
    'nav.sign_in': 'ログイン',
    'nav.profile': 'プロフィール',
    'nav.notifications': '通知',

    // AI Generator
    'ai.title': 'AI タトゥー ジェネレーター',
    'ai.subtitle': 'AI で素晴らしい中国伝統タトゥーデザインを作成',
    'ai.style': 'スタイル',
    'ai.body_part': 'ボディ部位',
    'ai.prompt_placeholder': 'タトゥーのアイデアを入力...',
    'ai.generate': '生成する',
    'ai.generating': '生成中...',
    'ai.sign_in_to_generate': 'ログインして生成',
    'ai.preview': 'プレビュー',
    'ai.download': 'HD ダウンロード',
    'ai.share': '共有',
    'ai.your_design': 'タトゥーデザインがここに表示されます',
    'ai.upload_image': '参照画像をアップロード',
    'ai.analyzing': '文化的意味を分析中...',

    // Pricing (basic)
    'pricing.free': 'フリー',
    'pricing.monthly': 'マンスリー',
    'pricing.yearly': 'イアーリー',
    'pricing.lifetime': 'ライフタイム',
    'pricing.per_day': '/日',
    'pricing.per_month': '/月',
    'pricing.per_year': '/年',
    'pricing.generations': '生成',
    'pricing.watermark': '透かし',
    'pricing.no_watermark': '透かしなし',
    'pricing.upgrade': 'アップグレード',

    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.cancel': 'キャンセル',
    'common.confirm': '確認',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.close': '閉じる',

    // Body Parts
    'body.arm': '腕',
    'body.back': '背中',
    'body.chest': '胸',
    'body.wrist': '手首',
    'body.collarbone': '鎖骨',
    'body.thigh': '太もも',
    'body.calf': 'ふくらはぎ',

    // Auth - Login
    'auth.welcome_back': 'おかえりなさい',
    'auth.sign_in_to_continue': 'ログインして続行',
    'auth.sign_in': 'ログイン',
    'auth.signing_in': 'ログイン中...',
    'auth.email': 'メールアドレス',
    'auth.password': 'パスワード',
    'auth.enter_email': 'メールアドレスを入力',
    'auth.enter_password': 'パスワードを入力',
    'auth.no_account': 'アカウントをお持ちでない方',
    'auth.sign_up_link': '新規登録',
    'auth.forgot_password': 'パスワードをお忘れですか？',

    // Auth - Register
    'auth.create_account': 'アカウント作成',
    'auth.join_community': 'InkAI.life コミュニティに参加',
    'auth.username': 'ユーザー名',
    'auth.choose_username': 'ユーザー名を選択',
    'auth.create_password': 'パスワードを作成',
    'auth.creating': '作成中...',
    'auth.has_account': 'すでにアカウントをお持ちの方',
    'auth.sign_in_link': 'ログイン',
    'auth.agree_terms': '同意する',
    'auth.terms_of_service': '利用規約',

    // Styles
    'style.oriental': '中華風',
    'style.japanese': '和風',
    'style.american_traditional': 'アメリカントラディショナル',
    'style.neo_traditional': 'ネオトラディショナル',
    'style.blackwork': 'ダーク＆ブラックワーク',
    'style.watercolor': '水彩',
    'style.minimalist': 'ミニマリスト',
    'style.realism': 'リアリスム',

    // Home Page
    'home.hero_title': 'AIで中国の伝統タトゥーデザインを作成',
    'home.hero_subtitle': 'あなたのアイデアを数秒でユニークなタトゥーデザインに変換。先進的なAI技術搭載。',
    'home.get_started': '無料で始める',
    'home.view_examples': '例を見る',
    'home.features_title': 'InkAIを選ぶ理由',
    'home.feature_ai_title': 'AI対応デザイン',
    'home.feature_ai_desc': '先進的なAI技術でユニークなタトゥーデザインを即座に生成',
    'home.feature_style_title': '伝統的なスタイル',
    'home.feature_style_desc': '本物の中国伝統タトゥースタイルと文化要素を探索',
    'home.feature_community_title': 'コミュニティギャラリー',
    'home.feature_community_desc': 'あなたのデザインを共有し、コミュニティからインスピレーションを得る',
    'home.feature_artist_title': 'プロフェッショナルアーティスト',
    'home.feature_artist_desc': '次のインクのために認定タトゥーアーティストとつながる',
    'home.how_it_works': '仕組み',
    'home.step1_title': 'あなたのビジョンを伝える',
    'home.step1_desc': 'タトゥースタイルとデザインを教えてください',
    'home.step2_title': 'AIが生成',
    'home.step2_desc': 'AIがあなたの説明に基づいてユニークなデザインを生成',
    'home.step3_title': 'ダウンロード＆共有',
    'home.step3_desc': 'タトゥーアーティスト用の高品質デザインを入手',

    // Explore Page
    'explore.title': 'コミュニティ',
    'explore.recommend': 'おすすめ',
    'explore.latest': '最新',
    'explore.hot': '人気',
    'explore.following': 'フォロー中',
    'explore.search_placeholder': '投稿を検索...',
    'explore.no_results': '投稿が見つかりません',
    'explore.load_more': 'もっと読み込む',
    'explore.trending_tags': 'トレンドタグ',

    // Inspire Page
    'inspire.title': 'インスピレーション',
    'inspire.subtitle': 'これらの伝統的な中国タトゥープロンプトからインスピレーションを得る',
    'inspire.copy_prompt': 'プロンプトをコピー',
    'inspire.copied': 'コピーしました！',

    // Pricing Page
    'pricing.title': 'メンバーシッププラン',
    'pricing.subtitle': 'あなたに最適なプランを選択',
    'pricing.current_plan': '現在のプラン',
    'pricing.features': '機能',
    'pricing.unlimited_generations': '無制限生成',
    'pricing.priority_support': '優先サポート',
    'pricing.exclusive_styles': '限定スタイル',
    'pricing.choose_plan': 'プランを選択',

    // Profile Page
    'profile.posts': '投稿',
    'profile.saved': '保存済み',
    'profile.followers': 'フォロワー',
    'profile.following': 'フォロー中',
    'profile.edit_profile': 'プロフィールを編集',
    'profile.follow': 'フォロー',
    'profile.unfollow': 'フォロー解除',
    'profile.no_posts': 'まだ投稿がありません',

    // Create Page
    'create.title': '投稿を作成',
    'create.select_images': '画像を選択',
    'create.drag_or_click': '画像をドラッグ＆ドロップするか、クリックして選択',
    'create.post_type': '投稿タイプ',
    'create.work': 'タトゥワーク',
    'create.idea': 'アイデア',
    'create.tattoo_style': 'タトゥースタイル',
    'create.tags': 'タグ',
    'create.visibility': '公開設定',
    'create.public': '公開',
    'create.followers_only': 'フォロワーのみ',
    'create.private': '非公開',
    'create.post': '投稿する',
    'create.posting': '投稿中...',

    // Post Detail
    'post.likes': 'いいね',
    'post.comments': 'コメント',
    'post.share': '共有',
    'post.report': '報告',
    'post.write_comment': 'コメントを書く...',
    'post.send': '送信',
    'post.delete': '削除',
    'post.edit': '編集',

    // Notifications
    'notifications.title': '通知',
    'notifications.mark_all_read': 'すべて既読にする',
    'notifications.no_notifications': '通知はまだありません',
    'notifications.liked': 'あなたの投稿をいいねしました',
    'notifications.commented': 'あなたの投稿にコメントしました',
    'notifications.followed': 'フォローしました',
    'notifications.save': 'あなたの投稿を保存しました',

    // Artist
    'artist.apply': 'アーティストとして申請',
    'artist.portfolio': 'ポートフォリオ',
    'artist.specialties': '専門分野',
    'artist.experience': '経験',
    'artist.book_appointment': '予約する',
    'artist.view_profile': 'プロフィールを見る',

    // Common Actions
    'action.like': 'いいね',
    'action.unlike': 'いいね解除',
    'action.save': '保存',
    'action.unsave': '保存解除',
    'action.share': '共有',
    'action.report': '報告',
    'action.delete': '削除',
    'action.edit': '編集',
    'action.follow': 'フォロー',
    'action.unfollow': 'フォロー解除',

    // Legal
    'legal.terms': '利用規約',
    'legal.privacy': 'プライバシーポリシー',
    'legal.disclaimer': '免責事項',
  },

  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.community': '社区',
    'nav.inspire': '灵感',
    'nav.artists': '艺术家',
    'nav.upgrade': '升级',
    'nav.apply_artist': '申请艺术家',
    'nav.sign_in': '登录',
    'nav.profile': '个人资料',
    'nav.notifications': '通知',

    // AI Generator
    'ai.title': 'AI 纹身生成器',
    'ai.subtitle': '用 AI 创作精美的中式传统纹身设计',
    'ai.style': '风格',
    'ai.body_part': '纹身部位',
    'ai.prompt_placeholder': '描述你的纹身想法...',
    'ai.generate': '生成纹身',
    'ai.generating': '生成中...',
    'ai.sign_in_to_generate': '登录以生成',
    'ai.preview': '预览',
    'ai.download': '下载高清',
    'ai.share': '分享',
    'ai.your_design': '你的纹身设计将显示在这里',
    'ai.upload_image': '上传参考图片',
    'ai.analyzing': '正在分析文化含义...',

    // Pricing (basic)
    'pricing.free': '免费',
    'pricing.monthly': '月付',
    'pricing.yearly': '年付',
    'pricing.lifetime': '终身',
    'pricing.per_day': '/天',
    'pricing.per_month': '/月',
    'pricing.per_year': '/年',
    'pricing.generations': '次生成',
    'pricing.watermark': '水印',
    'pricing.no_watermark': '无水印',
    'pricing.upgrade': '立即升级',

    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.close': '关闭',

    // Body Parts
    'body.arm': '手臂',
    'body.back': '背部',
    'body.chest': '胸部',
    'body.wrist': '手腕',
    'body.collarbone': '锁骨',
    'body.thigh': '大腿',
    'body.calf': '小腿',

    // Auth - Login
    'auth.welcome_back': '欢迎回来',
    'auth.sign_in_to_continue': '登录以继续您的旅程',
    'auth.sign_in': '登录',
    'auth.signing_in': '登录中...',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.enter_email': '输入您的邮箱',
    'auth.enter_password': '输入您的密码',
    'auth.no_account': '还没有账户？',
    'auth.sign_up_link': '立即注册',
    'auth.forgot_password': '忘记密码？',

    // Auth - Register
    'auth.create_account': '创建账户',
    'auth.join_community': '加入 InkAI.life 社区',
    'auth.username': '用户名',
    'auth.choose_username': '选择用户名',
    'auth.create_password': '创建密码',
    'auth.creating': '创建中...',
    'auth.has_account': '已有账户？',
    'auth.sign_in_link': '立即登录',
    'auth.agree_terms': '我同意',
    'auth.terms_of_service': '服务条款',

    // Styles
    'style.oriental': '中式',
    'style.japanese': '日式',
    'style.american_traditional': '美式传统',
    'style.neo_traditional': '新传统',
    'style.blackwork': '暗黑黑灰',
    'style.watercolor': '水彩',
    'style.minimalist': '极简线条',
    'style.realism': '写实',

    // Home Page
    'home.hero_title': '用 AI 创作惊艳的中式传统纹身',
    'home.hero_subtitle': '在几秒钟内将您的想法转化为独特的纹身设计。由先进的 AI 技术驱动。',
    'home.get_started': '免费开始',
    'home.view_examples': '查看示例',
    'home.features_title': '为什么选择 InkAI',
    'home.feature_ai_title': 'AI 驱动设计',
    'home.feature_ai_desc': '利用先进的 AI 技术即时生成独特的纹身设计',
    'home.feature_style_title': '传统风格',
    'home.feature_style_desc': '探索正宗的中式传统纹身风格和文化元素',
    'home.feature_community_title': '社区画廊',
    'home.feature_community_desc': '分享您的设计，从社区中获取灵感',
    'home.feature_artist_title': '专业艺术家',
    'home.feature_artist_desc': '与认证纹身艺术家联系，完成您的下一个纹身',
    'home.how_it_works': '使用方法',
    'home.step1_title': '描述您的想法',
    'home.step1_desc': '告诉我们您想要的纹身风格和设计',
    'home.step2_title': 'AI 生成',
    'home.step2_desc': '我们的 AI 根据您的描述创建独特的设计',
    'home.step3_title': '下载和分享',
    'home.step3_desc': '获取适合纹身艺术家的高品质设计',

    // Explore Page
    'explore.title': '社区',
    'explore.recommend': '推荐',
    'explore.latest': '最新',
    'explore.hot': '热门',
    'explore.following': '关注中',
    'explore.search_placeholder': '搜索帖子...',
    'explore.no_results': '未找到帖子',
    'explore.load_more': '加载更多',
    'explore.trending_tags': '热门标签',

    // Inspire Page
    'inspire.title': '灵感',
    'inspire.subtitle': '从这些传统中式纹身提示中获取灵感',
    'inspire.copy_prompt': '复制提示',
    'inspire.copied': '已复制！',

    // Pricing Page
    'pricing.title': '会员计划',
    'pricing.subtitle': '选择最适合您的方案',
    'pricing.current_plan': '当前方案',
    'pricing.features': '功能',
    'pricing.unlimited_generations': '无限生成',
    'pricing.priority_support': '优先支持',
    'pricing.exclusive_styles': '专属风格',
    'pricing.choose_plan': '选择方案',

    // Profile Page
    'profile.posts': '帖子',
    'profile.saved': '已保存',
    'profile.followers': '粉丝',
    'profile.following': '关注中',
    'profile.edit_profile': '编辑资料',
    'profile.follow': '关注',
    'profile.unfollow': '取消关注',
    'profile.no_posts': '还没有帖子',

    // Create Page
    'create.title': '创建帖子',
    'create.select_images': '选择图片',
    'create.drag_or_click': '拖拽图片到此处或点击选择',
    'create.post_type': '帖子类型',
    'create.work': '纹身作品',
    'create.idea': '创意',
    'create.tattoo_style': '纹身风格',
    'create.tags': '标签',
    'create.visibility': '可见性',
    'create.public': '公开',
    'create.followers_only': '仅关注者',
    'create.private': '私密',
    'create.post': '发布',
    'create.posting': '发布中...',

    // Post Detail
    'post.likes': '点赞',
    'post.comments': '评论',
    'post.share': '分享',
    'post.report': '举报',
    'post.write_comment': '写评论...',
    'post.send': '发送',
    'post.delete': '删除',
    'post.edit': '编辑',

    // Notifications
    'notifications.title': '通知',
    'notifications.mark_all_read': '全部标记为已读',
    'notifications.no_notifications': '暂无通知',
    'notifications.liked': '赞了你的帖子',
    'notifications.commented': '评论了你的帖子',
    'notifications.followed': '关注了你',
    'notifications.save': '保存了你的帖子',

    // Artist
    'artist.apply': '申请成为艺术家',
    'artist.portfolio': '作品集',
    'artist.specialties': '专长',
    'artist.experience': '经验',
    'artist.book_appointment': '预约',
    'artist.view_profile': '查看资料',

    // Common Actions
    'action.like': '点赞',
    'action.unlike': '取消点赞',
    'action.save': '保存',
    'action.unsave': '取消保存',
    'action.share': '分享',
    'action.report': '举报',
    'action.delete': '删除',
    'action.edit': '编辑',
    'action.follow': '关注',
    'action.unfollow': '取消关注',

    // Legal
    'legal.terms': '服务条款',
    'legal.privacy': '隐私政策',
    'legal.disclaimer': '免责声明',
  },

  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.community': 'Comunidade',
    'nav.inspire': 'Inspiração',
    'nav.artists': 'Artistas',
    'nav.upgrade': 'Upgrade',
    'nav.apply_artist': 'Aplicar Artista',
    'nav.sign_in': 'Entrar',
    'nav.profile': 'Perfil',
    'nav.notifications': 'Notificações',

    // AI Generator
    'ai.title': 'Gerador de Tatuagem AI',
    'ai.subtitle': 'Crie designs de tatuagens tradicionais chinesas impressionantes com IA',
    'ai.style': 'Estilo',
    'ai.body_part': 'Parte do Corpo',
    'ai.prompt_placeholder': 'Descreva sua ideia de tatuagem...',
    'ai.generate': 'Gerar Tatuagem',
    'ai.generating': 'Gerando...',
    'ai.sign_in_to_generate': 'Entre para Gerar',
    'ai.preview': 'Visualização',
    'ai.download': 'Baixar HD',
    'ai.share': 'Compartilhar',
    'ai.your_design': 'Seu design de tatuagem aparecerá aqui',
    'ai.upload_image': 'Carregar imagem de referência',
    'ai.analyzing': 'Analisando significado cultural...',

    // Pricing (basic)
    'pricing.free': 'Grátis',
    'pricing.monthly': 'Mensal',
    'pricing.yearly': 'Anual',
    'pricing.lifetime': 'Vitalício',
    'pricing.per_day': '/dia',
    'pricing.per_month': '/mês',
    'pricing.per_year': '/ano',
    'pricing.generations': 'gerações',
    'pricing.watermark': 'Marca d\'água',
    'pricing.no_watermark': 'Sem Marca d\'água',
    'pricing.upgrade': 'Atualizar Agora',

    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Salvar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.close': 'Fechar',

    // Body Parts
    'body.arm': 'Braço',
    'body.back': 'Costas',
    'body.chest': 'Peito',
    'body.wrist': 'Pulso',
    'body.collarbone': 'Clavícula',
    'body.thigh': 'Coxa',
    'body.calf': 'Panturrilha',

    // Auth - Login
    'auth.welcome_back': 'Bem-vindo de Volta',
    'auth.sign_in_to_continue': 'Entre para continuar sua jornada',
    'auth.sign_in': 'Entrar',
    'auth.signing_in': 'Entrando...',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.enter_email': 'Digite seu e-mail',
    'auth.enter_password': 'Digite sua senha',
    'auth.no_account': 'Não tem uma conta?',
    'auth.sign_up_link': 'Cadastre-se',
    'auth.forgot_password': 'Esqueceu a senha?',

    // Auth - Register
    'auth.create_account': 'Criar Conta',
    'auth.join_community': 'Junte-se à comunidade InkAI.life',
    'auth.username': 'Nome de Usuário',
    'auth.choose_username': 'Escolha um nome de usuário',
    'auth.create_password': 'Crie uma senha',
    'auth.creating': 'Criando...',
    'auth.has_account': 'Já tem uma conta?',
    'auth.sign_in_link': 'Entrar',
    'auth.agree_terms': 'Eu concordo com o',
    'auth.terms_of_service': 'Termos de Serviço',

    // Styles
    'style.oriental': 'Oriental',
    'style.japanese': 'Japonês',
    'style.american_traditional': 'Americano Tradicional',
    'style.neo_traditional': 'Neo Tradicional',
    'style.blackwork': 'Escuro & Blackwork',
    'style.watercolor': 'Aquarela',
    'style.minimalist': 'Minimalista',
    'style.realism': 'Realismo',

    // Home Page
    'home.hero_title': 'Crie Tatuagens Tradicionais Chinesas Incríveis com IA',
    'home.hero_subtitle': 'Transforme suas ideias em designs de tatuagem únicos em segundos. Alimentado por tecnologia avançada de IA.',
    'home.get_started': 'Comece Grátis',
    'home.view_examples': 'Ver Exemplos',
    'home.features_title': 'Por Que Escolher a InkAI',
    'home.feature_ai_title': 'Design com IA',
    'home.feature_ai_desc': 'Gere designs de tatuagem únicos instantaneamente com nossa IA avançada',
    'home.feature_style_title': 'Estilos Tradicionais',
    'home.feature_style_desc': 'Explore estilos autênticos de tatuagem tradicional chinesa e elementos culturais',
    'home.feature_community_title': 'Galeria da Comunidade',
    'home.feature_community_desc': 'Compartilhe seus designs e descubra inspiração da nossa comunidade',
    'home.feature_artist_title': 'Artistas Profissionais',
    'home.feature_artist_desc': 'Conecte-se com tatuadores certificados para sua próxima tatuagem',
    'home.how_it_works': 'Como Funciona',
    'home.step1_title': 'Descreva Sua Visão',
    'home.step1_desc': 'Nos diga qual estilo e design de tatuagem você deseja',
    'home.step2_title': 'IA Gera',
    'home.step2_desc': 'Nossa IA cria designs únicos com base na sua descrição',
    'home.step3_title': 'Baixar & Compartilhar',
    'home.step3_desc': 'Obtenha designs de alta qualidade prontos para seu tatuador',

    // Explore Page
    'explore.title': 'Comunidade',
    'explore.recommend': 'Para Você',
    'explore.latest': 'Recentes',
    'explore.hot': 'Popular',
    'explore.following': 'Seguindo',
    'explore.search_placeholder': 'Buscar publicações...',
    'explore.no_results': 'Nenhuma publicação encontrada',
    'explore.load_more': 'Carregar Mais',
    'explore.trending_tags': 'Tags em Alta',

    // Inspire Page
    'inspire.title': 'Inspiração',
    'inspire.subtitle': 'Inspire-se com essas sugestões de tatuagem tradicional chinesa',
    'inspire.copy_prompt': 'Copiar Sugestão',
    'inspire.copied': 'Copiado!',

    // Pricing Page
    'pricing.title': 'Planos de Assinatura',
    'pricing.subtitle': 'Escolha o plano que melhor funciona para você',
    'pricing.current_plan': 'Plano Atual',
    'pricing.features': 'Recursos',
    'pricing.unlimited_generations': 'Gerações Ilimitadas',
    'pricing.priority_support': 'Suporte Prioritário',
    'pricing.exclusive_styles': 'Estilos Exclusivos',
    'pricing.choose_plan': 'Escolher Plano',

    // Profile Page
    'profile.posts': 'Publicações',
    'profile.saved': 'Salvos',
    'profile.followers': 'Seguidores',
    'profile.following': 'Seguindo',
    'profile.edit_profile': 'Editar Perfil',
    'profile.follow': 'Seguir',
    'profile.unfollow': 'Deixar de Seguir',
    'profile.no_posts': 'Nenhuma publicação ainda',

    // Create Page
    'create.title': 'Criar Publicação',
    'create.select_images': 'Selecionar Imagens',
    'create.drag_or_click': 'Arraste e solte imagens aqui ou clique para selecionar',
    'create.post_type': 'Tipo de Publicação',
    'create.work': 'Trabalho de Tatuagem',
    'create.idea': 'Ideia',
    'create.tattoo_style': 'Estilo de Tatuagem',
    'create.tags': 'Tags',
    'create.visibility': 'Visibilidade',
    'create.public': 'Público',
    'create.followers_only': 'Apenas Seguidores',
    'create.private': 'Privado',
    'create.post': 'Publicar',
    'create.posting': 'Publicando...',

    // Post Detail
    'post.likes': 'Curtidas',
    'post.comments': 'Comentários',
    'post.share': 'Compartilhar',
    'post.report': 'Denunciar',
    'post.write_comment': 'Escreva um comentário...',
    'post.send': 'Enviar',
    'post.delete': 'Excluir',
    'post.edit': 'Editar',

    // Notifications
    'notifications.title': 'Notificações',
    'notifications.mark_all_read': 'Marcar todas como lidas',
    'notifications.no_notifications': 'Nenhuma notificação ainda',
    'notifications.liked': 'curtiu sua publicação',
    'notifications.commented': 'comentou na sua publicação',
    'notifications.followed': 'começou a seguir você',
    'notifications.save': 'salvou sua publicação',

    // Artist
    'artist.apply': 'Candidate-se como Artista',
    'artist.portfolio': 'Portfólio',
    'artist.specialties': 'Especialidades',
    'artist.experience': 'Experiência',
    'artist.book_appointment': 'Agendar Horário',
    'artist.view_profile': 'Ver Perfil',

    // Common Actions
    'action.like': 'Curtir',
    'action.unlike': 'Descurtir',
    'action.save': 'Salvar',
    'action.unsave': 'Remover dos Salvos',
    'action.share': 'Compartilhar',
    'action.report': 'Denunciar',
    'action.delete': 'Excluir',
    'action.edit': 'Editar',
    'action.follow': 'Seguir',
    'action.unfollow': 'Deixar de Seguir',

    // Legal
    'legal.terms': 'Termos de Serviço',
    'legal.privacy': 'Política de Privacidade',
    'legal.disclaimer': 'Aviso Legal',
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.community': 'Comunidad',
    'nav.inspire': 'Inspiración',
    'nav.artists': 'Artistas',
    'nav.upgrade': 'Mejorar',
    'nav.apply_artist': 'Aplicar Artista',
    'nav.sign_in': 'Iniciar Sesión',
    'nav.profile': 'Perfil',
    'nav.notifications': 'Notificaciones',

    // AI Generator
    'ai.title': 'Generador de Tatuajes AI',
    'ai.subtitle': 'Crea impresionantes diseños de tatuajes tradicionales chinos con IA',
    'ai.style': 'Estilo',
    'ai.body_part': 'Parte del Cuerpo',
    'ai.prompt_placeholder': 'Describe tu idea de tatuaje...',
    'ai.generate': 'Generar Tatuaje',
    'ai.generating': 'Generando...',
    'ai.sign_in_to_generate': 'Inicia sesión para Generar',
    'ai.preview': 'Vista Previa',
    'ai.download': 'Descargar HD',
    'ai.share': 'Compartir',
    'ai.your_design': 'Tu diseño de tatuaje aparecerá aquí',
    'ai.upload_image': 'Subir imagen de referencia',
    'ai.analyzing': 'Analizando significado cultural...',

    // Pricing (basic)
    'pricing.free': 'Gratis',
    'pricing.monthly': 'Mensual',
    'pricing.yearly': 'Anual',
    'pricing.lifetime': 'Vitalicio',
    'pricing.per_day': '/día',
    'pricing.per_month': '/mes',
    'pricing.per_year': '/año',
    'pricing.generations': 'generaciones',
    'pricing.watermark': 'Marca de agua',
    'pricing.no_watermark': 'Sin Marca de agua',
    'pricing.upgrade': 'Mejorar Ahora',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',

    // Body Parts
    'body.arm': 'Brazo',
    'body.back': 'Espalda',
    'body.chest': 'Pecho',
    'body.wrist': 'Muñeca',
    'body.collarbone': 'Clavícula',
    'body.thigh': 'Muslo',
    'body.calf': 'Pantorrilla',

    // Auth - Login
    'auth.welcome_back': 'Bienvenido de Nuevo',
    'auth.sign_in_to_continue': 'Inicia sesión para continuar tu viaje',
    'auth.sign_in': 'Iniciar Sesión',
    'auth.signing_in': 'Iniciando sesión...',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.enter_email': 'Ingresa tu correo electrónico',
    'auth.enter_password': 'Ingresa tu contraseña',
    'auth.no_account': '¿No tienes una cuenta?',
    'auth.sign_up_link': 'Regístrate',
    'auth.forgot_password': '¿Olvidaste tu contraseña?',

    // Auth - Register
    'auth.create_account': 'Crear Cuenta',
    'auth.join_community': 'Únete a la comunidad InkAI.life',
    'auth.username': 'Nombre de Usuario',
    'auth.choose_username': 'Elige un nombre de usuario',
    'auth.create_password': 'Crea una contraseña',
    'auth.creating': 'Creando...',
    'auth.has_account': '¿Ya tienes una cuenta?',
    'auth.sign_in_link': 'Inicia sesión',
    'auth.agree_terms': 'Acepto los',
    'auth.terms_of_service': 'Términos de Servicio',

    // Styles
    'style.oriental': 'Oriental',
    'style.japanese': 'Japonés',
    'style.american_traditional': 'Americano Tradicional',
    'style.neo_traditional': 'Neo Tradicional',
    'style.blackwork': 'Oscuro & Blackwork',
    'style.watercolor': 'Acuarela',
    'style.minimalist': 'Minimalista',
    'style.realism': 'Realismo',

    // Home Page
    'home.hero_title': 'Crea Impresionantes Tatuajes Tradicionales Chinos con IA',
    'home.hero_subtitle': 'Transforma tus ideas en diseños de tatuaje únicos en segundos. Impulsado por tecnología de IA avanzada.',
    'home.get_started': 'Comienza Gratis',
    'home.view_examples': 'Ver Ejemplos',
    'home.features_title': 'Por Qué Elegir InkAI',
    'home.feature_ai_title': 'Diseño con IA',
    'home.feature_ai_desc': 'Genera diseños de tatuaje únicos instantáneamente con nuestra IA avanzada',
    'home.feature_style_title': 'Estilos Tradicionales',
    'home.feature_style_desc': 'Explora estilos auténticos de tatuaje tradicional chino y elementos culturales',
    'home.feature_community_title': 'Galería de la Comunidad',
    'home.feature_community_desc': 'Comparte tus diseños y descubre inspiración de nuestra comunidad',
    'home.feature_artist_title': 'Artistas Profesionales',
    'home.feature_artist_desc': 'Conéctate con artistas del tatuaje certificados para tu próxima tinta',
    'home.how_it_works': 'Cómo Funciona',
    'home.step1_title': 'Describe Tu Visión',
    'home.step1_desc': 'Cuéntanos qué estilo y diseño de tatuaje quieres',
    'home.step2_title': 'IA Genera',
    'home.step2_desc': 'Nuestra IA crea diseños únicos basados en tu descripción',
    'home.step3_title': 'Descargar y Compartir',
    'home.step3_desc': 'Obtén diseños de alta calidad listos para tu artista del tatuaje',

    // Explore Page
    'explore.title': 'Comunidad',
    'explore.recommend': 'Para Ti',
    'explore.latest': 'Recientes',
    'explore.hot': 'Popular',
    'explore.following': 'Siguiendo',
    'explore.search_placeholder': 'Buscar publicaciones...',
    'explore.no_results': 'No se encontraron publicaciones',
    'explore.load_more': 'Cargar Más',
    'explore.trending_tags': 'Etiquetas Tendientes',

    // Inspire Page
    'inspire.title': 'Inspiración',
    'inspire.subtitle': 'Inspírate con estas ideas de tatuajes tradicionales chinos',
    'inspire.copy_prompt': 'Copiar Idea',
    'inspire.copied': '¡Copiado!',

    // Pricing Page
    'pricing.title': 'Planes de Membresía',
    'pricing.subtitle': 'Elige el plan que mejor funcione para ti',
    'pricing.current_plan': 'Plan Actual',
    'pricing.features': 'Características',
    'pricing.unlimited_generations': 'Generaciones Ilimitadas',
    'pricing.priority_support': 'Soporte Prioritario',
    'pricing.exclusive_styles': 'Estilos Exclusivos',
    'pricing.choose_plan': 'Elegir Plan',

    // Profile Page
    'profile.posts': 'Publicaciones',
    'profile.saved': 'Guardados',
    'profile.followers': 'Seguidores',
    'profile.following': 'Siguiendo',
    'profile.edit_profile': 'Editar Perfil',
    'profile.follow': 'Seguir',
    'profile.unfollow': 'Dejar de Seguir',
    'profile.no_posts': 'Sin publicaciones aún',

    // Create Page
    'create.title': 'Crear Publicación',
    'create.select_images': 'Seleccionar Imágenes',
    'create.drag_or_click': 'Arrastra y suelta imágenes aquí o haz clic para seleccionar',
    'create.post_type': 'Tipo de Publicación',
    'create.work': 'Trabajo de Tatuaje',
    'create.idea': 'Idea',
    'create.tattoo_style': 'Estilo de Tatuaje',
    'create.tags': 'Etiquetas',
    'create.visibility': 'Visibilidad',
    'create.public': 'Público',
    'create.followers_only': 'Solo Seguidores',
    'create.private': 'Privado',
    'create.post': 'Publicar',
    'create.posting': 'Publicando...',

    // Post Detail
    'post.likes': 'Me Gusta',
    'post.comments': 'Comentarios',
    'post.share': 'Compartir',
    'post.report': 'Reportar',
    'post.write_comment': 'Escribe un comentario...',
    'post.send': 'Enviar',
    'post.delete': 'Eliminar',
    'post.edit': 'Editar',

    // Notifications
    'notifications.title': 'Notificaciones',
    'notifications.mark_all_read': 'Marcar todas como leídas',
    'notifications.no_notifications': 'Sin notificaciones aún',
    'notifications.liked': 'le dio me gusta a tu publicación',
    'notifications.commented': 'comentó en tu publicación',
    'notifications.followed': 'empezó a seguirte',
    'notifications.save': 'guardó tu publicación',

    // Artist
    'artist.apply': 'Aplicar como Artista',
    'artist.portfolio': 'Portafolio',
    'artist.specialties': 'Especialidades',
    'artist.experience': 'Experiencia',
    'artist.book_appointment': 'Reservar Cita',
    'artist.view_profile': 'Ver Perfil',

    // Common Actions
    'action.like': 'Me Gusta',
    'action.unlike': 'Quitar Me Gusta',
    'action.save': 'Guardar',
    'action.unsave': 'Quitar de Guardados',
    'action.share': 'Compartir',
    'action.report': 'Reportar',
    'action.delete': 'Eliminar',
    'action.edit': 'Editar',
    'action.follow': 'Seguir',
    'action.unfollow': 'Dejar de Seguir',

    // Legal
    'legal.terms': 'Términos de Servicio',
    'legal.privacy': 'Política de Privacidad',
    'legal.disclaimer': 'Aviso Legal',
  },

  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.community': 'Gemeinschaft',
    'nav.inspire': 'Inspiration',
    'nav.artists': 'Künstler',
    'nav.upgrade': 'Upgrade',
    'nav.apply_artist': 'Künstler Bewerben',
    'nav.sign_in': 'Anmelden',
    'nav.profile': 'Profil',
    'nav.notifications': 'Benachrichtigungen',

    // AI Generator
    'ai.title': 'AI Tattoo Generator',
    'ai.subtitle': 'Erstelle atemberaubende chinesische traditionelle Tattoo-Designs mit KI',
    'ai.style': 'Stil',
    'ai.body_part': 'Körperteil',
    'ai.prompt_placeholder': 'Beschreibe deine Tattoo-Idee...',
    'ai.generate': 'Tattoo Erstellen',
    'ai.generating': 'Wird erstellt...',
    'ai.sign_in_to_generate': 'Anmelden zum Erstellen',
    'ai.preview': 'Vorschau',
    'ai.download': 'HD Herunterladen',
    'ai.share': 'Teilen',
    'ai.your_design': 'Dein Tattoo-Design erscheint hier',
    'ai.upload_image': 'Referenzbild hochladen',
    'ai.analyzing': 'Kulturelle Bedeutung analysieren...',

    // Pricing (basic)
    'pricing.free': 'Kostenlos',
    'pricing.monthly': 'Monatlich',
    'pricing.yearly': 'Jährlich',
    'pricing.lifetime': 'Lebenslang',
    'pricing.per_day': '/Tag',
    'pricing.per_month': '/Monat',
    'pricing.per_year': '/Jahr',
    'pricing.generations': 'Generationen',
    'pricing.watermark': 'Wasserzeichen',
    'pricing.no_watermark': 'Kein Wasserzeichen',
    'pricing.upgrade': 'Jetzt Upgraden',

    // Common
    'common.loading': 'Lädt...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.cancel': 'Abbrechen',
    'common.confirm': 'Bestätigen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',

    // Body Parts
    'body.arm': 'Arm',
    'body.back': 'Rücken',
    'body.chest': 'Brust',
    'body.wrist': 'Handgelenk',
    'body.collarbone': 'Schlüsselbein',
    'body.thigh': 'Oberschenkel',
    'body.calf': 'Wade',

    // Auth - Login
    'auth.welcome_back': 'Willkommen Zurück',
    'auth.sign_in_to_continue': 'Melde dich an um fortzufahren',
    'auth.sign_in': 'Anmelden',
    'auth.signing_in': 'Anmelden...',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.enter_email': 'Gib deine E-Mail ein',
    'auth.enter_password': 'Gib dein Passwort ein',
    'auth.no_account': 'Noch kein Konto?',
    'auth.sign_up_link': 'Registrieren',
    'auth.forgot_password': 'Passwort vergessen?',

    // Auth - Register
    'auth.create_account': 'Konto Erstellen',
    'auth.join_community': 'Werde Teil der InkAI.life Community',
    'auth.username': 'Benutzername',
    'auth.choose_username': 'Wähle einen Benutzernamen',
    'auth.create_password': 'Erstelle ein Passwort',
    'auth.creating': 'Wird erstellt...',
    'auth.has_account': 'Bereits ein Konto?',
    'auth.sign_in_link': 'Anmelden',
    'auth.agree_terms': 'Ich stimme den',
    'auth.terms_of_service': 'Nutzungsbedingungen zu',

    // Styles
    'style.oriental': 'Orientalisch',
    'style.japanese': 'Japanisch',
    'style.american_traditional': 'Amerikanisch Traditionell',
    'style.neo_traditional': 'Neo Traditionell',
    'style.blackwork': 'Dunkel & Blackwork',
    'style.watercolor': 'Aquarell',
    'style.minimalist': 'Minimalistisch',
    'style.realism': 'Realismus',

    // Home Page
    'home.hero_title': 'Erstelle Atemberaubende Chinesische Traditionelle Tattoos mit KI',
    'home.hero_subtitle': 'Verwandle deine Ideen in Sekunden in einzigartige Tattoo-Designs. Angetrieben von fortschrittlicher KI-Technologie.',
    'home.get_started': 'Kostenlos Starten',
    'home.view_examples': 'Beispiele Ansehen',
    'home.features_title': 'Warum InkAI Wählen',
    'home.feature_ai_title': 'KI-gestütztes Design',
    'home.feature_ai_desc': 'Generiere sofort einzigartige Tattoo-Designs mit unserer fortschrittlichen KI-Technologie',
    'home.feature_style_title': 'Traditionelle Stile',
    'home.feature_style_desc': 'Entdecke authentische chinesische traditionelle Tattoo-Stile und kulturelle Elemente',
    'home.feature_community_title': 'Community-Galerie',
    'home.feature_community_desc': 'Teile deine Designs und finde Inspiration in unserer Community',
    'home.feature_artist_title': 'Professionelle Künstler',
    'home.feature_artist_desc': 'Verbinde dich mit zertifizierten Tattoo-Künstlern für dein nächstes Tattoo',
    'home.how_it_works': 'So Funktioniert\'s',
    'home.step1_title': 'Beschreibe Deine Vision',
    'home.step1_desc': 'Sag uns, welchen Tattoo-Stil und welches Design du möchtest',
    'home.step2_title': 'KI Generiert',
    'home.step2_desc': 'Unsere KI erstellt einzigartige Designs basierend auf deiner Beschreibung',
    'home.step3_title': 'Download & Teilen',
    'home.step3_desc': 'Erhalte hochwertige Designs bereit für deinen Tattoo-Künstler',

    // Explore Page
    'explore.title': 'Gemeinschaft',
    'explore.recommend': 'Für Dich',
    'explore.latest': 'Neueste',
    'explore.hot': 'Beliebt',
    'explore.following': 'Folge ich',
    'explore.search_placeholder': 'Beiträge suchen...',
    'explore.no_results': 'Keine Beiträge gefunden',
    'explore.load_more': 'Mehr Laden',
    'explore.trending_tags': 'Trendige Tags',

    // Inspire Page
    'inspire.title': 'Inspiration',
    'inspire.subtitle': 'Lass dich von diesen traditionellen chinesischen Tattoo-Ideen inspirieren',
    'inspire.copy_prompt': 'Idee Kopieren',
    'inspire.copied': 'Kopiert!',

    // Pricing Page
    'pricing.title': 'Mitgliedschaftspläne',
    'pricing.subtitle': 'Wähle den Plan, der am besten zu dir passt',
    'pricing.current_plan': 'Aktueller Plan',
    'pricing.features': 'Funktionen',
    'pricing.unlimited_generations': 'Unbegrenzte Generationen',
    'pricing.priority_support': 'Prioritäts-Support',
    'pricing.exclusive_styles': 'Exklusive Stile',
    'pricing.choose_plan': 'Plan Wählen',

    // Profile Page
    'profile.posts': 'Beiträge',
    'profile.saved': 'Gespeichert',
    'profile.followers': 'Follower',
    'profile.following': 'Folge ich',
    'profile.edit_profile': 'Profil Bearbeiten',
    'profile.follow': 'Folgen',
    'profile.unfollow': 'Entfolgen',
    'profile.no_posts': 'Noch keine Beiträge',

    // Create Page
    'create.title': 'Beitrag Erstellen',
    'create.select_images': 'Bilder Auswählen',
    'create.drag_or_click': 'Bilder hierher ziehen und ablegen oder klicken zum Auswählen',
    'create.post_type': 'Beitragstyp',
    'create.work': 'Tattoo Arbeit',
    'create.idea': 'Idee',
    'create.tattoo_style': 'Tattoo-Stil',
    'create.tags': 'Tags',
    'create.visibility': 'Sichtbarkeit',
    'create.public': 'Öffentlich',
    'create.followers_only': 'Nur Follower',
    'create.private': 'Privat',
    'create.post': 'Veröffentlichen',
    'create.posting': 'Veröffentlichen...',

    // Post Detail
    'post.likes': 'Gefällt mir',
    'post.comments': 'Kommentare',
    'post.share': 'Teilen',
    'post.report': 'Melden',
    'post.write_comment': 'Schreibe einen Kommentar...',
    'post.send': 'Senden',
    'post.delete': 'Löschen',
    'post.edit': 'Bearbeiten',

    // Notifications
    'notifications.title': 'Benachrichtigungen',
    'notifications.mark_all_read': 'Alle als gelesen markieren',
    'notifications.no_notifications': 'Noch keine Benachrichtigungen',
    'notifications.liked': 'hat deinen Beitrag mit \"Gefällt mir\" markiert',
    'notifications.commented': 'hat deinen Beitrag kommentiert',
    'notifications.followed': 'folgt dir jetzt',
    'notifications.save': 'hat deinen Beitrag gespeichert',

    // Artist
    'artist.apply': 'Als Künstler Bewerben',
    'artist.portfolio': 'Portfolio',
    'artist.specialties': 'Spezialgebiete',
    'artist.experience': 'Erfahrung',
    'artist.book_appointment': 'Termin Buchen',
    'artist.view_profile': 'Profil Ansehen',

    // Common Actions
    'action.like': 'Gefällt mir',
    'action.unlike': 'Gefällt mir entfernen',
    'action.save': 'Speichern',
    'action.unsave': 'Entfernen',
    'action.share': 'Teilen',
    'action.report': 'Melden',
    'action.delete': 'Löschen',
    'action.edit': 'Bearbeiten',
    'action.follow': 'Folgen',
    'action.unfollow': 'Entfolgen',

    // Legal
    'legal.terms': 'Nutzungsbedingungen',
    'legal.privacy': 'Datenschutzrichtlinie',
    'legal.disclaimer': 'Haftungsausschluss',
  },
};

// Context 类型
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentLanguage: { id: Language; name: string; nativeName: string; flag: string };
}

// 默认 Context
const LanguageContext = createContext<LanguageContextType>({
  language: 'zh',
  setLanguage: () => {},
  t: (key: string) => key,
  currentLanguage: LANGUAGES[2], // 默认中文
});

// Storage key
const LANGUAGE_STORAGE_KEY = 'inkai-language';

// Provider 组件
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // 从 localStorage 读取
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && LANGUAGES.find(l => l.id === saved)) {
        return saved as Language;
      }
      // 检测浏览器语言
      const browserLang = navigator.language.split('-')[0];
      const matched = LANGUAGES.find(l => l.id === browserLang);
      if (matched) return matched.id;
    }
    return 'zh'; // 默认中文
  });

  // 保存到 localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    // 更新 HTML lang 属性
    document.documentElement.lang = lang;
  };

  // 翻译函数
  const t = (key: string): string => {
    return translations[language][key] || translations['zh'][key] || key;
  };

  const currentLanguage = LANGUAGES.find(l => l.id === language) || LANGUAGES[2];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook
export function useLanguage() {
  return useContext(LanguageContext);
}

// 导出语言列表供组件使用
export type { Language };
