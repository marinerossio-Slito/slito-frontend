import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BackLink } from '@/components/BackLink';

// next/link renders as a plain <a> in jsdom (router mocked globally via setup.ts).
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('BackLink', () => {
  it('renders the label prop', () => {
    render(<BackLink href="/artisan" label="Espace artisan" />);
    expect(screen.getByText('Espace artisan')).toBeDefined();
  });

  it('generates a link with the correct href', () => {
    render(<BackLink href="/compte" label="Mon compte" />);
    const link = screen.getByRole('link', { name: /Mon compte/ });
    expect(link.getAttribute('href')).toBe('/compte');
  });

  it('includes an aria-hidden left arrow', () => {
    const { container } = render(<BackLink href="/" label="Accueil" />);
    const arrow = container.querySelector('[aria-hidden]');
    expect(arrow).toBeDefined();
    expect(arrow?.textContent).toBe('←'); // ←
  });
});
