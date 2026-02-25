import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button';

describe('Button Component', () => {
  it('renders a standard button by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeTruthy();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders an anchor element when href is provided', () => {
    render(<Button href="/test">Link me</Button>);
    const link = screen.getByRole('link', { name: /link me/i });
    expect(link).toBeTruthy();
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/test');
  });

  it('applies variant and size classes correctly', () => {
    const { container } = render(
      <Button variant="secondary" size="lg">
        Styled
      </Button>,
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('secondary');
    expect(element.className).toContain('lg');
  });

  it('respects the disabled prop correctly', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toHaveProperty('disabled', true);
  });
});
