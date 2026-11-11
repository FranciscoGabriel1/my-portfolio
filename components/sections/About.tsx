import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SplitText } from "@/components/motion/SplitText";
import { Skills } from "@/components/sections/Skills";

const FACTS = ["location", "education", "now", "product"] as const;

/** Sobre, de servidor: texto, quatro fatos curtos e competências (components/sections/Skills.tsx). */
export async function About() {
  const t = await getTranslations("about");
  const tA11y = await getTranslations("accessibility");

  return (
    <section id="about" aria-labelledby="about-title" className="band-alt py-24 lg:py-40">
      <div className="container-site">
        <p className="type-eyebrow mb-5 text-accent-text">
          <span aria-hidden="true">02 — </span>
          {t("label")}
        </p>
        <SplitText id="about-title" text={t("title")} className="type-display max-w-[30ch] text-text" />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <div data-reveal="self" className="overflow-hidden rounded-xl border border-line">
            <Image
              src="/images/profile.jpeg"
              alt={tA11y("profile_photo_alt")}
              width={719}
              height={1280}
              sizes="(min-width: 1024px) 22rem, 100vw"
              className="aspect-[4/5] h-auto w-full object-cover object-top"
            />
          </div>

          <div data-reveal="children" className="flex flex-col gap-6">
            <p className="text-xl leading-relaxed text-text">{t("lead")}</p>
            <p className="leading-relaxed text-text-2">{t("bio_1")}</p>
            <p className="leading-relaxed text-text-2">{t("bio_2")}</p>

            <dl className="mt-4 grid gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
              {FACTS.map((fact) => (
                <div
                  key={fact}
                  className="flex items-baseline justify-between gap-4 border-t border-line py-4 sm:block"
                >
                  <dt className="type-eyebrow">{t(`facts.${fact}_label`)}</dt>
                  <dd className="text-right font-semibold text-text sm:mt-2 sm:text-left">
                    {t(`facts.${fact}`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <Skills />
      </div>
    </section>
  );
}
