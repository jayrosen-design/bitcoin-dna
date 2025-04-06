
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';

const Navbar: React.FC = () => {
  return (
    <nav className="border-b py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">Bitcoin DNA</Link>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/" className="hover:text-primary transition-colors">Visualizer</Link>
            <Link to="/" className="hover:text-primary transition-colors">Gallery</Link>
            <Link to="/" className="hover:text-primary transition-colors">About</Link>
          </div>
          
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button size="sm">Connect</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
