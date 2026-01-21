import { useEffect } from 'react';
import '@pwa/features/pages';
import { useUpdateAlert } from '@pwa/features/update-alert/use-update-alert';

const App = () => {
  useEffect(() => {
    useUpdateAlert();
  }, []);

  return (
    <>
      {/* <StartPage /> */}
      {/* <ResultPage /> */}
    </>
  );
};

export default App;