import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, FileText, Github } from 'lucide-react';

import paperPdfUrl from '../data/speculative_decoding.pdf?url';

type ProjectCard = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  primaryLink: { label: string; href: string; icon: React.ElementType; download?: boolean };
  secondaryLink?: { label: string; href: string; icon: React.ElementType };
};

const PROJECT_CARDS: ProjectCard[] = [
  {
    id: 'paper-topk-impspecdec',
    title: 'Enhancing Speculative Decoding for Faster LLM Inference',
    description:
      'Proposed TopK-ImpSpecDec, combining Top-K candidate selection with importance sampling to improve token acceptance rates and enable faster long-text generation. Evaluated across WikiText-103, Alpaca, and CNN/DailyMail with systematic parameter sweeps.',
    techStack: ['Python', 'PyTorch', 'Hugging Face Transformers', 'Datasets', 'NumPy', 'Matplotlib'],
    primaryLink: {
      label: 'Open Paper (PDF)',
      href: paperPdfUrl,
      icon: FileText,
    },
    secondaryLink: {
      label: 'Download PDF',
      href: paperPdfUrl,
      icon: ExternalLink,
    },
  },
  {
    id: 'gesture-recognition',
    title: 'Gesture Recognition (Classification)',
    description:
      'Built a gesture classification project focused on robust recognition from structured coordinate features. Includes training pipeline, evaluation, and reproducible repository setup for iteration and extension.',
    techStack: ['Python', 'Deep Learning', 'Classification', 'Experimentation'],
    primaryLink: {
      label: 'View on GitHub',
      href: 'https://github.com/Charlo-M/Gesture-recognition.git',
      icon: Github,
    },
  },
];

const Projects: React.FC = () => {
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

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className="relative">
      <div
        ref={sectionRef}
        className={`container mx-auto px-6 transition-all duration-1000 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
          Featured <span className="text-accent">Projects</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PROJECT_CARDS.map((project) => {
            const PrimaryIcon = project.primaryLink.icon;
            const SecondaryIcon = project.secondaryLink?.icon;

            return (
              <div
                key={project.id}
                className="group bg-slate-900/40 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 hover:bg-slate-800/60 hover:border-accent/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={project.primaryLink.href}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-accent transition-all"
                      title={project.primaryLink.label}
                    >
                      <PrimaryIcon size={20} />
                    </a>

                    {project.secondaryLink && SecondaryIcon && (
                      <a
                        href={project.secondaryLink.href}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-accent transition-all"
                        title={project.secondaryLink.label}
                      >
                        <SecondaryIcon size={20} />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-800/50 rounded-lg text-xs font-medium text-accent border border-slate-700/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Optional CTA row */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={project.primaryLink.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white transition-colors"
                  >
                    <PrimaryIcon size={16} />
                    {project.primaryLink.label} →
                  </a>

                  {project.secondaryLink && (
                    <a
                      href={project.secondaryLink.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      <ExternalLink size={16} />
                      {project.secondaryLink.label} →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;