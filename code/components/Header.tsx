"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/our-story", label: "Our story" },
  { href: "#", label: "Brands" },
  { href: "/robotics", label: "Robotics" },
  { href: "/media", label: "Media" },
  { href: "#", label: "Support" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`w-full bg-globo-header px-0 pt-4 md:pt-[15px] ${
        open ? "fixed inset-0 z-[999] h-full overflow-y-auto" : "relative"
      }`}
    >
      <div className="mx-auto w-full max-w-[1170px] px-4">
        <div className="flex flex-wrap items-start justify-between">
          <div className="mb-2 flex w-[66%] items-center md:mb-0 md:mt-[30px] md:w-[41%]">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/Globo-Logo-white.svg"
                alt="Globomantics logo"
                width={220}
                height={40}
                className="w-full max-w-[220px] border-r border-globo-mint pr-3 md:border-r"
                priority
              />
            </Link>
            <span className="ml-3 hidden text-[12px] italic text-globo-mint md:inline">
              MANIACALLY TAKING TECH TO THE GLOBE
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            className="mt-2 flex h-9 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`block h-0.5 w-[22px] bg-white transition ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-[22px] bg-white transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-[22px] bg-white transition ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>

          <div
            className={`${
              open ? "block w-full border-t border-white py-5" : "hidden"
            } md:hidden`}
          >
            <div className="relative mx-auto mb-4 max-w-[260px]">
              <span className="absolute left-3 top-3 text-globo-mint">⌕</span>
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-full border border-globo-mint bg-transparent py-2 pl-8 pr-3 text-sm text-globo-mint placeholder:text-globo-mint/70"
              />
            </div>
            <nav>
              <ul className="flex flex-col items-center">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="block px-[13px] py-[15px] text-sm text-globo-mint transition hover:text-globo-teal-hover"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="hidden items-start md:flex md:w-[41%]">
            <div className="ml-auto flex flex-col items-end">
              <div className="relative mb-1">
                <span className="absolute left-3 top-3.5 text-globo-mint">⌕</span>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-[228px] rounded-full border border-globo-mint/40 bg-transparent py-2 pl-8 pr-3 text-sm text-globo-mint placeholder:text-globo-mint/70"
                />
              </div>
              <nav>
                <ul className="flex items-center">
                  {navLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block px-[13px] py-[15px] text-sm text-globo-mint transition hover:text-globo-teal-hover"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          <div className="hidden items-center md:flex md:w-[16%] md:justify-end md:pr-5">
            <span className="mx-6 inline-block h-[90px] border-l border-globo-mint" />
            <Link
              href="/admin/login"
              className="mt-[30px] text-center text-globo-mint hover:text-white"
            >
              <Image
                src="/images/avatar.svg"
                alt="sign-in"
                width={32}
                height={32}
                className="mx-auto mb-1"
              />
              Sign-in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
