import React, { useEffect, useState } from 'react';
import { Download, ChevronDown, Github, Linkedin, Mail } from 'lucide-react';
import { PERSONAL_INFO } from '../data/resume';
import resumePdfUrl from '../data/Charlotte_Ma_Resume.pdf?url';

const Hero: React.FC = () => {
  const [displayedName, setDisplayedName] = useState('');

  useEffect(() => {
    const startDelay = 200;
    const typeSpeed = 100;

    let intervalId: number | null = null;

    const timeoutId = window.setTimeout(() => {
      let currentIndex = 0;
      intervalId = window.setInterval(() => {
        if (currentIndex <= PERSONAL_INFO.name.length) {
          setDisplayedName(PERSONAL_INFO.name.slice(0, currentIndex));
          currentIndex += 1;
        } else if (intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      }, typeSpeed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, []);

  const handleScrollDown = () => {
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
      skillsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadResume = () => {
    const link = document.createElement('a');
    link.href = resumePdfUrl;
    link.download = 'Charlotte_Ma_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="mb-6 inline-block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="py-1 px-4 rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700 text-accent text-sm font-semibold shadow-lg shadow-accent/10">
            Open to Work :)
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight min-h-[1.2em] flex justify-center items-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            {displayedName}
          </span>
          <span className="w-1 h-10 md:h-16 ml-1 bg-accent animate-pulse"></span>
        </h1>

        <h2 className="text-2xl md:text-3xl text-slate-400 mb-8 font-light animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {PERSONAL_INFO.title}
        </h2>

        <p className="max-w-2xl mx-auto text-lg text-slate-300 mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {PERSONAL_INFO.about}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={handleDownloadResume}
            className="group flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg shadow-accent/20 hover:scale-105"
          >
            <Download size={20} className="group-hover:animate-bounce" />
            Download Resume
          </button>

        <div className="flex gap-4">

          {/* LinkedIn */}
          <a
            href={PERSONAL_INFO.linkedin}
            target="_blank"
            rel="noreferrer"
            className="p-3 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-full hover:bg-slate-700 hover:border-accent hover:text-accent transition-all text-white hover:-translate-y-1"
            title="LinkedIn"
          >
            <Linkedin size={20} />
          </a>

          {/* Email: resilient fallback (no mailto config needed) */}
          <button
            type="button"
            onClick={async () => {
              const email = PERSONAL_INFO.email;
              const subject = "Let's connect";
              const body = `Hi Charlotte,\n\nI found your portfolio and would love to connect.\n\nBest,\n`;

              // 1) Try mailto (works when configured)
              const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

              // We try navigating in the same tab to avoid about:blank new tab behavior
              // Some browsers may still fail silently if no handler.
              window.location.href = mailto;

              // 2) Fallback: after a short delay, open Gmail compose + copy email
              window.setTimeout(async () => {
                // Copy email to clipboard as a universal fallback
                try {
                  await navigator.clipboard.writeText(email);
                } catch {
                  // ignore clipboard failures (e.g., permissions)
                }

                // Open Gmail web compose (works even if mailto isn't configured)
                const gmailUrl =
                  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}` +
                  `&su=${encodeURIComponent(subject)}` +
                  `&body=${encodeURIComponent(body)}`;

                window.open(gmailUrl, "_blank", "noopener,noreferrer");
              }, 300);
            }}
            className="p-3 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-full hover:bg-slate-700 hover:border-accent hover:text-accent transition-all text-white hover:-translate-y-1"
            title="Email (opens Gmail if needed)"
          >
            <Mail size={20} />
          </button>
        </div>
        </div>

        <div
          onClick={handleScrollDown}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer text-slate-500 hover:text-white transition-colors animate-float"
        >
        </div>
      </div>
    </section>
  );
};

export default Hero;