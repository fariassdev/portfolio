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

function CategoryCard({
  category,
  index,
  reduceMotion,
}: {
  readonly category: TechCategory;
  readonly index: number;
  readonly reduceMotion: boolean;
}) {
  return (
    <motion.div
      className={styles.card}
      variants={cardVariants}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.5, delay: index * 0.1, ease: 'easeOut' }
      }
    >
      <h3 className={styles.categoryName}>
        <span className={styles.slashes} aria-hidden="true">
          {'// '}
        </span>
        {category.name}
      </h3>
      <ul className={styles.techList} role="list">
        {category.technologies.map((tech) => (
          <TechItem key={tech.name} {...tech} />
        ))}
      </ul>
    </motion.div>
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
          <CategoryCard
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
