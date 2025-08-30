import Link from 'next/link';
import React from 'react';

const Banner = () => {
  return (
    <section className="relative w-full my-8 h-180">
      <div className="absolute inset-0 flex">
        <div 
          className="w-1/2 h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/banner1.jpg')" }}
        ></div>
        <div 
          className="w-1/2 h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/banner2.png')" }}
        ></div>
      </div>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
        <h2 className="text-4xl md:text-5xl font-bold">Expertly Selected Clinical Solutions</h2>
        <p className="text-lg mt-4 max-w-2xl opacity-90">
          We meticulously research and source best-in-class medical products, 
          focusing on safe, natural, and effective formulations, so you can provide your 
          patients with the highest standard of care.
        </p>
        <Link href="/products">
          <button className="mt-8 bg-white text-black py-3 px-8 rounded-md hover:bg-gray-200 transition-colors">
            Shop Now
          </button>
        </Link>
       
      </div>
    </section>
  );
};

export default Banner;
