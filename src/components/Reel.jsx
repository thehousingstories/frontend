import React from 'react';
import { ArrowUpRight, Instagram } from 'lucide-react';

export default function Reel({ url }) {
  if (!url) return null;
  const shortcode = url.match(/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)?.[1];
  return (
    <div className="reel-wrap">
      {shortcode && <iframe title="Property Instagram Reel" src={`https://www.instagram.com/reel/${shortcode}/embed`} loading="lazy" allowFullScreen />}
      <a href={url} target="_blank" rel="noreferrer"><Instagram size={16} /> Watch the property Reel on Instagram <ArrowUpRight size={15} /></a>
    </div>
  );
}
