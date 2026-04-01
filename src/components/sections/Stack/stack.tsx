'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { TechCategory, Technology } from './stack.constants';
import { categories } from './stack.constants';
import styles from './stack.module.css';

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
} as const;

function TechItem({ name, iconClassName, proficiency }: Technology) {
  return (
    <li className={styles.techItem}>
      <i className={`${styles.techIcon} ${iconClassName}`} aria-hidden="true" />
      <span className={styles.techName}>{name}</span>
      <span className={`${styles.badge} ${styles[`badge${proficiency}`]}`}>
        {proficiency}
      </span>
    </li>
  );
}

function CategoryRow({
  category,
  index,
  reduceMotion,
}: {
  readonly category: TechCategory;
  readonly index: number;
  readonly reduceMotion: boolean;
}) {
  const headingId = `stack-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <motion.article
      className={styles.categoryRow}
      variants={cardVariants}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.5, delay: index * 0.1, ease: 'easeOut' }
      }
    >
      <header className={styles.categoryHeader}>
        <h3 id={headingId} className={styles.categoryName}>
          <span className={styles.slashes} aria-hidden="true">
            {'// '}
          </span>
          {category.name}
        </h3>
        <p className={styles.categoryCount}>
          {category.technologies.length}{' '}
          {category.technologies.length === 1 ? 'Technology' : 'Technologies'}
        </p>
      </header>
      <ul className={styles.techList} role="list" aria-labelledby={headingId}>
        {category.technologies.map((tech) => (
          <TechItem key={tech.name} {...tech} />
        ))}
      </ul>
    </motion.article>
  );
}

export function Stack() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      id="stack"
      className={styles.section}
      aria-labelledby="stack-title"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.p
          className={styles.label}
          variants={headerVariants}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }
          }
        >
          Stack
        </motion.p>
        <motion.h2
          id="stack-title"
          className={styles.title}
          variants={headerVariants}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.5, delay: 0.1, ease: 'easeOut' }
          }
        >
          Technologies I use to build things that last.
        </motion.h2>
      </motion.div>

      <motion.div
        className={styles.grid}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {categories.map((category, index) => (
          <CategoryRow
            key={category.name}
            category={category}
            index={index}
            reduceMotion={reduceMotion}
          />
        ))}
      </motion.div>
    </section>
  );
}
