import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * TaskPanel - Windows XP-style sidebar with collapsible sections
 *
 * Usage:
 * <TaskPanel>
 *   <TaskPanel.Section title="Section Title" icon="/icon.png" variant="primary">
 *     <TaskPanel.Item icon="/icon.png" onClick={() => {}}>Item text</TaskPanel.Item>
 *     <TaskPanel.Link icon="/icon.png" href="https://...">Link text</TaskPanel.Link>
 *   </TaskPanel.Section>
 * </TaskPanel>
 */

// Main TaskPanel container
function TaskPanel({ children, width = 190 }) {
  return <PanelContainer $width={width}>{children}</PanelContainer>;
}

// Section component with collapsible header
function Section({
  title,
  children,
  defaultExpanded = true,
  variant = 'default', // 'default' | 'primary'
  icon = null
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isPrimary = variant === 'primary';

  const toggleIcon = expanded
    ? (isPrimary ? '/apps/about/pullup-alt.webp' : '/apps/about/pullup.webp')
    : (isPrimary ? '/apps/about/pulldown-alt.webp' : '/apps/about/pulldown.webp');

  return (
    <SectionContainer className={expanded ? '' : 'collapsed'}>
      <SectionHeader $isPrimary={isPrimary} onClick={() => setExpanded(!expanded)}>
        {icon && <HeaderIcon src={icon} alt="" />}
        <span>{title}</span>
        <ToggleIcon src={toggleIcon} alt="" />
      </SectionHeader>
      <SectionContent>
        <SectionContentInner>{children}</SectionContentInner>
      </SectionContent>
    </SectionContainer>
  );
}

// Clickable item row
function Item({ icon, children, onClick, disabled = false }) {
  return (
    <ItemRow onClick={disabled ? undefined : onClick} $disabled={disabled} $clickable={!!onClick}>
      {icon && <ItemIcon src={icon} alt="" />}
      <span>{children}</span>
    </ItemRow>
  );
}

// Link item row
function Link({ icon, children, href, target = '_blank' }) {
  const handleClick = (e) => {
    e.preventDefault();
    window.open(href, target, 'noopener,noreferrer');
  };

  return (
    <ItemRow as="a" href={href} onClick={handleClick} $clickable>
      {icon && <ItemIcon src={icon} alt="" />}
      <span>{children}</span>
    </ItemRow>
  );
}

// Text-only row (no interaction)
function Text({ icon, children }) {
  return (
    <ItemRow $clickable={false}>
      {icon && <ItemIcon src={icon} alt="" />}
      <span>{children}</span>
    </ItemRow>
  );
}

// Separator line
function Separator() {
  return <SeparatorLine />;
}

// Attach sub-components
TaskPanel.Section = Section;
TaskPanel.Item = Item;
TaskPanel.Link = Link;
TaskPanel.Text = Text;
TaskPanel.Separator = Separator;

// Styled components
const PanelContainer = styled.aside`
  background: linear-gradient(180deg, #748aff 0%, #4057d3 100%);
  width: ${props => props.$width}px;
  min-width: ${props => props.$width}px;
  max-width: ${props => props.$width}px;
  flex-shrink: 0;
  height: 100%;
  padding: 0;
  position: relative;
  z-index: 1;
  overflow-y: auto;
  font-family: Tahoma, Arial, sans-serif;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, #fff 0%, transparent 70%);
    transform: scaleX(0.8);
    transform-origin: right;
    pointer-events: none;
    z-index: 2;
  }
`;

const SectionContainer = styled.div`
  margin: 0 auto;
  width: calc(92% - 6px);
  max-width: calc(95% - 6px);
  padding-top: 14px;
  overflow: hidden;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;

  &:first-child {
    padding-top: 20px;
  }

  &.collapsed .section-content {
    max-height: 0;
    opacity: 0;
    padding: 0;
    pointer-events: none;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  height: 23px;
  padding: 0 8px 0 10px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background: ${props =>
    props.$isPrimary
      ? 'linear-gradient(90deg, #0059ce 0%, #2e9aff 100%)'
      : 'linear-gradient(90deg, #fff 0%, #f0f0ff 50%, #c2d4ec 100%)'};
  cursor: pointer;

  span {
    flex: 1;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2px;
    color: ${props => (props.$isPrimary ? '#fff' : '#0c327d')};
  }
`;

const HeaderIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 6px;
`;

const ToggleIcon = styled.img`
  width: 13px;
  height: 13px;
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5));
  transition: filter 0.1s ease, transform 0.05s ease;

  &:hover {
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5)) brightness(1.2);
  }

  &:active {
    filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0.4)) brightness(1.1);
    transform: translate(0.5px, 0.5px);
  }
`;

const SectionContent = styled.div.attrs({ className: 'section-content' })`
  background: #c2d4ec;
  border: 1.5px solid #fff;
  border-top: none;
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s;
`;

const SectionContentInner = styled.div`
  padding: 5px 10px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  text-decoration: none;
  color: inherit;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};

  &:hover span {
    text-decoration: ${props => props.$clickable ? 'underline' : 'none'};
  }

  span {
    font-size: 10px;
    line-height: 14px;
    color: #0c327d;
  }
`;

const ItemIcon = styled.img`
  width: 13px;
  height: 13px;
  margin-right: 6px;
`;

const SeparatorLine = styled.div`
  height: 1px;
  background: #99b4d1;
  margin: 6px 0;
`;

export default TaskPanel;
