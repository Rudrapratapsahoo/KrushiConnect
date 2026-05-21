'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { 
  Search, 
  MapPin, 
  Tag, 
  Filter, 
  SlidersHorizontal,
  ChevronRight,
  ShoppingBag,
  ArrowUpDown,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function MarketplacePage() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Static Category List
  const categories = ['All', 'Cereals', 'Pulses', 'Vegetables', 'Fruits', 'Oilseeds', 'Spices'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch all products with seller profiles
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users: user_id (
            name,
            email,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic Client-side (for responsive and instant updates)
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                            (product.description && product.description.toLowerCase().includes(search.toLowerCase())) ||
                            product.location.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || product.category === category;
      const matchesLocation = !location || product.location.toLowerCase().includes(location.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'qty-desc') {
        return b.quantity - a.quantity;
      }
      return 0;
    });

  return (
    <Layout>
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 py-16 px-4 sm:px-6 lg:px-8 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm border border-primary/20">
            🌾 DIRECT FARM-TO-BUYER MARKETPLACE
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Browse Fresh Organic Crops</h1>
          <p className="text-sm sm:text-base text-stone-300 font-medium max-w-xl mx-auto">
            Trade directly with local Indian farmers. Skip intermediary agent fees and source the freshest grain, spices, and produce.
          </p>
        </div>
      </div>

      {/* Filter and Content section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side Filter Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h3 className="font-extrabold text-earth-dark text-base flex items-center space-x-2">
                  <Filter className="h-4.5 w-4.5 text-primary" />
                  <span>Filters</span>
                </h3>
                <button 
                  onClick={() => { setSearch(''); setCategory('All'); setLocation(''); setSortBy('newest'); }}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-earth">Keyword Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search crop, farmer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 pl-9 pr-4 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50/50 font-medium"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-earth">Location (State/City)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 pl-9 pr-4 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50/50 font-medium"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-earth">Sort Listings By</label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 pl-9 pr-4 py-2.5 text-sm text-earth-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-stone-50/50 font-semibold appearance-none cursor-pointer"
                  >
                    <option value="newest">Newest Listings</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="qty-desc">Quantity: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Farmer Call to Action */}
            {profile?.role === 'farmer' && (
              <div className="bg-gradient-to-br from-primary-light/40 to-primary-light/10 p-6 rounded-3xl border border-primary/20 shadow-sm text-center space-y-4">
                <span className="text-2xl">👨‍🌾</span>
                <h4 className="font-extrabold text-primary-dark text-base">Selling crops?</h4>
                <p className="text-xs text-earth font-medium leading-relaxed">
                  List your organic grains, pulses or vegetables directly from your customized dashboard.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center space-x-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-2xl text-xs transition duration-200 cursor-pointer shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>List New Crop</span>
                </Link>
              </div>
            )}
          </div>

          {/* Main Grid Section */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Horizontal Categories Filter Bar */}
            <div className="overflow-x-auto scrollbar-none flex items-center space-x-2 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition cursor-pointer ${
                    category === cat
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-earth border border-stone-150 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {cat === 'All' ? '🌐 All Categories' : cat}
                </button>
              ))}
            </div>

            {/* Loading & Listing Status */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-20">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-stone-150 p-4 space-y-4 animate-pulse">
                    <div className="w-full h-44 bg-stone-200 rounded-2xl" />
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                    <div className="flex justify-between items-baseline pt-4">
                      <div className="h-4 bg-stone-200 rounded w-1/4" />
                      <div className="h-5 bg-stone-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-150 py-24 text-center space-y-4">
                <span className="text-5xl">🌾</span>
                <h3 className="font-extrabold text-earth-dark text-lg">No Crops Found</h3>
                <p className="text-sm text-stone-400 font-medium max-w-sm mx-auto">
                  We couldn't find any products matching your active filters. Try clearing filters or tweaking your keywords.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link 
                    href={`/marketplace/${product.id}`}
                    key={product.id}
                    className="group bg-white rounded-3xl border border-stone-150 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                  >
                    {/* Crop Image Wrapper */}
                    <div className="relative h-48 overflow-hidden bg-stone-100">
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-stone-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full text-earth-dark shadow-sm">
                        🏷️ {product.category}
                      </span>
                    </div>

                    {/* Crop Info */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-earth-dark text-lg leading-snug group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center text-xs text-stone-400 font-semibold space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-stone-400" />
                          <span>{product.location}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 font-medium line-clamp-2">
                        {product.description || 'No description provided by farmer. Organic cultivation.'}
                      </p>

                      <div className="flex justify-between items-baseline pt-3 border-t border-stone-50">
                        <span className="text-xs text-earth font-bold">{product.quantity} Kg available</span>
                        <span className="font-extrabold text-primary text-lg">₹{product.price}/Kg</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
