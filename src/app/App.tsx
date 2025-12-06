import { useEffect } from 'react';
import styles from './App.module.css';
import '@features/pages';
import '@features/update-alert/UpdateAlert';

const App = () => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className={styles.App}>
      {/* <StartPage /> */}
      {/* <ResultPage /> */}
    </div>
  );
};

export default App;