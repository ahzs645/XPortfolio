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

  /* Reset XP.css .window styles for Webamp */
  #webamp .window {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
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
