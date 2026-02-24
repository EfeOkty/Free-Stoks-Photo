import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>Free Stoks Photo</div>
                        <p className={styles.desc}>
                            Discover thousands of high-quality stock photos and use them in your projects.
                        </p>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© {new Date().getFullYear()} Free Stoks Photo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
