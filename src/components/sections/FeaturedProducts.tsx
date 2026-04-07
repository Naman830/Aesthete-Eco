import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { getFeaturedProducts } from '@/lib/data';
import { cn } from '@/lib/utils';

const FeaturedProducts = () => {
  const featuredProducts = getFeaturedProducts();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className={cn(
          'flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
              Handpicked for You
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Collection</h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-sm">
              Our most loved minimalist pieces, curated for modern living.
            </p>
          </div>
          <Button variant="ghost" className="group gap-1.5 shrink-0" asChild>
            <Link to="/products">
              View all products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                'transition-all duration-700',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              )}
              style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
            >
              <ProductCard product={product} featured />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
