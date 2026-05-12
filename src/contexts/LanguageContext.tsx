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

    // Pricing
    'pricing.title': 'Membership Plans',
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
  },

  ja: {
    'nav.home': 'ホーム',
    'nav.community': 'コミュニティ',
    'nav.inspire': 'インスピレーション',
    'nav.artists': 'アーティスト',
    'nav.upgrade': 'アップグレード',
    'nav.apply_artist': 'アーティスト申請',
    'nav.sign_in': 'ログイン',
    'nav.profile': 'プロフィール',
    'nav.notifications': '通知',

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

    'pricing.title': 'メンバーシッププラン',
    'pricing.free': 'フリー',
    'pricing.monthly': 'マンスリー',
    'pricing.yearly': 'イエールリー',
    'pricing.lifetime': 'ライフタイム',
    'pricing.per_day': '/日',
    'pricing.per_month': '/月',
    'pricing.per_year': '/年',
    'pricing.generations': '生成',
    'pricing.watermark': '透かし',
    'pricing.no_watermark': '透かしなし',
    'pricing.upgrade': 'アップグレード',

    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.cancel': 'キャンセル',
    'common.confirm': '確認',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.close': '閉じる',

    'body.arm': '腕',
    'body.back': '背中',
    'body.chest': '胸',
    'body.wrist': '手首',
    'body.collarbone': '鎖骨',
    'body.thigh': '太もも',
    'body.calf': 'ふくらはぎ',

    'style.oriental': '中華風',
    'style.japanese': '和風',
    'style.american_traditional': 'アメリカントラディショナル',
    'style.neo_traditional': 'ネオトラディショナル',
    'style.blackwork': 'ダーク＆ブラックワーク',
    'style.watercolor': '水彩',
    'style.minimalist': 'ミニマリスト',
    'style.realism': 'リアリスム',

    // Auth - Login
    'auth.welcome_back': 'おかえりなさい',
    'auth.sign_in_to_continue': 'サインインして続行',
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

    'body.arm': '腕',
    'nav.home': '首页',
    'nav.community': '社区',
    'nav.inspire': '灵感',
    'nav.artists': '艺术家',
    'nav.upgrade': '升级',
    'nav.apply_artist': '申请艺术家',
    'nav.sign_in': '登录',
    'nav.profile': '个人资料',
    'nav.notifications': '通知',

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

    'pricing.title': '会员计划',
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

    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.close': '关闭',

    'body.arm': '手臂',
    'body.back': '背部',
    'body.chest': '胸部',
    'body.wrist': '手腕',
    'body.collarbone': '锁骨',
    'body.thigh': '大腿',
    'body.calf': '小腿',

    'style.oriental': '中式',
    'style.japanese': '日式',
    'style.american_traditional': '美式传统',
    'style.neo_traditional': '新传统',
    'style.blackwork': '暗黑黑灰',
    'style.watercolor': '水彩',
    'style.minimalist': '极简线条',
    'style.realism': '写实',

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

    'body.arm': '手臂',
    'nav.home': 'Início',
    'nav.community': 'Comunidade',
    'nav.inspire': 'Inspiração',
    'nav.artists': 'Artistas',
    'nav.upgrade': 'Upgrade',
    'nav.apply_artist': 'Aplicar Artista',
    'nav.sign_in': 'Entrar',
    'nav.profile': 'Perfil',
    'nav.notifications': 'Notificações',

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

    'pricing.title': 'Planos de Assinatura',
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

    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Salvar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.close': 'Fechar',

    'body.arm': 'Braço',
    'body.back': 'Costas',
    'body.chest': 'Peito',
    'body.wrist': 'Pulso',
    'body.collarbone': 'Clavícula',
    'body.thigh': 'Coxa',
    'body.calf': 'Panturrilha',

    'style.oriental': 'Oriental',
    'style.japanese': 'Japonês',
    'style.american_traditional': 'Americano Tradicional',
    'style.neo_traditional': 'Neo Tradicional',
    'style.blackwork': 'Escuro & Blackwork',
    'style.watercolor': 'Aquarela',
    'style.minimalist': 'Minimalista',
    'style.realism': 'Realismo',

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

    'body.arm': 'Braço',
    'nav.home': 'Inicio',
    'nav.community': 'Comunidad',
    'nav.inspire': 'Inspiración',
    'nav.artists': 'Artistas',
    'nav.upgrade': 'Mejorar',
    'nav.apply_artist': 'Aplicar Artista',
    'nav.sign_in': 'Iniciar Sesión',
    'nav.profile': 'Perfil',
    'nav.notifications': 'Notificaciones',

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

    'pricing.title': 'Planes de Membresía',
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

    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',

    'body.arm': 'Brazo',
    'body.back': 'Espalda',
    'body.chest': 'Pecho',
    'body.wrist': 'Muñeca',
    'body.collarbone': 'Clavícula',
    'body.thigh': 'Muslo',
    'body.calf': 'Pantorrilla',

    'style.oriental': 'Oriental',
    'style.japanese': 'Japonés',
    'style.american_traditional': 'Americano Tradicional',
    'style.neo_traditional': 'Neo Tradicional',
    'style.blackwork': 'Oscuro & Blackwork',
    'style.watercolor': 'Acuarela',
    'style.minimalist': 'Minimalista',
    'style.realism': 'Realismo',

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

    'body.arm': 'Brazo',
    'nav.home': 'Startseite',
    'nav.community': 'Gemeinschaft',
    'nav.inspire': 'Inspiration',
    'nav.artists': 'Künstler',
    'nav.upgrade': 'Upgrade',
    'nav.apply_artist': 'Künstler Bewerben',
    'nav.sign_in': 'Anmelden',
    'nav.profile': 'Profil',
    'nav.notifications': 'Benachrichtigungen',

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

    'pricing.title': 'Mitgliedschaftspläne',
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

    'common.loading': 'Lädt...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.cancel': 'Abbrechen',
    'common.confirm': 'Bestätigen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',

    'body.arm': 'Arm',
    'body.back': 'Rücken',
    'body.chest': 'Brust',
    'body.wrist': 'Handgelenk',
    'body.collarbone': 'Schlüsselbein',
    'body.thigh': 'Oberschenkel',
    'body.calf': 'Wade',

    'style.oriental': 'Orientalisch',
    'style.japanese': 'Japanisch',
    'style.american_traditional': 'Amerikanisch Traditionell',
    'style.neo_traditional': 'Neo Traditionell',
    'style.blackwork': 'Dunkel & Blackwork',
    'style.watercolor': 'Aquarell',
    'style.minimalist': 'Minimalistisch',
    'style.realism': 'Realismus',

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
