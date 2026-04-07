import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [imgLoaded, setImgLoaded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div className="group relative flex flex-col">
      {/* ── Image ── */}
      <Link to={`/products/${product.id}`} className="block">
        <div
          className={cn(
            'product-image-wrapper rounded-2xl overflow-hidden bg-secondary',
            featured ? '[aspect-ratio:3/4]' : '[aspect-ratio:3/4]'
          )}
        >
          {/* Skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={cn(
              'img-cover transition-all duration-500',
              imgLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                Featured
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                Sold Out
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Wishlist button */}
          {user && (
            <button
              onClick={handleWishlist}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm',
                inWishlist
                  ? 'bg-red-500 text-white opacity-100'
                  : 'bg-white/90 dark:bg-black/60 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} />
            </button>
          )}

          {/* Quick add overlay */}
          <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full glass backdrop-blur-md bg-white/85 dark:bg-black/70 text-foreground hover:bg-white dark:hover:bg-black/90 border-white/40 shadow-lg h-9 text-sm font-medium"
              variant="outline"
            >
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
            </Button>
          </div>
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="pt-3 px-0.5 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.id}`} className="flex-1 min-w-0">
            <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary/80 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.round(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">₹{product.price.toLocaleString('en-IN')}</p>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{product.category}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
