import React from 'react';
import styled from 'styled-components';

/**
 * StatusBar Component - Windows XP style status bar
 *
 * @param {Object} props
 * @param {Array|string} props.fields - Status field(s) to display
 *   Can be a single string or array of strings/objects
 *   Object format: { text: string, width?: string, flex?: number }
 * @param {boolean} props.showGrip - Whether to show the resize grip (default: true)
 *
 * @example
 * // Single field
 * <StatusBar fields="Learn more about Ahmad" />
 *
 * // Multiple fields
 * <StatusBar fields={[
 *   { text: "Ready", flex: 1 },
 *   { text: "Ln 1, Col 1", width: "100px" },
 *   { text: "100%", width: "60px" }
 * ]} />
 */
function StatusBar({ fields = [], showGrip = true }) {
  // Normalize fields to always be an array
  const normalizedFields = Array.isArray(fields)
    ? fields
    : [fields];

  return (
    <StatusBarContainer className="status-bar">
      {normalizedFields.map((field, index) => {
        const isObject = typeof field === 'object' && field !== null;
        const text = isObject ? field.text : field;
        const style = {};

        if (isObject) {
          if (field.width) style.width = field.width;
          if (field.flex) style.flex = field.flex;
          if (field.minWidth) style.minWidth = field.minWidth;
        }

        return (
          <StatusBarField
            key={index}
            className="status-bar-field"
            style={style}
          >
            {text}
          </StatusBarField>
        );
      })}
      {showGrip && <StatusBarGrip />}
    </StatusBarContainer>
  );
}

const StatusBarContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #e9e9e9;
  height: 22px;
  min-height: 22px;
  max-height: 22px;
  padding: 1px 3px;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  user-select: none;
  box-sizing: border-box;
  flex-shrink: 0;
  margin-top: auto;
  overflow: hidden;
`;

const StatusBarField = styled.p`
  margin: 0;
  padding: 0 6px;
  border-right: 1px inset silver;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #000;
  box-sizing: border-box;

  &:last-of-type {
    border-right: none;
    flex-grow: 1;
  }
`;

const StatusBarGrip = styled.div`
  width: 13px;
  height: 13px;
  margin-left: auto;
  flex-shrink: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13'%3E%3Cpath fill='%23808080' d='M11 0h2v2h-2zM11 4h2v2h-2zM7 4h2v2H7zM11 8h2v2h-2zM7 8h2v2H7zM3 8h2v2H3z'/%3E%3Cpath fill='%23fff' d='M10 1h2v2h-2zM10 5h2v2h-2zM6 5h2v2H6zM10 9h2v2h-2zM6 9h2v2H6zM2 9h2v2H2z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: bottom right;
  cursor: se-resize;
`;

export default StatusBar;
