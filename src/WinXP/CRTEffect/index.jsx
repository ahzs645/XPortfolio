import React from 'react';
import styled from 'styled-components';

function CRTEffect({ enabled }) {
  if (!enabled) return null;

  return (
    <>
      <CRTOverlay className="crt-effect" />
      <CRTScanline className="crt-scanline" />
      <CRTFlicker className="crt-flicker" />
      <CRTVignette className="crt-vignette" />
      <CRTNoise className="crt-noise" />
      <CRTAberration className="crt-aberration" />
    </>
  );
}

const CRTOverlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100000;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    mix-blend-mode: multiply;
    opacity: 0.7;
    pointer-events: none;
    z-index: 100000;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.1) 1px,
      transparent 1px,
      transparent 2px
    );
    mix-blend-mode: multiply;
    opacity: 0.7;
    pointer-events: none;
    z-index: 100000;
  }
`;

const CRTScanline = styled.div`
  position: fixed;
  top: -20px;
  left: 0;
  width: 100%;
  height: 0.6px;
  background: linear-gradient(
    180deg,
    hsla(0, 0%, 100%, 0.01),
    hsla(0, 0%, 100%, 0.2) 50%,
    hsla(0, 0%, 100%, 0.01)
  );
  box-shadow: 0 0 2px hsla(0, 0%, 100%, 0.15);
  mix-blend-mode: screen;
  opacity: 0.3;
  pointer-events: none;
  z-index: 100001;
  animation: scanline-move 8s linear infinite;

  @keyframes scanline-move {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(100vh);
    }
  }
`;

const CRTFlicker = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 100003;
  animation: crt-flicker 10s infinite;

  @keyframes crt-flicker {
    0% { opacity: 1; }
    1% { opacity: 0.985; }
    2% { opacity: 0.995; }
    3% { opacity: 0.99; }
    4% { opacity: 1; }
    30% { opacity: 1; }
    31% { opacity: 0.985; }
    32% { opacity: 0.99; }
    33% { opacity: 1; }
    80% { opacity: 1; }
    81% { opacity: 0.99; }
    82% { opacity: 0.98; }
    83% { opacity: 1; }
    100% { opacity: 1; }
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.01);
    mix-blend-mode: normal;
    opacity: 0;
    pointer-events: none;
    animation: flicker 15s infinite;
  }

  @keyframes flicker {
    0% { opacity: 0; }
    5% { opacity: 0.01; }
    10% { opacity: 0; }
    15% { opacity: 0.01; }
    20% { opacity: 0; }
    50% { opacity: 0; }
    70% { opacity: 0.01; }
    80% { opacity: 0; }
    90% { opacity: 0.01; }
    100% { opacity: 0; }
  }
`;

const CRTVignette = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 70%,
    rgba(0, 0, 0, 0.08) 100%
  );
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 100005;
`;

const CRTNoise = styled.div`
  position: fixed;
  top: -500px;
  left: -500px;
  width: calc(100% + 1000px);
  height: calc(100% + 1000px);
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYSFCkEKYR5NwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAFMklEQVRo3u2aTYgbVRTHf+flJQUndtLYmcxkPpJMptA2yUx2XRT8QBFajFSUQhciCo1F62Zdl9UuXLhwIbgSRF1YLNSFVApaqrW2Cwr9oO20adPOJJN8TjNJJpnk3S7mZQpCmfH1FcwPDrx3Lzfv/s9999xz7oWfZDT+JLBOnAL0vDT93AcXI8DBCvUupOmcAQ4BDgGmLaXbAD4CMICzY7j61/iUMZWPmYsZbSMhFQZg2sK+oXcW3NkUfQ/4CjiKQ8DJxBKjKmLdJjV9uVYTKnUhkhLysSahAI9HiU7OC/GE0EoJkbSQjQmRuGRTwjomFOJCNS4kk0I2IeRiQiEqTEUk0pXFwffjwEZTEO0Knu5A/8/w7ReQW4TlzXB4HIoVuLgEk3MQb8OeLpgegsXrML4Ikj6Y0BYV6Ai87MJLj0FkFob7Ye80zL0Hh0bh+2tQexLefRa+OQXHx+GLl+DkfiicgxtFmChB4jroZekZhAe2wcNRoAMDCsQ2QukqJKYhfQFOPw6n9sFYAZbfgL2d8MmLkF2ApRT0/Qjb/wQdyP5rG/VtMsRBbxTM7fDVFFydg/k6JFNwKQBTXjicgYFu6M7A5DXIzoEuVLHoiYB0CqsZILIJUg3IRSCoQG8HZLpgOgNXzsCFUXhgN3QJYAlUDPoioHcAfmDVUjJQGQmA/jXw6tABEIZnHoWPz0O9BNF7YUc35AswM4dpSlJSmkCdJeKQqcHGLMR7oNcAVYFXAnA5D2tnwF+Eb4IwNQVJBdQIfg1MkoCvDukq1JwQ0MG0QK2CkYbSw5AchONfQ3YCDh2ETzNQbEA6CgcPYIZNgnqVdFFKFMCnQxDYW4GaA6a/7m7eJAS7oVwCFT4Pw8VzsH8U5qdg72MwfAaG34LMT1CehFgTMHDQqFHVaigFhVAO/ChYDexqE4orUKpD7Dp0bIL0TsjkYWEBigvQGIChBtzog8UEJA0wI1i0V4yp1DQm5yktY0KVtBQYXQDrQsi1PiLzsGcOTs7DlXlYuwuGYjAQg5k4TK2D9xZUi9i0t0EZhbwUMFDGJzVpEjYr6Kt3nBVgJQ25ALQaEAhDow7JCNgikIqCfxHu3ogx3Yfa4aIppdYW0W0ZEj5oiDCl++hRhHhKqKwK9SpCyYS5Fuy4fIcAUyZYAnNegZUitv9W8BWQU2DSgzQsAj5hdAHeq2FrNfjZhYFRSBSAxRL0Z2GpF3wFcuZdRKROa9HBUhWUILQrUFN4rQ3RUTjRCefrYJyFkztgvAwlwCcCyjC++t+I6A62ZR+2NQciQtgCzYAuHVp3QTUGHVVYa0GkCisZcKwK1gpYdcCt/38Hf9V5GQPLs1i6hoMiLRHKFliNwPtCVBHMuPBqCcoetPJCwcS0LUwFgmq9nUYCLEyhTQ1a3jJKpEmHFRCM2pDwwb4MnMtBYx52JSH1AGTdEEcHPwjtuaG1vc7LcnAoS2ihRsVrE1WFliNUCkK1FyIZGPPA1vGb35tFdkWEtfVQe3yFuRvkWwPkXYtCy89UExZdJ2HNyX1+A6PXYdmC+9zCeBkYLtJe1Lj6R29jXYHrJcgXABseFWFNF0ouODYHhQ6MiLDR8feSbzeiqeCZH9DbBt5k+cZDCc01Ia44iYiw7IO1Eo77q7/dPZpZWNsDaQO78CPN1XlSOZfDaZs9KUG78Zt+14JQWoBEHDIWhtZm3W5P87D9Bqm0QT3t5mTagCrWbypOgdZuDdOW32zfV4xpRXHz5eLWDaHa5L8CXv2J9pP8Ij8ALHQWw2ReQZEAAAAASUVORK5CYII=");
  background-repeat: repeat;
  opacity: 0.05;
  pointer-events: none;
  z-index: 100006;
  animation: noise 0.5s steps(10) infinite;

  @keyframes noise {
    0%, 100% { background-position: 0 0; }
    20% { background-position: 20% 20%; }
    40% { background-position: -20% -30%; }
    60% { background-position: 30% 10%; }
    80% { background-position: -30% 30%; }
  }
`;

const CRTAberration = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  mix-blend-mode: screen;
  opacity: 0.05;
  pointer-events: none;
  z-index: 100007;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 0, 0, 0.08);
    mix-blend-mode: screen;
    transform: translate(-1.2px, 0);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 255, 0.08);
    mix-blend-mode: screen;
    transform: translate(1.2px, 0);
    animation: chromatic-shift 3s ease-in-out infinite;
  }

  @keyframes chromatic-shift {
    0% { transform: translate(1.2px, 0); }
    25% { transform: translate(1.08px, 0.12px); }
    50% { transform: translate(1.2px, 0); }
    75% { transform: translate(1.32px, -0.12px); }
    100% { transform: translate(1.2px, 0); }
  }
`;

export default CRTEffect;
