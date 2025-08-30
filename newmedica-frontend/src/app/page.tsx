import { Suspense } from 'react';
import HomePageContent from './_components/HomePageContent';
import Banner from './_components/Banner';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
        <HomePageContent />
      </Suspense>
      <Banner />
    </>
  );
}