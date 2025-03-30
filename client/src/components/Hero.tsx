
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Navigation - Made sticky and positioned at the top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-ghibli-cream/90 backdrop-blur-sm shadow-sm py-4">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <div className="text-2xl font-bold text-ghibli-blue">Artify Ghibli</div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-ghibli-blue transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-ghibli-blue transition-colors">Pricing</a>
              <Link to="/sign-in" className="ghibli-btn-secondary py-2 px-4">Sign In</Link>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Add padding to compensate for the fixed navbar */}
      <div className="pt-16"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 dust-sprite" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-20 right-20 dust-sprite" style={{ animationDelay: '1.2s' }}></div>
      <div className="absolute bottom-10 left-1/4 dust-sprite" style={{ animationDelay: '2.1s' }}></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 relative inline-block animate-float">
            <span className="bg-clip-text text-transparent bg-ghibli-gradient">
              Artify Ghibli
            </span>
            <Sparkles className="inline-block ml-2 text-ghibli-yellow animate-pulse-soft" />
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-700 mb-8">
            Transform your photos into magical Studio Ghibli inspired artwork with just one click.
            Experience the whimsical charm of Miyazaki's world in your own images.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#pricing" className="ghibli-btn-primary">
              Get Started
            </a>
            <a href="#features" className="ghibli-btn-secondary">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
