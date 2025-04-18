/**
 * Utility functions for working with Unsplash images
 */

/**
 * Categories of events with corresponding Unsplash collections
 */
export const EVENT_CATEGORIES = {
  conference: 'conference,business,meeting',
  concert: 'concert,music,festival',
  workshop: 'workshop,learning,education',
  exhibition: 'exhibition,art,gallery',
  sports: 'sports,athletic,competition',
  networking: 'networking,business,people',
  party: 'party,celebration,event',
  wedding: 'wedding,celebration,ceremony',
  seminar: 'seminar,lecture,education',
  charity: 'charity,volunteer,community',
  festival: 'festival,celebration,outdoor',
  default: 'event,gathering,celebration'
};

/**
 * Get a random Unsplash image URL for a specific event category
 * @param category - The event category
 * @param width - Desired image width
 * @param height - Desired image height
 * @returns URL string for the Unsplash image
 */
export function getEventImageUrl(
  category: keyof typeof EVENT_CATEGORIES | string = 'default',
  width: number = 800,
  height: number = 600
): string {
  const searchTerm = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES] || EVENT_CATEGORIES.default;
  return `https://source.unsplash.com/random/${width}x${height}/?${searchTerm}`;
}

/**
 * Get a specific Unsplash image URL by ID
 * @param imageId - Unsplash image ID
 * @param width - Desired image width
 * @param height - Desired image height
 * @returns URL string for the Unsplash image
 */
export function getUnsplashImageById(
  imageId: string,
  width: number = 800,
  height: number = 600
): string {
  return `https://images.unsplash.com/photo-${imageId}?w=${width}&h=${height}&auto=format&fit=crop`;
}

/**
 * Get a set of curated event images
 * These are hand-picked Unsplash images that work well for events
 */
export const CURATED_EVENT_IMAGES = [
  // Conferences
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&auto=format',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=630&auto=format',
  
  // Concerts
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=630&auto=format',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=630&auto=format',
  
  // Workshops
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&auto=format',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&auto=format',
  
  // Exhibitions
  'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&h=630&auto=format',
  'https://images.unsplash.com/photo-1605429523419-d828acb941d9?w=1200&h=630&auto=format',
  
  // Networking
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=630&auto=format',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&h=630&auto=format',
  
  // Parties
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=630&auto=format',
  'https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=1200&h=630&auto=format',
  
  // Festivals
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?w=1200&h=630&auto=format',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=630&auto=format',
];

/**
 * Get a random image from the curated collection
 * @returns URL string for a curated Unsplash image
 */
export function getRandomCuratedImage(): string {
  const randomIndex = Math.floor(Math.random() * CURATED_EVENT_IMAGES.length);
  return CURATED_EVENT_IMAGES[randomIndex];
}
