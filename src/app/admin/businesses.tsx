import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  MapPin,
  Star,
  MessageSquare,
  Clock,
  User,
  Building2,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAdminAuthStore } from '@/lib/store';
import { db, type DBLocation } from '@/lib/database';

export default function AdminBusinessesScreen() {
  const insets = useSafeAreaInsets();
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [businesses, setBusinesses] = useState<DBLocation[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<DBLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<DBLocation | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    status: 'active' as DBLocation['status'],
  });

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace('/admin-login');
      return;
    }
    loadBusinesses();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, statusFilter]);

  const loadBusinesses = async () => {
    try {
      const data = await db.getLocations();
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBusinesses();
  }, []);

  const filterBusinesses = () => {
    let filtered = [...businesses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.address.toLowerCase().includes(query) ||
          b.ownerName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    setFilteredBusinesses(filtered);
  };

  const handleEdit = (business: DBLocation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBusiness(business);
    setEditForm({
      name: business.name,
      address: business.address,
      status: business.status,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedBusiness) return;
    try {
      await db.updateLocation(selectedBusiness.id, editForm);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadBusinesses();
      setEditModalVisible(false);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Error updating business:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDelete = (business: DBLocation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBusiness(business);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedBusiness) return;
    try {
      await db.deleteLocation(selectedBusiness.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadBusinesses();
      setDeleteModalVisible(false);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Error deleting business:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#10B981';
    if (rating >= 4.0) return '#00D4AA';
    if (rating >= 3.0) return '#F59E0B';
    return '#EF4444';
  };

  if (!isAdminAuthenticated) return null;

  if (loading) {
    return (
      <View className="flex-1 bg-[#F7F8FA] items-center justify-center">
        <ActivityIndicator size="large" color="#00D4AA" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-[#0F172A]">
        <View className="px-5 py-4">
          <View className="flex-row items-center">
            <Building2 size={24} color="#8B5CF6" />
            <Text className="text-white text-xl font-bold ml-3">Businesses</Text>
          </View>
          <Text className="text-white/60 text-sm mt-1">{businesses.length} registered businesses</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2.5 mb-3">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search businesses..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-[#1A1F36]"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View className="flex-row gap-2">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <Pressable
                key={status}
                onPress={() => {
                  Haptics.selectionAsync();
                  setStatusFilter(status);
                }}
                className={`px-4 py-2 rounded-full ${
                  statusFilter === status ? 'bg-[#8B5CF6]' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    statusFilter === status ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Businesses List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
        }
      >
        {filteredBusinesses.map((business, index) => (
          <Animated.View
            key={business.id}
            entering={FadeInDown.delay(index * 50).duration(400)}
            className="bg-white rounded-2xl p-4 mb-3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 items-center justify-center">
                <Building2 size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-[#1A1F36] font-semibold text-base">{business.name}</Text>
                <View className="flex-row items-center mt-1">
                  <MapPin size={12} color="#9CA3AF" />
                  <Text className="text-gray-500 text-sm ml-1 flex-1" numberOfLines={1}>
                    {business.address}
                  </Text>
                </View>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  business.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-xs font-medium capitalize ${
                    business.status === 'active' ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  {business.status}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">
              <View className="flex-row items-center mr-4">
                <User size={14} color="#9CA3AF" />
                <Text className="text-gray-600 text-sm ml-1">{business.ownerName}</Text>
              </View>
              <View className="flex-row items-center mr-4">
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text
                  className="text-sm font-medium ml-1"
                  style={{ color: getRatingColor(business.averageRating) }}
                >
                  {business.averageRating.toFixed(1)}
                </Text>
              </View>
              <View className="flex-row items-center mr-4">
                <MessageSquare size={14} color="#9CA3AF" />
                <Text className="text-gray-600 text-sm ml-1">{business.totalReviews}</Text>
              </View>
              {business.pendingResponses > 0 && (
                <View className="flex-row items-center">
                  <Clock size={14} color="#F97316" />
                  <Text className="text-orange-600 text-sm font-medium ml-1">
                    {business.pendingResponses}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions Row */}
            <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100">
              <Pressable
                onPress={() => handleEdit(business)}
                className="p-2 rounded-lg bg-blue-50 mr-2 active:opacity-70"
              >
                <Edit2 size={18} color="#3B82F6" />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(business)}
                className="p-2 rounded-lg bg-red-50 active:opacity-70"
              >
                <Trash2 size={18} color="#EF4444" />
              </Pressable>
            </View>
          </Animated.View>
        ))}

        {filteredBusinesses.length === 0 && (
          <View className="py-12 items-center">
            <Building2 size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4">No businesses found</Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            style={{ paddingBottom: insets.bottom + 16 }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />
            <View className="px-6">
              <Text className="text-xl font-bold text-[#1A1F36] mb-6">Edit Business</Text>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">Business Name</Text>
                <TextInput
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  className="bg-gray-100 rounded-xl px-4 py-3.5 text-[#1A1F36]"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">Address</Text>
                <TextInput
                  value={editForm.address}
                  onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                  className="bg-gray-100 rounded-xl px-4 py-3.5 text-[#1A1F36]"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-600 mb-2">Status</Text>
                <View className="flex-row gap-2">
                  {(['active', 'inactive'] as const).map((status) => (
                    <Pressable
                      key={status}
                      onPress={() => setEditForm({ ...editForm, status })}
                      className={`flex-1 py-3 rounded-xl items-center ${
                        editForm.status === status
                          ? status === 'active'
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`font-medium capitalize ${
                          editForm.status === status ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={handleSaveEdit}
                className="bg-[#8B5CF6] rounded-xl py-4 items-center flex-row justify-center active:opacity-90"
              >
                <Check size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Save Changes</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl w-full p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <Trash2 size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-[#1A1F36]">Delete Business?</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to delete "{selectedBusiness?.name}"? This will also delete all associated reviews.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                className="flex-1 bg-gray-100 rounded-xl py-3.5 items-center active:opacity-70"
              >
                <Text className="font-semibold text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                className="flex-1 bg-red-500 rounded-xl py-3.5 items-center active:opacity-90"
              >
                <Text className="font-semibold text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
