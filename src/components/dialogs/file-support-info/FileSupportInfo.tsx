import { Box } from '@mui/material';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import DialogSectionHeader from '../DialogSectionHeader';
import clsx from 'clsx';

interface FileSupportEntry {
  title: string;
  filenameFormat: string;
  filenameExample: string;
  fileType: 'Polygon' | 'Texture';
  description: string;
  notes?: string;
  hasIssues?: boolean;
}

const supportEntries: FileSupportEntry[] = [
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'STG{NN}POL.BIN',
    filenameExample: 'STG01POL.BIN',
    fileType: 'Polygon',
    description: 'Stage model/polygons',
    notes: 'Corresponding textures are in similarly named TEX.BIN files'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'STG{NN}TEX.BIN',
    filenameExample: 'STG01TEX.BIN',
    fileType: 'Texture',
    description: 'Stage textures',
    notes: 'Must be loaded with a corresponding POL.BIN file.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'DM{NN}POL.BIN',
    filenameExample: 'DM01POL.BIN',
    fileType: 'Polygon',
    description: 'Demo/menu model/polygons',
    notes: 'Corresponding textures are in similarly named TEX.BIN files'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'DM{NN}TEX.BIN',
    filenameExample: 'DM01TEX.BIN',
    fileType: 'Texture',
    description: 'Demo/menu texture',
    hasIssues: true,
    notes:
      'Must be loaded with corresponding POL.BIN file. Parts of a few specific files use VQ image-compression on images which is not yet supported. These will appear as tiny garbled sections followed by transparency, but textures without VQ can be safely edited.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'PL{NN}_WIN.BIN',
    filenameExample: 'PL1B_WIN.BIN',
    fileType: 'Texture',
    description: 'Player win portrait texture'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'PL{NN}_FAC.BIN',
    filenameExample: 'PL0D_FAC.BIN',
    fileType: 'Texture',
    description:
      'Player lifebars (both Japanese & US/International), super portrait and v.s. portrait',
    notes:
      'Palette will be limited (handled automatically on export). Note that portraits are in a lossy format, and also use a machine learning algorithm that can take up to a minute or two to generate. Because of this, you may want to keep a copy of the original image for any edits vs re-downloading/editing from a lossy format.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'END(DC|NM)TEX.BIN',
    filenameExample: 'ENDDCTEX.BIN',
    fileType: 'Texture',
    description: 'Game ending pictures and hi score name font.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'FONT.BIN',
    filenameExample: 'FONT.BIN',
    fileType: 'Texture',
    description: 'Font textures'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'SELSTG.BIN',
    filenameExample: 'SELSTG.BIN',
    fileType: 'Texture',
    description: 'Stage select screen previews.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'SELTEX.BIN',
    filenameExample: 'SELTEX.BIN',
    fileType: 'Texture',
    description: 'Stage select screen textures',
    notes:
      'Palette will be limited to fit within size limits (handled automatically on export).'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'SELVM(J|U).BIN',
    filenameExample: 'SELVMJ.BIN',
    fileType: 'Texture',
    description: 'VMU selection screen textures'
  },
  {
    title: 'Capcom vs SNK Pro',
    filenameFormat: 'STG{NN}POL.BIN',
    filenameExample: 'STG02POL.BIN',
    fileType: 'Polygon',
    description: 'Stage model/polygons',
    notes: `Corresponding textures are in similarly named TEX.BIN files.`
  },
  {
    title: 'Capcom vs SNK Pro',
    filenameFormat: 'STG{NN}TEX.BIN',
    filenameExample: 'STG02TEX.BIN',
    fileType: 'Texture',
    description: 'Stage textures',
    notes: `Must be loaded with a corresponding POL.BIN file.`
  },
  {
    title: 'Capcom vs SNK Pro',
    filenameFormat: 'DM{NN}POL.BIN',
    filenameExample: 'DM00POL.BIN',
    fileType: 'Polygon',
    description: 'Demo/menu model/polygons',
    notes: `Corresponding textures are in similarly named TEX.BIN files.`
  },
  {
    title: 'Capcom vs SNK Pro',
    filenameFormat: 'DM{NN}TEX.BIN',
    filenameExample: 'DM00TEX.BIN',
    fileType: 'Texture',
    description: 'Demo/menu textures',
    notes: `Must be loaded with a corresponding POL.BIN file.`
  },
  {
    title: 'Capcom vs SNK 2',
    filenameFormat: 'STG{NN}POL.BIN',
    filenameExample: 'STG02POL.BIN',
    fileType: 'Polygon',
    description: 'Stage model/polygons',
    notes: `Corresponding textures are in similarly named TEX.BIN files.`
  },
  {
    title: 'Capcom vs SNK 2',
    filenameFormat: 'STG{NN}(E)TEX.BIN',
    filenameExample: 'STG02TEX.BIN',
    fileType: 'Texture',
    description: 'Stage textures',
    notes: `Must be loaded with a corresponding POL.BIN file.`
  },
  {
    title: 'Capcom vs SNK 2',
    filenameFormat: 'DC{NN}POL.BIN',
    filenameExample: 'DC26POL.BIN',
    fileType: 'Polygon',
    description: 'Menu/Gui polygons/models',
    notes: `Corresponding textures are in similarly named TEX.BIN files.`
  },
  {
    title: 'Capcom vs SNK 2',
    filenameFormat: 'DC(E){NN}TEX.BIN',
    filenameExample: 'DC02TEX.BIN',
    fileType: 'Texture',
    description: 'Menu/Gui textures',
    notes: `Must be loaded with a corresponding POL.BIN file. Certain files are not able to load due to VQ sections, palette will be limited on export.`,
    hasIssues: true
  }
];

const rows = supportEntries.map((row, id) => ({
  ...row,
  id
}));

const getIssuesCellClassName = (params: GridCellParams) =>
  clsx(params.row.hasIssues ? 'has-issues' : '');

const columns: GridColDef<FileSupportEntry>[] = [
  {
    field: 'title',
    headerName: 'Title',
    width: 200,
    cellClassName: getIssuesCellClassName
  },
  {
    field: 'filenameFormat',
    headerName: 'Filename Format',
    width: 200,
    cellClassName: getIssuesCellClassName
  },
  {
    field: 'filenameExample',
    headerName: 'Example',
    width: 150
  },
  {
    field: 'fileType',
    headerName: 'Type',
    width: 120,
    cellClassName: getIssuesCellClassName
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 350
  },
  {
    field: 'notes',
    headerName: 'Notes',
    sortable: false,
    width: 400,
    cellClassName: getIssuesCellClassName
  }
];

const GET_AUTO_ROW_HEIGHT = () => 'auto' as const;

export default function FileSupportInfo() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        '--DataGrid-hasScrollY': 1,
        '& .data-grid-container': {
          overflowY: 'auto'
        },
        '& .MuiDataGrid-row': {
          position: 'relative'
        },

        '& .MuiDataGrid-cell.has-issues, & .MuiDataGrid-cell.has-issues:hover':
          {
            backgroundColor: 'var(--mui-palette-warningBackground)'
          },

        '& .MuiDataGrid-footerContainer': {
          display: 'none'
        }
      }}
    >
      <DialogSectionHeader>Supported Files</DialogSectionHeader>
      <div className='data-grid-container'>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowHeight={GET_AUTO_ROW_HEIGHT}
          className='data-grid'
        />
      </div>
    </Box>
  );
}
