import { HomePage } from '../components/HomePage';
import { LanguageRedirect } from '../components/LanguageRedirect';

// Cloudflare redirects at the edge; this also covers local/static-only hosting.
export default function Home() {
  return <><LanguageRedirect /><HomePage /></>;
}
