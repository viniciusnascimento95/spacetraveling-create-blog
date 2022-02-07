import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return(

    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <img src="/images/Logo.svg" alt="spacetraveling" />
        </a>
      </Link>
    </header>
  )
}
