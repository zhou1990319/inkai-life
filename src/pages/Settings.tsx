// ============================================
// InkAI 用户设置页面 (Settings)
// 编辑个人资料、账号设置、退出登录
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Globe, MapPin, FileText, LogOut, Camera, Save, X, Check } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { uploadImage } from '../services/storage';
import type { Database } from '../supabase/types';
import { useLoginPrompt } from '../components/LoginPrompt';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Settings() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  const { user, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { isOpen: loginPromptOpen, closePrompt: closeLoginPrompt } = useLoginPrompt();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 表单状态
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载用户资料
  useEffect(() => {
    if (!user) {
      // 未登录，跳转到登录页
      navigate('/login?redirect=/settings');
      return;
    }

    setProfile(user);
    setDisplayName(user.display_name || user.username || '');
    setBio(user.bio || '');
    setLocation(user.location || '');
    setWebsite(user.website || '');
    setAvatarUrl(user.avatar_url || '');
    setLoading(false);
  }, [user, navigate]);

  // 头像预览
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(isZh ? '图片大小不能超过5MB' : 'Image must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 保存资料
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let newAvatarUrl = avatarUrl;

      // 上传新头像
      if (avatarFile) {
        const { url, error: uploadError } = await uploadImage(avatarFile, 'avatars');
        if (uploadError) throw uploadError;
        newAvatarUrl = url;
      }

      // 更新资料
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio,
          location,
          website,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 刷新用户数据
      await refreshUser();
      setSuccess(isZh ? '个人资料更新成功！' : 'Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || (isZh ? '更新资料失败' : 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    if (!confirm(isZh ? '确定要退出登录吗？' : 'Are you sure you want to sign out?')) return;
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#9E2B25] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">{t('profile.settings') || 'Settings'}</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Avatar Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            {isZh ? '头像' : 'Profile Picture'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-white font-medium">{isZh ? "头像照片" : "Profile Photo"}</p>
              <p className="text-gray-400 text-sm">{isZh ? "支持 JPG、PNG 或 GIF 格式，最大 5MB" : "JPG, PNG or GIF. Max 5MB."}</p>
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            {isZh ? '个人信息' : 'Profile Information'}
          </h2>

          <div className="space-y-4">
            {/* Username (readonly) */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">{t('auth.username') || 'Username'}</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={profile?.username || ''}
                  disabled
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-gray-400 text-xs mt-1">{isZh ? "用户名不可更改" : "Username cannot be changed"}</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">{t('profile.display_name') || 'Display Name'}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-white focus:border-gray-400 focus:outline-none transition-colors"
                placeholder={isZh ? "输入你的显示名称" : "Your display name"}
                maxLength={50}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">{isZh ? "个人简介" : "Bio"}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-white focus:border-gray-400 focus:outline-none transition-colors resize-none"
                placeholder={isZh ? "介绍一下你自己..." : "Tell us about yourself..."}
                rows={3}
                maxLength={300}
              />
              <p className="text-gray-400 text-xs mt-1">{bio.length}/300</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {isZh ? '位置' : 'Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-white focus:border-gray-400 focus:outline-none transition-colors"
                placeholder={isZh ? "城市，国家" : "City, Country"}
                maxLength={100}
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-gray-400 text-sm mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {isZh ? '网站' : 'Website'}
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-white focus:border-gray-400 focus:outline-none transition-colors"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Email Section (readonly) */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-600" />
            {isZh ? '邮箱' : 'Email'}
          </h2>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
          />
          <p className="text-gray-400 text-xs mt-2">{isZh ? "如需更改邮箱，请联系客服" : "Contact support to change your email address"}</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mb-4"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isZh ? '保存更改' : 'Save Changes'}
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-gray-50 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          {isZh ? '退出登录' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
