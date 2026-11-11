import { HomePage } from '../components/HomePage';
import { LanguageRedirect } from '../components/LanguageRedirect';

// Cloudflare redirects at the edge; static hosts render English until the browser redirect runs.
export default function Home() {
  return <><LanguageRedirect /><HomePage initialLanguage="en" /></>;
}
