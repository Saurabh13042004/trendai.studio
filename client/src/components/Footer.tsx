
import React from 'react';

const Footer = () => {
  return (
    <footer className="py-8 border-t border-ghibli-blue/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-ghibli-blue">Artify Ghibli</h2>
            <p className="text-sm text-gray-600">Transform your photos into Ghibli art</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-ghibli-blue transition-colors">About</a>
            <a href="#" className="text-gray-600 hover:text-ghibli-blue transition-colors">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-ghibli-blue transition-colors">Terms</a>
            <a href="#" className="text-gray-600 hover:text-ghibli-blue transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2023 Artify Ghibli. All rights reserved.</p>
          <p className="mt-2">This is a fun project and not affiliated with Studio Ghibli.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
