'use client';

import { useReducedMotion, animate } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// Speed is configured in characters per second
const TYPING_SPEED = 14;
const DELETING_SPEED = 22;
const PAUSE_AFTER_TYPING = 2200;
const PAUSE_BEFORE_NEXT = 300;
const INITIAL_DELAY = 800;

interface UseTypewriterOptions {
  roles: string[];
}

export const useTypewriter = ({ roles }: UseTypewriterOptions) => {
  const [text, setText] = useState('');
  const [currentRole, setCurrentRole] = useState(roles[0] ?? '');
  const [isTyping, setIsTyping] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const roleIndexRef = useRef(0);

  useEffect(() => {
    if (roles.length === 0) return;

    if (shouldReduceMotion) {
      let roleIndex = 0;

      const initialTimeoutId = setTimeout(() => {
        setText(roles[0] ?? '');
        setCurrentRole(roles[0] ?? '');
      }, 0);

      const interval = setInterval(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        setText(roles[roleIndex] ?? '');
        setCurrentRole(roles[roleIndex] ?? '');
      }, PAUSE_AFTER_TYPING + PAUSE_BEFORE_NEXT);

      return () => {
        clearTimeout(initialTimeoutId);
        clearInterval(interval);
      };
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let animationControls: ReturnType<typeof animate>;
    let isCancelled = false;

    function startTyping({ delay = 0 } = {}) {
      const role = roles[roleIndexRef.current] ?? '';
      setCurrentRole(role);
      setIsTyping(true);

      if (delay > 0) {
        timeoutId = setTimeout(() => typeText(role), delay);
      } else {
        typeText(role);
      }
    }

    function typeText(role: string) {
      if (isCancelled) return;
      const duration = role.length / TYPING_SPEED;

      animationControls = animate(0, role.length, {
        duration,
        ease: 'linear',
        onUpdate: (latest) => {
          if (!isCancelled) setText(role.slice(0, Math.round(latest)));
        },
        onComplete: () => {
          if (!isCancelled) {
            setIsTyping(false);
            timeoutId = setTimeout(() => deleteText(role), PAUSE_AFTER_TYPING);
          }
        },
      });
    }

    function deleteText(role: string) {
      if (isCancelled) return;
      const duration = role.length / DELETING_SPEED;

      animationControls = animate(role.length, 0, {
        duration,
        ease: 'linear',
        onUpdate: (latest) => {
          if (!isCancelled) setText(role.slice(0, Math.round(latest)));
        },
        onComplete: () => {
          if (!isCancelled) {
            roleIndexRef.current = (roleIndexRef.current + 1) % roles.length;
            timeoutId = setTimeout(() => startTyping(), PAUSE_BEFORE_NEXT);
          }
        },
      });
    }

    startTyping({ delay: INITIAL_DELAY });

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      if (animationControls?.stop) {
        animationControls.stop();
      }
    };
  }, [roles, shouldReduceMotion]);

  return { text, currentRole, isTyping };
};
