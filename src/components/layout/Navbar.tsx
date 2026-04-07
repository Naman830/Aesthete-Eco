import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, User, Search, Menu, X, Heart,
  Package, LogOut, UserCircle, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user, signOut } = useAuth();
  const cartCount = getCartCount();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu / user menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isSearchOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close search with Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'glass-nav py-3' : 'bg-white/95 dark:bg-background/95 py-4 border-b border-transparent'
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4">

            {/* ── Logo ── */}
            <Link
              to="/"
              className="text-xl md:text-2xl font-semibold tracking-tight hover:opacity-75 transition-opacity shrink-0"
            >
              Aesthete
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                    location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                      ? 'text-foreground bg-secondary'
                      : 'text-foreground/65 hover:text-foreground hover:bg-secondary/70'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop Actions ── */}
            <div className="hidden md:flex items-center gap-1">
              {/* Search button */}
              <Button
                variant="ghost" size="icon"
                aria-label="Search products"
                onClick={() => setIsSearchOpen(true)}
                className="text-foreground/65 hover:text-foreground"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" aria-label="Wishlist" asChild
                className="text-foreground/65 hover:text-foreground">
                <Link to={user ? '/wishlist' : '/login'}>
                  <Heart className="h-[18px] w-[18px]" />
                </Link>
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" aria-label="Shopping cart"
                className="relative text-foreground/65 hover:text-foreground" asChild>
                <Link to="/cart">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium animate-scale-in">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* User: authenticated dropdown OR sign in link */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 px-2.5 text-foreground/65 hover:text-foreground"
                    onClick={() => setIsUserMenuOpen(v => !v)}
                  >
                    <UserCircle className="h-[18px] w-[18px]" />
                    <span className="text-sm font-medium max-w-[80px] truncate hidden lg:block">
                      {user.user_metadata?.full_name?.split(' ')[0] ?? 'Account'}
                    </span>
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isUserMenuOpen && 'rotate-180')} />
                  </Button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl shadow-lg overflow-hidden animate-scale-in py-1 z-50">
                      <div className="px-3 py-2.5 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                      <DropdownItem to="/account" icon={<User className="h-4 w-4" />} label="My Account" />
                      <DropdownItem to="/account?tab=orders" icon={<Package className="h-4 w-4" />} label="My Orders" />
                      <DropdownItem to="/wishlist" icon={<Heart className="h-4 w-4" />} label="Wishlist" />
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/8 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button variant="ghost" size="sm" asChild
                  className="text-foreground/65 hover:text-foreground text-sm font-medium px-3">
                  <Link to="/login">
                    <User className="h-[18px] w-[18px] mr-1.5" />
                    Sign In
                  </Link>
                </Button>
              )}
            </div>

            {/* ── Mobile Actions ── */}
            <div className="flex md:hidden items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}
                className="text-foreground/65 hover:text-foreground">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild
                className="relative text-foreground/65 hover:text-foreground">
                <Link to="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setIsMenuOpen(v => !v)}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isMenuOpen && (
          <div className="md:hidden glass-nav animate-fade-in border-t border-border/50">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                    location.pathname === to
                      ? 'bg-secondary text-foreground'
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  {label}
                </Link>
              ))}

              <div className="border-t border-border/50 my-2 pt-2 flex flex-col gap-0.5">
                {user ? (
                  <>
                    <Link to="/account" className="px-3 py-3 text-sm font-medium rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary/60 flex items-center gap-2.5">
                      <UserCircle className="h-4 w-4" /> My Account
                    </Link>
                    <Link to="/wishlist" className="px-3 py-3 text-sm font-medium rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary/60 flex items-center gap-2.5">
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-3 text-sm font-medium rounded-lg text-left text-destructive hover:bg-destructive/8 flex items-center gap-2.5"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="px-3 py-3 text-sm font-medium rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary/60 flex items-center gap-2.5">
                    <User className="h-4 w-4" /> Sign In / Create Account
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Search Overlay ── */}
      {isSearchOpen && (
        <div
          className="search-overlay animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setIsSearchOpen(false); }}
        >
          <div className="container mx-auto px-4 pt-24 max-w-2xl animate-fade-in-up">
            <div className="glass-card rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0 px-0 h-auto py-1 w-full"
                  />
                  <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                    Search
                  </Button>
                </form>
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}
                  className="shrink-0 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Esc</kbd> to close · <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Enter</kbd> to search
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Dropdown menu item helper
const DropdownItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-secondary/80 transition-colors"
  >
    <span className="text-muted-foreground">{icon}</span>
    {label}
  </Link>
);

export default Navbar;
