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
            ? "flex items-center space-x-6"
            : "flex flex-col space-y-4"
        }
      >
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              onClick={onNavigate}
              className="text-md text-black hover:text-gray-400 focus:text-gray-400 transition-colors "
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
