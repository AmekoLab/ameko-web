import { FC } from "react";
import Link from "next/link";

export const Logo: FC = () => (
  <Link href="/" aria-label="Cherry Xtrfy home" className="flex items-center">
    <span className="text-xl font-bold tracking-wide text-primary-900">
      CHERRY
    </span>
    <span className="text-xl font-bold tracking-wide text-primary-900 ml-1">
      XTRFY
    </span>
  </Link>
);
