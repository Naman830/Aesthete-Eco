import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { products } from '@/lib/data';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const WishlistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="space-y-3 text-center animate-pulse">
            <div className="h-8 w-48 bg-secondary rounded mx-auto" />
            <div className="h-4 w-32 bg-secondary rounded mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  // Join wishlist IDs with local product data
  const wishlistProducts = wishlist
    .map(item => ({
      item,
      product: products.find(p => p.id === item.product_id),
    }))
    .filter((e): e is { item: typeof wishlist[0]; product: NonNullable<typeof e.product> } =>
      e.product !== undefined
    );

  return (
    <>
      <Helmet>
        <title>Wishlist | Aesthete</title>
        <meta name="description" content="Your saved products on Aesthete." />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 md:px-6 py-10">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Heart className="h-7 w-7" />
                Wishlist
              </h1>
              <p className="text-muted-foreground mt-1">
                {wishlistProducts.length === 0
                  ? 'Your wishlist is empty'
                  : `${wishlistProducts.length} saved item${wishlistProducts.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {wishlistProducts.length === 0 ? (
              <div className="text-center py-24 animate-fade-in">
                <Heart className="h-14 w-14 mx-auto text-muted-foreground/30 mb-5" />
                <h2 className="text-xl font-semibold mb-2">Nothing saved yet</h2>
                <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                  Tap the heart icon on any product to save it here for later.
                </p>
                <Button asChild>
                  <Link to="/products" className="flex items-center gap-2">
                    Browse Products <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {wishlistProducts.map(({ item, product }, i) => (
                  <div
                    key={item.id}
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Image */}
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="product-image-wrapper rounded-xl overflow-hidden mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="img-cover"
                        />
                        {/* Remove overlay */}
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            await removeFromWishlist(product.id);
                          }}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 text-muted-foreground hover:text-red-500"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.category}
                      </span>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-sm font-medium leading-tight line-clamp-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <p className="font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1"
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WishlistPage;
