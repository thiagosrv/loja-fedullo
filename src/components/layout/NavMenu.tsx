import Link from "next/link";
import { BrandsSubmenu } from "./BrandsSubmenu";
import { CATEGORIES } from "@/constants/categories";

export function NavMenu() {
  return (
    <nav className="hidden md:flex items-center gap-6">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/${cat.slug}`}
          className="text-sm font-medium text-[#9ca3af] hover:text-white transition-colors duration-200"
        >
          {cat.name}
        </Link>
      ))}
      <BrandsSubmenu />
    </nav>
  );
}
