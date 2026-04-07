import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?q=90&w=1920&auto=format&fit=crop';

const Hero = () => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start text animations after a short delay
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: '92vh' }}>
      {/* ── Background image ── */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Minimalist interior"
          onLoad={() => setImgLoaded(true)}
          className={cn(
            'w-full h-full object-cover object-center transition-opacity duration-1000',
            imgLoaded ? 'opacity-55' : 'opacity-0'
          )}
        />
        {/* Layered gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative container mx-auto px-4 md:px-6 flex flex-col justify-center h-full"
        style={{ minHeight: '92vh' }}>
        <div className="max-w-2xl space-y-6">

          {/* Pill badge */}
          <div className={cn(
            'transition-all duration-700 delay-100',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          )}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/8 backdrop-blur-md text-white/80 text-xs font-medium tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              New Collection 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className={cn(
            'text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white transition-all duration-700 delay-200',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            Own Less.<br />
            <span className="text-white/60">Live More.</span>
          </h1>

          {/* Sub */}
          <p className={cn(
            'text-lg md:text-xl text-white/65 max-w-lg leading-relaxed transition-all duration-700 delay-300',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            Carefully crafted essentials that blend minimal design with everyday utility — built to last, not just impress.
          </p>

          {/* CTA Buttons */}
          <div className={cn(
            'flex flex-wrap gap-3 transition-all duration-700 delay-[400ms]',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-semibold px-7 h-12 rounded-full shadow-xl shadow-black/30 gap-2 hover-lift"
              asChild
            >
              <Link to="/products">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/25 text-white hover:bg-white/10 h-12 px-6 rounded-full gap-2 backdrop-blur-sm"
              asChild
            >
              <Link to="/about">
                <Play className="h-3.5 w-3.5 fill-current" />
                Our Story
              </Link>
            </Button>
          </div>

          {/* Trust stats */}
          <div className={cn(
            'flex flex-wrap gap-6 pt-4 transition-all duration-700 delay-500',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            {[
              { stat: '10k+', label: 'Happy Customers' },
              { stat: '500+', label: 'Curated Products' },
              { stat: '4.9★', label: 'Average Rating' },
            ].map(({ stat, label }) => (
              <div key={label} className="text-white/70">
                <p className="text-xl font-bold text-white">{stat}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce opacity-50">
        <div className="w-[1px] h-8 bg-white/50" />
        <span className="text-white/50 text-[10px] uppercase tracking-[0.2em]">Scroll</span>
      </div>
    </section>
  );
};

export default Hero;
