import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import {
  Star,
  MessageSquareText,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  Globe,
  ChevronRight,
  Quote,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated floating elements
function FloatingOrb({
  size,
  color,
  delay,
  duration,
  startX,
  startY,
}: {
  size: number;
  color: string;
  delay: number;
  duration: number;
  startX: number;
  startY: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    translateX.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(20, { duration: duration / 1.5, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration / 1.5, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          left: startX,
          top: startY,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: 0.4,
        }}
      />
    </Animated.View>
  );
}

// Feature card component
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(700).springify()}
      style={{
        flex: 1,
        minWidth: 280,
        maxWidth: 380,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        margin: 12,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: 'rgba(0, 212, 170, 0.15)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: '700',
          marginBottom: 12,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 16,
          lineHeight: 26,
          letterSpacing: 0.1,
        }}
      >
        {description}
      </Text>
    </Animated.View>
  );
}

// Stat card component
function StatCard({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600)}
      style={{
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
      }}
    >
      <Text
        style={{
          color: '#00D4AA',
          fontSize: 48,
          fontWeight: '800',
          letterSpacing: -2,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 14,
          fontWeight: '500',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

// Testimonial card
function TestimonialCard({
  quote,
  author,
  role,
  company,
  delay,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInRight.delay(delay).duration(700)}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        minWidth: 340,
        maxWidth: 400,
        marginHorizontal: 12,
      }}
    >
      <Quote size={32} color="rgba(0, 212, 170, 0.4)" style={{ marginBottom: 16 }} />
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: 17,
          lineHeight: 28,
          fontStyle: 'italic',
          marginBottom: 24,
        }}
      >
        "{quote}"
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#1A1F36',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Text style={{ color: '#00D4AA', fontSize: 18, fontWeight: '700' }}>
            {author.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>{author}</Text>
          <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, marginTop: 2 }}>
            {role}, {company}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function WebLandingPage() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0D14' }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={{ minHeight: 900, position: 'relative', overflow: 'hidden' }}>
        {/* Background gradient mesh */}
        <LinearGradient
          colors={['#0A0D14', '#0F1419', '#0A0D14']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Floating orbs for depth */}
        <FloatingOrb size={400} color="#00D4AA" delay={0} duration={8000} startX={-100} startY={100} />
        <FloatingOrb size={300} color="#1A1F36" delay={1000} duration={10000} startX={SCREEN_WIDTH - 200} startY={200} />
        <FloatingOrb size={200} color="#00D4AA" delay={2000} duration={7000} startX={SCREEN_WIDTH / 2} startY={600} />

        {/* Grid pattern overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Navigation */}
        <Animated.View
          entering={FadeIn.delay(100).duration(800)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 60,
            paddingVertical: 24,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../public/real-logo.png')}
              style={{ width: 40, height: 40, marginRight: 12 }}
              contentFit="contain"
            />
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>
              ReputeHQ
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 40 }}>
            <Pressable>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 15, fontWeight: '500' }}>
                Features
              </Text>
            </Pressable>
            <Pressable>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 15, fontWeight: '500' }}>
                Pricing
              </Text>
            </Pressable>
            <Pressable>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 15, fontWeight: '500' }}>
                About
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/login')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Sign In</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/signup')}
              style={{
                backgroundColor: '#00D4AA',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#0A0D14', fontSize: 15, fontWeight: '600' }}>Get Started</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Hero Content */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 60,
            paddingTop: 80,
            paddingBottom: 100,
          }}
        >
          {/* Badge */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(700)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 212, 170, 0.1)',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: 'rgba(0, 212, 170, 0.2)',
              marginBottom: 32,
            }}
          >
            <Sparkles size={16} color="#00D4AA" />
            <Text style={{ color: '#00D4AA', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
              AI-Powered Review Management
            </Text>
          </Animated.View>

          {/* Main headline */}
          <Animated.Text
            entering={FadeInDown.delay(300).duration(800)}
            style={{
              color: '#FFFFFF',
              fontSize: 72,
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: -3,
              lineHeight: 82,
              maxWidth: 900,
              marginBottom: 24,
            }}
          >
            Transform Customer Reviews Into{' '}
            <Text style={{ color: '#00D4AA' }}>Business Growth</Text>
          </Animated.Text>

          {/* Subheadline */}
          <Animated.Text
            entering={FadeInDown.delay(400).duration(800)}
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 20,
              textAlign: 'center',
              lineHeight: 32,
              maxWidth: 600,
              marginBottom: 48,
              letterSpacing: 0.2,
            }}
          >
            Centralize reviews from Google and Trustpilot. Generate intelligent responses with AI.
            Build lasting customer relationships at scale.
          </Animated.Text>

          {/* CTA Buttons */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(700)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}
          >
            <Pressable
              onPress={() => router.push('/signup')}
              style={{
                backgroundColor: '#00D4AA',
                paddingHorizontal: 32,
                paddingVertical: 18,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#0A0D14', fontSize: 17, fontWeight: '700', marginRight: 8 }}>
                Start Free Trial
              </Text>
              <ArrowRight size={20} color="#0A0D14" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/admin-login')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                paddingHorizontal: 32,
                paddingVertical: 18,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Shield size={18} color="#F59E0B" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>Admin Portal</Text>
            </Pressable>
          </Animated.View>

          {/* Trust badges */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(700)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 48,
              gap: 32,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle2 size={18} color="rgba(255, 255, 255, 0.4)" />
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: 14,
                  marginLeft: 8,
                  fontWeight: '500',
                }}
              >
                No credit card required
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle2 size={18} color="rgba(255, 255, 255, 0.4)" />
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: 14,
                  marginLeft: 8,
                  fontWeight: '500',
                }}
              >
                14-day free trial
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle2 size={18} color="rgba(255, 255, 255, 0.4)" />
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: 14,
                  marginLeft: 8,
                  fontWeight: '500',
                }}
              >
                Cancel anytime
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Stats Section */}
      <View
        style={{
          backgroundColor: '#0D1117',
          paddingVertical: 80,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <StatCard value="10K+" label="Active Businesses" delay={100} />
          <View style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 20 }} />
          <StatCard value="2M+" label="Reviews Managed" delay={200} />
          <View style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 20 }} />
          <StatCard value="4.9" label="Average Rating" delay={300} />
          <View style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 20 }} />
          <StatCard value="85%" label="Response Rate Increase" delay={400} />
        </View>
      </View>

      {/* Features Section */}
      <View style={{ paddingVertical: 120, paddingHorizontal: 60, backgroundColor: '#0A0D14' }}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(700)}
          style={{ alignItems: 'center', marginBottom: 64 }}
        >
          <Text
            style={{
              color: '#00D4AA',
              fontSize: 14,
              fontWeight: '700',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Platform Features
          </Text>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: -2,
              marginBottom: 16,
            }}
          >
            Everything You Need to Excel
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 18,
              textAlign: 'center',
              maxWidth: 600,
              lineHeight: 28,
            }}
          >
            A comprehensive suite of tools designed for modern businesses that take customer experience seriously.
          </Text>
        </Animated.View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 1200,
            alignSelf: 'center',
          }}
        >
          <FeatureCard
            icon={<MessageSquareText size={28} color="#00D4AA" />}
            title="Unified Dashboard"
            description="Aggregate reviews from Google Business, Trustpilot, and more into a single, intuitive command center."
            delay={200}
          />
          <FeatureCard
            icon={<Sparkles size={28} color="#00D4AA" />}
            title="AI Response Generation"
            description="Craft personalized, context-aware responses instantly with our GPT-4 powered AI assistant."
            delay={300}
          />
          <FeatureCard
            icon={<BarChart3 size={28} color="#00D4AA" />}
            title="Advanced Analytics"
            description="Track sentiment trends, response rates, and reputation scores with real-time insights."
            delay={400}
          />
          <FeatureCard
            icon={<Building2 size={28} color="#00D4AA" />}
            title="Multi-Location Support"
            description="Manage unlimited business locations from one account with role-based team access."
            delay={500}
          />
          <FeatureCard
            icon={<Zap size={28} color="#00D4AA" />}
            title="Instant Notifications"
            description="Never miss a review. Get real-time alerts and respond while the conversation is fresh."
            delay={600}
          />
          <FeatureCard
            icon={<Shield size={28} color="#00D4AA" />}
            title="Enterprise Security"
            description="Bank-level encryption, SOC 2 compliance, and role-based permissions protect your data."
            delay={700}
          />
        </View>
      </View>

      {/* Social Proof Section */}
      <View
        style={{
          paddingVertical: 120,
          backgroundColor: '#0D1117',
          borderTopWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(700)}
          style={{ alignItems: 'center', marginBottom: 64, paddingHorizontal: 60 }}
        >
          <Text
            style={{
              color: '#00D4AA',
              fontSize: 14,
              fontWeight: '700',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Trusted Worldwide
          </Text>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: -2,
            }}
          >
            Loved by Industry Leaders
          </Text>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 48,
            paddingVertical: 8,
          }}
        >
          <TestimonialCard
            quote="ReputeHQ transformed how we handle customer feedback. Our response time dropped from days to minutes, and our ratings have never been higher."
            author="Sarah Mitchell"
            role="Operations Director"
            company="Metro Hospitality Group"
            delay={200}
          />
          <TestimonialCard
            quote="The AI-generated responses are remarkably on-brand. It's like having a dedicated reputation manager working 24/7."
            author="James Rodriguez"
            role="CEO"
            company="AutoCare Express"
            delay={300}
          />
          <TestimonialCard
            quote="Managing 50+ locations was a nightmare before ReputeHQ. Now our franchise owners have full visibility while we maintain brand consistency."
            author="Emily Chen"
            role="VP of Marketing"
            company="FreshBite Restaurants"
            delay={400}
          />
        </ScrollView>
      </View>

      {/* CTA Section */}
      <View style={{ position: 'relative', overflow: 'hidden' }}>
        <LinearGradient
          colors={['#0A0D14', '#0F1820', '#0A0D14']}
          style={{
            paddingVertical: 120,
            paddingHorizontal: 60,
            alignItems: 'center',
          }}
        >
          {/* Background glow */}
          <View
            style={{
              position: 'absolute',
              width: 600,
              height: 600,
              borderRadius: 300,
              backgroundColor: 'rgba(0, 212, 170, 0.08)',
              top: -200,
              left: '50%',
              transform: [{ translateX: -300 }],
            }}
          />

          <Animated.Text
            entering={FadeInDown.delay(100).duration(700)}
            style={{
              color: '#FFFFFF',
              fontSize: 52,
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: -2,
              marginBottom: 20,
              maxWidth: 700,
            }}
          >
            Ready to Elevate Your Reputation?
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(700)}
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 40,
              maxWidth: 500,
              lineHeight: 28,
            }}
          >
            Join thousands of businesses using ReputeHQ to turn customer feedback into competitive advantage.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(300).duration(700)}>
            <Pressable
              onPress={() => router.push('/signup')}
              style={{
                backgroundColor: '#00D4AA',
                paddingHorizontal: 40,
                paddingVertical: 20,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#0A0D14', fontSize: 18, fontWeight: '700', marginRight: 10 }}>
                Start Your Free Trial
              </Text>
              <ArrowRight size={22} color="#0A0D14" />
            </Pressable>
          </Animated.View>
        </LinearGradient>
      </View>

      {/* Footer */}
      <View
        style={{
          backgroundColor: '#060810',
          paddingVertical: 60,
          paddingHorizontal: 60,
          borderTopWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            maxWidth: 1200,
            alignSelf: 'center',
            width: '100%',
          }}
        >
          {/* Brand */}
          <View style={{ marginBottom: 32, minWidth: 250 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Image
                source={require('../../public/real-logo.png')}
                style={{ width: 32, height: 32, marginRight: 10 }}
                contentFit="contain"
              />
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>ReputeHQ</Text>
            </View>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 14,
                lineHeight: 22,
                maxWidth: 280,
              }}
            >
              Empowering businesses to build stronger customer relationships through intelligent review management.
            </Text>
          </View>

          {/* Links */}
          <View style={{ flexDirection: 'row', gap: 80, flexWrap: 'wrap' }}>
            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                Product
              </Text>
              {['Features', 'Pricing', 'Integrations', 'API'].map((item) => (
                <Pressable key={item} style={{ marginBottom: 12 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                Company
              </Text>
              {['About', 'Careers', 'Blog', 'Press'].map((item) => (
                <Pressable key={item} style={{ marginBottom: 12 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                Support
              </Text>
              {['Help Center', 'Contact', 'Status', 'Security'].map((item) => (
                <Pressable key={item} style={{ marginBottom: 12 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View
          style={{
            marginTop: 48,
            paddingTop: 32,
            borderTopWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.05)',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 1200,
            alignSelf: 'center',
            width: '100%',
          }}
        >
          <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 13 }}>
            © 2025 ReputeHQ. All rights reserved.
          </Text>
          <View style={{ flexDirection: 'row', gap: 32 }}>
            <Pressable>
              <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 13 }}>Privacy Policy</Text>
            </Pressable>
            <Pressable>
              <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 13 }}>Terms of Service</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
