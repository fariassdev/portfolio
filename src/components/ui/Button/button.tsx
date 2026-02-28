import React from 'react';
import styles from './button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  download?: boolean | string;
  asChild?: boolean;
}

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    { className, variant = 'primary', size = 'md', href, asChild, ...props },
    ref,
  ) => {
    const composedClassName =
      `${styles.button} ${styles[variant]} ${styles[size]} ${
        className || ''
      }`.trim();

    if (href) {
      const { type, ...anchorProps } =
        props as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
          type?: string;
        };
      return (
        <a
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          className={composedClassName}
          {...anchorProps}
        >
          {props.children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        className={composedClassName}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
