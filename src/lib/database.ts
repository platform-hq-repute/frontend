import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';
import type { Location, Review, User, AdminUser, AISettings } from './store';

// Extended User type with additional fields for admin management
export interface DBUser extends User {
  createdAt: string;
  status: 'active' | 'suspended' | 'pending';
  businessCount: number;
  lastLoginAt?: string;
}

// Extended Location type with owner info
export interface DBLocation extends Location {
  ownerId: string;
  ownerName: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

// Extended Admin type
export interface DBAdmin extends AdminUser {
  createdAt: string;
  lastLoginAt?: string;
}

// Helper to convert snake_case to camelCase for users
function mapUserFromDB(row: Record<string, unknown>): DBUser {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    avatar: row.avatar as string | undefined,
    createdAt: row.created_at as string,
    status: row.status as 'active' | 'suspended' | 'pending',
    businessCount: row.business_count as number,
    lastLoginAt: row.last_login_at as string | undefined,
  };
}

// Helper to convert snake_case to camelCase for locations
function mapLocationFromDB(row: Record<string, unknown>): DBLocation {
  return {
    id: row.id as string,
    name: row.name as string,
    address: row.address as string,
    googlePlaceId: row.google_place_id as string | undefined,
    averageRating: row.average_rating as number,
    totalReviews: row.total_reviews as number,
    pendingResponses: row.pending_responses as number,
    ownerId: row.owner_id as string,
    ownerName: row.owner_name as string,
    createdAt: row.created_at as string,
    status: row.status as 'active' | 'inactive',
  };
}

// Helper to convert snake_case to camelCase for reviews
function mapReviewFromDB(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    locationId: row.location_id as string,
    locationName: row.location_name as string,
    platform: row.platform as 'google' | 'trustpilot',
    authorName: row.author_name as string,
    authorAvatar: row.author_avatar as string | undefined,
    rating: row.rating as number,
    content: row.content as string,
    createdAt: row.created_at as string,
    status: row.status as 'pending' | 'ai_generated' | 'responded',
    aiResponse: row.ai_response as string | undefined,
    publishedResponse: row.published_response as string | undefined,
    respondedAt: row.responded_at as string | undefined,
  };
}

// Helper to convert snake_case to camelCase for admins
function mapAdminFromDB(row: Record<string, unknown>): DBAdmin {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as 'admin' | 'super_admin',
    createdAt: row.created_at as string,
    lastLoginAt: row.last_login_at as string | undefined,
  };
}

// Database class using Supabase
class Database {
  // USERS CRUD
  async getUsers(): Promise<DBUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return (data || []).map(mapUserFromDB);
  }

  async getUserById(id: string): Promise<DBUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data ? mapUserFromDB(data) : null;
  }

  async getUserByEmail(email: string): Promise<DBUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error);
      return null;
    }
    return data ? mapUserFromDB(data) : null;
  }

  async createUser(user: Omit<DBUser, 'id' | 'createdAt'>): Promise<DBUser> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        status: user.status,
        business_count: user.businessCount,
        last_login_at: user.lastLoginAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    return mapUserFromDB(data);
  }

  async updateUser(id: string, updates: Partial<DBUser>): Promise<DBUser | null> {
    const updateData: Record<string, unknown> = {};
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.businessCount !== undefined) updateData.business_count = updates.businessCount;
    if (updates.lastLoginAt !== undefined) updateData.last_login_at = updates.lastLoginAt;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    return data ? mapUserFromDB(data) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    return true;
  }

  // LOCATIONS CRUD
  async getLocations(): Promise<DBLocation[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
    return (data || []).map(mapLocationFromDB);
  }

  async getLocationById(id: string): Promise<DBLocation | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching location:', error);
      return null;
    }
    return data ? mapLocationFromDB(data) : null;
  }

  async getLocationsByOwner(ownerId: string): Promise<DBLocation[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching locations by owner:', error);
      return [];
    }
    return (data || []).map(mapLocationFromDB);
  }

  async createLocation(location: Omit<DBLocation, 'id' | 'createdAt'>): Promise<DBLocation> {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        name: location.name,
        address: location.address,
        google_place_id: location.googlePlaceId,
        average_rating: location.averageRating,
        total_reviews: location.totalReviews,
        pending_responses: location.pendingResponses,
        owner_id: location.ownerId,
        owner_name: location.ownerName,
        status: location.status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      throw error;
    }

    // Update user's business count
    const user = await this.getUserById(location.ownerId);
    if (user) {
      await this.updateUser(location.ownerId, { businessCount: user.businessCount + 1 });
    }

    return mapLocationFromDB(data);
  }

  async updateLocation(id: string, updates: Partial<DBLocation>): Promise<DBLocation | null> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.googlePlaceId !== undefined) updateData.google_place_id = updates.googlePlaceId;
    if (updates.averageRating !== undefined) updateData.average_rating = updates.averageRating;
    if (updates.totalReviews !== undefined) updateData.total_reviews = updates.totalReviews;
    if (updates.pendingResponses !== undefined) updateData.pending_responses = updates.pendingResponses;
    if (updates.ownerName !== undefined) updateData.owner_name = updates.ownerName;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('locations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      return null;
    }
    return data ? mapLocationFromDB(data) : null;
  }

  async deleteLocation(id: string): Promise<boolean> {
    // Get location to update user's business count
    const location = await this.getLocationById(id);

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting location:', error);
      return false;
    }

    // Update user's business count
    if (location) {
      const user = await this.getUserById(location.ownerId);
      if (user) {
        await this.updateUser(location.ownerId, { businessCount: Math.max(0, user.businessCount - 1) });
      }
    }

    return true;
  }

  // REVIEWS CRUD
  async getReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
    return (data || []).map(mapReviewFromDB);
  }

  async getReviewById(id: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching review:', error);
      return null;
    }
    return data ? mapReviewFromDB(data) : null;
  }

  async getReviewsByLocation(locationId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews by location:', error);
      return [];
    }
    return (data || []).map(mapReviewFromDB);
  }

  async createReview(review: Omit<Review, 'id'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        location_id: review.locationId,
        location_name: review.locationName,
        platform: review.platform,
        author_name: review.authorName,
        author_avatar: review.authorAvatar,
        rating: review.rating,
        content: review.content,
        created_at: review.createdAt,
        status: review.status,
        ai_response: review.aiResponse,
        published_response: review.publishedResponse,
        responded_at: review.respondedAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }

    // Update location's review count and pending count
    const location = await this.getLocationById(review.locationId);
    if (location) {
      await this.updateLocation(review.locationId, {
        totalReviews: location.totalReviews + 1,
        pendingResponses: review.status === 'pending' ? location.pendingResponses + 1 : location.pendingResponses,
      });
    }

    return mapReviewFromDB(data);
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    // Get old review to check status change
    const oldReview = await this.getReviewById(id);

    const updateData: Record<string, unknown> = {};
    if (updates.locationName !== undefined) updateData.location_name = updates.locationName;
    if (updates.platform !== undefined) updateData.platform = updates.platform;
    if (updates.authorName !== undefined) updateData.author_name = updates.authorName;
    if (updates.authorAvatar !== undefined) updateData.author_avatar = updates.authorAvatar;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.aiResponse !== undefined) updateData.ai_response = updates.aiResponse;
    if (updates.publishedResponse !== undefined) updateData.published_response = updates.publishedResponse;
    if (updates.respondedAt !== undefined) updateData.responded_at = updates.respondedAt;

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return null;
    }

    // Update pending count if status changed
    if (oldReview && updates.status && oldReview.status !== updates.status) {
      const location = await this.getLocationById(oldReview.locationId);
      if (location) {
        let pendingDelta = 0;
        if (oldReview.status === 'pending' && updates.status !== 'pending') {
          pendingDelta = -1;
        } else if (oldReview.status !== 'pending' && updates.status === 'pending') {
          pendingDelta = 1;
        }
        if (pendingDelta !== 0) {
          await this.updateLocation(oldReview.locationId, {
            pendingResponses: Math.max(0, location.pendingResponses + pendingDelta),
          });
        }
      }
    }

    return data ? mapReviewFromDB(data) : null;
  }

  async deleteReview(id: string): Promise<boolean> {
    // Get review to update location counts
    const review = await this.getReviewById(id);

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting review:', error);
      return false;
    }

    // Update location counts
    if (review) {
      const location = await this.getLocationById(review.locationId);
      if (location) {
        await this.updateLocation(review.locationId, {
          totalReviews: Math.max(0, location.totalReviews - 1),
          pendingResponses: review.status === 'pending'
            ? Math.max(0, location.pendingResponses - 1)
            : location.pendingResponses,
        });
      }
    }

    return true;
  }

  // ADMINS CRUD
  async getAdmins(): Promise<DBAdmin[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, name, role, created_at, last_login_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admins:', error);
      return [];
    }
    return (data || []).map(mapAdminFromDB);
  }

  async getAdminByEmail(email: string): Promise<DBAdmin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, name, role, created_at, last_login_at')
      .ilike('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching admin by email:', error);
      return null;
    }
    return data ? mapAdminFromDB(data) : null;
  }

  async validateAdminLogin(email: string, password: string): Promise<DBAdmin | null> {
    console.log('[Admin Login] Attempting login for:', email);

    try {
      // Hash the password using SHA-256 (same as web app)
      const passwordHash = await this.hashPassword(password);
      console.log('[Admin Login] Password hashed successfully');

      // First check if admin exists
      const { data: admin, error: fetchError } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', email)
        .single();

      console.log('[Admin Login] Admin lookup result:', admin ? 'Found' : 'Not found', fetchError?.message || '');

      if (fetchError || !admin) {
        console.log('[Admin Login] Admin not found or error:', fetchError?.message);
        return null;
      }

      // If admin has no password_hash, set it (first time setup)
      if (!admin.password_hash) {
        console.log('[Admin Login] First time setup - setting password hash');
        const { error: updateError } = await supabase
          .from('admins')
          .update({ password_hash: passwordHash })
          .eq('id', admin.id);

        if (updateError) {
          console.error('[Admin Login] Error setting password hash:', updateError);
          return null;
        }
      } else if (admin.password_hash !== passwordHash) {
        // Password doesn't match
        console.log('[Admin Login] Password mismatch');
        return null;
      }

      // Update last login
      await this.updateAdminLastLogin(admin.id);
      console.log('[Admin Login] Login successful for:', admin.email);
      return mapAdminFromDB(admin);
    } catch (error) {
      console.error('[Admin Login] Exception during login:', error);
      throw error;
    }
  }

  // SHA-256 hash function (matches web app)
  private async hashPassword(password: string): Promise<string> {
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      return hash;
    } catch (error) {
      console.error('[hashPassword] Error hashing password:', error);
      throw error;
    }
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
  }

  // STATISTICS
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalLocations: number;
    totalReviews: number;
    pendingReviews: number;
    respondedReviews: number;
    averageRating: number;
  }> {
    const [users, locations, reviews] = await Promise.all([
      this.getUsers(),
      this.getLocations(),
      this.getReviews(),
    ]);

    const activeUsers = users.filter((u) => u.status === 'active').length;
    const pendingReviews = reviews.filter((r) => r.status === 'pending').length;
    const respondedReviews = reviews.filter((r) => r.status === 'responded').length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      totalUsers: users.length,
      activeUsers,
      totalLocations: locations.length,
      totalReviews: reviews.length,
      pendingReviews,
      respondedReviews,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  // Reset is no longer needed with Supabase - data persists in the cloud
  async reset(): Promise<void> {
    console.log('Reset not implemented for Supabase - manage data through Supabase dashboard');
  }
}

// Export singleton instance
export const db = new Database();
