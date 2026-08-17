"use client"

import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
  FlaskConical,
  Microscope,
  Route,
  Target,
  Users2,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"

export function TracksSection() {
  const { t, language } = useLanguage()

  const fronts = language === "pt"
    ? [
        {
          title: "Engineering",
          kicker: "Frente de engenharia",
          subtitle: "Construir sistemas, modelos e dados em produção",
          description:
            "Para quem quer atuar resolvendo problemas de produto e infraestrutura com código, arquitetura, ML aplicado e dados confiáveis.",
          icon: Code2,
          roles: [
            {
              name: "SWE",
              focus: "Software Engineering",
              icon: Code2,
              topics: [
                "Algoritmos, estruturas de dados e coding interviews",
                "Backend, APIs, arquitetura e qualidade de código",
                "System Design, escalabilidade e trade-offs técnicos",
              ],
            },
            {
              name: "MLE",
              focus: "Machine Learning Engineering",
              icon: BrainCircuit,
              topics: [
                "Treinamento, avaliação e deploy de modelos",
                "Pipelines de ML, feature stores e automação",
                "Monitoramento, confiabilidade e performance em produção",
              ],
            },
            {
              name: "Data Engineering",
              focus: "Infraestrutura e pipelines de dados",
              icon: Database,
              topics: [
                "SQL, modelagem, data warehouses e lakehouses",
                "Pipelines batch/streaming e orquestração",
                "Qualidade, governança e observabilidade de dados",
              ],
            },
          ],
        },
        {
          title: "Science",
          kicker: "Frente científica",
          subtitle: "Transformar dados, experimentos e pesquisa em decisão",
          description:
            "Para quem quer trabalhar com análise, modelagem, experimentação e pesquisa aplicada, conectando rigor técnico a impacto real.",
          icon: FlaskConical,
          roles: [
            {
              name: "Data Science",
              focus: "Análise, métricas e experimentação",
              icon: BarChart3,
              topics: [
                "Estatística, probabilidade e inferência prática",
                "SQL, Python, visualização e storytelling com dados",
                "Métricas de produto, A/B tests e tomada de decisão",
              ],
            },
            {
              name: "Applied Science",
              focus: "Modelagem aplicada a produto",
              icon: BrainCircuit,
              topics: [
                "Formulação de problemas de ML e avaliação offline/online",
                "Recomendação, NLP, ranking e modelos preditivos",
                "Causalidade, experimentos e protótipos de pesquisa aplicada",
              ],
            },
            {
              name: "Research Scientist",
              focus: "Pesquisa, leitura crítica e novos métodos",
              icon: Microscope,
              topics: [
                "Leitura de papers e reprodução de resultados",
                "Matemática, ML avançado e desenho experimental",
                "Comunicação de pesquisa, escrita técnica e seminários",
              ],
            },
          ],
        },
      ]
    : [
        {
          title: "Engineering",
          kicker: "Engineering front",
          subtitle: "Build systems, models, and data in production",
          description:
            "For people who want to solve product and infrastructure problems through code, architecture, applied ML, and reliable data.",
          icon: Code2,
          roles: [
            {
              name: "SWE",
              focus: "Software Engineering",
              icon: Code2,
              topics: [
                "Algorithms, data structures, and coding interviews",
                "Backend, APIs, architecture, and code quality",
                "System Design, scalability, and technical trade-offs",
              ],
            },
            {
              name: "MLE",
              focus: "Machine Learning Engineering",
              icon: BrainCircuit,
              topics: [
                "Model training, evaluation, and deployment",
                "ML pipelines, feature stores, and automation",
                "Monitoring, reliability, and production performance",
              ],
            },
            {
              name: "Data Engineering",
              focus: "Data infrastructure and pipelines",
              icon: Database,
              topics: [
                "SQL, modeling, data warehouses, and lakehouses",
                "Batch/streaming pipelines and orchestration",
                "Data quality, governance, and observability",
              ],
            },
          ],
        },
        {
          title: "Science",
          kicker: "Science front",
          subtitle: "Turn data, experiments, and research into decisions",
          description:
            "For people who want to work with analysis, modeling, experimentation, and applied research, connecting technical rigor to real impact.",
          icon: FlaskConical,
          roles: [
            {
              name: "Data Science",
              focus: "Analysis, metrics, and experimentation",
              icon: BarChart3,
              topics: [
                "Statistics, probability, and practical inference",
                "SQL, Python, visualization, and data storytelling",
                "Product metrics, A/B tests, and decision-making",
              ],
            },
            {
              name: "Applied Science",
              focus: "Product-oriented applied modeling",
              icon: BrainCircuit,
              topics: [
                "ML problem framing and offline/online evaluation",
                "Recommendation, NLP, ranking, and predictive models",
                "Causality, experiments, and applied research prototypes",
              ],
            },
            {
              name: "Research Scientist",
              focus: "Research, critical reading, and new methods",
              icon: Microscope,
              topics: [
                "Paper reading and result reproduction",
                "Mathematics, advanced ML, and experimental design",
                "Research communication, technical writing, and seminars",
              ],
            },
          ],
        },
      ]

  const sharedTracks = language === "pt"
    ? [
        {
          title: "Starter",
          focus: "Base comum",
          description:
            "Fundamentos para entrar no ritmo: programação, estatística básica, SQL, currículo e primeiros processos.",
          icon: Route,
        },
        {
          title: "Pro",
          focus: "Aprofundamento",
          description:
            "Conteúdos avançados por frente: system design, ML em produção, experimentação, papers e cases técnicos.",
          icon: Target,
        },
        {
          title: "Soft Skills",
          focus: "Comunicação e carreira",
          description:
            "Mock interviews, clareza de raciocínio, storytelling técnico, networking e entendimento de processos end-to-end.",
          icon: Users2,
        },
      ]
    : [
        {
          title: "Starter",
          focus: "Shared foundation",
          description:
            "Core skills to build momentum: programming, basic statistics, SQL, resumes, and first recruiting processes.",
          icon: Route,
        },
        {
          title: "Pro",
          focus: "Advanced practice",
          description:
            "Advanced content by front: system design, production ML, experimentation, papers, and technical cases.",
          icon: Target,
        },
        {
          title: "Soft Skills",
          focus: "Communication and career",
          description:
            "Mock interviews, clear reasoning, technical storytelling, networking, and end-to-end process awareness.",
          icon: Users2,
        },
      ]

  return (
    <section id="tracks" className="py-12 lg:py-20 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("tracks.title")}
          </h2>
          <div className="mt-2 mx-auto w-24 h-1 bg-primary rounded-full" />
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
            {t("tracks.desc")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {fronts.map((front) => {
            const FrontIcon = front.icon

            return (
              <article
                key={front.title}
                className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FrontIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary">
                      {front.kicker}
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-foreground">
                      {front.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      {front.subtitle}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-muted-foreground leading-relaxed">
                  {front.description}
                </p>

                <div className="mt-8 space-y-6">
                  {front.roles.map((role) => {
                    const RoleIcon = role.icon

                    return (
                      <div
                        key={role.name}
                        className="border-t border-border/70 pt-5 first:border-t-0 first:pt-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <RoleIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {role.name}
                            </h4>
                            <p className="text-sm text-primary">
                              {role.focus}
                            </p>
                          </div>
                        </div>
                        <ul className="mt-4 space-y-2">
                          {role.topics.map((topic) => (
                            <li
                              key={topic}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-12">
          <div className="mb-6 max-w-3xl">
            <p className="text-sm font-semibold uppercase text-primary">
              {language === "pt" ? "Camadas transversais" : "Shared layers"}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {language === "pt"
                ? "Starter, Pro e Soft Skills seguem como trilhas de apoio"
                : "Starter, Pro, and Soft Skills remain support tracks"}
            </h3>
            <p className="mt-3 text-muted-foreground">
              {language === "pt"
                ? "Cada pessoa escolhe uma frente principal, mas evolui por camadas que se adaptam ao nível, ao objetivo e ao processo seletivo que está mirando."
                : "Each member chooses a main front, then progresses through layers that adapt to their level, goal, and target recruiting process."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {sharedTracks.map((track) => {
              const TrackIcon = track.icon

              return (
                <article
                  key={track.title}
                  className="rounded-xl border border-border bg-background/50 p-6 transition-all hover:border-primary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TrackIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {track.title}
                      </h4>
                      <p className="text-sm text-primary">{track.focus}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {track.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
