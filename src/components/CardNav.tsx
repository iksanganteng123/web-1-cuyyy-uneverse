import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import "./CardNav.css";

export interface CardNavLink {
  label: string;
  href?: string;
  ariaLabel?: string;
}

export interface CardNavItem {
  label: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
  links: CardNavLink[];
}

export interface CardNavProps {
  items?: CardNavItem[];
  logo?: string | ReactNode;
  logoAlt?: string;
  logoHref?: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  };
  theme?: "dark" | "light";
  surface?: "glass" | "solid";
  openOn?: "click" | "hover";
  cardEffect?: "rise" | "unfold" | "fade";
  stagger?: number;
  bounce?: number;
  speed?: number;
  cardHeight?: number;
  maxWidth?: number;
  accentColor?: string;
  menuLabel?: boolean;
  intro?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  linkComponent?: ElementType;
  onLinkClick?: (
    link: CardNavLink,
    item: CardNavItem,
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

type ThemeVariables = CSSProperties & Record<`--${string}`, string>;

const THEMES = {
  dark: {
    "--cn-panel": "rgba(38, 35, 46, 0.72)",
    "--cn-solid": "#26232e",
    "--cn-edge": "rgba(255, 255, 255, 0.08)",
    "--cn-highlight": "rgba(255, 255, 255, 0.07)",
    "--cn-shadow":
      "0 24px 48px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)",
    "--cn-text": "#f4f4f5",
    "--cn-muted": "rgba(244, 244, 245, 0.56)",
    "--cn-hover": "rgba(255, 255, 255, 0.06)",
    "--cn-ring": "rgba(244, 244, 245, 0.55)",
    "--cn-tile": "linear-gradient(180deg, #34303d 0%, #27242f 100%)",
    "--cn-tile-rim":
      "inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 10px -4px rgba(0, 0, 0, 0.6)",
    "--cn-cta": "linear-gradient(180deg, #ffffff 0%, #ebebf0 100%)",
    "--cn-cta-ink": "#121016",
    "--cn-cta-shadow":
      "inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 6px 16px -6px rgba(0, 0, 0, 0.6)",
    "--cn-cta-hover": "brightness(0.94)",
  },
  light: {
    "--cn-panel": "rgba(244, 244, 246, 0.84)",
    "--cn-solid": "#f4f4f6",
    "--cn-edge": "rgba(24, 24, 27, 0.07)",
    "--cn-highlight": "rgba(255, 255, 255, 0.95)",
    "--cn-shadow":
      "0 24px 48px -24px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)",
    "--cn-text": "#18181b",
    "--cn-muted": "rgba(24, 24, 27, 0.56)",
    "--cn-hover": "rgba(24, 24, 27, 0.05)",
    "--cn-ring": "rgba(24, 24, 27, 0.45)",
    "--cn-tile": "linear-gradient(180deg, #ffffff 0%, #f8f8fa 100%)",
    "--cn-tile-rim":
      "inset 0 0 0 1px rgba(24, 24, 27, 0.07), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(24, 24, 27, 0.22)",
    "--cn-cta": "linear-gradient(180deg, #2c2c31 0%, #18181b 100%)",
    "--cn-cta-ink": "#ffffff",
    "--cn-cta-shadow":
      "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 6px 14px -6px rgba(24, 24, 27, 0.45)",
    "--cn-cta-hover": "brightness(1.25)",
  },
} satisfies Record<"dark" | "light", ThemeVariables>;

const DEFAULT_ITEMS: CardNavItem[] = [
  {
    label: "About",
    description: "The people and the story behind the studio.",
    links: [
      { label: "Company", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    label: "Projects",
    description: "Selected work from the last few years.",
    links: [
      { label: "Featured", href: "#" },
      { label: "Case studies", href: "#" },
    ],
  },
  {
    label: "Contact",
    description: "Say hello, we read everything.",
    links: [
      { label: "Email", href: "#" },
      { label: "X", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];

const NARROW = 560;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;

const contrastInk = (color: string) => {
  const hex = color.trim().replace("#", "");
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((character) => character + character)
          .join("")
      : hex;
  const channel = (index: number) => {
    const value = Number.parseInt(full.slice(index, index + 2), 16) / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance > 0.36 ? "#121016" : "#ffffff";
};

const CardNav = ({
  logo,
  logoAlt = "Logo",
  logoHref = "#",
  items = DEFAULT_ITEMS,
  cta,
  theme = "dark",
  surface = "glass",
  openOn = "click",
  cardEffect = "rise",
  stagger = 0.12,
  bounce = 0.2,
  speed = 1,
  cardHeight = 176,
  maxWidth = 800,
  accentColor,
  menuLabel = true,
  intro = true,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  linkComponent: LinkComponent = "a",
  onLinkClick,
  ariaLabel = "Main",
  className = "",
  style,
}: CardNavProps) => {
  const contentId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const engineRef = useRef<{
    wake: () => void;
    refresh: () => void;
  } | null>(null);
  const leaveRef = useRef<number>(0);
  const barRef = useRef<HTMLDivElement>(null);
  const introRef = useRef(intro);
  const [openState, setOpenState] = useState(defaultOpen);
  const [narrow, setNarrow] = useState(false);

  const controlled = openProp !== undefined;
  const hasCta = Boolean(cta);
  const open = controlled ? openProp : openState;
  const settingsRef = useRef({ open, cardEffect, stagger, bounce, speed });
  useLayoutEffect(() => {
    settingsRef.current = { open, cardEffect, stagger, bounce, speed };
  }, [open, cardEffect, stagger, bounce, speed]);

  const palette = THEMES[theme];
  const vars: ThemeVariables = {
    ...palette,
    "--cn-max": `${maxWidth}px`,
    "--cn-bar": "60px",
    "--cn-inset": "8px",
    "--cn-gap": "8px",
    "--cn-radius": "18px",
    "--cn-logo": "24px",
    "--cn-card": `${cardHeight}px`,
  };
  if (surface === "glass") vars["--cn-blur"] = "blur(20px) saturate(1.6)";
  if (surface === "solid") {
    vars["--cn-panel"] = palette["--cn-solid"];
    vars["--cn-blur"] = "none";
  }
  if (accentColor) {
    vars["--cn-cta"] = accentColor;
    vars["--cn-cta-ink"] = contrastInk(accentColor) ?? "#ffffff";
    vars["--cn-cta-shadow"] =
      "inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 16px -6px rgba(0, 0, 0, 0.45)";
    vars["--cn-cta-hover"] = "brightness(1.08)";
  }

  const setOpen = (next: boolean) => {
    if (next === open) return;
    if (!controlled) setOpenState(next);
    onOpenChange?.(next);
  };
  const setOpenRef = useRef(setOpen);
  useLayoutEffect(() => {
    setOpenRef.current = setOpen;
  });

  useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const state = {
      progress: settingsRef.current.open ? 1 : 0,
      velocity: 0,
      height: content.offsetHeight,
      bar: 60,
    };
    let animationFrame = 0;
    let lastFrame = 0;

    const render = () => {
      const settings = settingsRef.current;
      state.bar =
        Number.parseFloat(
          getComputedStyle(panel).getPropertyValue("--cn-bar"),
        ) || 60;
      panel.style.height = `${state.bar + Math.max(0, state.progress) * state.height}px`;
      content.style.visibility =
        settings.open || state.progress > 0 ? "visible" : "hidden";

      const cards = cardRefs.current.filter(
        (card): card is HTMLElement => card !== null,
      );
      const lag =
        cards.length > 1
          ? Math.min(settings.stagger, 0.7 / (cards.length - 1))
          : 0;
      const span = 1 - lag * (cards.length - 1);
      cards.forEach((card, index) => {
        const local = clamp(
          (state.progress - index * lag) / Math.max(span, 0.05),
          0,
          1,
        );
        const progress = easeOut(local);
        if (settings.cardEffect === "unfold") {
          card.style.transform = `translateY(${(1 - progress) * -10}px) rotateX(${(1 - progress) * -72}deg)`;
          card.style.opacity = `${clamp(local * 1.8, 0, 1)}`;
          card.style.filter = "";
        } else if (settings.cardEffect === "fade") {
          card.style.transform = `translateY(${(1 - progress) * 6}px)`;
          card.style.opacity = `${progress}`;
          card.style.filter =
            progress < 0.999 ? `blur(${(1 - progress) * 6}px)` : "";
        } else {
          card.style.transform = `translateY(${(1 - progress) * 26}px) scale(${0.97 + 0.03 * progress})`;
          card.style.opacity = `${progress}`;
          card.style.filter = "";
        }
      });
    };

    const tick = (now: number) => {
      animationFrame = 0;
      const settings = settingsRef.current;
      const delta = lastFrame
        ? Math.min(0.05, (now - lastFrame) / 1000)
        : 1 / 60;
      lastFrame = now;
      const target = settings.open ? 1 : 0;

      if (reduce) {
        state.progress = target;
        state.velocity = 0;
      } else {
        const stiffness = 160 * settings.speed * settings.speed;
        const damping = settings.open ? 1 - 0.68 * settings.bounce : 1;
        const steps = Math.ceil(delta / (1 / 240));
        const step = delta / steps;
        for (let index = 0; index < steps; index += 1) {
          state.velocity +=
            (-stiffness * (state.progress - target) -
              2 * damping * Math.sqrt(stiffness) * state.velocity) *
            step;
          state.progress += state.velocity * step;
        }
      }

      const done =
        Math.abs(state.progress - target) < 0.0005 &&
        Math.abs(state.velocity) < 0.002;
      if (done) {
        state.progress = target;
        state.velocity = 0;
      }
      render();
      if (!done) animationFrame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!animationFrame) {
        lastFrame = 0;
        animationFrame = requestAnimationFrame(tick);
      }
    };

    engineRef.current = {
      wake,
      refresh: () => {
        state.height = content.offsetHeight;
        render();
      },
    };
    render();

    const observer = new ResizeObserver(() => {
      state.height = content.offsetHeight;
      render();
    });
    observer.observe(content);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      engineRef.current = null;
    };
  }, [items.length, hasCta, narrow]);

  useLayoutEffect(() => {
    engineRef.current?.refresh();
    engineRef.current?.wake();
  }, [open]);

  useEffect(() => {
    engineRef.current?.refresh();
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setNarrow(root.offsetWidth < NARROW);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      setOpenRef.current(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenRef.current(false);
      menuRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(leaveRef.current), []);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const bar = barRef.current;
    if (!panel || !bar || !introRef.current) return;
    introRef.current = false;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const radius =
      Number.parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 18;
    panel.animate(
      [
        {
          clipPath: `inset(0px ${Math.max(0, (width - height) / 2)}px round ${height / 2}px)`,
          opacity: 0,
        },
        { clipPath: `inset(0px 0px round ${radius}px)`, opacity: 1 },
      ],
      { duration: 820, easing: EASE_OUT, fill: "backwards" },
    );
    Array.from(bar.children).forEach((child, index) => {
      child.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 560,
          delay: 220 + index * 70,
          easing: EASE_OUT,
          fill: "backwards",
        },
      );
    });
  }, []);

  const hover = openOn === "hover";
  const onPointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!hover || event.pointerType === "touch") return;
    window.clearTimeout(leaveRef.current);
    setOpen(true);
  };
  const onPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!hover || event.pointerType === "touch") return;
    window.clearTimeout(leaveRef.current);
    leaveRef.current = window.setTimeout(() => setOpenRef.current(false), 160);
  };

  const renderTarget = (
    target: {
      label: string;
      href?: string;
      ariaLabel?: string;
      onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
    },
    props: {
      className: string;
      tabIndex?: number;
      onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
    },
    children: ReactNode,
  ) => {
    const handleClick = (
      event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    ) => {
      target.onClick?.(event);
      props.onClick?.(event);
    };
    if (!target.href) {
      return (
        <button
          type="button"
          className={props.className}
          tabIndex={props.tabIndex}
          aria-label={target.ariaLabel}
          onClick={handleClick}
        >
          {children}
        </button>
      );
    }
    return (
      <LinkComponent
        href={target.href}
        className={props.className}
        tabIndex={props.tabIndex}
        aria-label={target.ariaLabel}
        onClick={handleClick}
      >
        {children}
      </LinkComponent>
    );
  };

  const renderCta = (wide: boolean) => {
    if (!cta) return null;
    return renderTarget(
      cta,
      {
        className: wide ? "card-nav__cta card-nav__cta--wide" : "card-nav__cta",
        tabIndex: wide && !open ? -1 : undefined,
        onClick: () => {
          if (wide) setOpen(false);
        },
      },
      cta.label,
    );
  };

  return (
    <div
      ref={rootRef}
      className={["card-nav", className].filter(Boolean).join(" ")}
      data-open={open ? "" : undefined}
      data-narrow={narrow ? "" : undefined}
      style={{ ...vars, ...style }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <nav ref={panelRef} className="card-nav__panel" aria-label={ariaLabel}>
        <div ref={barRef} className="card-nav__bar">
          <button
            ref={menuRef}
            type="button"
            className="card-nav__menu"
            data-icon-only={menuLabel ? undefined : ""}
            aria-expanded={open}
            aria-controls={contentId}
            aria-label={menuLabel ? undefined : open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <span className="card-nav__burger" aria-hidden="true">
              <span className="card-nav__line card-nav__line--top" />
              <span className="card-nav__line card-nav__line--bottom" />
            </span>
            {menuLabel && (
              <span className="card-nav__menu-label">
                <span className="card-nav__word card-nav__word--open" aria-hidden={open}>
                  Menu
                </span>
                <span className="card-nav__word card-nav__word--close" aria-hidden={!open}>
                  Close
                </span>
              </span>
            )}
          </button>

          {logo && (
            <LinkComponent
              href={logoHref}
              className="card-nav__logo"
              aria-label={logoAlt}
            >
              {typeof logo === "string" ? (
                <img src={logo} alt="" draggable={false} />
              ) : (
                logo
              )}
            </LinkComponent>
          )}

          {cta && !narrow && renderCta(false)}
        </div>

        <div
          ref={contentRef}
          id={contentId}
          className="card-nav__content"
          aria-hidden={!open}
        >
          <div className="card-nav__cards">
            {items.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className="card-nav__card"
                data-tinted={item.bgColor ? "" : undefined}
                style={
                  item.bgColor
                    ? { background: item.bgColor, color: item.textColor }
                    : undefined
                }
              >
                <div className="card-nav__card-head">
                  <span className="card-nav__label">{item.label}</span>
                  {item.description && (
                    <p className="card-nav__description">{item.description}</p>
                  )}
                </div>
                <ul className="card-nav__links">
                  {item.links.map((link, linkIndex) => (
                    <li key={`${link.label}-${linkIndex}`}>
                      {renderTarget(
                        link,
                        {
                          className: "card-nav__link",
                          tabIndex: open ? undefined : -1,
                          onClick: (event) => {
                            onLinkClick?.(link, item, event);
                            setOpen(false);
                          },
                        },
                        <>
                          <span className="card-nav__arrow" aria-hidden="true">
                            <HugeiconsIcon
                              className="card-nav__arrow-icon card-nav__arrow-icon--out"
                              icon={ArrowUpRight01Icon}
                              size={14}
                              strokeWidth={2}
                            />
                            <HugeiconsIcon
                              className="card-nav__arrow-icon card-nav__arrow-icon--in"
                              icon={ArrowUpRight01Icon}
                              size={14}
                              strokeWidth={2}
                            />
                          </span>
                          {link.label}
                        </>,
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {cta && narrow && (
            <div
              ref={(element) => {
                cardRefs.current[items.length] = element;
              }}
            >
              {renderCta(true)}
            </div>
          )}
        </div>
        <span className="card-nav__rim" />
      </nav>
    </div>
  );
};

export default CardNav;
