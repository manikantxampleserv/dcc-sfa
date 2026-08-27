import { ShoppingCart } from 'lucide-react';
import type { Product } from 'mock/data/products';
import { mockProducts, productCategories } from 'mock/data/products';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from 'shared/Button';
import Input from 'shared/Input';
import Select from 'shared/Select';
import { useAuth } from 'context/AuthContext';

interface CartItem extends Product {
  cartQty: number;
}

const PlaceOrder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState<Record<number, CartItem>>({});

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleQtyChange = (product: Product, qty: number) => {
    if (qty < 0) return;
    if (qty === 0) {
      const newCart = { ...cart };
      delete newCart[product.id];
      setCart(newCart);
      return;
    }
    setCart({
      ...cart,
      [product.id]: { ...product, cartQty: qty },
    });
  };

  const totalAmount = Object.values(cart).reduce(
    (sum, item) => sum + item.unit_price * item.cartQty,
    0
  );
  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.cartQty,
    0
  );

  const handleSubmit = () => {
    if (totalItems === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (user?.role === 'sales_officer' && !selectedCustomer) {
      toast.error('Please select a customer to order for');
      return;
    }
    // Mock submit
    toast.success('Order submitted successfully for review!');
    navigate('/orders');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Place New Order</h1>
          <p className="text-sm text-gray-500">
            Browse catalog and add items to your cart
          </p>
        </div>

        {/* Customer Selection for Sales Officers */}
        {user?.role === 'sales_officer' && (
          <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm bg-blue-50/50">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Order On Behalf Of (Select Customer)</label>
            <Select
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
              className="w-full max-w-md"
            >
              <option value="">-- Select Customer --</option>
              <option value="1000234">Kilimanjaro Distributors (1000234)</option>
              <option value="1000543">Moshi Wholesalers (1000543)</option>
              <option value="1000888">Arusha Mega Store (1000888)</option>
            </Select>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-48"
          >
            {productCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="h-32 rounded-lg w-full flex items-center justify-center font-semibold text-lg opacity-80"
                style={{ backgroundColor: product.image_placeholder_color }}
              >
                {product.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {product.code} • {product.unit}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold text-blue-600">
                    TZS {product.unit_price.toLocaleString()}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    MOQ: {product.min_order_qty}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
                <button
                  disabled={!product.in_stock}
                  onClick={() =>
                    handleQtyChange(
                      product,
                      (cart[product.id]?.cartQty || 0) - 1
                    )
                  }
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center disabled:opacity-50"
                >
                  -
                </button>
                <Input
                  type="number"
                  disabled={!product.in_stock}
                  value={cart[product.id]?.cartQty || ''}
                  onChange={e =>
                    handleQtyChange(product, parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="flex-1 min-w-0"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '32px',
                      borderRadius: '4px',
                    },
                    '& input': {
                      textAlign: 'center',
                    },
                  }}
                />
                <button
                  disabled={!product.in_stock}
                  onClick={() => {
                    const currentQty = cart[product.id]?.cartQty || 0;
                    handleQtyChange(
                      product,
                      currentQty === 0 ? product.min_order_qty : currentQty + 1
                    );
                  }}
                  className="w-8 h-8 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center disabled:opacity-50"
                >
                  +
                </button>
              </div>
              {!product.in_stock && (
                <p className="text-xs text-red-500 text-center mt-1">
                  Out of stock
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-0 flex flex-col h-[calc(100vh-120px)]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Current Order
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
              {totalItems} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {Object.values(cart).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                <ShoppingCart className="w-10 h-10 opacity-20" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              Object.values(cart).map(item => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 pb-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-800">
                      {item.name}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item, 0)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      {item.cartQty} x {item.unit_price.toLocaleString()}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {(item.cartQty * item.unit_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3 rounded-b-xl">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Subtotal</span>
              <span className="font-semibold text-gray-800">
                TZS {totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>VAT (18%)</span>
              <span>TZS {(totalAmount * 0.18).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-blue-600 text-lg">
                TZS {(totalAmount * 1.18).toLocaleString()}
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={totalItems === 0}
              className="w-full mt-2 justify-center"
            >
              Submit Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
