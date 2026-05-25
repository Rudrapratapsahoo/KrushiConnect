'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import RevenueChart from '@/components/RevenueChart';
import { getDetectedImageUrl, getCategoryFallbackUrl } from '@/utils/cropImages';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  IndianRupee, 
  TrendingUp, 
  Sprout, 
  CloudSun,
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // Active tab selection
  const [activeTab, setActiveTab] = useState('overview');

  // Loading states
  const [dbLoading, setDbLoading] = useState(true);

  // Farmer specific data
  const [myProducts, setMyProducts] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);

  // Buyer specific data
  const [myOrders, setMyOrders] = useState([]);

  // Modal listing state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Cereals',
    quantity: '',
    price: '',
    location: '',
    description: '',
    image_url: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [isFetchingImage, setIsFetchingImage] = useState(false);

  const autoFetchWikipediaImage = async (query) => {
    if (!query || newProduct.image_url) return;
    try {
      setIsFetchingImage(true);
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=800&origin=*`);
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].thumbnail) {
          setNewProduct(prev => ({ ...prev, image_url: pages[pageId].thumbnail.source }));
        }
      }
    } catch (err) {
      console.error('Failed to auto-fetch image from Wikipedia', err);
    } finally {
      setIsFetchingImage(false);
    }
  };

  // Sync / refresh databases
  const fetchFarmerData = async (userId) => {
    try {
      setDbLoading(true);
      // Fetch Farmer's listed products
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (prodErr) throw prodErr;
      setMyProducts(productsData || []);

      // Fetch Farmer's received orders
      // In Supabase we select orders where the product's user_id is this farmer
      const { data: ordersData, error: ordErr } = await supabase
        .from('orders')
        .select(`
          id,
          quantity,
          total_price,
          status,
          created_at,
          buyer_id,
          product_id,
          products!inner (
            name,
            price,
            user_id
          ),
          users: buyer_id (
            name,
            email,
            location
          )
        `)
        .eq('products.user_id', userId)
        .order('created_at', { ascending: false });

      if (ordErr) throw ordErr;
      setFarmerOrders(ordersData || []);
    } catch (err) {
      console.error('Error fetching farmer data:', err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const fetchBuyerData = async (userId) => {
    try {
      setDbLoading(true);
      // Fetch orders placed by this buyer
      const { data: ordersData, error: ordErr } = await supabase
        .from('orders')
        .select(`
          id,
          quantity,
          total_price,
          status,
          created_at,
          products (
            id,
            name,
            image_url,
            location,
            users (
              name,
              email
            )
          )
        `)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      if (ordErr) throw ordErr;
      setMyOrders(ordersData || []);
    } catch (err) {
      console.error('Error fetching buyer data:', err.message);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'farmer') {
        fetchFarmerData(user.id);
        fetchBuyerData(user.id);
      } else {
        fetchBuyerData(user.id);
      }
    }
  }, [user, profile]);

  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  // Handle Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const { name, category, quantity, price, location, description, image_url } = newProduct;

    if (!name || !quantity || !price || !location) {
      setFormError('Please fill in all required fields.');
      setFormLoading(false);
      return;
    }

    try {
      const finalImageUrl = image_url || getDetectedImageUrl(name, category);
      
      const { error } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            name,
            category,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            location,
            description,
            image_url: finalImageUrl
          }
        ]);

      if (error) throw error;

      // Reset form
      setNewProduct({
        name: '',
        category: 'Cereals',
        quantity: '',
        price: '',
        location: '',
        description: '',
        image_url: ''
      });
      setShowAddModal(false);
      fetchFarmerData(user.id);
    } catch (err) {
      setFormError(err.message || 'Failed to list product.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete product listing
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
      fetchFarmerData(user.id);
    } catch (err) {
      alert('Error deleting product listing: ' + err.message);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      fetchFarmerData(user.id);
    } catch (err) {
      alert('Error updating order: ' + err.message);
    }
  };

  // Farmer metrics
  const totalListings = myProducts.length;
  const totalEarnings = farmerOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total_price || 0), 0);
  const pendingFarmerOrders = farmerOrders.filter(o => o.status === 'pending').length;

  // Buyer metrics
  const totalOrdersPlaced = myOrders.length;
  const pendingDeliveries = myOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const totalSpent = myOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-8 shadow-xl border border-stone-800 flex flex-col md:flex-row justify-between items-center mb-10 space-y-6 md:space-y-0 relative overflow-hidden">
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <span className="bg-primary px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest text-white">
              {profile?.role === 'farmer' ? '🌾 Farmer Profile' : '🛒 Buyer Profile'}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {profile?.name || user.email}!</h1>
            <p className="text-sm text-stone-400 font-medium">
              Manage your agricultural trade actions, predictions, and recommendations.
            </p>
          </div>
          <div className="flex items-center space-x-4 relative z-10">
            <img 
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} 
              alt="Avatar" 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-lg"
            />
            <div>
              <div className="font-bold text-lg text-white">{profile?.name}</div>
              <div className="text-xs text-stone-400 font-semibold">{profile?.location}</div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Dashboard Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-3xl border border-stone-150 shadow-sm space-y-1">
              <span className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-earth mb-1">Navigation</span>
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition duration-200 cursor-pointer flex items-center space-x-2 ${
                  activeTab === 'overview'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-earth hover:bg-stone-50 hover:text-primary'
                }`}
              >
                <Package className="h-4.5 w-4.5" />
                <span>Overview Dashboard</span>
              </button>
              
              {profile?.role === 'farmer' ? (
                <>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition duration-200 cursor-pointer flex items-center space-x-2 ${
                      activeTab === 'listings'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-earth hover:bg-stone-50 hover:text-primary'
                    }`}
                  >
                    <ShoppingBag className="h-4.5 w-4.5" />
                    <span>My Listed Crops ({totalListings})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition duration-200 cursor-pointer flex items-center space-x-2 ${
                      activeTab === 'orders'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-earth hover:bg-stone-50 hover:text-primary'
                    }`}
                  >
                    <CheckCircle className="h-4.5 w-4.5" />
                    <span>Received Orders ({farmerOrders.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition duration-200 cursor-pointer flex items-center space-x-2 ${
                      activeTab === 'purchases'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-earth hover:bg-stone-50 hover:text-primary'
                    }`}
                  >
                    <Package className="h-4.5 w-4.5" />
                    <span>My Purchases ({myOrders.length})</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition duration-200 cursor-pointer flex items-center space-x-2 ${
                    activeTab === 'purchases'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-earth hover:bg-stone-50 hover:text-primary'
                  }`}
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>My Placed Purchases ({totalOrdersPlaced})</span>
                </button>
              )}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-4">
              <h3 className="font-bold text-earth-dark text-sm uppercase tracking-wider">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/crop-advisor" className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:border-primary/30 transition text-sm font-semibold text-earth-dark">
                  <span className="flex items-center space-x-2">
                    <Sprout className="h-4 w-4 text-primary" />
                    <span>Crop Recommendations</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-earth" />
                </Link>
                <Link href="/weather" className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:border-primary/30 transition text-sm font-semibold text-earth-dark">
                  <span className="flex items-center space-x-2">
                    <CloudSun className="h-4 w-4 text-primary" />
                    <span>Weather Analytics</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-earth" />
                </Link>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold py-3.5 px-4 rounded-3xl text-sm transition duration-200 cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Log Out Account</span>
            </button>
          </div>

          {/* Right Main Panel */}
          <div className="lg:col-span-3 space-y-8">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in-up">
                {/* Stats Row */}
                {profile?.role === 'farmer' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Crop Listings" value={totalListings} icon={ShoppingBag} color="primary" />
                    <StatCard title="Total Earnings (₹)" value={`₹${totalEarnings.toLocaleString()}`} icon={IndianRupee} color="secondary" />
                    <StatCard title="Pending Incoming Orders" value={pendingFarmerOrders} icon={Clock} color="earth" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Orders Placed" value={totalOrdersPlaced} icon={ShoppingBag} color="primary" />
                    <StatCard title="Total Delivered Spent (₹)" value={`₹${totalSpent.toLocaleString()}`} icon={IndianRupee} color="secondary" />
                    <StatCard title="Pending Deliveries" value={pendingDeliveries} icon={Truck} color="earth" />
                  </div>
                )}

                {/* Revenue Recharts for Farmers */}
                {profile?.role === 'farmer' && <RevenueChart />}

                {/* Recent Items Box */}
                <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-earth-dark text-lg">
                        {profile?.role === 'farmer' ? 'Recent Active Orders' : 'Your Placed Purchases'}
                      </h3>
                      <p className="text-xs text-earth font-semibold">Latest updates on transactional statuses</p>
                    </div>
                    {profile?.role === 'farmer' && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>List Crop Listing</span>
                      </button>
                    )}
                  </div>

                  {dbLoading ? (
                    <div className="py-12 text-center text-earth text-sm animate-pulse">Loading list...</div>
                  ) : profile?.role === 'farmer' ? (
                    farmerOrders.length === 0 ? (
                      <div className="py-12 text-center text-earth text-sm font-medium">No received orders yet. Keep listing high-quality crops!</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-100 text-xs font-bold uppercase tracking-wider text-earth">
                              <th className="pb-3">Crop Name</th>
                              <th className="pb-3">Buyer Detail</th>
                              <th className="pb-3">Qty (Kg)</th>
                              <th className="pb-3">Total Value</th>
                              <th className="pb-3">Status</th>
                              <th className="pb-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-medium divide-y divide-stone-50">
                            {farmerOrders.slice(0, 5).map((order) => (
                              <tr key={order.id} className="hover:bg-stone-50/50">
                                <td className="py-3.5 text-earth-dark font-semibold">{order.products?.name}</td>
                                <td className="py-3.5">
                                  <div className="text-xs text-stone-500 font-bold">{order.users?.name}</div>
                                  <div className="text-[10px] text-stone-400 font-semibold">{order.users?.email}</div>
                                </td>
                                <td className="py-3.5 text-stone-500">{order.quantity}</td>
                                <td className="py-3.5 text-earth-dark">₹{order.total_price?.toLocaleString()}</td>
                                <td className="py-3.5">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                    order.status === 'delivered' ? 'bg-primary-light text-primary-dark' :
                                    order.status === 'pending' ? 'bg-yellow-50 text-secondary' :
                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-3.5 text-right space-x-1.5">
                                  {order.status === 'pending' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                      className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                      className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                    >
                                      Ship
                                    </button>
                                  )}
                                  {order.status === 'shipped' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                      className="bg-primary-light hover:bg-primary text-primary-dark hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                    >
                                      Deliver
                                    </button>
                                  )}
                                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                      className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-2 py-1 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    myOrders.length === 0 ? (
                      <div className="py-12 text-center text-earth text-sm font-medium">
                        No purchases made yet.{' '}
                        <Link href="/marketplace" className="text-primary font-bold hover:underline">Browse Marketplace</Link> to buy fresh crops!
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-stone-100 text-xs font-bold uppercase tracking-wider text-earth">
                              <th className="pb-3">Crop Product</th>
                              <th className="pb-3">Farmer Location</th>
                              <th className="pb-3">Qty (Kg)</th>
                              <th className="pb-3">Price paid</th>
                              <th className="pb-3">Status</th>
                              <th className="pb-3">Date</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-medium divide-y divide-stone-50">
                            {myOrders.slice(0, 5).map((order) => (
                              <tr key={order.id} className="hover:bg-stone-50/50">
                                <td className="py-3.5 flex items-center space-x-3">
                                  <img 
                                    src={order.products?.image_url || getDetectedImageUrl(order.products?.name, '')} 
                                    alt="" 
                                    onError={(e) => { e.target.onerror = null; e.target.src = getCategoryFallbackUrl(''); }}
                                    className="w-10 h-10 rounded-xl object-cover border border-stone-150 shadow-sm"
                                  />
                                  <div>
                                    <div className="text-earth-dark font-bold">{order.products?.name}</div>
                                    <div className="text-[10px] text-stone-400 font-bold">Seller: {order.products?.users?.name}</div>
                                  </div>
                                </td>
                                <td className="py-3.5 text-stone-500 font-semibold">{order.products?.location}</td>
                                <td className="py-3.5 text-stone-500">{order.quantity}</td>
                                <td className="py-3.5 text-earth-dark font-bold">₹{order.total_price?.toLocaleString()}</td>
                                <td className="py-3.5">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                    order.status === 'delivered' ? 'bg-primary-light text-primary-dark' :
                                    order.status === 'pending' ? 'bg-yellow-50 text-secondary' :
                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-3.5 text-xs text-stone-400 font-semibold">{new Date(order.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* FARMER MY LISTINGS TAB */}
            {activeTab === 'listings' && profile?.role === 'farmer' && (
              <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-earth-dark text-xl">Your Crop Listings</h3>
                    <p className="text-xs text-earth font-semibold">Manage, list and edit crop quantities listed on the marketplace</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-md hover:shadow-lg"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>List New Crop Listing</span>
                  </button>
                </div>

                {dbLoading ? (
                  <div className="py-12 text-center text-earth text-sm animate-pulse">Loading listings...</div>
                ) : myProducts.length === 0 ? (
                  <div className="py-16 text-center text-earth font-medium flex flex-col items-center justify-center space-y-3">
                    <span className="text-4xl">🌾</span>
                    <p className="text-base text-earth-dark font-extrabold">You haven't listed any crops yet.</p>
                    <p className="text-sm text-stone-400 font-medium">Share your fresh crops with active buyers around India today!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myProducts.map((product) => (
                      <div key={product.id} className="border border-stone-150 rounded-3xl p-5 hover:shadow-md transition flex space-x-4">
                        <img 
                          src={product.image_url || getDetectedImageUrl(product.name, product.category)} 
                          alt="" 
                          onError={(e) => { e.target.onerror = null; e.target.src = getCategoryFallbackUrl(product.category); }}
                          className="w-24 h-24 rounded-2xl object-cover border border-stone-150 shadow-sm"
                        />
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-primary-light text-primary-dark font-extrabold px-2 py-0.5 rounded-full">{product.category}</span>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <h4 className="font-extrabold text-earth-dark text-lg mt-1">{product.name}</h4>
                            <div className="flex items-center text-xs text-stone-400 font-semibold space-x-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{product.location}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-baseline mt-4 border-t border-stone-50 pt-2">
                            <span className="text-xs text-earth font-bold">{product.quantity} Kg available</span>
                            <span className="font-extrabold text-primary text-base">₹{product.price}/Kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FARMER RECEIVED ORDERS TAB */}
            {activeTab === 'orders' && profile?.role === 'farmer' && (
              <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6 animate-fade-in-up">
                <div>
                  <h3 className="font-extrabold text-earth-dark text-xl">
                    Received Customer Orders
                  </h3>
                  <p className="text-xs text-earth font-semibold">Track tracking updates, payment verification, and delivery stages</p>
                </div>

                {dbLoading ? (
                  <div className="py-12 text-center text-earth text-sm animate-pulse">Loading orders...</div>
                ) : farmerOrders.length === 0 ? (
                    <div className="py-16 text-center text-earth font-medium flex flex-col items-center justify-center space-y-3">
                      <span className="text-4xl">🛒</span>
                      <p className="text-base text-earth-dark font-extrabold">No orders received yet.</p>
                      <p className="text-sm text-stone-400 font-medium">As soon as a buyer orders your crops, they will appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-100 text-xs font-bold uppercase tracking-wider text-earth">
                            <th className="pb-3">Crop Name</th>
                            <th className="pb-3">Buyer Detail</th>
                            <th className="pb-3">Qty (Kg)</th>
                            <th className="pb-3">Total Value</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm font-medium divide-y divide-stone-50">
                          {farmerOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-stone-50/50">
                              <td className="py-3.5 text-earth-dark font-semibold">{order.products?.name}</td>
                              <td className="py-3.5">
                                <div className="text-xs text-stone-500 font-bold">{order.users?.name}</div>
                                <div className="text-[10px] text-stone-400 font-semibold">{order.users?.email}</div>
                              </td>
                              <td className="py-3.5 text-stone-500">{order.quantity}</td>
                              <td className="py-3.5 text-earth-dark">₹{order.total_price?.toLocaleString()}</td>
                              <td className="py-3.5">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                  order.status === 'delivered' ? 'bg-primary-light text-primary-dark' :
                                  order.status === 'pending' ? 'bg-yellow-50 text-secondary' :
                                  order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right space-x-1.5">
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                    className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                )}
                                {order.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                    className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                  >
                                    Ship
                                  </button>
                                )}
                                {order.status === 'shipped' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                    className="bg-primary-light hover:bg-primary text-primary-dark hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                  >
                                    Deliver
                                  </button>
                                )}
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                    className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-2 py-1 rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            )}

            {/* PAST PURCHASES TAB (BOTH FARMER AND BUYER) */}
            {activeTab === 'purchases' && (
              <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6 animate-fade-in-up">
                <div>
                  <h3 className="font-extrabold text-earth-dark text-xl">
                    Past Purchases
                  </h3>
                  <p className="text-xs text-earth font-semibold">Track your placed orders, shipping status, and payment verification</p>
                </div>

                {dbLoading ? (
                  <div className="py-12 text-center text-earth text-sm animate-pulse">Loading orders...</div>
                ) : myOrders.length === 0 ? (
                    <div className="py-16 text-center text-earth font-medium flex flex-col items-center justify-center space-y-3">
                      <span className="text-4xl">🛒</span>
                      <p className="text-base text-earth-dark font-extrabold">You haven't purchased anything yet.</p>
                      <p className="text-sm text-stone-400 font-medium">Head over to the direct marketplace to buy organic farm crops.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-100 text-xs font-bold uppercase tracking-wider text-earth">
                            <th className="pb-3">Crop Product</th>
                            <th className="pb-3">Farmer Location</th>
                            <th className="pb-3">Qty (Kg)</th>
                            <th className="pb-3">Price paid</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Date Ordered</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm font-medium divide-y divide-stone-50">
                          {myOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-stone-50/50">
                              <td className="py-3.5 flex items-center space-x-3">
                                <img 
                                  src={order.products?.image_url || getDetectedImageUrl(order.products?.name, '')} 
                                  alt="" 
                                  onError={(e) => { e.target.onerror = null; e.target.src = getCategoryFallbackUrl(''); }}
                                  className="w-10 h-10 rounded-xl object-cover border border-stone-150 shadow-sm"
                                />
                                <div>
                                  <div className="text-earth-dark font-bold">{order.products?.name}</div>
                                  <div className="text-[10px] text-stone-400 font-bold">Seller: {order.products?.users?.name}</div>
                                </div>
                              </td>
                              <td className="py-3.5 text-stone-500 font-semibold">{order.products?.location}</td>
                              <td className="py-3.5 text-stone-500">{order.quantity}</td>
                              <td className="py-3.5 text-earth-dark font-bold">₹{order.total_price?.toLocaleString()}</td>
                              <td className="py-3.5">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                  order.status === 'delivered' ? 'bg-primary-light text-primary-dark' :
                                  order.status === 'pending' ? 'bg-yellow-50 text-secondary' :
                                  order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-xs text-stone-400 font-semibold">{new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FARMER ADD CROP LISTING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-stone-250 shadow-2xl p-6 sm:p-8 max-w-lg w-full relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-earth-dark text-2xl mb-2">List Fresh Crop Listing</h3>
            <p className="text-xs text-earth font-semibold mb-6">List your crops on the platform so buyers can view and purchase them directly.</p>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl mb-4 text-xs font-semibold flex items-center space-x-1.5">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wheat, Basmati Rice"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    onBlur={(e) => autoFetchWikipediaImage(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50"
                  >
                    <option>Cereals</option>
                    <option>Pulses</option>
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Oilseeds</option>
                    <option>Spices</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">Quantity Available (Kg) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">Price per Kg (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 40"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">Farming / Sale Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nashik, Maharashtra"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank for auto-detected crop image"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50 mb-3"
                />
                
                {/* Auto-detected image preview */}
                <div className="flex items-center space-x-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-200 border border-stone-300 relative flex items-center justify-center">
                    {isFetchingImage ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <img 
                        src={newProduct.image_url || getDetectedImageUrl(newProduct.name, newProduct.category)} 
                        alt="Crop preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-earth-dark">Profile Picture Preview</span>
                    <span className="text-[10px] font-semibold text-stone-500">
                      {isFetchingImage ? 'Searching web for image...' : (newProduct.image_url ? 'Using custom or web URL' : (newProduct.name ? 'Auto-detected from crop name' : 'Category default image'))}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-earth mb-1">Crop Description</label>
                <textarea
                  rows="3"
                  placeholder="Tell buyers about organic cultivation, freshness, seed variety..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50"
                />
              </div>

              <div className="flex space-x-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-earth-dark font-bold py-3 px-6 rounded-2xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-2xl text-xs transition cursor-pointer shadow-md flex items-center justify-center"
                >
                  {formLoading ? 'Submitting...' : 'Confirm Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
