
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">Bitcoin DNA</h3>
            <p className="text-muted-foreground">
              Transform Bitcoin seed phrases into unique visual representations.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Features</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">DNA Visualizer</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Wallet Generator</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">NFT Gallery</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Matrix Simulation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">API</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">GitHub</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Twitter</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Discord</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Bitcoin DNA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
