import { styled } from '@mui/material';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import DialogSectionHeader from '../DialogSectionHeader';
import clsx from 'clsx';

const rows = [
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'STG{NN}POL.BIN',
    filenameExample: 'STG01POL.BIN',
    description: 'Stage model/polygons',
    notes: 'Corresponding textures are in similarly named TEX.BIN files'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'STG{NN}TEX.BIN',
    filenameExample: 'STG01TEX.BIN',
    description: 'Stage textures',
    notes: 'Must be loaded with a corresponding POL.BIN file.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'DM{NN}POL.BIN',
    filenameExample: 'DM01POL.BIN',
    description: 'Demo/menu model/polygons',
    notes: 'Corresponding textures are in similarly named TEX.BIN files'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'DM{NN}TEX.BIN',
    filenameExample: 'DM01TEX.BIN',
    description: 'Demo/menu texture',
    notes:
      'Must be loaded with corresponding POL.BIN file. A few of these files use VQ image-compression on images which is not yet supported. These will appear as tiny garbled sections but can be safely edited/re-saved for non VQ areas.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'PL{NN}_WIN.BIN',
    filenameExample: 'PL1B_WIN.BIN',
    description: 'Player win portrait texture',
    notes: ''
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'PL{NN}_FAC.BIN',
    filenameExample: 'PL0D_FAC.BIN',
    description:
      'Player lifebars (both Japanese & US/International), super portrait and v.s. portrait',
    notes:
      'Palette will be limited (handled automatically on export). Note that portraits are in a lossy format, and also use a machine learning algorithm that can take up to a minute or two to generate. Because of this, you may want to keep a copy of the original image for any edits vs re-downloading/editing from a lossy format.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'END(DC|NM)TEX.BIN',
    filenameExample: 'ENDDCTEX.BIN',
    description: 'Game ending pictures and hi score name font.',
    notes: ''
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'SELSTG.BIN',
    filenameExample: 'SELSTG.BIN',
    description: 'Stage select screen previews.',
    notes: ''
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'SELTEX.BIN',
    filenameExample: 'SELTEX.BIN',
    description: 'Stage select screen textures',
    notes:
      'Palette will be limited to fit within size limits (handled automatically on export).'
  },
  {
    title: 'Capcom vs SNK 2',
    filenameFormat: 'STG{NN}POL.BIN',
    filenameExample: 'STG02POL.BIN',
    description: 'Stage model/polygons',
    notes: `Corresponding textures are in similarly named TEX.BIN files.`
  },
  {
    title: 'Capcom vs SNK 2',
    filenameFormat: 'STG{NN}(E)TEX.BIN',
    filenameExample: 'STG02TEX.BIN',
    description: 'Stage textures',
    notes: `Must be loaded with a corresponding POL.BIN file.`
  },
  {
    title: 'Capcom vs SNK 2',
    filenameFormat: 'DC{NN}POL.BIN',
    filenameExample: 'DC26POL.BIN',
    description: 'Menu/Gui polygons/models',
    notes: `Corresponding textures are in similarly named TEX.BIN files.`
  },
  {
    title: 'Capcom vs SNK 2',
    filenameFormat: 'DC(E){NN}TEX.BIN',
    filenameExample: 'DC02TEX.BIN',
    description: 'Menu/Gui textures',
    notes: `Must be loaded with a corresponding POL.BIN file. Certain files are not able to load due to VQ sections, palette will be limited on export.`,
    hasIssues: true
  }
].map((r, id) => ({ ...r, id }));

const Styled = styled('div')(
  ({ theme: { palette } }) => `
    & {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    & .MuiDataGrid-row {
      position: relative;
    }

    & .MuiDataGrid-cell.has-issues, & .MuiDataGrid-cell.has-issues:hover {
      background-color: ${palette.warningBackground};
    }

    & .MuiDataGrid-footerContainer {
      display: none;
    }`
);

const redIssueCellClassName = (params: GridCellParams) =>
  clsx(params.row.hasIssues ? 'has-issues' : '');

const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Title',
    width: 200,
    cellClassName: redIssueCellClassName
  },
  {
    field: 'filenameFormat',
    headerName: 'Filename Format',
    width: 200,
    cellClassName: redIssueCellClassName
  },
  {
    field: 'filenameExample',
    headerName: 'Example',
    width: 150
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
    cellClassName: redIssueCellClassName
  }
];

const GET_AUTO_ROW_HEIGHT = () => 'auto' as const;

export default function FileSupportInfo() {
  return (
    <Styled>
      <DialogSectionHeader>Supported Files</DialogSectionHeader>
      <div className='data-grid-container'>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowHeight={GET_AUTO_ROW_HEIGHT}
          className='data-grid'
        />
      </div>
    </Styled>
  );
}
