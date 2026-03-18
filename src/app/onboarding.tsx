import { useState, useRef } from 'react';
import { View, Text, Pressable, Dimensions, FlatList, ViewToken } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MessageSquareText, Sparkles, BarChart3, Zap } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '@/lib/store';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: [string, string];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: <MessageSquareText size={64} color="#ffffff" strokeWidth={1.5} />,
    title: 'All Reviews,\nOne Place',
    description: 'Manage Google and Trustpilot reviews from a single, beautiful dashboard.',
    gradient: ['#1A1F36', '#2D3555'],
  },
  {
    id: '2',
    icon: <Sparkles size={64} color="#ffffff" strokeWidth={1.5} />,
    title: 'AI-Powered\nResponses',
    description: 'Generate thoughtful, personalized responses in seconds with our smart AI.',
    gradient: ['#0D9488', '#0F766E'],
  },
  {
    id: '3',
    icon: <BarChart3 size={64} color="#ffffff" strokeWidth={1.5} />,
    title: 'Track Your\nReputation',
    description: 'Monitor ratings, response times, and customer sentiment at a glance.',
    gradient: ['#7C3AED', '#5B21B6'],
  },
  {
    id: '4',
    icon: <Zap size={64} color="#ffffff" strokeWidth={1.5} />,
    title: 'Ready to\nGet Started?',
    description: 'Join thousands of businesses building better customer relationships.',
    gradient: ['#1A1F36', '#374151'],
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    setOnboarded(true);
    router.replace('/login');
  };

  const handleSkip = () => {
    setOnboarded(true);
    router.replace('/login');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <View style={{ width }} className="flex-1 items-center justify-center px-8">
        <View className="w-32 h-32 rounded-full bg-white/10 items-center justify-center mb-10">
          {item.icon}
        </View>
        <Text className="text-white text-4xl font-bold text-center mb-4 leading-tight">
          {item.title}
        </Text>
        <Text className="text-white/70 text-lg text-center leading-relaxed max-w-xs">
          {item.description}
        </Text>
      </View>
    );
  };

  const currentSlide = slides[currentIndex];

  return (
    <View className="flex-1">
      <LinearGradient
        colors={currentSlide?.gradient ?? ['#1A1F36', '#2D3555']}
        style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Skip Button */}
        <View className="flex-row justify-between items-center px-6 py-4">
          {/* Logo */}
          <Image
            source={require('../../public/real-logo.png')}
            style={{ width: 40, height: 40 }}
            contentFit="contain"
          />
          <Pressable onPress={handleSkip} className="active:opacity-70">
            <Text className="text-white/60 text-base font-medium">Skip</Text>
          </Pressable>
        </View>

        {/* Slides */}
        <View className="flex-1">
          <FlatList
            ref={flatListRef}
            data={slides}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScroll={(e) => {
              scrollX.value = e.nativeEvent.contentOffset.x;
            }}
            scrollEventThrottle={16}
          />
        </View>

        {/* Pagination & Button */}
        <View className="px-8 pb-8">
          {/* Dots */}
          <View className="flex-row justify-center mb-8">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full mx-1 ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </View>

          {/* Button */}
          <Pressable
            onPress={handleNext}
            className="bg-white rounded-2xl py-4 active:opacity-90"
          >
            <Text className="text-center text-lg font-semibold" style={{ color: currentSlide?.gradient[0] ?? '#1A1F36' }}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
