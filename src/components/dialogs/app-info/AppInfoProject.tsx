import { ButtonBase, Card, CardContent, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  url: string;
  title: ReactNode | string;
  body: ReactNode | string;
};

export default function AppInfoProject({ url, title, body }: Props) {
  return (
    <Card elevation={2}>
      <ButtonBase onClick={() => window.open(url, 'new')}>
        <CardContent>
          <Typography variant='subtitle1' textAlign='left'>
            {title}
          </Typography>
          {body}
        </CardContent>
      </ButtonBase>
    </Card>
  );
}
