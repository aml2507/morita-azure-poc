"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import menuData from "./menuData";
import Image from "next/image";

// POC: Autenticación deshabilitada
const Header = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/favicon.ico"
                alt="Morita Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-2xl font-bold text-white">
                Morita .
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuData.map((menuItem, index) => (
              <Link
                key={index}
                href={menuItem.path || "#"}
                className={`text-white/70 hover:text-[#FF00FF] transition-colors ${
                  pathname === menuItem.path ? "text-[#FF00FF]" : ""
                }`}
              >
                {menuItem.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
