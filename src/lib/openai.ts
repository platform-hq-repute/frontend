import type { Review } from './store';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;

export type ResponseTone = 'professional' | 'friendly' | 'casual';

interface GenerateResponseParams {
  review: Review;
  tone: ResponseTone;
  businessName?: string;
  maxLength?: number;
}

export async function generateAIReviewResponse({
  review,
  tone,
  businessName,
  maxLength = 300,
}: GenerateResponseParams): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    throw new Error('OpenAI API key not configured. Please add it in the API tab.');
  }

  const toneInstructions = {
    professional: 'Use a professional, courteous, and business-appropriate tone. Be polite and formal.',
    friendly: 'Use a warm, friendly, and approachable tone. Be personable while remaining professional.',
    casual: 'Use a casual, relaxed tone. Be conversational and authentic while still being respectful.',
  };

  const ratingContext = review.rating >= 4
    ? 'This is a positive review. Express gratitude and appreciation.'
    : review.rating === 3
    ? 'This is a neutral review. Acknowledge their feedback and express commitment to improvement.'
    : 'This is a negative review. Apologize sincerely, acknowledge their concerns, and offer to make things right.';

  const systemPrompt = `You are a helpful assistant that generates responses to customer reviews for businesses.
${toneInstructions[tone]}
${ratingContext}
Keep the response under ${maxLength} characters.
Do not use placeholder text like [Business Name] - use the actual business name if provided.
Be genuine and specific to the review content.
Do not start with "Dear" - be more natural.`;

  const userPrompt = `Generate a response to this ${review.rating}-star review${businessName ? ` for ${businessName}` : ''}:

"${review.content}"

Reviewer: ${review.authorName}
Platform: ${review.platform}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    const generatedResponse = data.choices?.[0]?.message?.content?.trim();

    if (!generatedResponse) {
      throw new Error('No response generated');
    }

    return generatedResponse;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

// Fallback function if OpenAI is not configured
export function generateFallbackResponse(review: Review, tone: ResponseTone): string {
  const templates = {
    professional: {
      positive: `Thank you for your wonderful ${review.rating}-star review, ${review.authorName}. We truly appreciate your kind words and are delighted that you had a positive experience with us. Your feedback motivates our team to continue delivering excellent service.`,
      neutral: `Thank you for taking the time to share your feedback, ${review.authorName}. We value your honest assessment and are committed to improving our services. Please don't hesitate to reach out if there's anything we can do to enhance your experience.`,
      negative: `Thank you for bringing this to our attention, ${review.authorName}. We sincerely apologize that your experience did not meet your expectations. We take your feedback seriously and would appreciate the opportunity to make things right. Please contact us directly so we can address your concerns.`,
    },
    friendly: {
      positive: `Wow, thank you so much for the amazing review, ${review.authorName}! We're thrilled to hear you had such a great experience. Your feedback means the world to us, and we can't wait to see you again soon!`,
      neutral: `Hey ${review.authorName}, thanks for sharing your thoughts with us! We really appreciate your feedback and are always looking for ways to improve. We'd love to hear more about how we can make your next visit even better!`,
      negative: `Hi ${review.authorName}, we're really sorry to hear about your experience. This definitely isn't up to our usual standards, and we want to make it right. Please reach out to us directly so we can personally address this for you.`,
    },
    casual: {
      positive: `Thanks so much for the awesome review, ${review.authorName}! So happy you enjoyed your experience. Hope to see you again soon!`,
      neutral: `Hey ${review.authorName}, thanks for the feedback! We appreciate you taking the time to share your thoughts. Let us know if there's anything we can do better next time!`,
      negative: `Hi ${review.authorName}, sorry to hear things didn't go as expected. We'd really like to make it up to you - drop us a message and let's sort this out!`,
    },
  };

  const sentiment = review.rating >= 4 ? 'positive' : review.rating === 3 ? 'neutral' : 'negative';
  return templates[tone][sentiment];
}
