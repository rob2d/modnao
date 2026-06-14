import SearchIcon from '@mui/icons-material/Search';
import gameNameMap from '@/constants/gameNameMap';
import resourceAttribMappings from '@/constants/resourceAttribMappings';
import resourceTypeNameMap from '@/constants/resourceTypeNameMap';
import { selectPolygonFileName, selectTextureFileName } from '@/selectors';
import { useAppSelector } from '@/storeTypings';
import type { ResourceAttribs } from '@/types';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  InputAdornment,
  Popper,
  PopperProps,
  SxProps,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

interface ResourceSearchOptionBase {
  id: string;
  game: ResourceAttribs['game'];
  resourceKey: string;
  resourceName: string;
  resourceType: ResourceAttribs['resourceType'];
  identifier: string;
  filenamePattern: string;
  displayFilenamePattern: string;
  textureDefsHash?: string;
  textureFileType?: ResourceAttribs['textureFileType'];
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
  modelDescription?: string;
  modelKeywords?: string[];
  modelSearchText: string;
  resourceSearchText: string;
}

type ResourceSearchOption =
  | ResourceMappingSearchOption
  | ResourceModelSearchOption;

export type ResourceNavigatorOption = ResourceSearchOption;

interface ResourceSearchInputState {
  resetKey: string;
  value: string;
}

const formatFilenamePattern = (filenamePattern: string) =>
  filenamePattern
    .replace(/\(\.mn\)\?/gi, '')
    .replace(/\[0-9A-Z\]\{2\}/gi, 'XY')
    .replace(/[()]/g, '')
    .replace(/^\^/, '')
    .replace(/\$$/, '');

const searchTextMatchesTerm = (searchText: string, term: string) =>
  searchText
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .some((word) => word.startsWith(term));

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

const getDisplayFilenamePattern = (attribs: ResourceAttribs) => {
  const displayFilenamePattern = formatFilenamePattern(attribs.filenamePattern);

  if (!/POL\.BIN$/i.test(attribs.filenamePattern)) {
    return displayFilenamePattern;
  }

  const textureAttribs = attribs.textureFileType
    ? resourceAttribMappings[attribs.textureFileType]
    : Object.values(resourceAttribMappings).find(
        (candidate) =>
          candidate !== attribs &&
          candidate.game === attribs.game &&
          candidate.resourceType === attribs.resourceType &&
          candidate.name === attribs.name &&
          candidate.identifier === attribs.identifier &&
          /TEX(?:\(.mn\)\?)?\.BIN\$/i.test(candidate.filenamePattern)
      );

  if (!textureAttribs) {
    return displayFilenamePattern;
  }

  return `${displayFilenamePattern}, ${formatFilenamePattern(textureAttribs.filenamePattern)}`;
};

const resourceSearchOptions = Object.entries(resourceAttribMappings)
  .flatMap(([resourceKey, attribs]): ResourceSearchOption[] => {
    const displayFilenamePattern = getDisplayFilenamePattern(attribs);
    const resourceSearchText = [
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
    ].join(' ');

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
      textureDefsHash: attribs.textureDefsHash,
      textureFileType: attribs.textureFileType,
      treeDepth: 1,
      label: attribs.name,
      searchText: resourceSearchText
    };

    if (!attribs.polygonMapped || !attribs.modelHints) {
      return [resourceOption];
    }

    return [
      resourceOption,
      ...Object.entries(attribs.modelHints).map(
        ([modelIndex, modelHint]): ResourceModelSearchOption => {
          const modelSearchText = [
            modelIndex,
            modelHint.name,
            modelHint.description,
            modelHint.keywords?.join(' ')
          ].join(' ');

          return {
            id: `model:${resourceKey}:${modelIndex}`,
            kind: 'model',
            game: attribs.game,
            resourceKey,
            resourceName: attribs.name,
            resourceType: attribs.resourceType,
            identifier: attribs.identifier,
            filenamePattern: attribs.filenamePattern,
            displayFilenamePattern,
            textureDefsHash: attribs.textureDefsHash,
            textureFileType: attribs.textureFileType,
            treeDepth: 2,
            modelIndex,
            modelDescription: modelHint.description,
            label: modelHint.name,
            modelSearchText,
            resourceSearchText,
            searchText: [resourceSearchText, modelSearchText].join(' ')
          };
        }
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

  const searchTerms = searchValue.split(/\s+/);
  const matchingOptionIds = new Set<string>();
  const matchingResourceKeys = new Set<string>();

  options.forEach((option) => {
    const matchesSearchTerms =
      option.kind === 'resource'
        ? searchTerms.every((term) =>
            searchTextMatchesTerm(option.searchText, term)
          )
        : searchTerms.every((term) =>
            [option.resourceSearchText, option.modelSearchText].some(
              (searchText) => searchTextMatchesTerm(searchText, term)
            )
          ) &&
          searchTerms.some((term) =>
            searchTextMatchesTerm(option.modelSearchText, term)
          );

    if (!matchesSearchTerms) {
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

const scopedResourceAttribKeys = [
  'game',
  'name',
  'resourceType',
  'identifier',
  'filenamePattern',
  'textureDefsHash',
  'textureFileType'
] as const satisfies ReadonlyArray<keyof ResourceAttribs>;

const getScopedResourceKey = (scope: ResourceAttribs) =>
  Object.entries(resourceAttribMappings).find(
    ([, attribs]) =>
      attribs === scope ||
      scopedResourceAttribKeys.every((key) => attribs[key] === scope[key])
  )?.[0];

interface ResourceNavigatorProps {
  includeSourceResourceOption?: boolean;
  label?: string;
  onSelectOption?: (option: ResourceNavigatorOption) => boolean;
  scope?: ResourceAttribs;
  sx?: SxProps;
}

export default function ResourceNavigator({
  includeSourceResourceOption = true,
  label = 'Find supported resources',
  onSelectOption,
  scope,
  sx
}: ResourceNavigatorProps) {
  const polygonFileName = useAppSelector(selectPolygonFileName);
  const textureFileName = useAppSelector(selectTextureFileName);
  const resourceSearchInputResetKey = `${polygonFileName ?? ''}:${textureFileName ?? ''}`;
  const [isResourceSearchOpen, setIsResourceSearchOpen] = useState(false);
  const [resourceSearchInputState, setResourceSearchInputState] =
    useState<ResourceSearchInputState>({
      resetKey: resourceSearchInputResetKey,
      value: ''
    });
  const resourceSearchInput =
    resourceSearchInputState.resetKey === resourceSearchInputResetKey
      ? resourceSearchInputState.value
      : '';

  const scopedResourceKey = useMemo(
    () => (!scope ? undefined : getScopedResourceKey(scope)),
    [scope]
  );

  const scopedResourceSearchOptions = useMemo(
    () =>
      !scopedResourceKey
        ? resourceSearchOptions
        : resourceSearchOptions.filter(
            (option) => option.resourceKey === scopedResourceKey
          ),
    [scopedResourceKey]
  );

  const visibleResourceSearchOptions = useMemo(
    () =>
      includeSourceResourceOption
        ? scopedResourceSearchOptions
        : scopedResourceSearchOptions.filter(
            (option) => option.kind === 'model'
          ),
    [includeSourceResourceOption, scopedResourceSearchOptions]
  );

  const visibleResourceSearchParentKeys = useMemo(
    () =>
      new Set(
        filterResourceSearchOptions(visibleResourceSearchOptions, {
          inputValue: resourceSearchInput
        })
          .filter((option) => option.kind === 'resource')
          .map((option) => option.resourceKey)
      ),
    [resourceSearchInput, visibleResourceSearchOptions]
  );

  const onSelectResourceSearchOption = useCallback(
    (_event: React.SyntheticEvent, option: ResourceSearchOption | null) => {
      if (!option) {
        return;
      }

      const didNavigate = onSelectOption?.(option) ?? false;

      setResourceSearchInputState({
        resetKey: resourceSearchInputResetKey,
        value: didNavigate ? '' : option.displayFilenamePattern
      });
    },
    [onSelectOption, resourceSearchInputResetKey]
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', ...sx }}>
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
          size='small'
          blurOnSelect
          clearOnBlur={false}
          filterOptions={filterResourceSearchOptions}
          getOptionKey={(option) => option.id}
          getOptionLabel={(option) => option.label}
          groupBy={(option) => gameNameMap[option.game]}
          inputValue={resourceSearchInput}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={onSelectResourceSearchOption}
          onClose={() => setIsResourceSearchOpen(false)}
          onInputChange={(_event, value, reason) => {
            if (reason === 'blur' || reason === 'reset') {
              return;
            }

            setResourceSearchInputState({
              resetKey: resourceSearchInputResetKey,
              value
            });
          }}
          onOpen={() => setIsResourceSearchOpen(true)}
          openOnFocus
          options={visibleResourceSearchOptions}
          value={null}
          slots={{
            popper: ResourceSearchPopper
          }}
          renderGroup={(params) => (
            <Box
              key={`${params.key}:${resourceSearchInput}`}
              sx={{ listStyle: 'none' }}
            >
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
                key={option.id}
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
                      ? `${resourceTypeNameMap[option.resourceType]} model ${Number(option.modelIndex) + 1} - ${option.resourceName}`
                      : `${resourceTypeNameMap[option.resourceType]} ${option.identifier}`}
                  </Typography>
                  {!(
                    option.kind === 'model' && option.modelDescription
                  ) ? null : (
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
                      {option.modelDescription?.trim()}
                    </Typography>
                  )}
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
              label={label}
              sx={{ width: '100%' }}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position='start' sx={{ mr: 0.5 }}>
                        <SearchIcon
                          fontSize='small'
                          sx={{ color: 'var(--mui-palette-text-secondary)' }}
                        />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  sx: {
                    width: '100%',
                    '& .MuiAutocomplete-input': {
                      pl: 0
                    }
                  }
                }
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
}
