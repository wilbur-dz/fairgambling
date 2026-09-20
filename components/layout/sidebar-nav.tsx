"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DollarSign, MessageCircle } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { Icon } from "@/components/ui/icon";
import { useSidebar } from "@/components/layout/sidebar-provider";
import {
  NAV_SECTIONS,
  SOCIAL_LINKS,
  isPathActive,
  sectionHasActivePath,
  type NavLinkItem,
  type NavSection,
  type NavSubSection,
} from "@/lib/navigation";

type SidebarNavProps = {
  rounded?: string;
  variant?: "desktop" | "mobile";
};

function NavItem({
  href,
  icon,
  label,
  badge,
  external,
  collapsed = false,
}: NavLinkItem & { collapsed?: boolean }) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const active = isPathActive(href, pathname);

  return (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-[rgba(142,142,255,0.14)] text-[#8874ff]"
          : "text-[#2a274e] hover:bg-[rgba(142,142,255,0.14)] dark:text-white"
      }`}
    >
      <Icon name={icon} size={18} />
      {!collapsed && <span>{label}</span>}
      {!collapsed && badge ? (
        <span className="ml-auto shrink-0 rounded-full bg-[#8874ff]/15 px-2 py-0.5 text-[10px] font-semibold leading-none text-[#8874ff] ring-1 ring-inset ring-[#8874ff]/25 dark:text-[#b3a7ff]">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavItemWithChildren({ item }: { item: NavLinkItem }) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const active = isPathActive(item.href, pathname);
  const childActive =
    item.children?.some((child) => isPathActive(child.href, pathname)) ?? false;
  const [expanded, setExpanded] = useState(active || childActive);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center rounded-md pr-1 transition-colors ${
          active
            ? "bg-[rgba(142,142,255,0.14)]"
            : "hover:bg-[rgba(142,142,255,0.14)]"
        }`}
      >
        <Link
          href={item.href}
          onClick={() => setOpen(false)}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          aria-current={active ? "page" : undefined}
          className={`flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
            active ? "text-[#8874ff]" : "text-[#2a274e] dark:text-white"
          }`}
        >
          <Icon name={item.icon} size={18} />
          <span>{item.label}</span>
        </Link>
        <button
          type="button"
          aria-label={expanded ? "Collapse" : "Expand"}
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#2a274e]/50 transition-colors hover:text-[#2a274e] dark:text-white/50 dark:hover:text-white"
        >
          <Icon
            name="chevron-down"
            size={16}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {expanded && item.children ? (
        <div className="ml-4 flex flex-col gap-1 pl-2">
          {item.children.map((child) => (
            <NavItem key={child.href} {...child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CollapsedSection({ section }: { section: NavSection }) {
  return (
    <div className="flex flex-col gap-1">
      <hr className="border-0 border-t border-[#2a274e]/10 dark:border-white/10" />
      {section.items.flatMap((item) => [
        <NavItem key={item.href} {...item} collapsed />,
        ...(item.children ?? []).map((child) => (
          <NavItem key={child.href} {...child} collapsed />
        )),
      ])}
      {section.sub?.items.map((item) => (
        <NavItem key={item.href} {...item} collapsed />
      ))}
    </div>
  );
}

function SubSectionToggle({
  sub,
  open,
  onToggle,
}: {
  sub: NavSubSection;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-[#2a274e] transition-colors hover:bg-[rgba(142,142,255,0.14)] dark:text-white"
    >
      <span className="flex items-center gap-3">
        <Icon name={sub.icon} size={18} />
        <span>{sub.label}</span>
      </span>
      <Icon
        name="chevron-down"
        size={16}
        className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function NavSectionBlock({
  section,
  open,
  onToggle,
  subOpen,
  onSubToggle,
}: {
  section: NavSection;
  open: boolean;
  onToggle: () => void;
  subOpen: boolean;
  onSubToggle: () => void;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 py-1 text-[#637083] transition-colors hover:text-[#8a96a8]"
      >
        <span className="shrink-0 text-[11px] font-semibold uppercase leading-[16.5px] tracking-[0.55px]">
          {section.label}
        </span>
        <span className="h-px flex-1 bg-[#2a274e]/10 dark:bg-white/10" />
        <Icon
          name="chevron-down"
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <nav className="mt-1 flex flex-col gap-1">
          {section.items.map((item) =>
            item.children ? (
              <NavItemWithChildren key={item.href} item={item} />
            ) : (
              <NavItem key={item.href} {...item} />
            ),
          )}
          {section.sub ? (
            <>
              <SubSectionToggle
                sub={section.sub}
                open={subOpen}
                onToggle={onSubToggle}
              />
              {subOpen ? (
                <div className="ml-4 flex flex-col gap-1 pl-2">
                  {section.sub.items.map((item) => (
                    <NavItem key={item.href} {...item} />
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

function openSupport() {
  const intercom = (
    window as Window & { Intercom?: (command: string) => void }
  ).Intercom;
  if (typeof intercom === "function") {
    intercom("show");
  }
}

export function SidebarNav({
  rounded = "rounded-[23px]",
  variant = "desktop",
}: SidebarNavProps) {
  const pathname = usePathname();
  const { setOpen, collapsed, toggleCollapsed } = useSidebar();
  const isCollapsed = variant === "desktop" && collapsed;
  const onToggleClick = variant === "mobile" ? () => setOpen(false) : toggleCollapsed;
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const isSectionOpen = (section: NavSection) =>
    openMap[section.label] ??
    (section.defaultOpen ||
      section.items.some((item) => isPathActive(item.href, pathname)) ||
      (!!section.sub && sectionHasActivePath(section.sub, pathname)));

  const isSubOpen = (sub: NavSubSection) =>
    openMap[sub.label] ?? sectionHasActivePath(sub, pathname);

  const toggleKey = (key: string, currentlyOpen: boolean) => {
    setOpenMap((prev) => ({ ...prev, [key]: !currentlyOpen }));
  };

  return (
    <div
      className={`light-element dark-element relative flex h-full flex-col p-[16.5px] ${rounded}`}
    >
      <div
        className={`flex items-start pb-3 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expand menu"
            className="flex shrink-0 cursor-pointer items-center justify-center"
          >
            <BrandMark priority />
          </button>
        ) : (
          <>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
            >
              <BrandMark priority />
              <Image
                src="/icons/fairgambling-logo.svg"
                alt="FairGambling"
                width={116}
                height={15}
                style={{ height: "auto" }}
                className="dark:hidden"
              />
              <Image
                src="/icons/fairgambling-logo-dark.svg"
                alt=""
                width={116}
                height={15}
                style={{ height: "auto" }}
                className="hidden dark:block"
              />
            </Link>
            <button
              type="button"
              onClick={onToggleClick}
              aria-label="Collapse menu"
              className="flex items-center justify-center rounded-lg p-1.5 text-[#2a274e]/60 transition-colors hover:text-[#2a274e]/90 dark:text-white/40 dark:hover:text-white/70"
            >
              <Icon name="sidebar-toggle-icon" size={18} />
            </button>
          </>
        )}
      </div>

      <div className="scrollbar-hide flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden border-t border-[#2a274e]/10 pt-4 dark:border-white/10">
        <nav className="flex flex-col gap-4">
          <NavItem href="/" icon="home-icon" label="Home" collapsed={isCollapsed} />
          {NAV_SECTIONS.map((section) =>
            isCollapsed ? (
              <CollapsedSection key={section.label} section={section} />
            ) : (
              <NavSectionBlock
                key={section.label}
                section={section}
                open={isSectionOpen(section)}
                onToggle={() =>
                  toggleKey(section.label, isSectionOpen(section))
                }
                subOpen={!!section.sub && isSubOpen(section.sub)}
                onSubToggle={() =>
                  section.sub &&
                  toggleKey(section.sub.label, isSubOpen(section.sub))
                }
              />
            ),
          )}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-[#2a274e]/10 pt-[21px] dark:border-[#eaecf0]/10">
        <Link
          href="/affiliate"
          onClick={() => setOpen(false)}
          title={isCollapsed ? "Earn Extra Rewards" : undefined}
          className={`flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-[#8874ff] to-[#5105a1] text-sm font-medium text-white shadow-[0_0_28px_0_rgba(153,51,229,0.3),0_0_4px_0_rgba(184,71,255,0.5)] transition-transform hover:scale-[1.01] ${
            isCollapsed ? "p-3" : "px-8 py-3"
          }`}
        >
          <DollarSign size={16} className="shrink-0" />
          {!isCollapsed ? <span>Earn Extra Rewards</span> : null}
        </Link>

        <button
          type="button"
          onClick={openSupport}
          className={`flex w-full items-center justify-center gap-1.5 rounded-full border-[0.5px] border-[#2a274e]/15 bg-[rgba(142,142,255,0.04)] text-sm font-medium text-[#2a274e]/60 transition-colors hover:bg-[rgba(142,142,255,0.08)] hover:text-[#2a274e] dark:border-white/20 dark:text-white/50 dark:hover:text-white/70 ${
            isCollapsed ? "p-3" : "px-8 py-3"
          }`}
          title="Support"
        >
          <MessageCircle size={16} className="shrink-0" />
          {!isCollapsed ? <span>Support</span> : null}
        </button>

        <div
          className={`flex items-center justify-center gap-3 ${
            isCollapsed ? "flex-wrap" : ""
          }`}
        >
          {SOCIAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#2a274e] transition-colors hover:bg-[#2a274e]/5 dark:text-white dark:hover:bg-white/[0.06]"
              aria-label={link.label}
              title={link.label}
            >
              <Icon name={link.icon} size={16} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
