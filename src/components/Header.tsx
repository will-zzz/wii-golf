
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { Menu, X } from "lucide-react";

const navItems = [
  { title: "About", href: "/about" },
  { title: "Players", href: "/players" },
  { title: "Events", href: "/events" },
  { title: "Scores", href: "/scores" },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out",
        isScrolled || mobileMenuOpen
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative py-2 px-1 text-2xl font-medium transition-colors",
                  "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-pwga-green",
                  "after:transition-all after:duration-300 hover:text-pwga-green",
                  location.pathname === item.href
                    ? "text-pwga-green after:w-full"
                    : "text-gray-500 after:w-0 hover:after:w-full"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Apply Button */}
          <div className="hidden md:flex">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeHqJNp82Ig2erwn3q3C4qOxt8lXentPQqSEtVaV9yPWLuJ9Q/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 text-sm font-medium text-white bg-pwga-green rounded-md shadow hover:bg-pwga-green-dark transition-colors"
            >
              Apply
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="pt-2 pb-4 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "block py-3 px-4 text-base font-medium rounded-md transition-colors",
                  location.pathname === item.href
                    ? "text-pwga-green bg-gray-50"
                    : "text-gray-700 hover:bg-gray-50 hover:text-pwga-green"
                )}
              >
                {item.title}
              </Link>
            ))}
            <a
              key="apply"
              href="https://docs.google.com/forms/d/e/1FAIpQLSeHqJNp82Ig2erwn3q3C4qOxt8lXentPQqSEtVaV9yPWLuJ9Q/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "block py-3 px-4 text-base font-medium rounded-md transition-colors",
                location.pathname ===
                  "https://docs.google.com/forms/d/e/1FAIpQLSeHqJNp82Ig2erwn3q3C4qOxt8lXentPQqSEtVaV9yPWLuJ9Q/viewform?usp=dialog"
                  ? "text-pwga-green bg-gray-50"
                  : "text-gray-700 hover:bg-gray-50 hover:text-pwga-green"
              )}
            >
              Apply
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
