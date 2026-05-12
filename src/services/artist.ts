/**
 * 艺术家服务 - Artist Service
 * 处理艺术家申请、作品展示、预约等
 */
import { supabase } from '../supabase/client';

export interface ArtistApplication {
  id: string;
  user_id: string;
  bio: string | null;
  portfolio_urls: string[];
  styles: string[];
  years_experience: number;
  price_range: string | null;
  location: string | null;
  instagram: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ArtistProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  is_artist: boolean;
  artist_verified: boolean;
  followers_count: number;
  portfolio_count: number;
  rating: number;
}

export interface ArtistPortfolio {
  id: string;
  artist_id: string;
  title: string;
  description: string | null;
  image_url: string;
  style: string[];
  price_range: string | null;
  availability: boolean;
}

export interface Booking {
  id: string;
  artist_id: string;
  client_id: string;
  preferred_date: string | null;
  message: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// 纹身风格列表
export const TATTOO_STYLES = [
  { id: 'ChineseTattoo', name: '中式传统', nameEn: 'Chinese Traditional' },
  { id: 'JapaneseTattoo', name: '日式传统', nameEn: 'Japanese Traditional' },
  { id: 'Traditional', name: '老传统', nameEn: 'Traditional' },
  { id: 'NeoTraditional', name: '新传统', nameEn: 'Neo-Traditional' },
  { id: 'BlackAndGrey', name: '黑灰', nameEn: 'Black & Grey' },
  { id: 'WatercolorTattoo', name: '水彩', nameEn: 'Watercolor' },
  { id: 'FineLineTattoo', name: '极简线条', nameEn: 'Fine Line' },
  { id: 'RealisticTattoo', name: '写实', nameEn: 'Realism' },
  { id: 'GeometricTattoo', name: '几何', nameEn: 'Geometric' },
  { id: 'Tribal', name: '部落', nameEn: 'Tribal' },
];

// 价格区间
export const PRICE_RANGES = [
  { id: 'small', label: '小图 ¥200-500' },
  { id: 'medium', label: '中图 ¥500-1500' },
  { id: 'large', label: '大图 ¥1500-3000' },
  { id: 'sleeve', label: '花臂/花腿 ¥3000+' },
  { id: 'custom', label: '面议' },
];

/**
 * 提交艺术家申请
 */
export async function submitArtistApplication(
  userId: string,
  data: {
    bio: string;
    portfolio_urls: string[];
    styles: string[];
    years_experience: number;
    price_range: string;
    location: string;
    instagram?: string;
  }
): Promise<{ success: boolean; application?: ArtistApplication; error?: string }> {
  try {
    // 1. 检查是否已有申请
    const { data: existing } = await supabase
      .from('artist_applications')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing && existing.status === 'pending') {
      return { success: false, error: 'You already have a pending application' };
    }

    if (existing && existing.status === 'approved') {
      return { success: false, error: 'You are already a verified artist' };
    }

    // 2. 创建或更新申请
    const { data: application, error } = await supabase
      .from('artist_applications')
      .upsert({
        user_id: userId,
        bio: data.bio,
        portfolio_urls: data.portfolio_urls,
        styles: data.styles,
        years_experience: data.years_experience,
        price_range: data.price_range,
        location: data.location,
        instagram: data.instagram || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, application };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit' };
  }
}

/**
 * 获取用户的艺术家的申请状态
 */
export async function getArtistApplicationStatus(
  userId: string
): Promise<ArtistApplication | null> {
  try {
    const { data, error } = await supabase
      .from('artist_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * 获取艺术家列表
 */
export async function getArtists(options: {
  style?: string;
  location?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ artists: ArtistProfile[]; total: number }> {
  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('is_artist', true)
      .eq('artist_verified', true);

    if (options.location) {
      query = query.ilike('location', `%${options.location}%`);
    }

    const { data, error, count } = await query
      .order('followers_count', { ascending: false })
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 20) - 1);

    if (error) {
      return { artists: [], total: 0 };
    }

    return { artists: data || [], total: count || 0 };
  } catch {
    return { artists: [], total: 0 };
  }
}

/**
 * 获取艺术家详情
 */
export async function getArtistProfile(artistId: string): Promise<ArtistProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', artistId)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * 获取艺术家作品集
 */
export async function getArtistPortfolios(artistId: string): Promise<ArtistPortfolio[]> {
  try {
    const { data, error } = await supabase
      .from('artist_portfolios')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/**
 * 添加作品到作品集
 */
export async function addPortfolioItem(
  artistId: string,
  data: {
    title: string;
    description?: string;
    image_url: string;
    style: string[];
    price_range?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('artist_portfolios').insert({
      artist_id: artistId,
      title: data.title,
      description: data.description || null,
      image_url: data.image_url,
      style: data.style,
      price_range: data.price_range || null,
      availability: true,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add' };
  }
}

/**
 * 创建预约
 */
export async function createBooking(
  artistId: string,
  clientId: string,
  data: {
    preferred_date?: string;
    message?: string;
  }
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        artist_id: artistId,
        client_id: clientId,
        preferred_date: data.preferred_date || null,
        message: data.message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, booking };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create booking' };
  }
}

/**
 * 获取艺术家的预约列表
 */
export async function getArtistBookings(
  artistId: string,
  status?: string
): Promise<Booking[]> {
  try {
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('artist_id', artistId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/**
 * 更新预约状态
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update' };
  }
}
