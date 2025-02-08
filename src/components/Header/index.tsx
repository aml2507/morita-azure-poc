"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import menuData from "./menuData";
import { Button } from "@/components/ui/button";

const Header = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold text-white">
              Morita.
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

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              Iniciar sesión
            </Button>
            <Button className="bg-[#FF00FF] hover:bg-[#7C4DFF] shadow-[0_0_20px_rgba(255,0,255,0.3)]">
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
