import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer>
      <div className="px-16 py-8 border-t border-gray-300">
        <div className="flex flex-col flex-row justify-between gap-8 text-center text-left">
          <div className="w-1/2">
            <h3 className="font-semibold text-lg mb-4">Follow us</h3>
            <div className="flex gap-4 justify-center md:justify-start">
              <Link href="#" className="text-foreground/70 hover:text-primary"><Facebook /></Link>
              <Link href="#" className="text-foreground/70 hover:text-primary"><Instagram /></Link>
              <Link href="#" className="text-foreground/70 hover:text-primary"><Twitter /></Link>
              <Link href="#" className="text-foreground/70 hover:text-primary"><Youtube /></Link>
            </div>
          </div>
          <div className="w-1/3">
            <h3 className="font-semibold text-lg mb-4">Our mission</h3>
            <p className="text-foreground/80">
              Our mission is to enhance patient's quality of life and healthcare professional's quality of service. At Newmedica, we are always based in providing the most advanced and safe technology medical and wellness products, specializing in interventional patients hygiene, infection control, pain management and wellness.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-300">
        <div className="mx-auto px-4 py-4 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Newmedica Sdn. Bhd.</p>
          <div className="mt-2">
            <Link href="#" className="hover:underline">Terms of Service</Link>
            <span className="mx-2">|</span>
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <Link href="#" className="hover:underline">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
