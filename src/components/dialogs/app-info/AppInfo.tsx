import { type SyntheticEvent, useCallback, useState } from 'react';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { Box, Button, Tab, Tabs } from '@mui/material';
import Contributors from './sections/Contributors';
import DevLog from './sections/DevLog';
import OtherProjects from './sections/OtherProjects';
import GettingStarted from './sections/GettingStarted';
import AppInfoGuide from '@/components/dialogs/app-info/AppInfoGuide';
import { closeDialog } from '@/modules/dialogs';
import { selectIsAppInfoDialogShown } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';

const appInfoTabs = [
  { label: 'Getting Started', value: 'getting-started' },
  { label: 'Guide', value: 'how-to' },
  { label: 'App Updates', value: 'app-updates' },
  { label: 'Credits', value: 'credits' },
  { label: 'Other Projects', value: 'other-projects' }
] as const;

type AppInfoTabValue = (typeof appInfoTabs)[number]['value'];

export default function AppInfo() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] =
    useState<AppInfoTabValue>('getting-started');

  const onClose = useCallback(() => {
    dispatch(closeDialog());
  }, []);

  const onTabChange = useCallback(
    (_event: SyntheticEvent, nextTab: AppInfoTabValue) => {
      setActiveTab(nextTab);
    },
    []
  );

  const isAppInfoDialogShown = useAppSelector(selectIsAppInfoDialogShown);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        flex: 1,
        width: '100%',
        height: '100%',
        containerType: 'inline-size',
        minWidth: 0,
        minHeight: 0,
        gridTemplateColumns: { xs: 'none', lg: '5fr 7fr 5fr' },
        gridTemplateRows: { xs: 'auto minmax(0, 1fr)', lg: '1fr 1fr' },
        gap: { xs: 0, lg: 1 },
        '& .app-info-section:not(:last-child):not(.MuiDivider-root)': {
          mb: 2
        },
        '& .MuiCardContent-root.MuiCardContent-root': {
          py: 1,
          px: 2
        },
        '& .app-info-tab-panel': {
          minHeight: 0,
          overflow: 'hidden',
          '& > .app-info-section': {
            height: '100%'
          }
        },
        '& .getting-started': {
          gridRowStart: { lg: 1 },
          gridRowEnd: { lg: 3 }
        },
        '& .dev-vlog': {
          gridRowStart: { lg: 1 },
          gridRowEnd: { lg: 2 }
        }
      }}
    >
      <Box sx={{ display: { xs: 'none', lg: 'contents' } }}>
        <GettingStarted />
        <DevLog />
        <AppInfoGuide includeContributors />
        <OtherProjects />
      </Box>
      <Box sx={{ display: { xs: 'contents', lg: 'none' } }}>
        <Box
          sx={{
            p: 0,
            mt: 0,
            mx: 0,
            mb: 1,
            minHeight: 0,
            '& .MuiTabs-root': {
              minHeight: 'calc(var(--mui-spacing) * 4)'
            },
            '& .MuiTabs-flexContainer': {
              minHeight: 'calc(var(--mui-spacing) * 4)'
            },
            '& .MuiTab-root': {
              minWidth: 'auto',
              minHeight: 'calc(var(--mui-spacing) * 4)',
              py: 0,
              px: 1
            }
          }}
        >
          <Tabs
            aria-label='App info sections'
            value={activeTab}
            variant='scrollable'
            scrollButtons={false}
            onChange={onTabChange}
          >
            {appInfoTabs.map(({ label, value }) => (
              <Tab
                key={value}
                id={`app-info-tab-${value}`}
                label={label}
                value={value}
                aria-controls={`app-info-panel-${value}`}
              />
            ))}
          </Tabs>
        </Box>
        <Box
          id='app-info-panel-getting-started'
          role='tabpanel'
          aria-labelledby='app-info-tab-getting-started'
          className='app-info-tab-panel'
          hidden={activeTab !== 'getting-started'}
        >
          <GettingStarted compact />
        </Box>
        <Box
          id='app-info-panel-how-to'
          role='tabpanel'
          aria-labelledby='app-info-tab-how-to'
          className='app-info-tab-panel'
          hidden={activeTab !== 'how-to'}
        >
          <AppInfoGuide />
        </Box>
        <Box
          id='app-info-panel-app-updates'
          role='tabpanel'
          aria-labelledby='app-info-tab-app-updates'
          className='app-info-tab-panel'
          hidden={activeTab !== 'app-updates'}
        >
          <DevLog compact />
        </Box>
        <Box
          id='app-info-panel-credits'
          role='tabpanel'
          aria-labelledby='app-info-tab-credits'
          className='app-info-tab-panel'
          hidden={activeTab !== 'credits'}
        >
          <Contributors compact />
        </Box>
        <Box
          id='app-info-panel-other-projects'
          role='tabpanel'
          aria-labelledby='app-info-tab-other-projects'
          className='app-info-tab-panel'
          hidden={activeTab !== 'other-projects'}
        >
          <OtherProjects compact />
        </Box>
      </Box>
      {!isAppInfoDialogShown ? null : (
        <Button
          variant='outlined'
          size='small'
          onClick={onClose}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: 'var(--mui-palette-background-paper)',
            lineHeight: 1
          }}
        >
          OK <KeyboardDoubleArrowRightIcon fontSize='small' />
        </Button>
      )}
    </Box>
  );
}
