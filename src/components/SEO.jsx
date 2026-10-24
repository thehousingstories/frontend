
import { useEffect } from 'react';

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || window.location.origin
).replace(/\/$/, '');

export default function SEO({
  title,
  description,
  path = '/',
  image,
  structuredData,
  noindex = false,
}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | The Housing Stories`
      : 'Flats for Rent in Bangalore | The Housing Stories';

    const metaDescription = description ||
      'Discover rental properties, flats and houses in Bengaluru. Compare rent, amenities and locations with The Housing Stories.';

    document.title = fullTitle;

    const setMeta = (attribute, key, content) => {
      let element = document.head.querySelector(
        `meta[${attribute}="${key}"]`
      );

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    setMeta('name', 'description', metaDescription);
    setMeta('name', 'robots', noindex
      ? 'noindex, nofollow'
      : 'index, follow');

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', metaDescription);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', `${SITE_URL}${path}`);

    if (image) {
      setMeta('property', 'og:image', image);
    }

    let canonical = document.head.querySelector(
      'link[rel="canonical"]'
    );

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = `${SITE_URL}${path}`;

    let schema = document.getElementById('page-structured-data');

    if (schema) schema.remove();

    if (structuredData) {
      schema = document.createElement('script');
      schema.id = 'page-structured-data';
      schema.type = 'application/ld+json';
      schema.textContent = JSON.stringify(structuredData);
      document.head.appendChild(schema);
    }
  }, [title, description, path, image, structuredData, noindex]);

  return null;
}
