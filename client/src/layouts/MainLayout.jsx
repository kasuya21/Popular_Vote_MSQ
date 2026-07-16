import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

const MainLayout = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Starfield + Olympus ambient blobs — matches index.css body background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Purple ambient top blob */}
        <div className="absolute top-[-15%] right-[-5%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] rounded-full blur-[100px] opacity-40 animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), rgba(109,40,217,0.3))' }}
        />
        {/* Gold ambient bottom-right blob */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px] opacity-25 animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.5), rgba(160,117,16,0.2))', animationDelay: '3s' }}
        />
        {/* Teal ambient bottom-left blob */}
        <div className="absolute bottom-[10%] left-[-10%] w-[40vw] h-[40vw] max-w-[550px] max-h-[550px] rounded-full blur-[120px] opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(77,208,196,0.4), rgba(35,156,146,0.2))', animationDelay: '6s' }}
        />
        {/* Deep indigo center */}
        <div className="absolute top-[35%] left-[20%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full blur-[80px] opacity-30 animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.4), rgba(67,20,180,0.2))', animationDelay: '4.5s' }}
        />
      </div>

      <Navbar />

      <main className="flex-grow relative z-10 w-full max-w-[1400px] mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <Outlet />
      </main>

      <div className="relative z-10 hidden md:block">
        <Footer />
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
