import { SketchPicker } from 'react-color';

interface PickVertexColorControlsProps {
  selectedColor: string;
  onChangeSelectedColor: (hexColor: string) => void;
  onPickColor: (hexColor: string) => void;
}

export default function PickVertexColorControls({
  selectedColor,
  onChangeSelectedColor,
  onPickColor
}: PickVertexColorControlsProps) {
  return (
    <SketchPicker
      width='100%'
      color={selectedColor}
      styles={{
        default: {
          picker: {
            width: '100%',
            background: 'transparent',
            boxShadow: 'none',
            position: 'relative',
            left: 'calc(var(--mui-spacing) * -1.25)',
            top: 'calc(var(--mui-spacing) * -0.5))'
          }
        }
      }}
      onChange={({ hex }) => onChangeSelectedColor(hex)}
      onChangeComplete={({ hex }) => onPickColor(hex)}
    />
  );
}
