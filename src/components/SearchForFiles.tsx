import gameNameMap from '@/constants/gameNameMap';
import resourceAttribMappings from '@/constants/resourceAttribMappings';
import resourceTypeNameMap from '@/constants/resourceTypeNameMap';
import type { ResourceAttribs } from '@/types';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Popper,
  PopperProps,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';

interface ResourceSearchOptionBase {
  id: string;
  game: ResourceAttribs['game'];
  resourceKey: string;
  resourceName: string;
  resourceType: ResourceAttribs['resourceType'];
  identifier: string;
  filenamePattern: string;
  displayFilenamePattern: string;
  treeDepth: number;
  label: string;
  searchText: string;
}

interface ResourceMappingSearchOption extends ResourceSearchOptionBase {
  kind: 'resource';
}

interface ResourceModelSearchOption extends ResourceSearchOptionBase {
  kind: 'model';
  modelIndex: string;
  modelDescription: string;
}

type ResourceSearchOption =
  | ResourceMappingSearchOption
  | ResourceModelSearchOption;

const formatFilenamePattern = (filenamePattern: string) =>
  filenamePattern
    .replace(/\(\.mn\)\?/gi, '')
    .replace(/[()]/g, '')
    .replace(/^\^/, '')
    .replace(/\$$/, '');

function ResourceSearchPopper(props: PopperProps) {
  return (
    <Popper
      {...props}
      placement='bottom-start'
      style={{
        ...props.style,
        maxWidth: 'calc(100vw - 32px)',
        width: '640px'
      }}
    />
  );
}

const resourceSearchOptions = Object.entries(resourceAttribMappings)
  .flatMap(([resourceKey, attribs]): ResourceSearchOption[] => {
    const displayFilenamePattern = formatFilenamePattern(
      attribs.filenamePattern
    );

    const resourceOption: ResourceMappingSearchOption = {
      id: `resource:${resourceKey}`,
      kind: 'resource',
      game: attribs.game,
      resourceKey,
      resourceName: attribs.name,
      resourceType: attribs.resourceType,
      identifier: attribs.identifier,
      filenamePattern: attribs.filenamePattern,
      displayFilenamePattern,
      treeDepth: 1,
      label: attribs.name,
      searchText: [
        resourceKey,
        attribs.game,
        gameNameMap[attribs.game],
        attribs.name,
        attribs.identifier,
        attribs.resourceType,
        resourceTypeNameMap[attribs.resourceType],
        attribs.filenamePattern,
        attribs.textureFileType,
        attribs.textureDefsHash
      ].join(' ')
    };

    if (!attribs.polygonMapped || !attribs.modelHints) {
      return [resourceOption];
    }

    return [
      resourceOption,
      ...Object.entries(attribs.modelHints).map(
        ([modelIndex, modelHint]): ResourceModelSearchOption => ({
          id: `model:${resourceKey}:${modelIndex}`,
          kind: 'model',
          game: attribs.game,
          resourceKey,
          resourceName: attribs.name,
          resourceType: attribs.resourceType,
          identifier: attribs.identifier,
          filenamePattern: attribs.filenamePattern,
          displayFilenamePattern,
          treeDepth: 2,
          modelIndex,
          modelDescription: modelHint.description,
          label: modelHint.name,
          searchText: [
            resourceKey,
            attribs.game,
            gameNameMap[attribs.game],
            attribs.name,
            attribs.identifier,
            attribs.resourceType,
            resourceTypeNameMap[attribs.resourceType],
            attribs.filenamePattern,
            modelIndex,
            modelHint.name,
            modelHint.description
          ].join(' ')
        })
      )
    ];
  })
  .sort(
    (left, right) =>
      left.game.localeCompare(right.game) ||
      left.resourceName.localeCompare(right.resourceName) ||
      left.resourceKey.localeCompare(right.resourceKey) ||
      (left.kind === right.kind ? 0 : left.kind === 'resource' ? -1 : 1)
  );

const filterResourceSearchOptions = (
  options: ResourceSearchOption[],
  state: { inputValue: string }
) => {
  const searchValue = state.inputValue.trim().toLowerCase();

  if (!searchValue) {
    return options;
  }

  const matchingOptionIds = new Set<string>();
  const matchingResourceKeys = new Set<string>();

  options.forEach((option) => {
    if (!option.searchText.toLowerCase().includes(searchValue)) {
      return;
    }

    matchingOptionIds.add(option.id);
    matchingResourceKeys.add(option.resourceKey);
  });

  return options.filter((option) => {
    if (option.kind === 'resource') {
      return matchingResourceKeys.has(option.resourceKey);
    }

    return matchingOptionIds.has(option.id);
  });
};

export default function SearchForFiles() {
  const [isResourceSearchOpen, setIsResourceSearchOpen] = useState(false);
  const [resourceSearchInput, setResourceSearchInput] = useState('');
  const visibleResourceSearchParentKeys = new Set(
    filterResourceSearchOptions(resourceSearchOptions, {
      inputValue: resourceSearchInput
    })
      .filter((option) => option.kind === 'resource')
      .map((option) => option.resourceKey)
  );

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: (theme) => theme.zIndex.modal - 1,
          opacity: isResourceSearchOpen ? 1 : 0,
          pointerEvents: isResourceSearchOpen ? 'auto' : 'none',
          bgcolor: 'rgba(8, 10, 12, 0.24)',
          backdropFilter: 'blur(3px) saturate(120%)',
          transition: (theme) =>
            theme.transitions.create('opacity', {
              duration: theme.transitions.duration.standard,
              easing: theme.transitions.easing.easeInOut
            })
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: (theme) => theme.zIndex.modal
        }}
      >
        <Autocomplete<ResourceSearchOption>
          clearOnBlur={false}
          filterOptions={filterResourceSearchOptions}
          getOptionLabel={(option) => option.label}
          groupBy={(option) => gameNameMap[option.game]}
          inputValue={resourceSearchInput}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onClose={() => setIsResourceSearchOpen(false)}
          onInputChange={(_event, value, reason) => {
            if (reason === 'blur') {
              return;
            }

            setResourceSearchInput(value);
          }}
          onOpen={() => setIsResourceSearchOpen(true)}
          openOnFocus
          options={resourceSearchOptions}
          slots={{
            popper: ResourceSearchPopper
          }}
          renderGroup={(params) => (
            <Box key={params.key} sx={{ listStyle: 'none' }}>
              <Typography
                component='div'
                variant='caption'
                sx={{
                  boxSizing: 'border-box',
                  color: 'var(--mui-palette-text-primary)',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  width: '100%',
                  px: 1.5,
                  py: 1,
                  top: 0,
                  zIndex: 1,
                  bgcolor: 'var(--mui-palette-background-paper)',
                  borderBottom: '1px solid var(--mui-palette-divider)'
                }}
              >
                {params.group}
              </Typography>
              <Box
                sx={{
                  listStyle: 'none',
                  m: 0,
                  pr: 1,
                  py: 0.5,
                  width: '100%',
                  position: 'relative',
                  '& > li': {
                    borderRadius: 1,
                    ml: 0,
                    position: 'relative'
                  }
                }}
              >
                {params.children}
              </Box>
            </Box>
          )}
          renderOption={(props, option) => {
            const hasVisibleParentResource =
              option.kind === 'model' &&
              visibleResourceSearchParentKeys.has(option.resourceKey);
            const displayTreeDepth = hasVisibleParentResource
              ? option.treeDepth
              : 1;

            return (
              <Box
                component='li'
                {...props}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  px: 1.5,
                  pr: 1.5,
                  py: 1,
                  width: '100%'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    pl: (displayTreeDepth - 1) * 2,
                    width: '100%',
                    borderLeft: !hasVisibleParentResource
                      ? undefined
                      : '1px solid var(--mui-palette-divider)'
                  }}
                >
                  <Box
                    sx={{
                      alignItems: 'baseline',
                      display: 'flex',
                      gap: 1.5,
                      minWidth: 0,
                      width: '100%'
                    }}
                  >
                    <Typography
                      component='span'
                      variant='body2'
                      sx={{
                        color: 'var(--mui-palette-text-primary)',
                        overflowWrap: 'anywhere',
                        width: '100%'
                      }}
                    >
                      {option.label}
                    </Typography>
                    <Typography
                      component='span'
                      variant='body2'
                      sx={{
                        color: 'var(--mui-palette-text-disabled)',
                        minWidth: 0,
                        overflowWrap: 'anywhere',
                        textAlign: 'right',
                        width: '100%'
                      }}
                    >
                      {option.displayFilenamePattern}
                    </Typography>
                  </Box>
                  <Typography
                    component='div'
                    variant='caption'
                    sx={{
                      color: 'var(--mui-palette-text-secondary)',
                      display: 'block',
                      lineHeight: 1.35,
                      mt: 0.25,
                      overflowWrap: 'anywhere',
                      width: '100%'
                    }}
                  >
                    {option.kind === 'model'
                      ? `${resourceTypeNameMap[option.resourceType]} model ${option.modelIndex} - ${option.resourceName}`
                      : `${resourceTypeNameMap[option.resourceType]} ${option.identifier}`}
                  </Typography>
                  {option.kind === 'model' ? (
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'var(--mui-palette-text-secondary)',
                        display: 'block',
                        lineHeight: 1.35,
                        m: 0,
                        mt: 0.5,
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {option.modelDescription.trim()}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            );
          }}
          sx={{ width: '100%' }}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField
              margin='dense'
              variant='outlined'
              {...params}
              fullWidth
              label='Find supported resources'
              sx={{ width: '100%' }}
              slotProps={{
                input: {
                  ...params.InputProps,
                  sx: { width: '100%' }
                }
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
}
