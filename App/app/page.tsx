"use client";

import dynamic from 'next/dynamic';

const ImageLibrary = dynamic(() => import('@/components/ImageLibrary'), {
  ssr: false
});

export default function Home() {
  return <ImageLibrary />;
}