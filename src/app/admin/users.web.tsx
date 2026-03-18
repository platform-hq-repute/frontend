import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Building2,
  Mail,
  Calendar,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAdminAuthStore } from '@/lib/store';
import { db, type DBUser } from '@/lib/database';
import { AdminWebLayout } from '@/components/AdminWebLayout';

export default function AdminUsersWeb() {
  const router = useRouter();
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const [loading, setLoading] = useState(true);
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
    }
  };

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
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, status: user.status });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      await db.updateUser(selectedUser.id, editForm);
      await loadUsers();
      setEditModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = (user: DBUser) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await db.deleteUser(selectedUser.id);
      await loadUsers();
      setDeleteModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!isAdminAuthenticated) return null;

  if (loading) {
    return (
      <AdminWebLayout title="Users" subtitle="Loading...">
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      </AdminWebLayout>
    );
  }

  return (
    <AdminWebLayout title="Users" subtitle={`Manage ${users.length} registered users`}>
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
              placeholder="Search by name or email..."
              className="flex-1 ml-3 text-[#1A1F36]"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Status Filter */}
          <View className="flex-row gap-2">
            {(['all', 'active', 'pending', 'suspended'] as const).map((status) => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === status
                    ? 'bg-cyan-500'
                    : 'bg-gray-100'
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

      {/* Users Table */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Table Header */}
        <View className="flex-row bg-gray-50 px-6 py-4 border-b border-gray-100">
          <Text className="flex-[2] font-semibold text-gray-600">User</Text>
          <Text className="flex-1 font-semibold text-gray-600">Status</Text>
          <Text className="flex-1 font-semibold text-gray-600">Businesses</Text>
          <Text className="flex-1 font-semibold text-gray-600">Joined</Text>
          <Text className="w-24 font-semibold text-gray-600 text-center">Actions</Text>
        </View>

        {/* Table Body */}
        {filteredUsers.map((user, index) => (
          <View
            key={user.id}
            className={`flex-row items-center px-6 py-4 ${
              index < filteredUsers.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            {/* User Info */}
            <View className="flex-[2] flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-cyan-100 items-center justify-center">
                <Text className="text-cyan-600 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="ml-3">
                <Text className="font-medium text-[#1A1F36]">{user.name}</Text>
                <View className="flex-row items-center mt-0.5">
                  <Mail size={12} color="#9CA3AF" />
                  <Text className="text-gray-500 text-sm ml-1">{user.email}</Text>
                </View>
              </View>
            </View>

            {/* Status */}
            <View className="flex-1">
              <View
                className={`self-start px-3 py-1 rounded-full ${
                  user.status === 'active'
                    ? 'bg-green-100'
                    : user.status === 'pending'
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    user.status === 'active'
                      ? 'text-green-700'
                      : user.status === 'pending'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}
                >
                  {user.status}
                </Text>
              </View>
            </View>

            {/* Businesses */}
            <View className="flex-1 flex-row items-center">
              <Building2 size={16} color="#9CA3AF" />
              <Text className="ml-2 text-gray-600">{user.businessCount}</Text>
            </View>

            {/* Joined */}
            <View className="flex-1 flex-row items-center">
              <Calendar size={16} color="#9CA3AF" />
              <Text className="ml-2 text-gray-600 text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {/* Actions */}
            <View className="w-24 flex-row justify-center gap-2">
              <Pressable
                onPress={() => handleEdit(user)}
                className="p-2 rounded-lg bg-blue-50"
              >
                <Edit2 size={16} color="#3B82F6" />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(user)}
                className="p-2 rounded-lg bg-red-50"
              >
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        ))}

        {filteredUsers.length === 0 && (
          <View className="py-12 items-center">
            <Text className="text-gray-400">No users found</Text>
          </View>
        )}
      </Animated.View>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl w-[400px] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#1A1F36]">Edit User</Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-600 mb-2">Name</Text>
              <TextInput
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                className="bg-gray-50 rounded-lg px-4 py-3 text-[#1A1F36]"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-600 mb-2">Email</Text>
              <TextInput
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                className="bg-gray-50 rounded-lg px-4 py-3 text-[#1A1F36]"
                keyboardType="email-address"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-600 mb-2">Status</Text>
              <View className="flex-row gap-2">
                {(['active', 'pending', 'suspended'] as const).map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => setEditForm({ ...editForm, status })}
                    className={`flex-1 py-2 rounded-lg items-center ${
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
              <Text className="text-xl font-bold text-[#1A1F36]">Delete User?</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to delete {selectedUser?.name}? This will also delete all their businesses and reviews.
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
