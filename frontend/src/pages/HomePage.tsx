import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Metrics from '../components/Metrix';
import About from '../components/About';

function HomePage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Metrics/>
      <About />
      {/* Hero Section */}
    </div>
  );
}

export default HomePage;