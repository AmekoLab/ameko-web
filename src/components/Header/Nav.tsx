import { FC } from "react";
import { NAV_ITEMS } from "../../data/nav";

type Props = {
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
};

export const Nav: FC<Props> = ({ onNavigate, orientation = "horizontal" }) => {
  return (
    <nav
      aria-label="Primary"
      className={
        orientation === "horizontal" ? "hidden lg:block" : "block lg:hidden"
      }
    >
      <ul
        className={
          orientation === "horizontal"
            ? "flex items-center space-x-20 xl:space-x-24"
            : "flex flex-col space-y-6"
        }
      >
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              onClick={onNavigate}
              className="text-sm uppercase tracking-widest text-white hover:text-[#f0c040] transition-colors"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
