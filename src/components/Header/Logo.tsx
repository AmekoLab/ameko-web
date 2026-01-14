import { FC } from "react";
import Link from "next/link";
import Image from "next/image";

export const Logo: FC = () => (
  <Link href="/" aria-label="AMEKO home" className="flex items-center">
    <Image
      src="https://res.cloudinary.com/doezwafgz/image/upload/v1768359101/logo-removebg-preview_1_updhae.png"
      alt="AMEKO Logo"
      className="h-16 w-auto"
      width={200}
      height={50}
    />
  </Link>
);
