import WinXP from './WinXP';
import { createGlobalStyle } from 'styled-components';
import { ConfigProvider } from './contexts/ConfigContext';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font-family: Tahoma, 'Noto Sans', sans-serif;
    font-size: 11px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Windows XP style scrollbars */
  ::-webkit-scrollbar {
    width: 16px;
    height: 16px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border: 1px solid #a1a1a1;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  ::-webkit-scrollbar-corner {
    background: #f1f1f1;
  }
`;

function App() {
  return (
    <ConfigProvider>
      <GlobalStyle />
      <WinXP />
    </ConfigProvider>
  );
}

export default App;
