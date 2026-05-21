import React from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  schemas?: object[];
}

export default function SEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000',
  schemas = []
}: SEOProps) {
  React.useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to find or create a meta tag
    const setMetaTag = (attrs: Record<string, string>, content: string) => {
      let query = 'meta';
      Object.entries(attrs).forEach(([key, value]) => {
        query += `[${key}="${value}"]`;
      });
      let elem = document.querySelector(query) as HTMLMetaElement;
      if (!elem) {
        elem = document.createElement('meta');
        Object.entries(attrs).forEach(([key, value]) => {
          elem.setAttribute(key, value);
        });
        document.head.appendChild(elem);
      }
      elem.setAttribute('content', content);
    };

    // 2. Meta Description
    setMetaTag({ name: 'description' }, description);

    // 3. Open Graph
    setMetaTag({ property: 'og:title' }, title);
    setMetaTag({ property: 'og:description' }, description);
    setMetaTag({ property: 'og:image' }, ogImage);
    setMetaTag({ property: 'og:type' }, ogType);
    setMetaTag({ property: 'og:url' }, window.location.href);

    // 4. Twitter Cards
    setMetaTag({ name: 'twitter:card' }, 'summary_large_image');
    setMetaTag({ name: 'twitter:title' }, title);
    setMetaTag({ name: 'twitter:description' }, description);
    setMetaTag({ name: 'twitter:image' }, ogImage);

    // 5. Canonical Link
    const currentCanonicalUrl = canonical || window.location.href;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentCanonicalUrl);

    // 6. JSON-LD Schemas markup
    // Remove if any exists
    const existingScript = document.getElementById('nexus-jsonld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    if (schemas && schemas.length > 0) {
      const script = document.createElement('script');
      script.id = 'nexus-jsonld-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schemas);
      document.head.appendChild(script);
    }

    return () => {
      // Clean up dynamic schema element when switching routes
      const scriptToRemove = document.getElementById('nexus-jsonld-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, canonical, ogType, ogImage, schemas]);

  return null; // Side-effect only component
}
