import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { withBaseUrl } from '../../../utils/baseUrl';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function DateTimeProperties({ onClose, onMinimize }) {
  const [activeTab, setActiveTab] = useState('datetime');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Get current timezone name
  const getTimezoneName = useCallback(() => {
    return new Intl.DateTimeFormat('en-GB', { timeZoneName: 'long' })
      .format(new Date())
      .replace(/.*,\s*/, '');
  }, []);

  // Generate calendar days
  const generateCalendarDays = useCallback(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const today = new Date();

    const days = [];
    let week = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      if (week.length === 7) {
        days.push(week);
        week = [];
      }
      const isToday = d === today.getDate() &&
                      selectedYear === today.getFullYear() &&
                      selectedMonth === today.getMonth();
      const isSelected = d === selectedDay;
      week.push({ day: d, isToday, isSelected });
    }

    // Push remaining days
    if (week.length > 0) {
      days.push(week);
    }

    return days;
  }, [selectedMonth, selectedYear, selectedDay]);

  // Draw analog clock
  const drawClock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const radius = canvas.height / 2;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(radius, radius);

    // Draw tick marks
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30;
      const x = Math.cos(angle) * (radius - 10);
      const y = Math.sin(angle) * (radius - 10);

      ctx.save();
      ctx.translate(x, y);

      if (i % 5 === 0) {
        ctx.fillStyle = '#008080';
        ctx.fillRect(-2, -2, 4, 4);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, 2 * Math.PI);
        ctx.fillStyle = '#B6B2A5';
        ctx.fill();
      }

      ctx.restore();
    }

    const now = new Date();
    const hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // Draw hands
    const drawHand = (angle, length, width, color) => {
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-width / 2, 0);
      ctx.lineTo(width / 2, 0);
      ctx.lineTo(1, -length);
      ctx.lineTo(-1, -length);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    // Hour hand
    drawHand(
      ((hour * 30 + minute / 2) * Math.PI) / 180,
      radius * 0.5,
      6,
      '#008080'
    );

    // Minute hand
    drawHand(
      ((minute * 6 + second * 0.1) * Math.PI) / 180,
      radius * 0.75,
      5,
      '#008080'
    );

    // Second hand
    drawHand((second * 6 * Math.PI) / 180, radius * 0.85, 1, 'black');

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();

    ctx.restore();

    setCurrentDate(new Date());
    animationRef.current = setTimeout(drawClock, 1000);
  }, []);

  useEffect(() => {
    if (activeTab === 'datetime') {
      drawClock();
    }
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [drawClock, activeTab]);

  // Get timezone options
  const getTimezones = useCallback(() => {
    try {
      const timezones = Intl.supportedValuesOf('timeZone');
      const now = new Date();

      return timezones.map(tz => {
        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour12: false,
            timeZoneName: 'short'
          });
          const parts = formatter.formatToParts(now);
          const tzPart = parts.find(p => p.type === 'timeZoneName');
          const match = tzPart?.value.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);

          let offset = '';
          if (match) {
            const h = match[1].padStart(3, '0');
            const m = match[2] || '00';
            offset = `${h}:${m}`;
          }

          return {
            value: tz,
            label: `(GMT${offset}) ${tz.replace(/_/g, ' ')}`,
            isLocal: tz === Intl.DateTimeFormat().resolvedOptions().timeZone
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch {
      return [];
    }
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const calendarDays = generateCalendarDays();
  const timezones = getTimezones();
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <ProgramLayout
      menus={[]}
      windowActions={{ onClose, onMinimize }}
      showMenuBar={false}
      showToolbar={false}
      showAddressBar={false}
      statusFields={null}
      showStatusBar={false}
    >
      <WindowSurface>
        <TabContainer>
          <menu role="tablist">
            <button
              aria-selected={activeTab === 'datetime'}
              aria-controls="tab-datetime"
              onClick={() => setActiveTab('datetime')}
            >
              Date &amp; Time
            </button>
            <button
              aria-selected={activeTab === 'timezone'}
              aria-controls="tab-timezone"
              onClick={() => setActiveTab('timezone')}
            >
              Time Zone
            </button>
          </menu>
          <article role="tabpanel" id={activeTab === 'datetime' ? 'tab-datetime' : 'tab-timezone'}>
          {activeTab === 'datetime' && (
            <DateTimePane>
              <GroupRow>
                <Fieldset>
                  <Legend>Date</Legend>
                  <DateSelectors>
                    <MonthSelect
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      disabled
                    >
                      {MONTHS.map((month, idx) => (
                        <option key={month} value={idx}>{month}</option>
                      ))}
                    </MonthSelect>
                    <YearInput
                      type="number"
                      min="1900"
                      max="2100"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      disabled
                    />
                  </DateSelectors>
                  <CalendarTable>
                    <thead>
                      <tr>
                        {DAYS_OF_WEEK.map((day, idx) => (
                          <CalendarHeader key={idx}>{day}</CalendarHeader>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {calendarDays.map((week, weekIdx) => (
                        <tr key={weekIdx}>
                          {week.map((dayObj, dayIdx) => (
                            <CalendarCell
                              key={dayIdx}
                              $active={dayObj?.isToday || dayObj?.isSelected}
                              onClick={() => dayObj && setSelectedDay(dayObj.day)}
                            >
                              {dayObj?.day || ''}
                            </CalendarCell>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </CalendarTable>
                </Fieldset>

                <Fieldset>
                  <Legend>Time</Legend>
                  <ClockContainer>
                    <ClockCanvas ref={canvasRef} width={140} height={140} />
                    <TimeInput
                      type="text"
                      value={formatTime(currentDate)}
                      readOnly
                      disabled
                    />
                  </ClockContainer>
                </Fieldset>
              </GroupRow>
              <TimezoneInfo>
                Current time zone: {getTimezoneName()}
              </TimezoneInfo>
            </DateTimePane>
          )}

          {activeTab === 'timezone' && (
            <TimezonePane>
              <TimezoneSelect disabled defaultValue={currentTimezone}>
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </TimezoneSelect>
              <MapImage src={withBaseUrl('/gui/datetime/map.png')} alt="World Time Zones" />
            </TimezonePane>
          )}
          </article>
        </TabContainer>

        <Actions>
          <ActionButton onClick={onClose}>OK</ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton disabled>Apply</ActionButton>
        </Actions>
      </WindowSurface>
    </ProgramLayout>
  );
}

const WindowSurface = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7f6f0 0%, #ece9d8 45%, #e2dfcf 100%);
  padding: 8px;
  overflow: hidden;
  font-family: 'MS Sans Serif', 'Tahoma', sans-serif;
  font-size: 12px;
`;

const TabContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  menu[role="tablist"] {
    position: relative;
    margin: 0;
    padding: 0;
    z-index: 2;

    button {
      position: relative;
      margin-bottom: -2px;
      margin-left: 0;
      margin-right: 0;

      &[aria-selected="true"] {
        z-index: 3;
        margin-left: 0;
      }
    }
  }

  article[role="tabpanel"] {
    flex: 1;
    padding: 12px;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }
`;

const DateTimePane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GroupRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 8px 10px 10px 10px;
  border: 1px solid #919b9c;
`;

const Legend = styled.legend`
  background: #fbfbfc;
  padding: 0 4px;
  font-size: 12px;
  color: #003399;
`;

const DateSelectors = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 6px;
`;

const MonthSelect = styled.select`
  flex: 1;
  font-size: 12px;
  padding: 2px;
`;

const YearInput = styled.input`
  flex: 1;
  font-size: 12px;
  padding: 2px;
  width: 60px;
`;

const CalendarTable = styled.table`
  width: 100%;
  table-layout: fixed;
  text-align: center;
  background: #fff;
  border: 1px solid #7f9db9;
  border-collapse: collapse;
`;

const CalendarHeader = styled.th`
  padding: 3px 4px;
  background: #254079;
  color: #fff;
  font-weight: normal;
  font-size: 11px;
`;

const CalendarCell = styled.td`
  padding: 1px 3px;
  cursor: pointer;
  font-size: 11px;
  background: ${({ $active }) => ($active ? '#0054e3' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : 'inherit')};

  &:hover {
    background: ${({ $active }) => ($active ? '#0054e3' : '#cce4ff')};
  }
`;

const ClockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ClockCanvas = styled.canvas`
  display: block;
`;

const TimeInput = styled.input`
  font-size: 12px;
  padding: 2px 4px;
  text-align: center;
  width: 100px;
`;

const TimezoneInfo = styled.div`
  font-size: 12px;
  color: #333;
`;

const TimezonePane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
`;

const TimezoneSelect = styled.select`
  width: 100%;
  font-size: 12px;
  padding: 2px;
`;

const MapImage = styled.img`
  width: 100%;
  border: 2px solid;
  border-color: #716f64 #f1efe2 #f1efe2 #716f64;
  box-sizing: border-box;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  min-width: 72px;
  padding: 6px 12px;
  font-size: 11px;
  font-family: 'MS Sans Serif', 'Tahoma', sans-serif;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

export default DateTimeProperties;
