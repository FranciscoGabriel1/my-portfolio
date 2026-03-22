import { Github, Linkedin, Mail, GraduationCap } from "lucide-react";
import type { ComponentType } from "react";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

export interface SocialLink {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub",   href: "https://github.com/FranciscoGabriel1",                    icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/francisco-gabriel-software/", icon: Linkedin },
  { label: "Lattes",   href: "http://lattes.cnpq.br/6111525331943224",                  icon: GraduationCap },
  { label: "Discord",  href: "https://discord.gg/jDjgZUjamz",                           icon: DiscordIcon },
  { label: "Email",    href: "mailto:franciscogabriel.dev@gmail.com",                   icon: Mail },
];
