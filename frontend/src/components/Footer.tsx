import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { PERSONAL_INFO } from '../data/resume';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Let's Connect</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
            I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </p>
        
        <div className="flex justify-center gap-6 mb-8">
            <a href={PERSONAL_INFO.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-accent transition-colors">
                <Github size={24} />
            </a>
            <a href={PERSONAL_INFO.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-accent transition-colors">
                <Linkedin size={24} />
            </a>
            <a href={`mailto:${PERSONAL_INFO.email}`} className="text-slate-400 hover:text-accent transition-colors">
                <Mail size={24} />
            </a>
        </div>
        
        <div className="text-sm text-slate-600">
            © {new Date().getFullYear()} Charlotte Ma. Built with React, Tailwind & Gemini AI.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
