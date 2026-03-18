import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
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
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAdminAuthStore } from '@/lib/store';
import { db, type DBLocation } from '@/lib/database';
import { AdminWebLayout } from '@/components/AdminWebLayout';

export default function AdminBusinessesWeb() {
  const router = useRouter();
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const [loading, setLoading] = useState(true);
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
    }
  };

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
      await loadBusinesses();
      setEditModalVisible(false);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Error updating business:', error);
    }
  };

  const handleDelete = (business: DBLocation) => {
    setSelectedBusiness(business);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedBusiness) return;
    try {
      await db.deleteLocation(selectedBusiness.id);
      await loadBusinesses();
      setDeleteModalVisible(false);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-cyan-600';
    if (rating >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isAdminAuthenticated) return null;

  if (loading) {
    return (
      <AdminWebLayout title="Businesses" subtitle="Loading...">
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      </AdminWebLayout>
    );
  }

  return (
    <AdminWebLayout title="Businesses" subtitle={`Manage ${businesses.length} registered businesses`}>
      {/* Filters */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100"
      >
        <View className="flex-row items-center gap-4">
          {/* Search */}
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-lg px-4 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, address, or owner..."
              className="flex-1 ml-3 text-[#1A1F36]"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Status Filter */}
          <View className="flex-row gap-2">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === status ? 'bg-cyan-500' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`font-medium capitalize ${
                    statusFilter === status ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Businesses Table */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Table Header */}
        <View className="flex-row bg-gray-50 px-6 py-4 border-b border-gray-100">
          <Text className="flex-[2] font-semibold text-gray-600">Business</Text>
          <Text className="flex-1 font-semibold text-gray-600">Owner</Text>
          <Text className="w-20 font-semibold text-gray-600 text-center">Rating</Text>
          <Text className="w-20 font-semibold text-gray-600 text-center">Reviews</Text>
          <Text className="w-20 font-semibold text-gray-600 text-center">Pending</Text>
          <Text className="w-20 font-semibold text-gray-600 text-center">Status</Text>
          <Text className="w-24 font-semibold text-gray-600 text-center">Actions</Text>
        </View>

        {/* Table Body */}
        {filteredBusinesses.map((business, index) => (
          <View
            key={business.id}
            className={`flex-row items-center px-6 py-4 ${
              index < filteredBusinesses.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            {/* Business Info */}
            <View className="flex-[2]">
              <Text className="font-medium text-[#1A1F36]">{business.name}</Text>
              <View className="flex-row items-center mt-1">
                <MapPin size={12} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
                  {business.address}
                </Text>
              </View>
            </View>

            {/* Owner */}
            <View className="flex-1 flex-row items-center">
              <User size={14} color="#9CA3AF" />
              <Text className="ml-2 text-gray-600 text-sm">{business.ownerName}</Text>
            </View>

            {/* Rating */}
            <View className="w-20 flex-row items-center justify-center">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className={`ml-1 font-medium ${getRatingColor(business.averageRating)}`}>
                {business.averageRating.toFixed(1)}
              </Text>
            </View>

            {/* Reviews */}
            <View className="w-20 flex-row items-center justify-center">
              <MessageSquare size={14} color="#9CA3AF" />
              <Text className="ml-1 text-gray-600">{business.totalReviews}</Text>
            </View>

            {/* Pending */}
            <View className="w-20 flex-row items-center justify-center">
              <Clock size={14} color={business.pendingResponses > 0 ? '#F97316' : '#9CA3AF'} />
              <Text
                className={`ml-1 ${
                  business.pendingResponses > 0 ? 'text-orange-600 font-medium' : 'text-gray-600'
                }`}
              >
                {business.pendingResponses}
              </Text>
            </View>

            {/* Status */}
            <View className="w-20 items-center">
              <View
                className={`px-2 py-1 rounded-full ${
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

            {/* Actions */}
            <View className="w-24 flex-row justify-center gap-2">
              <Pressable
                onPress={() => handleEdit(business)}
                className="p-2 rounded-lg bg-blue-50"
              >
                <Edit2 size={16} color="#3B82F6" />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(business)}
                className="p-2 rounded-lg bg-red-50"
              >
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        ))}

        {filteredBusinesses.length === 0 && (
          <View className="py-12 items-center">
            <Text className="text-gray-400">No businesses found</Text>
          </View>
        )}
      </Animated.View>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl w-[450px] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#1A1F36]">Edit Business</Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-600 mb-2">Business Name</Text>
              <TextInput
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                className="bg-gray-50 rounded-lg px-4 py-3 text-[#1A1F36]"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-600 mb-2">Address</Text>
              <TextInput
                value={editForm.address}
                onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                className="bg-gray-50 rounded-lg px-4 py-3 text-[#1A1F36]"
                multiline
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-600 mb-2">Status</Text>
              <View className="flex-row gap-2">
                {(['active', 'inactive'] as const).map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => setEditForm({ ...editForm, status })}
                    className={`flex-1 py-2 rounded-lg items-center ${
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
              className="bg-cyan-500 rounded-xl py-3 items-center"
            >
              <View className="flex-row items-center">
                <Check size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Save Changes</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl w-[360px] p-6">
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
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              >
                <Text className="font-semibold text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                className="flex-1 bg-red-500 rounded-xl py-3 items-center"
              >
                <Text className="font-semibold text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AdminWebLayout>
  );
}
