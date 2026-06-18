import { SvgIcon, type SvgIconProps } from '@mui/material';

export interface MdiSvgIconProps extends SvgIconProps {
  path: string;
}

export default function MdiSvgIcon({ path, ...props }: MdiSvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d={path} />
    </SvgIcon>
  );
}
