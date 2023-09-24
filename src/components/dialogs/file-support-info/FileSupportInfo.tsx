import { styled } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DialogSectionHeader from '../DialogSectionHeader';

const COMPRESSED_FILE_NOTE =
  'These are compressed files; export is mostly supported but still experimental and in a few niche cases corrupts the ROM.';

const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Title',
    width: 200
  },
  {
    field: 'filenameFormat',
    headerName: 'Filename Format',
    width: 200
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
    width: 400
  }
];

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
    notes: COMPRESSED_FILE_NOTE
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'PL{NN}_FAC.BIN',
    filenameExample: 'PL0D_FAC.BIN',
    description: 'Player lifebar and superportraits',
    notes:
      'This file has a very specific format including VQ images; currently can view a few of the images related to lifebars and export file support is W.I.P.'
  },
  {
    title: 'Marvel vs Capcom 2',
    filenameFormat: 'END(DC|NM)TEX.BIN',
    filenameExample: 'ENDDCTEX.BIN',
    description: 'Game ending pictures and hi score name font.',
    notes: COMPRESSED_FILE_NOTE
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
    filenameFormat: 'STG{NN}TEX.BIN',
    filenameExample: 'STG02TEX.BIN',
    description: 'Stage textures',
    notes: `Must be loaded with a corresponding POL.BIN file. ${COMPRESSED_FILE_NOTE}`
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
    filenameFormat: 'DC{NN}TEX.BIN',
    filenameExample: 'DC02TEX.BIN',
    description: 'Menu/Gui textures',
    notes: `Must be loaded with a corresponding POL.BIN file. ${COMPRESSED_FILE_NOTE} There also may be cases of VQ image data not yet supported that appear garbled.`
  }
].map((r, id) => ({ ...r, id }));

const Styled = styled('div')(
  () => `
    & {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: calc(100vh - 120px);
    }
    
    & .MuiDataGrid-footerContainer {
      display: none;
    }`
);

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
