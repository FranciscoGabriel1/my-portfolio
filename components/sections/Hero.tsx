import { preload } from "react-dom";
import { ArrowRight, Download } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SplitText } from "@/components/motion/SplitText";
import { buttonVariants } from "@/components/ui/Button";
import { BUILT_AT } from "@/lib/content/career";
import { CV_URL } from "@/lib/cv";

/**
 * Hero de servidor: HTML completo e final sem JavaScript. Só o nome anima (CSS, ao carregar).
 * A imagem dos blocos é decorativa e é a versão sem 3D; a change cena-3d-montagem monta o canvas por cima.
 */
export async function Hero() {
  const t = await getTranslations("hero");
  const tA11y = await getTranslations("accessibility");
  const locale = await getLocale();
  const cvUrl = CV_URL[locale] ?? CV_URL.en;
  // A cena é o elemento de LCP. Todo visitante novo entra no tema escuro (padrão), então a versão
  // escura é pré-carregada com prioridade alta; quem escolheu o claro baixa 34 kB a mais, uma vez.
  preload("/images/scene/blocks-dark.webp", { as: "image", fetchPriority: "high" });

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="flex min-h-[calc(100svh-var(--header-h))] flex-col"
    >
      <div className="container-site grid flex-1 items-center gap-10 py-16 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-7">
          <p className="type-eyebrow flex items-center gap-2.5 text-text-2">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-ok" />
            {t("status")}
          </p>

          <SplitText
            as="h1"
            id="hero-title"
            mode="load"
            text={t("name")}
            className="type-giant max-w-[9ch] text-text"
          />

          <p className="type-lead max-w-[60ch]">{t("tagline")}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#projects" className={buttonVariants({ variant: "primary", size: "lg" })}>
              <ArrowRight className="h-4 w-4" aria-hidden />
              {t("cta_projects")}
            </a>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("cta_cv")}
              <span className="sr-only"> ({tA11y("open_link_new_tab")})</span>
            </a>
          </div>
        </div>

        {/* Cena decorativa, versão sem 3D. Fundo em CSS (.hero-scene em globals.css): o navegador baixa
            só a imagem do tema ativo e a descobre junto com o CSS, sem atrasar o LCP. */}
        <div aria-hidden="true" className="hero-scene mx-auto w-full max-w-[34rem] lg:max-w-none" />
      </div>

      <div className="border-y border-line">
        <div className="container-site flex flex-wrap items-center gap-x-7 gap-y-3 py-5">
          <p className="type-eyebrow">{t("built_label")}</p>
          <ul aria-label={t("built_label")} className="flex flex-wrap gap-x-7 gap-y-2 font-display text-lg font-bold text-text-2">
            {BUILT_AT.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
