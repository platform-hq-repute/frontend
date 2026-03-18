import type { Location, Review, User } from './store';

export const mockUser: User = {
  id: '1',
  email: 'sarah@coffeehouse.com',
  name: 'Sarah Mitchell',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
};

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'The Coffee House - Downtown',
    address: '123 Main Street, San Francisco, CA 94102',
    googlePlaceId: 'ChIJ123456789',
    averageRating: 4.6,
    totalReviews: 234,
    pendingResponses: 8,
  },
  {
    id: '2',
    name: 'The Coffee House - Marina',
    address: '456 Marina Blvd, San Francisco, CA 94123',
    googlePlaceId: 'ChIJ987654321',
    averageRating: 4.8,
    totalReviews: 156,
    pendingResponses: 3,
  },
  {
    id: '3',
    name: 'The Coffee House - Mission',
    address: '789 Valencia St, San Francisco, CA 94110',
    googlePlaceId: 'ChIJ456789123',
    averageRating: 4.4,
    totalReviews: 89,
    pendingResponses: 5,
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    locationId: '1',
    locationName: 'Downtown',
    platform: 'google',
    authorName: 'Michael Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    content: 'Absolutely love this place! The oat milk latte is perfection and the staff is always so friendly. My go-to spot for morning coffee before work. The atmosphere is cozy and they have plenty of outlets for working.',
    createdAt: '2024-01-15T09:30:00Z',
    status: 'pending',
  },
  {
    id: '2',
    locationId: '1',
    locationName: 'Downtown',
    platform: 'google',
    authorName: 'Emily Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 4,
    content: 'Great coffee and pastries. The cold brew is excellent. Only minor complaint is that it can get pretty crowded during peak hours, but that speaks to how good this place is!',
    createdAt: '2024-01-14T14:15:00Z',
    status: 'ai_generated',
    aiResponse: 'Thank you so much for your kind words, Emily! We\'re thrilled you enjoy our cold brew and pastries. We appreciate your patience during busy times - your support means the world to us. Hope to see you again soon!',
  },
  {
    id: '3',
    locationId: '1',
    locationName: 'Downtown',
    platform: 'google',
    authorName: 'David Thompson',
    rating: 2,
    content: 'Disappointed with my last visit. Waited 20 minutes for a simple americano and it was lukewarm when I got it. Staff seemed overwhelmed and disorganized. Used to be my favorite spot but quality has gone downhill.',
    createdAt: '2024-01-13T11:45:00Z',
    status: 'pending',
  },
  {
    id: '4',
    locationId: '2',
    locationName: 'Marina',
    platform: 'google',
    authorName: 'Jessica Park',
    authorAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop',
    rating: 5,
    content: 'The Marina location is stunning! Love the outdoor seating area with views of the bay. The avocado toast is a must-try. Perfect brunch spot.',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'responded',
    aiResponse: 'Thank you Jessica! We\'re so happy you enjoyed the view and our avocado toast. Our Marina team takes pride in creating a beautiful experience. See you at your next brunch!',
    publishedResponse: 'Thank you Jessica! We\'re so happy you enjoyed the view and our avocado toast. Our Marina team takes pride in creating a beautiful experience. See you at your next brunch!',
    respondedAt: '2024-01-15T11:30:00Z',
  },
  {
    id: '5',
    locationId: '2',
    locationName: 'Marina',
    platform: 'google',
    authorName: 'Robert Kim',
    rating: 3,
    content: 'Coffee is good but pricey. $7 for a latte feels steep even for SF. The quality is there but I wish they had more affordable options.',
    createdAt: '2024-01-12T16:20:00Z',
    status: 'pending',
  },
  {
    id: '6',
    locationId: '3',
    locationName: 'Mission',
    platform: 'google',
    authorName: 'Anna Williams',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    content: 'Best espresso in the Mission district! The baristas really know their craft. Love supporting a local business that sources ethically.',
    createdAt: '2024-01-14T08:30:00Z',
    status: 'ai_generated',
    aiResponse: 'Anna, thank you for recognizing our commitment to quality and ethical sourcing! Our Mission team is passionate about their craft. Your support of local businesses like ours means everything. Cheers!',
  },
  {
    id: '7',
    locationId: '3',
    locationName: 'Mission',
    platform: 'google',
    authorName: 'Marcus Johnson',
    rating: 4,
    content: 'Solid neighborhood coffee shop. Good wifi, friendly staff, and the breakfast burritos are surprisingly good. A reliable spot.',
    createdAt: '2024-01-11T09:15:00Z',
    status: 'pending',
  },
  {
    id: '8',
    locationId: '1',
    locationName: 'Downtown',
    platform: 'google',
    authorName: 'Lisa Chang',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    rating: 5,
    content: 'I\'ve tried coffee shops all over the city and this is hands down the best. The single origin pour-over is exceptional. Staff is knowledgeable and passionate.',
    createdAt: '2024-01-10T15:45:00Z',
    status: 'responded',
    publishedResponse: 'Lisa, thank you for such high praise! Our team is passionate about sourcing and brewing the finest single origin beans. We love sharing our coffee knowledge with fellow enthusiasts like you!',
    respondedAt: '2024-01-10T17:00:00Z',
  },
];

// AI Response templates based on rating and tone
export const generateAIResponse = (review: Review, tone: 'professional' | 'friendly' | 'casual'): string => {
  const templates = {
    5: {
      professional: `Thank you for your wonderful review, ${review.authorName}. We're delighted to hear about your positive experience. Your feedback motivates our team to maintain our high standards. We look forward to serving you again.`,
      friendly: `Wow, thank you so much ${review.authorName}! 😊 We're thrilled you had such a great experience with us. It means the world to our team! Can't wait to see you again soon!`,
      casual: `Thanks ${review.authorName}! Really appreciate you taking the time to share this. Glad you enjoyed it - hope to see you back soon!`,
    },
    4: {
      professional: `Thank you for your review, ${review.authorName}. We appreciate your positive feedback and value your suggestions for improvement. Our team is committed to delivering excellent experiences.`,
      friendly: `Thanks so much for the great review, ${review.authorName}! We're happy you enjoyed your visit. If there's anything we can do to make it a 5-star experience next time, let us know!`,
      casual: `Hey ${review.authorName}, thanks for the feedback! Glad you had a good time. Always looking to improve - hope to see you again!`,
    },
    3: {
      professional: `Thank you for your honest feedback, ${review.authorName}. We appreciate you taking the time to share your experience. We're committed to addressing your concerns and improving our service.`,
      friendly: `Hi ${review.authorName}, thanks for your feedback! We're sorry your experience wasn't perfect. We'd love the chance to make it right - please reach out to us directly.`,
      casual: `Thanks for the feedback ${review.authorName}. Sorry it wasn't a great experience - we'll work on it. Give us another shot sometime!`,
    },
    2: {
      professional: `${review.authorName}, thank you for bringing this to our attention. We sincerely apologize for falling short of your expectations. We take your feedback seriously and are implementing improvements. Please contact us directly so we can address your concerns.`,
      friendly: `Hi ${review.authorName}, we're really sorry to hear about your experience. This isn't the standard we strive for. We'd love to make it up to you - please reach out to us so we can make things right.`,
      casual: `Sorry about that ${review.authorName}. That's not the experience we want anyone to have. Would love a chance to make it right if you're willing.`,
    },
    1: {
      professional: `${review.authorName}, we sincerely apologize for your disappointing experience. This does not reflect our standards and we take full responsibility. Please contact us directly at your earliest convenience so we can resolve this matter and regain your trust.`,
      friendly: `${review.authorName}, we're so sorry. This is not okay and we want to make it right. Please reach out to us directly - we'd really appreciate the chance to turn this around.`,
      casual: `Really sorry ${review.authorName}. We dropped the ball here. Please get in touch with us - we want to fix this.`,
    },
  };

  const ratingKey = Math.max(1, Math.min(5, review.rating)) as 1 | 2 | 3 | 4 | 5;
  return templates[ratingKey][tone];
};
