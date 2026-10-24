import React from 'react';
import { ArrowUpRight, Instagram } from 'lucide-react';

// Shows only a link to the Instagram reel (no video on our website)
export default function Reel({ url }) {
  if (!url) return null;
  return (
    <a className="insta-link" href={url} target="_blank" rel="noreferrer noopener">
      <Instagram size={19} /> Watch on Instagram <ArrowUpRight size={16} />
    </a>
  );
}