import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { products } from '@/lib/data';
import type { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { addToCart } = useCart();

  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const results: Product[] = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" — Search | Aesthete` : 'Search | Aesthete'}</title>
        <meta name="description" content={`Search results for ${query}`} />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 md:px-6 py-10">

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Search products…"
                  className="pl-9 pr-9"
                  autoFocus
                />
                {inputValue && (
                  <button type="button" onClick={() => setInputValue('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Results header */}
            {query && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold">
                  {results.length > 0
                    ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
                    : `No results for "${query}"`}
                </h1>
                {results.length === 0 && (
                  <p className="text-muted-foreground mt-2">
                    Try a different keyword or browse our{' '}
                    <Link to="/products" className="text-primary underline-offset-2 hover:underline">full catalogue</Link>.
                  </p>
                )}
              </div>
            )}

            {!query && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Start typing to search products</p>
              </div>
            )}

            {/* Results grid */}
            {results.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {results.map((product, i) => (
                  <div
                    key={product.id}
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="product-image-wrapper rounded-xl overflow-hidden mb-3 bg-secondary">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="img-cover"
                        />
                      </div>
                    </Link>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.category}
                      </span>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-sm font-medium leading-tight line-clamp-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
                        <Button
                          size="sm" variant="outline"
                          className="h-7 text-xs px-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => addToCart(product)}
                        >
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

export default SearchPage;
