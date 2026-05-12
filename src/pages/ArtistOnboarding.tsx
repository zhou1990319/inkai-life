import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Clock, AlertCircle, ArrowLeft, Upload, Sparkles, Plus, Trash2, ExternalLink, Save, ShoppingBag } from 'lucide-react';
import { supabase } from '../supabase/client';
import { uploadImage } from '../services/storage';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const styles = [
  { id: 'ink-wash', name: 'Ink Wash 水墨', icon: '墨' },
  { id: 'dragon', name: 'Dragon 龙', icon: '龙' },
  { id: 'phoenix', name: 'Phoenix 凤', icon: '凤' },
  { id: 'dunhuang', name: 'Dunhuang 敦煌', icon: '敦煌' },
  { id: 'mythical', name: 'Mythical 神兽', icon: '兽' },
  { id: 'blackwork', name: 'Blackwork 黑灰', icon: '黑' },
  { id: 'color', name: 'Color 彩色', icon: '彩' },
  { id: 'realistic', name: 'Realistic 写实', icon: '真' },
  { id: 'traditional', name: 'Traditional 传统', icon: '传' },
  { id: 'geometric', name: 'Geometric 几何', icon: '图' },
];

export default function ArtistOnboarding() {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);

  // Form data
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [bio, setBio] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [location, setLocation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Product management state
  const [activeTab, setActiveTab] = useState<'apply' | 'products'>('apply');
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', product_link: '', image_url: '' });
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    checkUserAndApplication();
  }, []);

  const checkUserAndApplication = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    setUser(profile);

    if (profile?.is_artist) {
      // Verified artist - show product management
      setUser(profile);
      fetchProducts(session.user.id);
      return;
    }

    // Check for existing application
    const { data: application } = await supabase
      .from('artist_applications')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    setExistingApplication(application);
  };

  // Fetch artist's products
  const fetchProducts = async (artistId: string) => {
    const { data } = await supabase
      .from('artist_products')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  // Upload product image
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { publicUrl } = await uploadImage(file, 'artist-products');
    setNewProduct(prev => ({ ...prev, image_url: publicUrl }));
  };

  // Save new product
  const handleSaveProduct = async () => {
    if (!newProduct.name.trim()) {
      setError(isZh ? '请输入产品名称' : 'Product name is required');
      return;
    }
    if (!user?.id) return;

    setSavingProduct(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('artist_products')
        .insert({
          artist_id: user.id,
          name: newProduct.name.trim(),
          description: newProduct.description.trim() || null,
          price: newProduct.price.trim() || null,
          product_link: newProduct.product_link.trim() || null,
          image_url: newProduct.image_url || null,
        });

      if (insertError) throw insertError;

      setNewProduct({ name: '', description: '', price: '', product_link: '', image_url: '' });
      fetchProducts(user.id);
    } catch (err: any) {
      setError(err.message || (isZh ? '保存产品失败' : 'Failed to save product'));
    } finally {
      setSavingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(isZh ? '确定要删除这个产品吗？' : 'Are you sure you want to delete this product?')) return;

    await supabase.from('artist_products').delete().eq('id', productId);
    if (user?.id) fetchProducts(user.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (portfolioImages.length + files.length > 6) {
      setError(isZh ? '最多上传6张图片' : 'Maximum 6 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} ${isZh ? '文件过大（最大10MB）' : 'is too large (max 10MB)'}`);
        return false;
      }
      return true;
    });

    setPortfolioImages([...portfolioImages, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPortfolioPreviews([...portfolioPreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...portfolioImages];
    const newPreviews = [...portfolioPreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setPortfolioImages(newImages);
    setPortfolioPreviews(newPreviews);
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId) ? prev.filter(s => s !== styleId) : [...prev, styleId]
    );
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setError(isZh ? '请先登录' : 'Please login first');
      return;
    }
    if (portfolioImages.length < 3) {
      setError(isZh ? '请至少上传3张作品集图片' : 'Please upload at least 3 portfolio images');
      return;
    }
    if (selectedStyles.length === 0) {
      setError(isZh ? '请至少选择一种风格' : 'Please select at least one style');
      return;
    }
    if (!bio.trim()) {
      setError(isZh ? '请填写个人简介' : 'Please write a bio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload portfolio images
      const uploadedUrls: string[] = [];
      for (const image of portfolioImages) {
        const { publicUrl } = await uploadImage(image, 'artist-portfolios');
        uploadedUrls.push(publicUrl);
      }

      // Submit application (upsert for re-application support)
      const { error: submitError } = await supabase
        .from('artist_applications')
        .upsert({
          user_id: user.id,
          portfolio_urls: uploadedUrls,
          styles: selectedStyles,
          years_experience: parseInt(yearsExperience) || 0,
          bio: bio.trim(),
          price_range: priceRange || null,
          location: location.trim() || null,
          instagram: instagram.trim() || null,
          status: 'pending',
        }, { onConflict: 'user_id' });

      if (submitError) throw submitError;

      setStep('success');
    } catch (err: any) {
      console.error('Application failed:', err);
      setError(err.message || (isZh ? '提交申请失败' : 'Failed to submit application'));
    } finally {
      setLoading(false);
    }
  };

  // Handle re-apply: clear existing application and go to form
  const handleReapply = () => {
    setExistingApplication(null);
    setStep('form');
  };

  if (existingApplication) {
    const isRejected = existingApplication.status === 'rejected';

    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 pt-20 pb-24">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/80 border border-stone-800 rounded-2xl p-8 text-center"
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isRejected ? 'bg-red-500/20' : 'bg-amber-500/20'
            }`}>
              {isRejected ? (
                <AlertCircle className="w-8 h-8 text-red-500" />
              ) : (
                <Clock className="w-8 h-8 text-amber-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isRejected
                ? (isZh ? '申请未通过' : 'Application Not Approved')
                : (isZh ? '申请审核中' : 'Application Under Review')
              }
            </h2>
            <p className="text-stone-400 mb-6">
              {isRejected
                ? (isZh
                  ? '很遗憾，您的纹身师认证申请未通过审核。您可以查看拒绝原因并重新提交申请。'
                  : 'Unfortunately, your artist application was not approved. You can review the reason and reapply.')
                : (isZh
                  ? '我们的团队正在审核您的纹身师申请，通常需要1-3个工作日。'
                  : 'Your artist application is being reviewed by our team. This usually takes 1-3 business days.')
              }
            </p>

            {/* Rejection reason */}
            {isRejected && existingApplication.rejection_reason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-left">
                <p className="text-red-400 text-sm font-medium mb-1">
                  {isZh ? '拒绝原因：' : 'Rejection Reason:'}
                </p>
                <p className="text-stone-400 text-sm">
                  {existingApplication.rejection_reason}
                </p>
              </div>
            )}

            <div className="bg-stone-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-400">{isZh ? '状态' : 'Status'}</span>
                <span className={`font-medium capitalize ${isRejected ? 'text-red-400' : 'text-amber-400'}`}>
                  {existingApplication.status === 'pending'
                    ? (isZh ? '审核中' : 'Pending')
                    : existingApplication.status === 'rejected'
                      ? (isZh ? '未通过' : 'Rejected')
                      : existingApplication.status
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">{isZh ? '提交时间' : 'Submitted'}</span>
                <span className="text-stone-300">{new Date(existingApplication.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {isRejected && (
                <button
                  onClick={handleReapply}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-full transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {isZh ? '重新申请' : 'Reapply'}
                </button>
              )}
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-amber-500 hover:text-amber-400"
              >
                <ArrowLeft className="w-4 h-4" />
                {isZh ? '返回首页' : 'Back to Home'}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 pt-20 pb-24">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-stone-900/80 border border-stone-800 rounded-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isZh ? '申请已提交！' : 'Application Submitted!'}
            </h2>
            <p className="text-stone-400 mb-6">
              {isZh
                ? '感谢您申请成为 InkAI.life 认证纹身师。我们的团队将在1-3个工作日内审核您的申请。'
                : 'Thank you for applying to join InkAI.life as a verified artist. Our team will review your application within 1-3 business days.'
              }
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="text-left">
                  <p className="text-amber-400 text-sm font-medium">
                    {isZh ? '接下来会发生什么？' : 'What happens next?'}
                  </p>
                  <p className="text-stone-400 text-sm mt-1">
                    {isZh
                      ? '审核通过后您将收到通知。请确保您的作品集展示了您最好的作品！'
                      : "You'll receive a notification once approved. Make sure your portfolio images showcase your best work!"
                    }
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-full transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {isZh ? '返回首页' : 'Back to Home'}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Verified Artist - Product Management Dashboard
  if (user?.is_artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 pt-20 pb-24">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-500 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {isZh ? '返回' : 'Back'}
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isZh ? '纹身师工作台' : 'Artist Dashboard'}
                </h1>
                <p className="text-stone-400">
                  {isZh ? '管理您的个人资料和产品' : 'Manage your profile and products'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 bg-stone-900/50 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('apply')}
              className={`flex-1 py-3 rounded-lg transition-all ${
                activeTab === 'apply' ? 'bg-amber-500 text-stone-950 font-medium' : 'text-stone-400'
              }`}
            >
              {isZh ? '个人资料' : 'Profile'}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'products' ? 'bg-amber-500 text-stone-950 font-medium' : 'text-stone-400'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isZh ? '产品' : 'Products'} ({products.length})
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'apply' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <CheckCircle className="w-8 h-8 text-amber-500" />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isZh ? '认证纹身师' : 'Verified Artist'}
                  </h2>
                  <p className="text-stone-400 text-sm">
                    {isZh ? '您的资料对所有用户可见' : 'Your profile is visible to all users'}
                  </p>
                </div>
              </div>
              <p className="text-stone-300">
                {isZh
                  ? '您的纹身师资料已激活。用户可以查看您的作品、购买您的产品并向您发送消息。'
                  : 'Your artist profile is active. Users can view your works, purchase your products, and send you messages.'
                }
              </p>
              <Link
                to={`/artist/${user.id}`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-500 text-stone-950 font-medium rounded-full hover:bg-amber-400 transition-colors"
              >
                {isZh ? '查看公开资料' : 'View Public Profile'}
              </Link>
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Add Product Form */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  {isZh ? '添加新产品' : 'Add New Product'}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-400 text-sm mb-1">
                        {isZh ? '产品名称 *' : 'Product Name *'}
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={isZh ? '例如：定制纹身设计' : 'e.g., Custom Flash Design'}
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 text-sm mb-1">
                        {isZh ? '价格' : 'Price'}
                      </label>
                      <input
                        type="text"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                        placeholder={isZh ? '例如：¥200 - ¥500' : 'e.g., $200 - $500'}
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-stone-400 text-sm mb-1">
                      {isZh ? '描述' : 'Description'}
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={isZh ? '描述您的产品...' : 'Describe your product...'}
                      rows={2}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-sm mb-1">
                      {isZh ? '产品链接' : 'Product Link'}
                    </label>
                    <input
                      type="url"
                      value={newProduct.product_link}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, product_link: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-sm mb-1">
                      {isZh ? '产品图片' : 'Product Image'}
                    </label>
                    <div className="flex items-center gap-4">
                      {newProduct.image_url ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                          <img src={newProduct.image_url} alt={isZh ? '产品' : 'Product'} className="w-full h-full object-cover" />
                          <button
                            onClick={() => setNewProduct(prev => ({ ...prev, image_url: '' }))}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-24 h-24 border-2 border-dashed border-stone-700 rounded-xl cursor-pointer hover:border-amber-500/50 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-stone-500" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleSaveProduct}
                    disabled={savingProduct}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-stone-950 font-medium rounded-full hover:bg-amber-400 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {savingProduct ? (isZh ? '保存中...' : 'Saving...') : (isZh ? '保存产品' : 'Save Product')}
                  </button>
                </div>
              </div>

              {/* Product List */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {isZh ? '我的产品' : 'Your Products'}
                </h3>
                {products.length === 0 ? (
                  <p className="text-stone-500 text-center py-8">
                    {isZh ? '暂无产品，请在上方添加您的第一个产品！' : 'No products yet. Add your first product above!'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-xl">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{product.name}</h4>
                          {product.price && <p className="text-amber-500 text-sm">{product.price}</p>}
                          {product.product_link && (
                            <a href={product.product_link} target="_blank" rel="noopener noreferrer"
                               className="text-stone-400 text-xs hover:text-amber-500 flex items-center gap-1 mt-1">
                              <ExternalLink className="w-3 h-3" />
                              {product.product_link.slice(0, 40)}...
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 pt-20 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-500 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isZh ? '返回' : 'Back'}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isZh ? '成为认证纹身师' : 'Become a Verified Artist'}
              </h1>
              <p className="text-stone-400">
                {isZh ? '加入我们的专业纹身师社区' : 'Join our community of professional tattoo artists'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-6"
        >
          {/* Portfolio Images */}
          <div>
            <label className="block text-stone-300 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" />
              {isZh ? '作品集图片 *（3-6张）' : 'Portfolio Images * (3-6 images)'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {portfolioPreviews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >
                  <img src={preview} alt={`${isZh ? '作品' : 'Portfolio'} ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  >
                    x
                  </button>
                </motion.div>
              ))}
              {portfolioPreviews.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-stone-700 rounded-xl cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-stone-500 mb-1" />
                  <span className="text-xs text-stone-500">{isZh ? '添加' : 'Add'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-stone-500 text-xs mt-2">
              {isZh ? '展示您最好的作品 - 优先真实纹身照片' : 'Showcase your best work - real tattoos preferred'}
            </p>
          </div>

          {/* Styles */}
          <div>
            <label className="block text-stone-300 mb-3">
              {isZh ? '您的纹身风格 *' : 'Your Tattoo Styles *'}
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedStyles.includes(style.id)
                      ? 'bg-amber-500 text-stone-950 font-medium'
                      : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-amber-500/50'
                  }`}
                >
                  {style.icon} {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Experience & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 mb-2">
                {isZh ? '从业年限' : 'Years of Experience'}
              </label>
              <select
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">{isZh ? '请选择...' : 'Select...'}</option>
                <option value="1">{isZh ? '1-2年' : '1-2 years'}</option>
                <option value="3">{isZh ? '3-5年' : '3-5 years'}</option>
                <option value="5">{isZh ? '5-10年' : '5-10 years'}</option>
                <option value="10">{isZh ? '10年以上' : '10+ years'}</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-300 mb-2">
                {isZh ? '所在地' : 'Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isZh ? '城市，国家' : 'City, Country'}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-stone-300 mb-2">
              {isZh ? '价格范围（每次）' : 'Price Range (per session)'}
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="">{isZh ? '请选择...' : 'Select...'}</option>
              <option value="under-500">{isZh ? '¥500以下' : 'Under $500'}</option>
              <option value="500-1000">{isZh ? '¥500 - ¥1,000' : '$500 - $1,000'}</option>
              <option value="1000-2000">{isZh ? '¥1,000 - ¥2,000' : '$1,000 - $2,000'}</option>
              <option value="2000-5000">{isZh ? '¥2,000 - ¥5,000' : '$2,000 - $5,000'}</option>
              <option value="over-5000">{isZh ? '¥5,000以上' : 'Over $5,000'}</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-stone-300 mb-2">
              {isZh ? '个人简介 *' : 'Artist Bio *'}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={isZh
                ? '请介绍一下您自己、您的艺术历程，以及您作品的独特之处...'
                : 'Tell us about yourself, your artistic journey, and what makes your work unique...'
              }
              rows={4}
              maxLength={500}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
            />
            <span className="text-stone-500 text-xs mt-1">{bio.length}/500</span>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-stone-300 mb-2">
              {isZh ? 'Instagram（选填）' : 'Instagram (optional)'}
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 bg-stone-800 border border-r-0 border-stone-700 rounded-l-xl text-stone-400">
                @
              </span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="your_username"
                className="flex-1 bg-stone-800 border border-stone-700 rounded-r-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full"
                />
                {isZh ? '提交中...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                {isZh ? '提交申请' : 'Submit Application'}
              </>
            )}
          </button>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {isZh ? '纹身师权益' : 'Artist Benefits'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '\uD83C\uDFAF', text: isZh ? '个人资料认证徽章' : 'Verified badge on profile' },
              { icon: '\uD83D\uDCCA', text: isZh ? '专属数据分析' : 'Artist-only analytics' },
              { icon: '\uD83D\uDCAC', text: isZh ? '直接预约请求' : 'Direct booking requests' },
              { icon: '\uD83C\uDFC6', text: isZh ? '在探索页展示' : 'Featured in explore' },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-stone-300">
                <span className="text-xl">{benefit.icon}</span>
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
