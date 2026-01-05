import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  // Navigation
  'nav.about': { pt: 'Sobre', en: 'About' },
  'nav.tracks': { pt: 'Trilhas', en: 'Tracks' },
  'nav.howItWorks': { pt: 'Como Funciona', en: 'How it Works' },
  'nav.content': { pt: 'Conteúdo', en: 'Content' },
  'nav.icmc': { pt: 'ICMC', en: 'ICMC' },
  'nav.faq': { pt: 'FAQ', en: 'FAQ' },
  'nav.join': { pt: 'Entrar', en: 'Join' },

  // Hero
  'hero.title': { pt: 'Prepare-se para entrevistas de Big Tech', en: 'Prepare for Big Tech Interviews' },
  'hero.subtitle': { 
    pt: 'Grupo de extensão do ICMC-USP focado em preparação técnica para entrevistas de software engineering com práticas semanais, mock interviews e produção de conteúdo.', 
    en: 'ICMC-USP extension group focused on technical interview preparation for software engineering with weekly practice, mock interviews, and content production.' 
  },
  'hero.cta.join': { pt: 'Participar', en: 'Join Us' },
  'hero.cta.github': { pt: 'GitHub', en: 'GitHub' },
  'hero.cadence.title': { pt: 'Cadência Semanal', en: 'Weekly Cadence' },
  'hero.cadence.leetcode': { pt: '1x LeetCode por tópico', en: '1x Topic-based LeetCode' },
  'hero.cadence.mock': { pt: '1x Mock Interview', en: '1x Mock Interview' },
  'hero.cadence.behavioral': { pt: '1x Behavioral Prep', en: '1x Behavioral Prep' },

  // About
  'about.title': { pt: 'Sobre o Grind ICMC', en: 'About Grind ICMC' },
  'about.description': { 
    pt: 'O Grind ICMC é um grupo de extensão universitária que prepara estudantes para processos seletivos das principais empresas de tecnologia do mundo. Nossa metodologia é baseada em práticas reais de entrevistas técnicas.', 
    en: 'Grind ICMC is a university extension group that prepares students for hiring processes at the world\'s leading tech companies. Our methodology is based on real technical interview practices.' 
  },
  'about.goal1': { pt: 'Estabelecer rotina consistente de estudos e prática', en: 'Establish consistent study and practice routine' },
  'about.goal2': { pt: 'Melhorar performance em coding interviews', en: 'Improve coding interview performance' },
  'about.goal3': { pt: 'Desenvolver comunicação técnica eficiente', en: 'Develop efficient technical communication' },
  'about.goal4': { pt: 'Produzir conteúdo público de alta qualidade', en: 'Produce high-quality public content' },
  'about.goal5': { pt: 'Atingir padrão de excelência Big Tech', en: 'Achieve Big Tech excellence standard' },

  // Tracks
  'tracks.title': { pt: 'Trilhas', en: 'Tracks' },
  'tracks.subtitle': { pt: 'Caminhos especializados para diferentes carreiras em tecnologia', en: 'Specialized paths for different tech careers' },
  'tracks.swe.title': { pt: 'Software Engineering', en: 'Software Engineering' },
  'tracks.swe.description': { pt: 'Algoritmos, estruturas de dados, system design e coding interviews. Foco em preparação para FAANG e empresas de tecnologia tier-1.', en: 'Algorithms, data structures, system design, and coding interviews. Focus on preparation for FAANG and tier-1 tech companies.' },
  'tracks.swe.status': { pt: 'Ativo', en: 'Active' },
  'tracks.data.title': { pt: 'Data / ML', en: 'Data / ML' },
  'tracks.data.description': { pt: 'Machine learning, estatística, SQL e análise de dados. Preparação para posições de Data Scientist e ML Engineer.', en: 'Machine learning, statistics, SQL, and data analysis. Preparation for Data Scientist and ML Engineer positions.' },
  'tracks.data.status': { pt: 'Em breve', en: 'Coming Soon' },
  'tracks.security.title': { pt: 'Security', en: 'Security' },
  'tracks.security.description': { pt: 'Segurança de aplicações, criptografia, network security e CTFs. Preparação para posições de Security Engineer e estágios na área.', en: 'Application security, cryptography, network security, and CTFs. Preparation for Security Engineer positions and internships.' },
  'tracks.security.status': { pt: 'Em breve', en: 'Coming Soon' },

  // How it Works
  'how.title': { pt: 'Como Funciona', en: 'How it Works' },
  'how.step1.title': { pt: 'Problemas Semanais', en: 'Weekly Problems' },
  'how.step1.description': { pt: 'Problemas selecionados por tópico (arrays, trees, graphs, DP) com dificuldade progressiva. Foco em patterns que aparecem em entrevistas reais.', en: 'Topic-based problems (arrays, trees, graphs, DP) with progressive difficulty. Focus on patterns that appear in real interviews.' },
  'how.step2.title': { pt: 'Mock Interviews', en: 'Mock Interviews' },
  'how.step2.description': { pt: 'Simulações realistas com papéis rotativos: interviewer, candidate e observer. Experiência dos dois lados da mesa.', en: 'Realistic simulations with rotating roles: interviewer, candidate, and observer. Experience from both sides of the table.' },
  'how.step3.title': { pt: 'Feedback Estruturado', en: 'Structured Feedback' },
  'how.step3.description': { pt: 'Rubric de avaliação: comunicação, correção, complexidade e edge cases. Feedback actionable para melhoria contínua.', en: 'Evaluation rubric: communication, correctness, complexity, and edge cases. Actionable feedback for continuous improvement.' },
  'how.step4.title': { pt: 'Produção de Conteúdo', en: 'Content Production' },
  'how.step4.description': { pt: 'Write-ups e vídeos explicando soluções. Foco em trade-offs, análise de complexidade e tratamento de edge cases.', en: 'Write-ups and videos explaining solutions. Focus on trade-offs, complexity analysis, and edge case handling.' },

  // Content
  'content.title': { pt: 'Conteúdo', en: 'Content' },
  'content.subtitle': { pt: 'Recursos públicos produzidos pelo grupo', en: 'Public resources produced by the group' },
  'content.youtube.title': { pt: 'Canal no YouTube', en: 'YouTube Channel' },
  'content.youtube.description': { pt: 'Vídeos explicativos de problemas, system design e preparação para entrevistas técnicas.', en: 'Explanatory videos on problems, system design, and technical interview preparation.' },
  'content.youtube.cta': { pt: 'Acessar Canal', en: 'Visit Channel' },
  'content.github.title': { pt: 'Repositório GitHub', en: 'GitHub Repository' },
  'content.github.description': { pt: 'Soluções comentadas, templates de código e recursos de estudo organizados por tópico.', en: 'Commented solutions, code templates, and study resources organized by topic.' },
  'content.github.cta': { pt: 'Acessar Repositório', en: 'Visit Repository' },

  // ICMC
  'icmc.title': { pt: 'Sobre o ICMC-USP', en: 'About ICMC-USP' },
  'icmc.description': { 
    pt: 'O Instituto de Ciências Matemáticas e de Computação (ICMC) é uma unidade da Universidade de São Paulo, localizada em São Carlos. É referência nacional e internacional em computação, matemática e ciência de dados, com forte tradição em pesquisa e formação técnica de excelência.', 
    en: 'The Institute of Mathematics and Computer Sciences (ICMC) is a unit of the University of São Paulo, located in São Carlos. It is a national and international reference in computing, mathematics, and data science, with a strong tradition in research and excellence in technical education.' 
  },
  'icmc.highlight1': { pt: 'Pesquisa de ponta em IA e computação', en: 'Cutting-edge research in AI and computing' },
  'icmc.highlight2': { pt: 'Alumni em empresas globais de tecnologia', en: 'Alumni at global tech companies' },
  'icmc.highlight3': { pt: 'Ambiente acadêmico colaborativo', en: 'Collaborative academic environment' },
  'icmc.cta': { pt: 'Saiba mais sobre o ICMC', en: 'Learn more about ICMC' },

  // FAQ
  'faq.title': { pt: 'Perguntas Frequentes', en: 'Frequently Asked Questions' },
  'faq.q1': { pt: 'Preciso ser avançado para participar?', en: 'Do I need to be advanced to participate?' },
  'faq.a1': { pt: 'Não. Temos atividades para diferentes níveis. O importante é ter compromisso com a rotina de estudos e vontade de evoluir.', en: 'No. We have activities for different levels. What matters is commitment to the study routine and willingness to improve.' },
  'faq.q2': { pt: 'Como novos membros entram no grupo?', en: 'How do new members join the group?' },
  'faq.a2': { pt: 'Abrimos processo seletivo periodicamente. Inscreva-se na lista de interesse e avisaremos sobre as próximas vagas.', en: 'We open selection processes periodically. Sign up for the interest list and we\'ll notify you about upcoming openings.' },
  'faq.q3': { pt: 'Quanto tempo por semana preciso dedicar?', en: 'How much time per week do I need to dedicate?' },
  'faq.a3': { pt: 'Recomendamos 6-10 horas semanais para aproveitar bem as atividades: resolução de problemas, participação em mocks e revisão de material.', en: 'We recommend 6-10 hours per week to make the most of activities: problem solving, mock participation, and material review.' },
  'faq.q4': { pt: 'O grupo oferece certificado?', en: 'Does the group offer a certificate?' },
  'faq.a4': { pt: 'Sim, participantes ativos recebem certificado de atividade de extensão universitária da USP ao final do semestre.', en: 'Yes, active participants receive a university extension activity certificate from USP at the end of the semester.' },
  'faq.q5': { pt: 'Como funcionam as mock interviews?', en: 'How do mock interviews work?' },
  'faq.a5': { pt: 'São sessões de 45-60 minutos simulando entrevistas reais. Os participantes alternam entre os papéis de entrevistador, candidato e observador.', en: 'They are 45-60 minute sessions simulating real interviews. Participants rotate between interviewer, candidate, and observer roles.' },

  // Join
  'join.title': { pt: 'Junte-se ao Grind ICMC', en: 'Join Grind ICMC' },
  'join.subtitle': { pt: 'Inscreva-se na lista de interesse para ser notificado sobre próximas turmas', en: 'Sign up for the interest list to be notified about upcoming cohorts' },
  'join.form.name': { pt: 'Nome', en: 'Name' },
  'join.form.email': { pt: 'E-mail', en: 'Email' },
  'join.form.linkedin': { pt: 'LinkedIn (opcional)', en: 'LinkedIn (optional)' },
  'join.form.preparing': { pt: 'Para que você está se preparando?', en: 'What are you preparing for?' },
  'join.form.preparing.internship': { pt: 'Estágio', en: 'Internship' },
  'join.form.preparing.newgrad': { pt: 'New Grad', en: 'New Grad' },
  'join.form.preparing.experienced': { pt: 'Posição Experienced', en: 'Experienced Position' },
  'join.form.preparing.other': { pt: 'Outro', en: 'Other' },
  'join.form.submit': { pt: 'Inscrever-se', en: 'Sign Up' },
  'join.community': { pt: 'Ou entre em contato pelos canais:', en: 'Or reach out through our channels:' },

  // Footer
  'footer.rights': { pt: 'Todos os direitos reservados.', en: 'All rights reserved.' },
  'footer.description': { pt: 'Grupo de extensão do ICMC-USP focado em preparação para entrevistas técnicas.', en: 'ICMC-USP extension group focused on technical interview preparation.' },

  // Meta
  'meta.title': { pt: 'Grind ICMC | Preparação para Entrevistas Big Tech', en: 'Grind ICMC | Big Tech Interview Preparation' },
  'meta.description': { pt: 'Grupo de extensão do ICMC-USP focado em preparação para entrevistas técnicas de software engineering. LeetCode, mock interviews e conteúdo de qualidade.', en: 'ICMC-USP extension group focused on technical interview preparation for software engineering. LeetCode, mock interviews, and quality content.' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('grind-language') as Language;
    if (saved && (saved === 'pt' || saved === 'en')) {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
      setLanguageState(browserLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('grind-language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (!translation) return key;
    return translation[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
