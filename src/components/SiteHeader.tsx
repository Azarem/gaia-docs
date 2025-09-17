'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Menu, X, Github, ExternalLink } from 'lucide-react';

const navigation = [
  { name: 'Getting Started', href: '/getting-started' },
  { name: 'API Reference', href: '/api' },
  { name: 'Projects', href: '/projects' },
  { name: 'Guides', href: '/guides' },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">GaiaLabs Documentation</span>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg text-foreground">GaiaLabs</span>
              <span className="text-muted-foreground text-sm">Docs</span>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="https://github.com/gaialabs-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link
              href="https://scribe.gaialabs.studio"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Open Editor
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50" />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border/10">
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5">
                  <span className="sr-only">GaiaLabs Documentation</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">G</span>
                    </div>
                    <span className="font-bold text-lg text-foreground">GaiaLabs</span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-border/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6 space-y-2">
                    <Link
                      href="https://github.com/gaialabs-platform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="-mx-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Github className="h-5 w-5" />
                      GitHub
                    </Link>
                    <Link
                      href="https://scribe.gaialabs.studio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="-mx-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-primary hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Open Editor
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
