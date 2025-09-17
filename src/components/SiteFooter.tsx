import Link from 'next/link';
import { Github, ExternalLink } from 'lucide-react';

const navigation = {
  docs: [
    { name: 'Getting Started', href: '/getting-started' },
    { name: 'API Reference', href: '/api' },
    { name: 'Guides', href: '/guides' },
    { name: 'Examples', href: '/examples' },
  ],
  tools: [
    { name: 'ROM Editor', href: 'https://scribe.gaialabs.studio' },
    { name: 'Assembly Generator', href: '/tools/assembly' },
    { name: 'Data Extractor', href: '/tools/extractor' },
    { name: 'Project Browser', href: '/projects' },
  ],
  community: [
    { name: 'GitHub', href: 'https://github.com/gaialabs-platform' },
    { name: 'Discord', href: 'https://discord.gg/gaialabs' },
    { name: 'Contributing', href: '/contributing' },
    { name: 'Changelog', href: '/changelog' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'License', href: '/license' },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and description */}
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-xl text-foreground">GaiaLabs</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Comprehensive tools and documentation for ROM analysis, data structure editing, 
              and retro game development. Making the technical accessible.
            </p>
            <div className="flex space-x-6">
              <Link
                href="https://github.com/gaialabs-platform"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Navigation links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Documentation</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.docs.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Tools</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.tools.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {item.name}
                        {item.href.startsWith('http') && <ExternalLink className="h-3 w-3" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Community</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.community.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {item.name}
                        {item.href.startsWith('http') && <ExternalLink className="h-3 w-3" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 border-t border-border/40 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="text-xs leading-5 text-muted-foreground">
              &copy; 2025 GaiaLabs. All rights reserved.
            </p>
            <p className="mt-4 text-xs leading-5 text-muted-foreground sm:mt-0">
              Built with Next.js and deployed on Vercel
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}




