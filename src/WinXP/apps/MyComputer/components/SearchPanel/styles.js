import styled from 'styled-components';

export const Container = styled.div`
  width: 210px;
  min-width: 210px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #748aff 0%, #4057d3 100%);
  overflow: hidden;
  position: relative;

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

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 8px 8px 8px;
  min-height: 0;
  overflow: hidden;
  height: 100%;
`;

export const Balloon = styled.div`
  position: relative;
  background: linear-gradient(180deg, #E8F0F8 0%, #D8E8F0 100%);
  border: 1px solid #FFFFFF;
  border-radius: 12px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  margin-bottom: 8px;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
  padding: 12px 10px 0 0;
`;

export const BalloonInner = styled.div`
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
`;

export const BalloonContent = styled.div`
  padding: 0 4px 12px 12px;
  overflow-y: auto;
  flex: 1 1 0;
  min-height: 0;
`;

export const BalloonTip = styled.div`
  position: absolute;
  bottom: -16px;
  left: 30px;
  width: 0;
  height: 0;
  border-top: 16px solid #D8E8F0;
  border-left: 16px solid transparent;
`;

export const BalloonTitle = styled.div`
  font-size: 11px;
  font-weight: bold;
  color: #000;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  margin-bottom: 10px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  box-sizing: border-box;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

export const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

export const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  line-height: 1.3;

  &:hover span {
    text-decoration: underline;
    color: #0066CC;
  }
`;

export const AlsoSection = styled.div`
  margin-top: 8px;
`;

export const AlsoTitle = styled.div`
  font-size: 11px;
  color: #666;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  margin-bottom: 8px;
`;

export const AlsoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 4px;

  &:hover span {
    text-decoration: underline;
    color: #0066CC;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
`;

export const CheckboxRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 4px;

  label {
    cursor: pointer;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
  margin-left: 4px;
`;

export const RadioRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;

  label {
    cursor: pointer;
  }

  input:checked + label {
    font-weight: bold;
  }
`;

export const InputLabel = styled.div`
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 4px;
`;

export const SelectInput = styled.select`
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8px;
  font-size: 11px;
`;

export const CollapsibleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  cursor: pointer;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  font-weight: bold;
  color: #000;

  &:hover {
    color: #0066CC;
  }
`;

export const CollapsibleContent = styled.div`
  padding: 4px 0 8px 8px;
`;

export const SizeSpecifyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

export const SizeInput = styled.input`
  width: 50px;
  padding: 2px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

export const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;

  span {
    width: 30px;
  }
`;

export const DateInput = styled.input`
  flex: 1;
  padding: 2px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;

  &:disabled {
    background: #f0f0f0;
    color: #888;
  }

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

export const SearchTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 4px 6px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  box-sizing: border-box;
  margin-bottom: 8px;
  resize: none;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }

  &::placeholder {
    color: #888;
  }
`;

export const SampleSection = styled.div`
  margin-bottom: 8px;
`;

export const SampleTitle = styled.div`
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 4px;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 12px 12px 12px;
  justify-content: center;
  flex-shrink: 0;
`;

export const XPButton = styled.button`
  min-width: 70px;
  padding: 4px 12px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  background: linear-gradient(180deg, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #d8d8d8 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;
  color: #000;

  &:hover {
    background: linear-gradient(180deg, #fff 0%, #e5f4fc 50%, #c4e5f6 51%, #d8e8f0 100%);
  }

  &:active {
    background: linear-gradient(180deg, #c4e5f6 0%, #98d1ef 50%, #68b8e3 51%, #8ccded 100%);
  }
`;

export const RoverArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 8px;
  height: 100px;
  flex-shrink: 0;
`;

export const RoverSprite = styled.div`
  width: 80px;
  height: 80px;
  background-image: url('/agents/Rover/map.png');
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

export const SearchEngineList = styled.select`
  width: 100%;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  margin-bottom: 12px;
`;

export const ModalText = styled.div`
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  color: #000;
  margin-bottom: 8px;
`;
