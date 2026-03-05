import '../styles/globals.css';
import { AuthProvider } from '../lib/authContext';
import { LangProvider } from '../lib/langContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <LangProvider>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Component {...pageProps} />
      </AuthProvider>
    </LangProvider>
  );
}
