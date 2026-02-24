import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, GraduationCap, Calendar, MapPin } from 'lucide-react';
import { EXPERIENCE } from '../data/resume';
import { ExperienceItem } from '../types';

const TimelineItem: React.FC<{ item: ExperienceItem; isLeft: boolean }> = ({ item, isLeft }) => {
  const Icon = item.type === 'work' ? Briefcase : GraduationCap;
  
  return (
    <div className={`mb-8 flex justify-between items-center w-full ${isLeft ? 'flex-row-reverse' : ''} group`}>
      <div className="order-1 w-5/12"></div>
      
      <div className={`z-20 flex items-center order-1 shadow-xl w-12 h-12 rounded-full border-4 transition-colors justify-center shrink-0 
        ${item.type === 'education' ? 'bg-indigo-900 border-slate-800 group-hover:border-indigo-400' : 'bg-slate-900 border-slate-800 group-hover:border-accent'}`}>
        <Icon size={20} className={item.type === 'education' ? 'text-indigo-400' : 'text-accent'} />
      </div>
      
      <div className={`order-1 backdrop-blur-md rounded-2xl shadow-xl w-5/12 px-6 py-6 border transition-all duration-300 hover:-translate-y-1
        ${item.type === 'education' 
            ? 'bg-indigo-950/30 border-indigo-500/20 hover:bg-indigo-900/40 hover:border-indigo-400/40' 
            : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-accent/40'}`}>
        
        <span className={`mb-3 inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border 
            ${item.type === 'education' ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' : 'text-accent bg-accent/10 border-accent/20'}`}>
          <Calendar size={12} className="mr-1" /> {item.period}
        </span>
        
        <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
        <h4 className="mb-3 text-slate-400 font-medium flex items-center text-sm">
            {item.company} 
            <span className="mx-2 text-slate-600">•</span> 
            <MapPin size={12} className="mr-1 inline" /> {item.location}
        </h4>
        <ul className="list-disc list-outside ml-4 text-sm text-slate-300 space-y-2 mb-4 leading-relaxed">
            {item.description.slice(0, 3).map((desc, i) => (
                <li key={i}>{desc}</li>
            ))}
        </ul>
        {item.skills && (
            <div className={`flex flex-wrap gap-2 mt-4 pt-4 border-t ${item.type === 'education' ? 'border-indigo-500/20' : 'border-slate-700/50'}`}>
                {item.skills.map((skill, i) => (
                    <span key={i} className={`text-xs px-2 py-1 rounded border ${
                        item.type === 'education' 
                        ? 'text-indigo-300 bg-indigo-900/50 border-indigo-700/50' 
                        : 'text-slate-400 bg-slate-800/50 border-slate-700/50'
                    }`}>
                        {skill}
                    </span>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

// Mobile version
const MobileTimelineItem: React.FC<{ item: ExperienceItem }> = ({ item }) => {
    return (
        <div className={`mb-8 relative pl-8 border-l-2 ml-3 ${item.type === 'education' ? 'border-indigo-500/30' : 'border-slate-700'}`}>
             <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-slate-900 
                ${item.type === 'education' ? 'border-indigo-500' : 'border-accent'}`}>
            </div>
            
            <div className={`backdrop-blur-md p-5 rounded-xl border transition-colors 
                ${item.type === 'education' 
                ? 'bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-400/40' 
                : 'bg-slate-900/40 border-slate-700/50 hover:border-accent/30'}`}>
                
                <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                    <div>
                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                        <div className={`text-sm font-semibold ${item.type === 'education' ? 'text-indigo-400' : 'text-accent'}`}>{item.company}</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded flex items-center whitespace-nowrap 
                        ${item.type === 'education' ? 'text-indigo-300 bg-indigo-900/50' : 'text-slate-400 bg-slate-800/50'}`}>
                         <Calendar size={12} className="mr-1" /> {item.period}
                    </div>
                </div>
                
                <ul className="list-disc ml-4 text-sm text-slate-300 space-y-2 mt-3">
                    {item.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

const Timeline: React.FC = () => {
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
    <section id="experience" className="relative">
      <div 
        ref={sectionRef} 
        className={`container mx-auto px-6 transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">
          Education & <span className="text-accent">Experience</span>
        </h2>
        
        {/* Desktop Timeline */}
        <div className="hidden md:block relative w-full">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-slate-800"></div>
          {EXPERIENCE.map((item) => (
            <TimelineItem key={item.id} item={item} isLeft={item.type === 'education'} />
          ))}
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden">
            {EXPERIENCE.map((item) => (
                <MobileTimelineItem key={item.id} item={item} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;