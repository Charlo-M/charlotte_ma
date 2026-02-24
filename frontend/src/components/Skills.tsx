import React, { useEffect, useRef, useState } from 'react';
import { SKILLS } from '../data/resume';

const Skills: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="relative">
      <div 
        ref={sectionRef} 
        className={`container mx-auto px-6 transition-all duration-1000 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
          Technical <span className="text-accent">Expertise</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SKILLS.map((category, idx) => (
            <div 
              key={idx} 
              className="group bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold mb-4 text-white border-b border-slate-700/50 pb-2 group-hover:border-accent/30 transition-colors">
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, sIdx) => (
                  <span 
                    key={sIdx} 
                    className="px-3 py-1 bg-slate-800/50 text-slate-300 text-sm rounded-lg border border-slate-700/50 hover:text-white hover:bg-accent/20 hover:border-accent/30 transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;