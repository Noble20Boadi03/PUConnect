import { EXPLORE_CATEGORIES_MOCK } from '../constants/exploreMock';
import { EXPLORE_CATEGORY_SERVICES_MOCK } from '../constants/exploreCategoryServicesMock';
import type { ExploreCategory, ExploreCategoryService } from '../types/explore';

// Helper function to map post category tags to explore category
export function getExploreCategoryFromPostTags(
  categoryTags: string[]
): ExploreCategory | undefined {
  // First let's define keyword mappings to categories
  const keywordMappings: Record<string, string[]> = {
    tutoring: [
      'tutoring', 'mathematics', 'stem', 'chemistry', 'physics', 'calculus', 
      'algebra', 'biology', 'exam prep', 'study group', 'finals', 'midterms', 
      'linear algebra', 'python', 'programming', 'cs', 'computer science', 
      'bootcamp', 'homework help'
    ],
    tech: [
      'web development', 'react', 'next.js', 'node.js', 'firebase', 
      'mobile development', 'react native', 'mvp', 'expo', 'app', 
      'debugging', 'github', 'portfolio', 'deployment'
    ],
    design: [
      'graphic design', 'ui', 'ux', 'photography', 'branding', 'posters', 
      'logo', 'figma', 'flyers', 'social media', 'content creation', 
      'video editing', 'premiere', 'campus events', 'student orgs'
    ],
    career: [
      'resume', 'linkedin', 'interview prep', 'personal branding', 'writing', 
      'editing', 'personal statements', 'career fair', 'job search', 
      'career coaching', 'cv', 'internships'
    ],
    campus: [
      'errands', 'delivery', 'laundry', 'moving', 'campus', 'dorm', 
      'grocery shopping', 'pickup', 'pets', 'dog walking', 'wash-and-fold',
      'lift','moving'
    ],
  };

  // Convert all tags to lowercase for comparison
  const lowerTags = categoryTags.map(tag => tag.toLowerCase());
  
  // Check each category in order and return the first match
  for (const [categoryId, keywords] of Object.entries(keywordMappings)) {
    if (keywords.some(keyword => lowerTags.some(tag => tag.includes(keyword)))) {
      return EXPLORE_CATEGORIES_MOCK.find(cat => cat.id === categoryId);
    }
  }
  
  // Fallback: return tutoring if no match found
  return EXPLORE_CATEGORIES_MOCK[0];
}

// Helper function to find explore services that match a post's tags
export function getExploreServicesForPost(
  categoryTags: string[]
): ExploreCategoryService[] {
  const category = getExploreCategoryFromPostTags(categoryTags);
  
  if (!category) return [];
  
  const services = EXPLORE_CATEGORY_SERVICES_MOCK[category.id];
  
  // Convert all post category tags to lowercase
  const lowerTags = categoryTags.map(tag => tag.toLowerCase());
  
  // Find services where some filter tag matches some post tag
  const matchingServices = services.filter(service => 
    service.filterTags.some(serviceTag => 
      lowerTags.some(postTag => 
        postTag.includes(serviceTag.toLowerCase()) || 
        serviceTag.toLowerCase().includes(postTag)
      )
    )
  );
  
  // If no matching services, return all services in the category
  return matchingServices.length > 0 ? matchingServices : services;
}
