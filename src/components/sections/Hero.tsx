
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full bg-black">
        <div
          className={cn(
            "h-full w-full bg-cover bg-center transition-opacity duration-1000 bg-black",
            isLoaded ? "opacity-60" : "opacity-0"
          )}
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?q=80&w=1374&auto=format&fit=crop')"
          }}
          onLoad={() => setIsLoaded(true)}
        >
          <img
            src="https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?q=80&w=1374&auto=format&fit=crop"
            alt="Minimalist interior"
            className="hidden"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="container relative mx-auto px-4 md:px-6 py-24 sm:py-32 md:py-40 min-h-[80vh] flex flex-col justify-center items-start">
        <div className="max-w-2xl">
          <div
            className={cn(
              "transition-all duration-700 delay-100 transform",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
        <span className="inline-block px-4 py-1.5 mb-2  text-[11px] tracking-widest uppercase font-medium backdrop-blur-md rounded-full text-white/90 border border-white/10 pointer-events-none">
              Designed for Modern Living
            </span>
          </div>

         <h1
            className={cn(
              "text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-white mb-6 transition-all duration-700 delay-200 transform",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Own Less. <br />
            Experience More.
          </h1>

          
          <p
            className={cn(
              "text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed transition-all duration-700 delay-300 transform",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Aesthelte brings you carefully crafted essentials that blend minimal design with everyday utility — built to last, not just impress.
          </p>
          
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-400 transform",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <Button size="lg" asChild className="hover-lift">
              <Link to="/products">
                   Explore Collection
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-black hover:bg-white/10 hover-lift" asChild>
              <Link to="/about">
                Our Story
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
