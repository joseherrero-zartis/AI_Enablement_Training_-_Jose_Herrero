"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const CLASS_NAME =
  "inline-block py-2 text-sm opacity-80 hover:opacity-100 aria-[current=page]:font-medium aria-[current=page]:opacity-100";

type Props = { href: string; children: React.ReactNode };

// A header link that marks itself as the current page for screen readers and sighted users.
// usePathname() is dynamic on routes like /challenges/[slug], so it needs a Suspense boundary
// (cacheComponents). The fallback is the same link without the current-page state.
export function NavLink({ href, children }: Props) {
  return (
    <Suspense
      fallback={
        <Link href={href} className={CLASS_NAME}>
          {children}
        </Link>
      }
    >
      <CurrentAwareLink href={href}>{children}</CurrentAwareLink>
    </Suspense>
  );
}

function CurrentAwareLink({ href, children }: Props) {
  const isCurrent = usePathname() === href;

  return (
    <Link href={href} aria-current={isCurrent ? "page" : undefined} className={CLASS_NAME}>
      {children}
    </Link>
  );
}
