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
  const { t } = useLanguage();
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
      setError('Product name is required');
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
      setError(err.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    await supabase.from('artist_products').delete().eq('id', productId);
    if (user?.id) fetchProducts(user.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (portfolioImages.length + files.length > 6) {
      setError('Maximum 6 images allowed');
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is too large (max 10MB)`);
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
      setError('Please login first');
      return;
    }
    if (portfolioImages.length < 3) {
      setError('Please upload at least 3 portfolio images');
      return;
    }
    if (selectedStyles.length === 0) {
      setError('Please select at least one style');
      return;
    }
    if (!bio.trim()) {
      setError('Please write a bio');
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

      // Submit application
      const { error: submitError } = await supabase
        .from('artist_applications')
        .insert({
          user_id: user.id,
          portfolio_urls: uploadedUrls,
          styles: selectedStyles,
          years_experience: parseInt(yearsExperience) || 0,
          bio: bio.trim(),
          price_range: priceRange || null,
          location: location.trim() || null,
          instagram: instagram.trim() || null,
          status: 'pending',
        });

      if (submitError) throw submitError;

      setStep('success');
    } catch (err: any) {
      console.error('Application failed:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 pt-20 pb-24">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/80 border border-stone-800 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Application Under Review</h2>
            <p className="text-stone-400 mb-6">
              Your artist application is being reviewed by our team. This usually takes 1-3 business days.
            </p>
            <div className="bg-stone-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-400">Status</span>
                <span className="text-amber-400 font-medium capitalize">{existingApplication.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Submitted</span>
                <span className="text-stone-300">{new Date(existingApplication.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
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
            <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
            <p className="text-stone-400 mb-6">
              Thank you for applying to join InkAI.life as a verified artist. Our team will review your application within 1-3 business days.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="text-left">
                  <p className="text-amber-400 text-sm font-medium">What happens next?</p>
                  <p className="text-stone-400 text-sm mt-1">
                    You'll receive a notification once approved. Make sure your portfolio images showcase your best work!
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-full transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Back to Home
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
              Back
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Artist Dashboard</h1>
                <p className="text-stone-400">Manage your profile and products</p>
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
              Profile
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'products' ? 'bg-amber-500 text-stone-950 font-medium' : 'text-stone-400'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Products ({products.length})
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
                  <h2 className="text-xl font-bold text-white">Verified Artist</h2>
                  <p className="text-stone-400 text-sm">Your profile is visible to all users</p>
                </div>
              </div>
              <p className="text-stone-300">
                Your artist profile is active. Users can view your works, purchase your products, and send you messages.
              </p>
              <Link
                to={`/artist/${user.id}`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-500 text-stone-950 font-medium rounded-full hover:bg-amber-400 transition-colors"
              >
                View Public Profile
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
                  Add New Product
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-400 text-sm mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Custom Flash Design"
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 text-sm mb-1">Price</label>
                      <input
                        type="text"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g., $200 - $500"
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-stone-400 text-sm mb-1">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your product..."
                      rows={2}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-sm mb-1">Product Link</label>
                    <input
                      type="url"
                      value={newProduct.product_link}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, product_link: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-sm mb-1">Product Image</label>
                    <div className="flex items-center gap-4">
                      {newProduct.image_url ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                          <img src={newProduct.image_url} alt="Product" className="w-full h-full object-cover" />
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
                    {savingProduct ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </div>

              {/* Product List */}
              <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Products</h3>
                {products.length === 0 ? (
                  <p className="text-stone-500 text-center py-8">No products yet. Add your first product above!</p>
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
            Back
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Become a Verified Artist</h1>
              <p className="text-stone-400">Join our community of professional tattoo artists</p>
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
              Portfolio Images * (3-6 images)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {portfolioPreviews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >
                  <img src={preview} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
              {portfolioPreviews.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-stone-700 rounded-xl cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-stone-500 mb-1" />
                  <span className="text-xs text-stone-500">Add</span>
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
            <p className="text-stone-500 text-xs mt-2">Showcase your best work - real tattoos preferred</p>
          </div>

          {/* Styles */}
          <div>
            <label className="block text-stone-300 mb-3">Your Tattoo Styles *</label>
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
              <label className="block text-stone-300 mb-2">Years of Experience</label>
              <select
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="1">1-2 years</option>
                <option value="3">3-5 years</option>
                <option value="5">5-10 years</option>
                <option value="10">10+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-300 mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-stone-300 mb-2">Price Range (per session)</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="">Select...</option>
              <option value="under-500">Under $500</option>
              <option value="500-1000">$500 - $1,000</option>
              <option value="1000-2000">$1,000 - $2,000</option>
              <option value="2000-5000">$2,000 - $5,000</option>
              <option value="over-5000">Over $5,000</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-stone-300 mb-2">Artist Bio *</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your artistic journey, and what makes your work unique..."
              rows={4}
              maxLength={500}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
            />
            <span className="text-stone-500 text-xs mt-1">{bio.length}/500</span>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-stone-300 mb-2">Instagram (optional)</label>
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
                Submitting...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Submit Application
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
            Artist Benefits
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🎯', text: 'Verified badge on profile' },
              { icon: '📊', text: 'Artist-only analytics' },
              { icon: '💬', text: 'Direct booking requests' },
              { icon: '🏆', text: 'Featured in explore' },
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
