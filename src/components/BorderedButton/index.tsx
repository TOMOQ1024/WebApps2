import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type BorderedButtonSize = "md" | "lg";

type BorderedButtonStyleProps = {
  active?: boolean;
  size?: BorderedButtonSize;
  className?: string;
};

function borderedButtonClass({
  active = false,
  size = "md",
  className,
}: BorderedButtonStyleProps): string {
  const sizeClass =
    size === "lg" ? "px-8 py-4 font-bold" : "px-4 py-2 font-medium";

  return [
    "no-transition inline-block border-2 bg-[var(--background-color)] no-underline text-[var(--text-color)]",
    "hover:scale-105 hover:border-[var(--text-color)] active:scale-95",
    sizeClass,
    active
      ? "font-bold border-[var(--text-color)] bg-[var(--text-color)] !text-[var(--background-color)]"
      : "border-[var(--border-color)]",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

type BorderedButtonLinkProps = BorderedButtonStyleProps & {
  href: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

function isExternalHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  );
}

export function BorderedButtonLink({
  href,
  active,
  size,
  className,
  children,
  ...props
}: BorderedButtonLinkProps) {
  const linkClassName = borderedButtonClass({ active, size, className });

  if (isExternalHref(href)) {
    const { prefetch: _prefetch, ...anchorProps } = props;
    return (
      <a href={href} className={linkClassName} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClassName} {...props}>
      {children}
    </Link>
  );
}

type BorderedButtonProps = BorderedButtonStyleProps & {
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children">;

export function BorderedButton({
  active,
  size,
  className,
  children,
  type = "button",
  ...props
}: BorderedButtonProps) {
  return (
    <button
      type={type}
      className={borderedButtonClass({ active, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
