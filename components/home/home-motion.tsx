"use client"

import { useEffect } from "react"

/** The HTML stays complete and usable before this optional layer loads. */
export function HomeMotion({ language }: { language: "fr" | "ar" }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".dz-home")
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let cancelled = false
    let revert: (() => void) | undefined

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, triggerModule]) => {
      if (cancelled) return
      const gsap = gsapModule.gsap
      const ScrollTrigger = triggerModule.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      const media = gsap.matchMedia()
      revert = () => media.revert()
      const revealHeadings = (duration: number, yPercent: number) => {
        root.querySelectorAll<HTMLElement>("[data-dz-reveal]").forEach((heading) => {
          gsap.from(heading, {
            yPercent,
            duration,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heading.closest(".dz-scene") ?? heading,
              start: "top 78%",
              once: true,
            },
          })
        })
      }

      media.add("(min-width: 851px) and (prefers-reduced-motion: no-preference)", () => {
        revealHeadings(0.85, 105)

        const neighborhood = root.querySelector<HTMLElement>(".dz-neighborhood")
        const neighborhoodImage = root.querySelector<HTMLElement>(".dz-neighborhood-image")
        if (neighborhood && neighborhoodImage) {
          gsap.to(neighborhoodImage, {
            y: -26,
            rotationZ: language === "ar" ? -1.3 : 1.3,
            ease: "none",
            scrollTrigger: { trigger: ".dz-hero", start: "top top", end: "bottom top", scrub: 0.8 },
          })
        }
        gsap.from(root.querySelectorAll("[data-dz-float]"), { opacity: 0, y: 12, duration: 0.55, stagger: 0.12, delay: 0.18, ease: "power2.out" })

        root.querySelectorAll<HTMLElement>("[data-dz-photo]").forEach((card, index) => {
          gsap.from(card, {
            clipPath: "inset(12% 0 0 0 round 7px)",
            y: 35,
            opacity: 0,
            duration: 0.95,
            delay: index * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 87%", once: true },
          })
          const image = card.querySelector(".dz-life-image")
          if (image) gsap.fromTo(image, { yPercent: -3 }, {
            yPercent: 3,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.7 },
          })
        })

        const cards = root.querySelectorAll<HTMLElement>("[data-dz-category]")
        if (cards.length) {
          gsap.from(cards, {
            autoAlpha: 0,
            x: language === "ar" ? -24 : 24,
            duration: 0.66,
            stagger: 0.075,
            ease: "power2.out",
            scrollTrigger: { trigger: ".dz-category-grid", start: "top 80%", once: true },
          })
        }

        const preview = root.querySelector<HTMLElement>(".dz-preview-browser")
        if (preview) {
          gsap.from(preview, {
            autoAlpha: 0,
            y: 32,
            rotationX: 9,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: ".dz-business", start: "top 65%", once: true },
          })
        }

        const discovery = root.querySelector<HTMLElement>(".dz-place-artwork-image")
        if (discovery) {
          gsap.fromTo(discovery, { y: 16, rotationZ: -1 }, {
            y: -16,
            rotationZ: 1,
            ease: "none",
            scrollTrigger: { trigger: ".dz-place", start: "top bottom", end: "bottom top", scrub: 0.7 },
          })
        }

        const benefits = root.querySelectorAll<HTMLElement>(".dz-benefit")
        if (benefits.length === 2) {
          gsap.from(benefits[0], { x: language === "ar" ? 18 : -18, autoAlpha: 0, duration: 0.68, ease: "power2.out", scrollTrigger: { trigger: ".dz-benefits", start: "top 72%", once: true } })
          gsap.from(benefits[1], { x: language === "ar" ? -18 : 18, autoAlpha: 0, duration: 0.68, ease: "power2.out", scrollTrigger: { trigger: ".dz-benefits", start: "top 72%", once: true } })
        }
        root.querySelectorAll<HTMLElement>(".dz-journey-steps").forEach((steps) => {
          gsap.from(steps.querySelectorAll("li"), { opacity: 0, y: 12, duration: 0.5, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: steps, start: "top 85%", once: true } })
        })
        gsap.from(root.querySelector<HTMLElement>(".dz-final-orbit"), {
          scale: 0.86,
          opacity: 0.35,
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".dz-final", start: "top 80%", once: true },
        })
      })

      media.add("(max-width: 850px) and (prefers-reduced-motion: no-preference)", () => {
        revealHeadings(0.42, 35)
        root.querySelectorAll<HTMLElement>("[data-dz-photo]").forEach((photo) => {
          gsap.from(photo, { opacity: 0, y: 14, duration: 0.5, ease: "power2.out", scrollTrigger: { trigger: photo, start: "top 92%", once: true } })
        })
        const cards = root.querySelectorAll<HTMLElement>("[data-dz-category]")
        if (cards.length) {
          gsap.from(cards, {
            autoAlpha: 0,
            y: 12,
            duration: 0.4,
            stagger: 0.045,
            ease: "power2.out",
            scrollTrigger: { trigger: ".dz-category-grid", start: "top 84%", once: true },
          })
        }
      })

      ScrollTrigger.refresh()
      void document.fonts.ready.then(() => { if (!cancelled) ScrollTrigger.refresh() })
    }).catch((error) => {
      revert?.()
      console.error("DzairBox motion could not start:", error)
    })

    return () => {
      cancelled = true
      revert?.()
    }
  }, [language])

  return null
}
