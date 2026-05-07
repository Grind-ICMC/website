"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useLanguage } from "@/components/language-context"

const faqItems = [
  { question: "faq.q1", answer: "faq.a1" },
  { question: "faq.q2", answer: "faq.a2" },
  { question: "faq.q3", answer: "faq.a3" },
  { question: "faq.q4", answer: "faq.a4" },
  { question: "faq.q5", answer: "faq.a5" },
]

export function FAQSection() {
  const { t } = useLanguage()

  return (
    <section id="faq" className="py-12 lg:py-20 bg-card/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("faq.title")}
          </h2>
          <div className="mt-2 mx-auto w-24 h-1 bg-primary rounded-full" />
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-xl border border-border bg-card/30 px-6 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                {t(item.question)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {t(item.answer)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
