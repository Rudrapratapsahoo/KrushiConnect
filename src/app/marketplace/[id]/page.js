'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { getDetectedImageUrl, getCategoryFallbackUrl } from '@/utils/cropImages';
import { 
  ArrowLeft, 
  MapPin, 
  ShoppingBag, 
  User, 
  Calendar,
  CheckCircle2,
  Mail,
  AlertTriangle,
  Loader2,
  IndianRupee,
  Minus,
  Plus
} from 'lucide-react';

export default function ProductDetailPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const productId = unwrappedParams.id;
  
  const { user, profile } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users: user_id (
            name,
            email,
            location,
            avatar_url
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => {
    if (orderQuantity < product.quantity) {
      setOrderQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (orderQuantity > 1) {
      setOrderQuantity(prev => prev - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      // Store current page to redirect back after login
      router.push('/login?redirect=' + encodeURIComponent(`/marketplace/${productId}`));
      return;
    }

    if (profile?.role === 'farmer' && product.user_id === user.id) {
      setOrderError('You cannot purchase your own crop listing.');
      return;
    }

    if (orderQuantity > product.quantity) {
      setOrderError('Requested quantity exceeds available stock.');
      return;
    }

    try {
      setPlacingOrder(true);
      setOrderError('');
      
      const totalPrice = parseFloat(product.price) * orderQuantity;

      // 1. Create order entry in supabase
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert([
          {
            buyer_id: user.id,
            product_id: product.id,
            quantity: orderQuantity,
            total_price: totalPrice,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Decrement available stock in products table
      const newStock = product.quantity - orderQuantity;
      const { error: stockErr } = await supabase
        .from('products')
        .update({ quantity: newStock })
        .eq('id', product.id);

      if (stockErr) throw stockErr;

      setOrderSuccess(true);
      // Refresh local state immediately
      setProduct(prev => ({ ...prev, quantity: newStock }));
      // Invalidate Next.js cache so the marketplace list and other views get the updated quantity
      router.refresh();
      // Fetch fresh data from DB (might be cached by Next.js if router.refresh is not enough, but state is already updated)
      await fetchProductDetails();
    } catch (err) {
      setOrderError(err.message || 'An error occurred while creating your order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-earth text-sm font-semibold">Loading crop details...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
          <span className="text-6xl">🌾</span>
          <h2 className="text-2xl font-extrabold text-earth-dark">Crop Listing Not Found</h2>
          <p className="text-earth text-sm font-medium">
            This crop product listing may have been sold out, deleted, or expired.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-bold shadow-md text-sm"
          >
            Back to Marketplace
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back Link */}
        <Link 
          href="/marketplace" 
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-earth hover:text-primary mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>

        {orderSuccess ? (
          /* Secure Order Success State */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-150 p-8 text-center space-y-6 shadow-xl animate-fade-in-up">
            <div className="w-16 h-16 bg-primary-light/60 text-primary rounded-full flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-earth-dark">Order Successfully Initiated!</h2>
            <p className="text-sm text-stone-500 font-medium max-w-md mx-auto leading-relaxed">
              Your order for <strong className="text-earth-dark">{orderQuantity} Kg</strong> of <strong className="text-earth-dark">{product.name}</strong> has been successfully placed. The farmer has been notified and will verify the shipment details shortly.
            </p>
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 max-w-sm mx-auto text-left space-y-2">
              <div className="flex justify-between text-xs text-earth font-bold">
                <span>Crop Product:</span>
                <span className="text-earth-dark">{product.name}</span>
              </div>
              <div className="flex justify-between text-xs text-earth font-bold">
                <span>Quantity Ordered:</span>
                <span className="text-earth-dark">{orderQuantity} Kg</span>
              </div>
              <div className="flex justify-between text-xs text-earth font-bold">
                <span>Total Amount:</span>
                <span className="text-primary font-extrabold">₹{(product.price * orderQuantity).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-earth font-bold">
                <span>Farming Location:</span>
                <span className="text-earth-dark">{product.location}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-7 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition text-xs"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/marketplace"
                className="w-full sm:w-auto bg-stone-100 hover:bg-stone-250 text-earth-dark px-7 py-3 rounded-full font-bold transition text-xs"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Crop Product Detail View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Product Images and Description (Left) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl overflow-hidden border border-stone-150 shadow-sm relative h-96 sm:h-[480px]">
                <img 
                  src={product.image_url || getDetectedImageUrl(product.name, product.category)} 
                  alt={product.name} 
                  onError={(e) => { e.target.onerror = null; e.target.src = getCategoryFallbackUrl(product.category); }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-stone-150 text-xs font-extrabold px-3 py-1.5 rounded-full text-earth-dark shadow-sm">
                  🌾 {product.category}
                </span>
              </div>

              {/* Crop Description */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-150 shadow-sm space-y-4">
                <h3 className="font-extrabold text-earth-dark text-xl">Crop Details & Harvesting Description</h3>
                <p className="text-sm text-earth leading-relaxed font-medium">
                  {product.description || 'No detailed farming description provided. Our system ensures all local listings follow clean biological controls, traditional sowing patterns, and verified regional storage protocols.'}
                </p>
              </div>
            </div>

            {/* Seller Details and Order Card (Right) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Primary Pricing and Order Panel */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-150 shadow-sm space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-earth-dark leading-tight">{product.name}</h1>
                  <div className="flex items-center text-xs text-stone-400 font-bold space-x-1 mt-1.5">
                    <MapPin className="h-4 w-4 text-stone-400" />
                    <span>Harvested in: {product.location}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-earth font-bold uppercase tracking-wider block">Price per Kilogram</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center mt-1">
                      <IndianRupee className="h-6 w-6 mr-0.5" />
                      {product.price}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-earth font-bold uppercase tracking-wider block">Stock Available</span>
                    <span className={`text-base font-extrabold mt-1 block ${product.quantity > 0 ? 'text-primary-dark' : 'text-red-600'}`}>
                      {product.quantity > 0 ? `${product.quantity} Kg` : 'Sold Out'}
                    </span>
                  </div>
                </div>

                {product.quantity > 0 ? (
                  <>
                    {/* Quantity Picker */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-earth">Select Quantity (Kg)</label>
                      <div className="flex items-center justify-between border border-stone-200 rounded-2xl p-2 bg-stone-50/50">
                        <button
                          onClick={handleDecrement}
                          disabled={orderQuantity <= 1}
                          className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 flex items-center justify-center text-earth-dark transition border border-stone-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-extrabold text-base text-earth-dark select-none">{orderQuantity} Kg</span>
                        <button
                          onClick={handleIncrement}
                          disabled={orderQuantity >= product.quantity}
                          className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 flex items-center justify-center text-earth-dark transition border border-stone-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Total Calculator */}
                    <div className="border-t border-stone-100 pt-4 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-earth-dark">Total Order Value:</span>
                      <span className="text-2xl font-extrabold text-primary flex items-center">
                        <IndianRupee className="h-5.5 w-5.5 mr-0.5" />
                        {(product.price * orderQuantity).toLocaleString()}
                      </span>
                    </div>

                    {orderError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{orderError}</span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-55"
                    >
                      {placingOrder ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Securing Order...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-5 w-5" />
                          <span>{user ? 'Place Purchase Order' : 'Sign In to Purchase'}</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl text-center text-earth text-sm font-semibold">
                    🚫 Crop listed is fully sold out. Keep checking for fresh harvests!
                  </div>
                )}
              </div>

              {/* Farmer Info Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-150 shadow-sm space-y-4">
                <h4 className="font-extrabold text-earth-dark text-sm uppercase tracking-wider">Farmer Details</h4>
                <div className="flex items-center space-x-4">
                  <img 
                    src={product.users?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${product.user_id}`} 
                    alt="Seller" 
                    className="w-14 h-14 rounded-2xl object-cover border border-primary-light"
                  />
                  <div>
                    <h5 className="font-extrabold text-earth-dark text-base">{product.users?.name || 'Local Farmer'}</h5>
                    <div className="flex items-center text-xs text-stone-400 font-bold space-x-1.5 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{product.users?.location || 'India'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-earth font-bold">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <span>{product.users?.email || 'farmer@krushiconnect.com'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-earth font-bold">
                    <Calendar className="h-4 w-4 text-stone-400" />
                    <span>Listing Date: {new Date(product.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </Layout>
  );
}
