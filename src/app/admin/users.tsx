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
  Mail,
  Building2,
  Calendar,
  Users as UsersIcon,
  Filter,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAdminAuthStore } from '@/lib/store';
import { db, type DBUser } from '@/lib/database';

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DBUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', status: 'active' as DBUser['status'] });

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace('/admin-login');
      return;
    }
    loadUsers();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter]);

  const loadUsers = async () => {
    try {
      const data = await db.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers();
  }, []);

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user: DBUser) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, status: user.status });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      await db.updateUser(selectedUser.id, editForm);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadUsers();
      setEditModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDelete = (user: DBUser) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await db.deleteUser(selectedUser.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadUsers();
      setDeleteModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getStatusColor = (status: DBUser['status']) => {
    switch (status) {
      case 'active': return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'suspended': return { bg: 'bg-red-100', text: 'text-red-700' };
    }
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
            <UsersIcon size={24} color="#00D4AA" />
            <Text className="text-white text-xl font-bold ml-3">Users</Text>
          </View>
          <Text className="text-white/60 text-sm mt-1">{users.length} registered users</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2.5 mb-3">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search users..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-[#1A1F36]"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View className="flex-row gap-2">
            {(['all', 'active', 'pending', 'suspended'] as const).map((status) => (
              <Pressable
                key={status}
                onPress={() => {
                  Haptics.selectionAsync();
                  setStatusFilter(status);
                }}
                className={`px-4 py-2 rounded-full ${
                  statusFilter === status ? 'bg-[#00D4AA]' : 'bg-gray-100'
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

      {/* Users List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4AA" />
        }
      >
        {filteredUsers.map((user, index) => {
          const statusStyle = getStatusColor(user.status);
          return (
            <Animated.View
              key={user.id}
              entering={FadeInDown.delay(index * 50).duration(400)}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-[#0F172A] items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-[#1A1F36] font-semibold text-base">{user.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Mail size={12} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">{user.email}</Text>
                  </View>
                </View>
                <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
                  <Text className={`text-xs font-medium capitalize ${statusStyle.text}`}>
                    {user.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">
                <View className="flex-1 flex-row items-center">
                  <Building2 size={14} color="#9CA3AF" />
                  <Text className="text-gray-600 text-sm ml-1">{user.businessCount} businesses</Text>
                </View>
                <View className="flex-1 flex-row items-center">
                  <Calendar size={14} color="#9CA3AF" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleEdit(user)}
                    className="p-2 rounded-lg bg-blue-50 active:opacity-70"
                  >
                    <Edit2 size={18} color="#3B82F6" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(user)}
                    className="p-2 rounded-lg bg-red-50 active:opacity-70"
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          );
        })}

        {filteredUsers.length === 0 && (
          <View className="py-12 items-center">
            <UsersIcon size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4">No users found</Text>
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
              <Text className="text-xl font-bold text-[#1A1F36] mb-6">Edit User</Text>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">Name</Text>
                <TextInput
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  className="bg-gray-100 rounded-xl px-4 py-3.5 text-[#1A1F36]"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">Email</Text>
                <TextInput
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  className="bg-gray-100 rounded-xl px-4 py-3.5 text-[#1A1F36]"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-600 mb-2">Status</Text>
                <View className="flex-row gap-2">
                  {(['active', 'pending', 'suspended'] as const).map((status) => (
                    <Pressable
                      key={status}
                      onPress={() => setEditForm({ ...editForm, status })}
                      className={`flex-1 py-3 rounded-xl items-center ${
                        editForm.status === status
                          ? status === 'active'
                            ? 'bg-green-500'
                            : status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
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
                className="bg-[#00D4AA] rounded-xl py-4 items-center flex-row justify-center active:opacity-90"
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
              <Text className="text-xl font-bold text-[#1A1F36]">Delete User?</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to delete {selectedUser?.name}? This will also delete all their businesses and reviews.
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
