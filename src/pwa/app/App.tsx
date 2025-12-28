import { useEffect } from 'react';
import styles from './App.module.css';
import '@features/pages';
import { useUpdateAlert } from '../features/update-alert/use-update-alert';

const App = () => {
  useEffect(() => {
    useUpdateAlert();
  }, []);

  return (
    <div className={styles.App}>
      {/* <StartPage /> */}
      {/* <ResultPage /> */}
    </div>
  );
};

export default App;