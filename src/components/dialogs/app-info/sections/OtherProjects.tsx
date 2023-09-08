import { styled } from '@mui/material';
import DialogSectionHeader from '../../../DialogSectionHeader';
import AppInfoProject from '../AppInfoProject';

const Styled = styled('div')(
  ({ theme }) => `
  & {
    flex-shrink: 0;
  }

  & > div:nth-of-type(2) {
    overflow-y: auto;
    padding: 0 ${theme.spacing(1)};
  }

  & .MuiCard-root {
    margin-left: ${theme.spacing(1)};
    margin-right: ${theme.spacing(1)};
  }

  & .MuiCard-root:not(:last-of-type) {
    margin-bottom: ${theme.spacing(3)};
  }

  & .MuiTypography-h6 {
    margin-top: ${theme.spacing(1)};
  }
`
);

export default function OtherProjects() {
  return (
    <Styled className='section'>
      <DialogSectionHeader>Other Notable Projects</DialogSectionHeader>
      <div>
        <AppInfoProject
          url='https://paxtez.zachd.com'
          title={<>Paxtez&apos; MVC2 Mod Tool</>}
          body={
            <>
              A tool which provides various quality of life patches and custom
              pre-made stages for your provided Marvel vs Capcom 2 ROM.
            </>
          }
        />
        <AppInfoProject
          url='https://zachd.com/palmod/'
          title={<>PalMod</>}
          body={
            <>
              <b>Pal</b>ette <b>mod</b>ification tool for fighting games; this
              can modify character sprite palettes of MVC2/CVS2.
            </>
          }
        />
        <AppInfoProject
          url='https://github.com/NaomiMod/blender-NaomiLib'
          title={<>Blender NaomiLib Importer</>}
          body={
            <>
              Plugin for importing NL models into Blender. The folks behind this
              were a great help when starting this project for the binary
              format.
            </>
          }
        />
      </div>
    </Styled>
  );
}
