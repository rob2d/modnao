import { styled } from '@mui/material';
import AppInfoSectionHeader from '../AppInfoSectionHeader';
import AppInfoProject from './AppInfoProject';

const Styled = styled('div')(
  ({ theme }) => `
& .MuiCard-root:not(:last-of-type) {
  margin-bottom: ${theme.spacing(3)};
}
`
);

export default function OtherProjects() {
  return (
    <Styled className='section'>
      <AppInfoSectionHeader>Other Notable Projects</AppInfoSectionHeader>
      <AppInfoProject
        url='https://paxtez.zachd.com'
        title={<>Paxtez&apos; MVC2 Mod Tool</>}
        body={
          <>
            A tool which provides various quality of life patches and custom
            pre-made stages with a provided Marvel vs Capcom 2 ROM.
          </>
        }
      />
      <AppInfoProject
        url='https://zachd.com/palmod/'
        title={<>PalMod</>}
        body={
          <>
            <b>Pal</b>ette <b>mod</b>ification tool for fighting games; for the
            Naomi games Capcom vs SNK 2 and Marvel vs Capcom 2 this can modify
            character sprite palettes.
          </>
        }
      />
      <AppInfoProject
        url='https://paxtez.zachd.com'
        title={<>Blender NaomiLib Importer</>}
        body={
          <>
            Plugin for importing NL models into Blender. The folks behind this
            were a great help when starting this project and getting help with
            the binary format.
          </>
        }
      />
    </Styled>
  );
}
