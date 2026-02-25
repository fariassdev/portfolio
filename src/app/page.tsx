import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section
          id="hero"
          style={{ minHeight: '100vh', width: '100%', padding: '100px 20px' }}
        >
          <h1>Hero Section</h1>
        </section>
        <section
          id="work"
          style={{
            minHeight: '100vh',
            width: '100%',
            padding: '100px 20px',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <h2>Work Section</h2>
        </section>
        <section
          id="stack"
          style={{ minHeight: '100vh', width: '100%', padding: '100px 20px' }}
        >
          <h2>Stack Section</h2>
        </section>
        <section
          id="experience"
          style={{
            minHeight: '100vh',
            width: '100%',
            padding: '100px 20px',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <h2>Experience Section</h2>
        </section>
        <section
          id="contact"
          style={{ minHeight: '100vh', width: '100%', padding: '100px 20px' }}
        >
          <h2>Contact Section</h2>
        </section>
      </main>
    </div>
  );
}
