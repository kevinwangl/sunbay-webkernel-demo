import { useEffect, useState } from 'react';
import './App.css';
import { PosTerminal } from './components/PosTerminal';
import { loadConfig, getConfig } from './config';

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load configuration on app startup
    loadConfig()
      .then(() => {
        const config = getConfig();
        console.log('📋 App Configuration:', config);
        setConfigLoaded(true);
      })
      .catch((err) => {
        console.error('❌ Failed to load configuration:', err);
        setError('Failed to load configuration');
        setConfigLoaded(true); // Continue with default config
      });
  }, []);

  if (!configLoaded) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>🚀 SUNBAY WebKernel Demo</h1>
          <p className="subtitle">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>🚀 SUNBAY WebKernel Demo</h1>
          <p className="subtitle error">{error}</p>
          <p className="subtitle">Using default configuration</p>
        </div>
        <PosTerminal />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>🚀 SUNBAY WebKernel Demo</h1>
        <p className="subtitle">Dynamic WASM Kernel Loading from Backend</p>
      </div>
      <PosTerminal />
    </div>
  );
}

export default App;
