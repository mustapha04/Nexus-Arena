import { Game } from '../types';

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://nexusarena.com/#organization',
  'name': 'Nexus Arena',
  'url': 'https://nexusarena.com',
  'logo': {
    '@type': 'ImageObject',
    'url': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
    'width': '600',
    'height': '338'
  },
  'sameAs': [
    'https://twitter.com/nexus_arena',
    'https://twitch.tv/nexus_arena',
    'https://youtube.com/nexus_arena'
  ]
});

export const getWebsiteSchema = (query?: string) => {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://nexusarena.com/#website',
    'name': 'Nexus Arena',
    'url': 'https://nexusarena.com',
    'publisher': {
      '@id': 'https://nexusarena.com/#organization'
    }
  };

  if (query !== undefined) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      'target': `https://nexusarena.com/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    };
  }

  return schema;
};

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': item.url
  }))
});

export const getVideoGameSchema = (game: Game, ratingValue: number = 4.8, ratingCount: number = 120) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  'name': game.title,
  'description': game.short_description,
  'image': game.thumbnail,
  'genre': game.genre,
  'gamePlatform': game.platform,
  'publisher': game.publisher,
  'developer': game.developer,
  'releaseDate': game.release_date,
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': ratingValue,
    'bestRating': '5',
    'worstRating': '1',
    'ratingCount': ratingCount
  }
});

export const getGameFaqSchema = (game: Game) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': `Is ${game.title} multiplayer?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `${game.title} features multiplayer gameplay. It's a premium free-to-play ${game.genre} title.`
      }
    },
    {
      '@type': 'Question',
      'name': `What platforms support ${game.title}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `${game.title} is fully supported on ${game.platform}.`
      }
    },
    {
      '@type': 'Question',
      'name': `Is ${game.title} worth playing?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `Yes, ${game.title} is highly recommended by players, featuring state-of-the-art ${game.genre} elements. It has a high rating and offers incredible free-to-play content.`
      }
    }
  ]
});
