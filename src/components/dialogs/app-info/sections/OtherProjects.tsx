import { styled, Typography } from '@mui/material';
import DialogSectionHeader from '../../DialogSectionHeader';
import AppInfoProject from '../AppInfoProject';
import DialogSectionContentCards from '../../DialogSectionContentCards';

const Styled = styled('div')(
  ({ theme }) => `

  & {
    display: flex;
    flex-direction: column;
  }

  & .MuiTypography-h6 {
    margin-top: ${theme.spacing(1)};
  }
`
);

export default function OtherProjects() {
  return (
    <Styled className='app-info-section scroll-body'>
      <DialogSectionHeader>Other Notable Projects</DialogSectionHeader>
      <DialogSectionContentCards>
        <AppInfoProject
          url='https://paxtez.zachd.com'
          title={<>Paxtez&apos; MVC2 Mod Tool</>}
          body={
            <Typography variant='body2' color='text.secondary' textAlign='left'>
              A tool which provides various quality of life patches and custom
              pre-made stages for your provided Marvel vs Capcom 2 ROM.
            </Typography>
          }
        />
        <AppInfoProject
          url='https://zachd.com/palmod/'
          title={<>PalMod</>}
          body={
            <Typography variant='body2' color='text.secondary' textAlign='left'>
              <b>Pal</b>ette <b>mod</b>ification tool for fighting games; this
              can modify character sprite palettes of MVC2/CVS2.
            </Typography>
          }
        />
        <AppInfoProject
          url='https://github.com/NaomiMod/blender-NaomiLib'
          title={<>Blender NaomiLib Importer</>}
          body={
            <Typography variant='body2' color='text.secondary' textAlign='left'>
              Plugin for importing NL models into Blender. The folks behind this
              were a great help when starting this project for the binary
              format.
            </Typography>
          }
        />
        <AppInfoProject
          url='https://www.dreamcast-talk.com/forum/viewtopic.php?t=18323'
          title={<>Capcom vs SNK 2 English Version</>}
          body={
            <>
              <Typography
                variant='body2'
                color='text.secondary'
                textAlign='left'
                sx={{ mb: 1 }}
              >
                A Dreamcast patch that localizes Capcom vs SNK 2 with all of its
                original quotes (5100+) into English for the first time, along
                with many unique enhancements.
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                textAlign='left'
              >
                As a collaborative effort with ateam and some very talented &
                passionate people, it was a great experience to work with them
                on the graphics.
              </Typography>
            </>
          }
        />
      </DialogSectionContentCards>
    </Styled>
  );
}
