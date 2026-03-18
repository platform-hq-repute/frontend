import { Redirect } from 'expo-router';

// Mobile users are redirected to the tabs layout
// Web users see the landing page (index.web.tsx)
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
