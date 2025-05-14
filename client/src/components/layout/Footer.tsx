import React from 'react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-300 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} DroneOps. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-neutral-600 hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-neutral-600 hover:text-primary">Terms of Service</Link>
            <Link href="/support" className="text-sm text-neutral-600 hover:text-primary">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
