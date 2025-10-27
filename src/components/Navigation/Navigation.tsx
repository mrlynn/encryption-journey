"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Home",
    path: "/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M8 3.293l6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
        <path fillRule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
      </svg>
    ),
    description: "Return to the main page"
  },
  {
    name: "View Demo",
    path: "/view/demo",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
      </svg>
    ),
    description: "Explore the encryption journey visualization"
  },
  {
    name: "Interactive Form",
    path: "/interactive",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
      </svg>
    ),
    description: "Create a patient record with custom encryption"
  },
  {
    name: "Query Console",
    path: "/query-console",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6.375 7.125V4.658h1.78c.973 0 1.542.457 1.542 1.237 0 .802-.604 1.23-1.764 1.23H6.375zm0 3.762h1.898c1.184 0 1.81-.48 1.81-1.377 0-.885-.65-1.348-1.886-1.348H6.375v2.725z"/>
        <path d="M4.002 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4h-8zm0 1h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3z"/>
      </svg>
    ),
    description: "Experiment with queries against encrypted data"
  },
  {
    name: "Encryption Visualizer",
    path: "/encryption-visualizer",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5Z"/>
      </svg>
    ),
    description: "Compare different encryption modes"
  },
  {
    name: "Developer Resources",
    path: "/developer-resources",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"/>
      </svg>
    ),
    description: "Implementation guides and code examples"
  }
];

export function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-mongo-dark-800 border-b border-accent/20 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Main Title */}
        <div className="flex items-center gap-3">
          <div className="text-primary text-xl font-bold p-2 rounded-full bg-primary/10">
            🔐
          </div>
          <Link href="/" className="text-xl font-bold text-primary">
            Encryption Journey
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              title={item.description}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname === item.path
                  ? "text-primary"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {item.icon && <span className="text-primary/80">{item.icon}</span>}
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-neutral-400 hover:text-neutral-200 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            {menuOpen ? (
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
            ) : (
              <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed top-12 left-0 right-0 z-50 bg-mongo-dark-800 shadow-lg border-b border-accent/20 mt-2 py-2">
          <div className="space-y-2 px-4 max-h-[70vh] overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 py-2 px-3 rounded-md transition-colors ${
                  pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-400 hover:bg-mongo-dark-700 hover:text-neutral-200"
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-neutral-500">{item.description}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}