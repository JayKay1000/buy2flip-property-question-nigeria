import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link to="/">
          <Logo light={!scrolled} />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "#how-it-works", label: "How It Works" },
            { href: "#plans", label: "Plans" },
            { href: "#why-us", label: "Why Us" },
            { to: "/contact-officer", label: "Contact" },
          ].map((link) => (
            link.to ? (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? "text-foreground hover:text-brand" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? "text-foreground hover:text-brand" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            )
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button
              variant={scrolled ? "ghost" : "ghost"}
              className={scrolled ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10"}
            >
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gold hover:bg-gold-dark text-white border-0">Create Account</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}