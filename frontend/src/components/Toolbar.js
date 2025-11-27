import React from 'react';
import styled from 'styled-components';
import { SketchPicker } from 'react-color';

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  padding: 12px 24px;
  border-top: 1px solid #e1e5e9;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.04);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
    padding: 8px 12px;
    justify-content: center;
  }
`;

const ToolButton = styled.button`
  background: ${props => props.$active ? '#667eea' : '#f8f9fa'};
  color: ${props => props.$active ? '#fff' : '#333'};
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  transition: background 0.2s;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 0.85rem;
    min-width: 60px;
  }

  &:hover {
    background: #e9ecef;
    color: #333;
  }
`;

const ColorBox = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid #e1e5e9;
  background: ${props => props.color};
  cursor: pointer;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
  }
`;

const RangeInput = styled.input`
  width: 80px;

  @media (max-width: 768px) {
    width: 60px;
  }
`;

const ExportButton = styled.button`
  background: #764ba2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 1rem;
  font-weight: 500;
  margin-left: 8px;
  cursor: pointer;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 0.85rem;
    margin-left: 4px;
  }

  &:hover {
    background: #5a357a;
  }
`;

const BrushSizeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;

  @media (max-width: 768px) {
    min-width: 120px;
    gap: 4px;
  }
`;

const BrushSizeLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const BrushSizeValue = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  min-width: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    min-width: 16px;
  }
`;

function Toolbar({ settings, onSettingsChange, onClear, onUndo, onRedo, onExportImage, onExportPDF }) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const handleToolChange = (tool) => {
    onSettingsChange({ ...settings, tool });
  };

  const handleColorChange = (color) => {
    onSettingsChange({ ...settings, color: color.hex });
  };

  const handleBrushSizeChange = (e) => {
    onSettingsChange({ ...settings, brushSize: parseInt(e.target.value, 10) });
  };

  return (
    <ToolbarContainer>
      <ToolButton $active={settings.tool === 'pen'} onClick={() => handleToolChange('pen')}>Pen</ToolButton>
      <ToolButton $active={settings.tool === 'eraser'} onClick={() => handleToolChange('eraser')}>Eraser</ToolButton>
      <ToolButton $active={settings.tool === 'rectangle'} onClick={() => handleToolChange('rectangle')}>Rectangle</ToolButton>
      <ToolButton $active={settings.tool === 'circle'} onClick={() => handleToolChange('circle')}>Circle</ToolButton>
      <ToolButton $active={settings.tool === 'text'} onClick={() => handleToolChange('text')}>Text</ToolButton>
      <div style={{ position: 'relative' }}>
        <ColorBox color={settings.color} onClick={() => setShowColorPicker(v => !v)} />
        {showColorPicker && (
          <div style={{ position: 'absolute', zIndex: 10 }}>
            <SketchPicker color={settings.color} onChange={handleColorChange} />
          </div>
        )}
      </div>
      <BrushSizeContainer>
        <BrushSizeLabel>Size:</BrushSizeLabel>
        <RangeInput
          type="range"
          min={1}
          max={30}
          value={settings.brushSize}
          onChange={handleBrushSizeChange}
        />
        <BrushSizeValue>{settings.brushSize}</BrushSizeValue>
      </BrushSizeContainer>
      <ToolButton onClick={onUndo}>Undo</ToolButton>
      <ToolButton onClick={onRedo}>Redo</ToolButton>
      <ToolButton onClick={onClear}>Clear</ToolButton>
      <ExportButton onClick={onExportImage}>Export Image</ExportButton>
      <ExportButton onClick={onExportPDF}>Export PDF</ExportButton>
    </ToolbarContainer>
  );
}

export default Toolbar; 