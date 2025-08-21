'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the API call to your backend
    console.log(`Email submitted: ${email}`);
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Join Our Waitlist</h1>
        <p className="text-lg text-foreground/80 mt-4">
          Be the first to know about new products, special offers, and company news.
        </p>

        <div className="mt-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg font-semibold text-accent">
                Thank you for subscribing! We'll be in touch.
              </p>
              <Link href="/products" className="font-semibold text-primary hover:underline">
                Browse our products &rarr;
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full flex-grow p-3 bg-card border border-border rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
              />
              <button
                type="submit"
                className="bg-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {!submitted && (
          <div className="mt-12">
            <Link href="/products" className="font-semibold text-foreground/70 hover:text-primary transition-colors">
              or, browse our products &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}