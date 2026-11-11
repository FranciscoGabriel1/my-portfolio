import Image from "next/image";
import { getMessages, getTranslations } from "next-intl/server";
import { SplitText } from "@/components/motion/SplitText";

const SKILL_GROUPS = ["frontend", "state_tools", "backend_infra", "quality"] as const;
const FACTS = ["location", "education", "now", "product"] as const;

type SkillGroup = (typeof SKILL_GROUPS)[number];

interface AboutMessages {
  about: { skills: Record<SkillGroup, { label: string; items: string[] }> };
}

/** Sobre, de servidor: texto, quatro fatos curtos e competências agrupadas. */
export async function About() {
  const t = await getTranslations("about");
  const tA11y = await getTranslations("accessibility");
  const { about } = (await getMessages()) as unknown as AboutMessages;

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

        <h3 className="type-eyebrow mt-20 lg:mt-28">{t("skills_title")}</h3>
        <div data-reveal="children" className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {SKILL_GROUPS.map((group) => (
            <div key={group} className="border-t border-line pt-6">
              <h4 className="font-display text-xl font-bold text-text">{about.skills[group].label}</h4>
              <ul className="mt-4 flex flex-col gap-1.5 text-text-2">
                {about.skills[group].items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
