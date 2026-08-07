import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import Products from './components/Products';
import Stats from './components/Stats';
import Partners from './components/Partners';
import Footer from './components/Footer';
import Intro from './components/Intro';
import Admin from './components/admin/Admin';
import { OrderProvider } from './components/OrderModal';
import { useLenis } from './hooks/useLenis';

export default function App() {
  // одна страница + админка, полноценный роутер ради этого не нужен
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/admin') return <Admin />;
  return <Site />;
}

function Site() {
  useLenis();
  return (
    <OrderProvider>
      <Intro />
      <main>
        <Navbar />
        <Hero />
        <Catalog />
        <Products />
        <Stats />
        <Partners />
        <Footer />
      </main>
    </OrderProvider>
  );
}
