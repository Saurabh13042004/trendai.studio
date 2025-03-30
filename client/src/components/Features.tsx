
import React from 'react';
import { Sparkles, ImageIcon, Zap, Download } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <ImageIcon className="h-10 w-10 text-ghibli-blue" />,
      title: "Transform Any Image",
      description: "Upload your photos and watch them transform into beautiful Studio Ghibli inspired artwork."
    },
    {
      icon: <Zap className="h-10 w-10 text-ghibli-pink" />,
      title: "Instant Processing",
      description: "Our advanced AI transforms your images in seconds, no waiting around."
    },
    {
      icon: <Sparkles className="h-10 w-10 text-ghibli-yellow" />,
      title: "Magical Results",
      description: "Experience the whimsical charm of Miyazaki's world in your own photographs."
    },
    {
      icon: <Download className="h-10 w-10 text-ghibli-green" />,
      title: "Easy Download",
      description: "Save your Ghibli-styled creations with a single click and share them with friends."
    }
  ];

  return (
    <section id="features" className="py-16 bg-white bg-opacity-70">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          <span className="bg-clip-text text-transparent bg-ghibli-gradient">
            Magical Features
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="ghibli-card hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-white shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
