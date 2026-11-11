import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SplitText } from "@/components/motion/SplitText";
import { FEATURED_PROJECT_ID, PROJECTS, type Project } from "@/lib/content/projects";

const pad = (n: number) => String(n).padStart(2, "0");

/** Projetos, de servidor: um caso em destaque e os demais em lista numerada. */
export async function Projects() {
  const t = await getTranslations("projects");
  const tA11y = await getTranslations("accessibility");
  const newTab = tA11y("open_link_new_tab");

  const featured = PROJECTS.find((p) => p.id === FEATURED_PROJECT_ID) ?? PROJECTS[0];
  const others = PROJECTS.filter((p) => p.id !== featured.id);
  const item = (p: Project, key: string) => t(`items.${p.id}.${key}`);

  return (
    <section id="projects" aria-labelledby="projects-title" className="band py-24 lg:py-40">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <div>
            <p className="type-eyebrow mb-5 text-accent-text">
              <span aria-hidden="true">03 — </span>
              {t("label")}
            </p>
            <SplitText id="projects-title" text={t("title")} className="type-display text-text" />
          </div>
          <p className="type-lead">{t("subtitle")}</p>
        </div>

        <article
          aria-labelledby={`project-${featured.id}`}
          data-reveal="self"
          className="mt-16 flex flex-col gap-5 lg:mt-24 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16"
        >
          {/* No celular, o bloco de texto se desfaz (contents) para a imagem entrar logo após o título. */}
          <div className="contents lg:flex lg:flex-col lg:gap-5">
            <p className="type-eyebrow order-first">
              <span aria-hidden="true">01 · </span>
              {item(featured, "context")}
            </p>
            <h3 id={`project-${featured.id}`} className="type-title order-first text-text">
              {item(featured, "title")}
            </h3>
            <p className="text-lg leading-relaxed text-text-2">{item(featured, "description")}</p>

            {t.has(`items.${featured.id}.did`) && (
              <dl className="border-t border-line pt-4">
                <dt className="type-eyebrow">{t("did_label")}</dt>
                <dd className="mt-2 leading-relaxed text-text">{item(featured, "did")}</dd>
              </dl>
            )}

            <p className="type-eyebrow leading-relaxed">{featured.stack.join(" · ")}</p>

            {featured.url && (
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-md font-semibold text-accent-text underline-offset-4 hover:underline"
              >
                {t("visit")}
                <span className="sr-only">
                  {" — "}
                  {item(featured, "title")} ({newTab})
                </span>
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>

          <div className="order-first my-3 overflow-hidden rounded-2xl border border-line bg-surface lg:order-none lg:my-0">
            <Image
              src={featured.image.src}
              alt={t.has(`items.${featured.id}.image_alt`) ? item(featured, "image_alt") : ""}
              width={featured.image.width}
              height={featured.image.height}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[16/10] h-auto w-full object-cover object-top-left"
            />
          </div>
        </article>

        <h3 className="type-eyebrow mt-20 lg:mt-28">{t("others_label")}</h3>
        <ol data-reveal="children" className="mt-6 border-t border-line">
          {others.map((project, index) => {
            const href = project.url ?? project.github;
            const title = item(project, "title");
            return (
              <li
                key={project.id}
                className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-5 gap-y-1 border-b border-line py-5 transition-colors hover:bg-surface lg:grid-cols-[3rem_minmax(0,1fr)_auto_auto] lg:py-6"
              >
                <span aria-hidden="true" className="font-mono text-[0.78rem] text-text-3">
                  {pad(index + 2)}
                </span>
                <div className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-5">
                  <h4 className="font-display text-xl font-bold text-text lg:text-2xl">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md after:absolute after:inset-0 after:content-['']"
                      >
                        {title}
                        <span className="sr-only">
                          {" "}
                          ({project.url ? newTab : `${t("code")}, ${newTab}`})
                        </span>
                      </a>
                    ) : (
                      title
                    )}
                  </h4>
                  <p className="text-text-2">{item(project, "context")}</p>
                </div>
                <p className="type-eyebrow col-start-2 row-start-2 lg:col-start-auto lg:row-start-auto">
                  {project.stack.join(" · ")}
                </p>
                {href && (
                  <ArrowUpRight
                    aria-hidden
                    className="col-start-3 row-span-2 row-start-1 h-5 w-5 text-text-2 transition-transform group-hover:text-accent-text motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 lg:col-start-auto lg:row-span-1 lg:row-start-auto"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
