"use client"

import { motion } from "motion/react"
import { Fragment } from "react"

import { heroTitle, heroWord } from "@/animations/hero"

interface HeroTitleProps {
  text: string
  id?: string
  className?: string
}

/**
 * H1 tipográfico: palavra por palavra. As palavras são spans reais separados por espaços,
 * então o texto completo está no HTML e é lido uma única vez pelos leitores de tela.
 */
export function HeroTitle({ text, id, className }: HeroTitleProps) {
  const words = text.split(" ")

  return (
    <motion.h1 id={id} className={className} variants={heroTitle} initial="hidden" animate="visible">
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 && " "}
          <motion.span data-motion="" className="inline-block will-change-transform" variants={heroWord}>
            {word}
          </motion.span>
        </Fragment>
      ))}
    </motion.h1>
  )
}
