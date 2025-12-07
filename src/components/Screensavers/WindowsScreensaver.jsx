import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import XPLogoSVG from '../../assets/xp.svg?react';

function WindowsScreensaver() {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const velocityRef = useRef({ dx: 1.5, dy: 1 });

  useEffect(() => {
    let animationId;

    const animate = () => {
      const container = containerRef.current;
      const logo = logoRef.current;
      if (!container || !logo) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      // Use container bounds instead of window
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      const logoW = logo.offsetWidth || w * 0.4;
      const logoH = logo.offsetHeight || logoW * 0.6;

      // Scale velocity based on container size (slower for small previews)
      const scale = Math.min(w, h) / 500;
      const baseSpeed = Math.max(0.3, scale);

      setPosition(prev => {
        let { x, y } = prev;
        let { dx, dy } = velocityRef.current;

        x += dx * baseSpeed;
        y += dy * baseSpeed;

        // Bounce off edges
        if (x <= 0) {
          x = 0;
          velocityRef.current.dx = Math.abs(dx);
        }
        if (x + logoW >= w) {
          x = w - logoW;
          velocityRef.current.dx = -Math.abs(dx);
        }
        if (y <= 0) {
          y = 0;
          velocityRef.current.dy = Math.abs(dy);
        }
        if (y + logoH >= h) {
          y = h - logoH;
          velocityRef.current.dy = -Math.abs(dy);
        }

        return { x, y };
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <Logo
        ref={logoRef}
        style={{
          left: position.x,
          top: position.y,
        }}
      />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
  position: relative;
`;

const Logo = styled(XPLogoSVG)`
  position: absolute;
  width: 40%;
  min-width: 30px;
  max-width: 400px;
  height: auto;
`;

export default WindowsScreensaver;
