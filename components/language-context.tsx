"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "pt" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Navbar
    "nav.about": "Sobre",
    "nav.tracks": "Trilhas",
    "nav.howItWorks": "Como Funciona",
    "nav.content": "Conteúdo",
    "nav.team": "Equipe",
    "nav.faq": "FAQ",
    "nav.login": "Entrar",
    
    // Hero
    "hero.tag": "Grupo de Extensão ICMC-USP",
    "hero.title": "Prepare-se para processos seletivos das",
    "hero.titleHighlight": "Grandes Empresas de Tecnologia",
    "hero.subtitle": "Grupo de extensão do ICMC-USP focado na preparação completa para entrevistas e processos seletivos em tecnologia, dados e IA. Unimos algoritmos, engenharia de software, machine learning, ciência de dados, pesquisa aplicada, conexões e soft skills para transformar estudo em oportunidade.",
    "hero.cta": "Participar",
    "hero.github": "GitHub",
    
    // About
    "about.title": "Sobre o Grind ICMC",
    "about.mission": "Nosso objetivo é fazer a ponte entre a teoria acadêmica da universidade e a prática do mercado em Engineering e Science, sem competitividade tóxica. Acreditamos que todos podem evoluir juntos.",
    "about.feature1": "Estabelecer rotina consistente",
    "about.feature2": "Praticar entrevistas e cases técnicos",
    "about.feature3": "Desenvolver comunicação técnica eficiente",
    "about.feature4": "Produzir conteúdo público sobre tecnologia, dados e IA",
    "about.feature5": "Construir repertório para empresas e pesquisa de alto nível",
    "about.feature6": "Conexão com ex-membros (Alumni)",
    
    // Tracks
    "tracks.title": "Frentes e Trilhas de Estudo",
    "tracks.desc": "O Grind agora se organiza em duas frentes principais. Engineering prepara para sistemas, ML e dados em produção. Science prepara para análise, experimentação e pesquisa aplicada.",
    "tracks.starter.title": "Trilha Starter",
    "tracks.starter.focus": "Foco: Base comum",
    "tracks.starter.desc": "Fundamentos de programação, estatística, SQL, currículo e primeiros processos.",
    "tracks.pro.title": "Trilha Pro",
    "tracks.pro.focus": "Foco: Aprofundamento por frente",
    "tracks.pro.desc": "System Design, ML em produção, Data Science, experimentação, papers e cases técnicos.",
    "tracks.softskills.title": "Soft Skills",
    "tracks.softskills.focus": "Foco: Comunicação e carreira",
    "tracks.softskills.desc": "Mock interviews, storytelling técnico, networking e estratégias de carreira.",
    
    // Content
    "content.title": "Aprenda com a Comunidade",
    "content.desc": "Confira nosso canal no YouTube com conteúdos sobre preparação para entrevistas, resolução de problemas, engenharia, dados, ML, ciência aplicada e carreira.",
    "content.cta": "Ver canal completo",
    
    // Team
    "team.title": "Nossa Equipe",
    "team.currentMembers": "Membros Atuais",
    "team.alumniMembers": "Membros Alumni",
    "team.pagination": "Paginação da equipe",
    "team.previous": "Anterior",
    "team.next": "Próxima",
    "team.previousPage": "Ir para a página anterior",
    "team.nextPage": "Ir para a próxima página",
    "team.page": "Ir para a página {page}",

    // ICMC
    "icmc.title": "Instituto de Ciências Matemáticas e de Computação",
    "icmc.desc": "O Instituto de Ciências Matemáticas e de Computação (ICMC) é uma unidade da Universidade de São Paulo, localizada em São Carlos. É referência nacional e internacional em computação, matemática e ciência de dados, com forte tradição em pesquisa e formação técnica de excelência.",
    "icmc.bullet1": "Pesquisa de ponta em IA e computação",
    "icmc.bullet2": "Alumni em empresas globais de tecnologia",
    "icmc.bullet3": "Ambiente acadêmico colaborativo",
    "icmc.cta": "Saiba mais sobre o ICMC",
    
    // FAQ
    "faq.title": "Perguntas Frequentes",
    "faq.q1": "Preciso ser avançado para participar?",
    "faq.a1": "Não! Todos começam de algum lugar. As camadas Starter, Pro e Soft Skills ajudam cada pessoa a evoluir dentro da frente que fizer mais sentido para seus objetivos.",
    "faq.q2": "O foco é só LeetCode?",
    "faq.a2": "Não. LeetCode continua sendo uma base útil para alguns processos, mas também estamos trabalhando na preparação para outras áreas e formatos de processo seletivo, como cases técnicos, discussões de projeto, dados, ML, pesquisa aplicada e entrevistas comportamentais.",
    "faq.q3": "Como funcionam as mock interviews?",
    "faq.a3": "São sessões de 45-60 minutos simulando entrevistas e discussões técnicas reais. Dependendo da frente, podem envolver coding, System Design, cases de dados, ML, experimentos ou comunicação comportamental.",
    "faq.q4": "Quanto tempo por semana preciso dedicar?",
    "faq.a4": "Recomendamos 6-10 horas semanais para aproveitar bem as atividades: resolução de problemas, participação em mocks e revisão de material.",
    "faq.q5": "O grupo oferece certificado?",
    "faq.a5": "Sim, participantes ativos recebem certificado de atividade de extensão universitária da USP ao final do semestre.",
    
    // Footer
    "footer.rights": "Todos os direitos reservados.",

    // Login
    "login.badge": "Acesso interno",
    "login.title": "Entrada para pessoas membras do Grind ICMC",
    "login.subtitle": "Esta página é reservada para quem já faz parte do grupo e precisa acessar os materiais, encontros e registros internos. O acesso acontece pelo GitHub usado na organização do Grind.",
    "login.activeMembers.title": "Para membros ativos",
    "login.activeMembers.description": "Entre com a conta GitHub vinculada ao grupo para continuar para a área administrativa.",
    "login.join.title": "Quer participar?",
    "login.join.description": "As novidades do processo seletivo aparecem primeiro nas nossas redes sociais.",
    "login.memberArea.title": "Área de membros",
    "login.memberArea.description": "Se você já é membro do grupo, entre com o GitHub para acessar o ambiente interno. Se ainda não é, acompanhe o Instagram para saber quando abrirem as inscrições para o processo seletivo.",
    "login.error.unauthorized": "Acesso restrito a membros da organização Grind-ICMC no GitHub.",
    "login.config.githubCredentials": "as credenciais OAuth do GitHub",
    "login.config.prefix": "Configure",
    "login.config.suffix": "no servidor e reinicie o Next para ativar o login com GitHub.",
    "login.github": "Entrar com GitHub",
    "login.instagram.description": "Ainda não faz parte? Fique de olho no nosso Instagram para não perder a abertura das próximas inscrições.",

    // Join Page
    "join.title": "Como Participar",
    "join.subtitle": "Entenda como funciona o Grind ICMC e as formas de participar",
    "join.internal.title": "Membros Internos (USP)",
    "join.internal.desc": "O Grind ICMC é um grupo de extensão organizado por alunos da Universidade de São Paulo (USP). Se você é aluno da USP, pode participar ativamente das atividades internas do grupo.",
    "join.external.title": "Público Externo",
    "join.external.desc": "Se você não é aluno da USP, ainda pode fazer parte da nossa comunidade! Disponibilizamos diversos conteúdos e eventos abertos ao público externo.",
    "join.content.title": "Conteúdo Disponível",
    "join.content.youtube": "Vídeos educacionais no YouTube sobre algoritmos, System Design, dados, machine learning, ciência aplicada e carreira",
    "join.content.events": "Eventos abertos como workshops, palestras e lives com profissionais, pesquisadores e alumni",
    "join.content.social": "Dicas e conteúdos nas nossas redes sociais",
    "join.connect.title": "Conecte-se Conosco",
    "join.connect.desc": "Acompanhe nossos canais de comunicação para ficar por dentro de novidades, eventos e conteúdos exclusivos.",
    "join.back": "Voltar para a página inicial",
  },
  en: {
    // Navbar
    "nav.about": "About",
    "nav.tracks": "Tracks",
    "nav.howItWorks": "How It Works",
    "nav.content": "Content",
    "nav.team": "Team",
    "nav.faq": "FAQ",
    "nav.login": "Login",
    
    // Hero
    "hero.tag": "ICMC-USP Extension Group",
    "hero.title": "Prepare for recruiting processes at",
    "hero.titleHighlight": "Leading Tech Companies",
    "hero.subtitle": "ICMC-USP extension group focused on complete preparation for interviews and recruiting processes in technology, data, and AI. We combine algorithms, software engineering, machine learning, data science, applied research, connections, and soft skills to turn study into opportunity.",
    "hero.cta": "Join Us",
    "hero.github": "GitHub",
    
    // About
    "about.title": "About Grind ICMC",
    "about.mission": "Our goal is to bridge the gap between university academic theory and market practice in Engineering and Science, without toxic competitiveness. We believe everyone can improve together.",
    "about.feature1": "Establish a consistent routine",
    "about.feature2": "Practice interviews and technical cases",
    "about.feature3": "Develop efficient technical communication",
    "about.feature4": "Produce public content about technology, data, and AI",
    "about.feature5": "Build repertoire for top companies and research",
    "about.feature6": "Connect with former members (Alumni)",
    
    // Tracks
    "tracks.title": "Study Fronts and Tracks",
    "tracks.desc": "Grind is now organized into two main fronts. Engineering prepares members for systems, ML, and production data. Science prepares members for analysis, experimentation, and applied research.",
    "tracks.starter.title": "Starter Track",
    "tracks.starter.focus": "Focus: Shared foundation",
    "tracks.starter.desc": "Programming fundamentals, statistics, SQL, resumes, and first recruiting processes.",
    "tracks.pro.title": "Pro Track",
    "tracks.pro.focus": "Focus: Advanced practice by front",
    "tracks.pro.desc": "System Design, production ML, Data Science, experimentation, papers, and technical cases.",
    "tracks.softskills.title": "Soft Skills",
    "tracks.softskills.focus": "Focus: Communication and career",
    "tracks.softskills.desc": "Mock interviews, technical storytelling, networking, and career strategy.",
    
    // Content
    "content.title": "Learn from the Community",
    "content.desc": "Check out our YouTube channel with content about interview preparation, problem solving, engineering, data, ML, applied science, and career growth.",
    "content.cta": "View full channel",
    
    // Team
    "team.title": "Our Team",
    "team.currentMembers": "Current Members",
    "team.alumniMembers": "Alumni Members",
    "team.pagination": "Team pagination",
    "team.previous": "Previous",
    "team.next": "Next",
    "team.previousPage": "Go to previous page",
    "team.nextPage": "Go to next page",
    "team.page": "Go to page {page}",

    // ICMC
    "icmc.title": "Institute of Mathematics and Computer Sciences",
    "icmc.desc": "The Institute of Mathematics and Computer Sciences (ICMC) is a unit of the University of São Paulo, located in São Carlos. It is a national and international reference in computing, mathematics, and data science, with a strong tradition in research and technical training of excellence.",
    "icmc.bullet1": "Cutting-edge research in AI and computing",
    "icmc.bullet2": "Alumni in global technology companies",
    "icmc.bullet3": "Collaborative academic environment",
    "icmc.cta": "Learn more about ICMC",
    
    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.q1": "Do I need to be advanced to participate?",
    "faq.a1": "No! Everyone starts somewhere. The Starter, Pro, and Soft Skills layers help each person grow within the front that best matches their goals.",
    "faq.q2": "Is the focus only on LeetCode?",
    "faq.a2": "No. LeetCode remains a useful foundation for some processes, but we are also working on preparation for other areas and recruiting formats, such as technical cases, project discussions, data, ML, applied research, and behavioral interviews.",
    "faq.q3": "How do mock interviews work?",
    "faq.a3": "They are 45-60 minute sessions simulating real interviews and technical discussions. Depending on the front, they may involve coding, System Design, data cases, ML, experiments, or behavioral communication.",
    "faq.q4": "How much time per week do I need to dedicate?",
    "faq.a4": "We recommend 6-10 hours per week to make the most of the activities: problem-solving, participating in mocks, and reviewing material.",
    "faq.q5": "Does the group offer a certificate?",
    "faq.a5": "Yes, active participants receive a university extension activity certificate from USP at the end of the semester.",
    
    // Footer
    "footer.rights": "All rights reserved.",

    // Login
    "login.badge": "Internal access",
    "login.title": "Login for Grind ICMC members",
    "login.subtitle": "This page is reserved for people who are already part of the group and need to access internal materials, meetings, and records. Access uses the GitHub account connected to the Grind organization.",
    "login.activeMembers.title": "For active members",
    "login.activeMembers.description": "Sign in with the GitHub account linked to the group to continue to the admin area.",
    "login.join.title": "Want to join?",
    "login.join.description": "Selection process updates appear first on our social media.",
    "login.memberArea.title": "Members area",
    "login.memberArea.description": "If you are already a group member, sign in with GitHub to access the internal environment. If you are not a member yet, follow Instagram to know when applications open for the selection process.",
    "login.error.unauthorized": "Access is restricted to members of the Grind-ICMC organization on GitHub.",
    "login.config.githubCredentials": "the GitHub OAuth credentials",
    "login.config.prefix": "Configure",
    "login.config.suffix": "on the server and restart Next to enable GitHub login.",
    "login.github": "Sign in with GitHub",
    "login.instagram.description": "Not a member yet? Keep an eye on our Instagram so you do not miss the next application window.",

    // Join Page
    "join.title": "How to Join",
    "join.subtitle": "Understand how Grind ICMC works and ways to participate",
    "join.internal.title": "Internal Members (USP)",
    "join.internal.desc": "Grind ICMC is an extension group organized by students from the University of São Paulo (USP). If you are a USP student, you can actively participate in the group's internal activities.",
    "join.external.title": "External Public",
    "join.external.desc": "If you are not a USP student, you can still be part of our community! We offer various content and events open to the external public.",
    "join.content.title": "Available Content",
    "join.content.youtube": "Educational videos on YouTube about algorithms, System Design, data, machine learning, applied science, and career growth",
    "join.content.events": "Open events like workshops, talks, and lives with professionals, researchers, and alumni",
    "join.content.social": "Tips and content on our social media",
    "join.connect.title": "Connect With Us",
    "join.connect.desc": "Follow our communication channels to stay updated on news, events and exclusive content.",
    "join.back": "Back to home page",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt")

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
