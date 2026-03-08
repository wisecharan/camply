import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar"; // Ensure your import path is correct

// Reusable chip component for the filter tags
const Chip = ({ text, active }) => (
  <button className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
    active 
      ? "border-gray-900 text-gray-900 bg-white" 
      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white"
  }`}>
    {text}
  </button>
);

// Reusable card component for the grid
const ProjectCard = ({ title, author, image, colSpan = "" }) => (
  <div className={`relative group rounded-[2rem] overflow-hidden cursor-pointer ${colSpan}`}>
    <img src={image} alt={title} className="w-full h-full object-cover min-h-[400px] lg:min-h-[500px] transition-transform duration-700 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-80" />
    <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between">
      <div>
        <h3 className="text-white text-xl font-medium mb-1">{title}</h3>
        <p className="text-white/70 text-sm">{author}</p>
      </div>
      <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* The Navbar will sit completely flush at the top. 
        Ensure your Navbar.jsx has a white background (e.g., bg-white) 
        and no top margin.
      */}
      <Navbar />

      <main className="flex-1 w-full relative">
        
        {/* Subtle Curved Accent Line */}
        <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none z-0">
          <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto stroke-gray-200" strokeWidth="1">
            <path d="M0 160 Q 720 -80 1440 160" />
          </svg>
        </div>

        {/* Content Container - constrains text/images for readability but isn't a visible box */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-12 relative z-10">
          
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 lg:gap-8 mb-16">
            <h1 className="text-[56px] sm:text-[72px] lg:text-[88px] font-medium text-gray-900 tracking-tight leading-[1.05] max-w-2xl">
              Manage placements<br />the modern way
            </h1>
            
            <div className="max-w-md pb-3 lg:pb-6">
              <p className="text-gray-500 leading-relaxed mb-6 text-lg">
                Simple, fast, and modern platform for students, companies, and admins to handle recruitment and hiring processes efficiently.
              </p>
              <Link
                to="/register"
                className="inline-block px-8 py-3.5 bg-black text-white rounded-full text-base font-medium hover:bg-gray-900 transition-colors shadow-lg shadow-black/10"
              >
                Try it For Free
              </Link>
            </div>
          </div>

          {/* Filter / Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
              <Chip text="Engineering" active={true} />
              <Chip text="Management" />
              <Chip text="Design" />
              <Chip text="Internships" />
              <Chip text="Full-Time" />
            </div>
            
            <div className="flex items-center gap-2">
              <Chip text="Guidelines" />
              <Chip text="Placement Guide" />
            </div>
          </div>

          {/* 3-Column Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard 
              title="Abstract Data Display"
              author="Rudi Wibowo"
              image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
            />
            <ProjectCard 
              title="Minimalist Geometric"
              author="Ilham Fahmi"
              image="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80"
            />
            <ProjectCard 
              title="Abstract 3D Illustration"
              author="Nina Lestari"
              image="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80"
            />
          </div>

        </div>
      </main>

      {/* Utilities */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;