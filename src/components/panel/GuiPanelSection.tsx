import { Divider, Typography } from '@mui/material';

type Props = {
  children: React.ReactNode;
  title: string;
};
export default function GuiPanelSection({ children, title }: Props) {
  return (
    <>
      <Divider flexItem>
        <Typography variant='subtitle2' textAlign='left' width='100%'>
          {title}
        </Typography>
      </Divider>
      {children}
    </>
  );
}
