import { Typography, styled } from '@mui/material';

const Styled = styled('div')(
  ({ theme }) => `
    & {
      position: relative;
      display: flex;
      flex-direction: column;
    }`
);

export default function Contributors() {
  return (
    <Styled>
      <Typography variant='h5'>Credits</Typography>
      <pre>
        {`Design/Development: 
  Rob2D
  
Help w/ Naomi & MVC2/CVS2 ROM model format details:
  TVIndustries, VincentNL, egregiousguy, mountainmanjed, zocker-160, bankbank
  
Early user testing & feedback:
  Magnetro2k`}
      </pre>
    </Styled>
  );
}
