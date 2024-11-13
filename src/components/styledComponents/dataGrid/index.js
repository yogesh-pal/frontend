import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { styled } from '@mui/material/styles';

export const DataGridStyled = styled(DataGrid)(({ theme, display }) => ({
  '.MuiDataGrid-columnHeader:focus': {
    outline: 'none !important'
  },
  '.MuiDataGrid-cell:focus': {
    outline: 'none !important'
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme?.background?.primary,
    color: theme.text.ternary,
    fontSize: '15px',
    '& .MuiCheckbox-root': {
      color: `${theme.text.ternary} !important`,
    },
    '& .MuiIconButton-root': {
      color: `${theme.text.ternary} !important`,
    }
  },
  '& .Mui-selected': {
    backgroundColor: `${theme.background.secondary} !important`,
    color: '#502A74 !important',
    fontWeight: 900,
    '& .MuiCheckbox-root': {
      color: '#502a74 !important',
    }
  },
  // '& .MuiDataGrid-row:hover': {
  //   backgroundColor: `${theme.background.secondary} !important`,
  //   color: `${theme.text.primary} !important`,
  //   cursor: 'unset',
  //   fontWeight: 900,
  //   '& .MuiCheckbox-root': {
  //     color: '#502a74 !important',
  //   }
  // },
  '& .MuiDataGrid-row.enabledRow:hover': {
    color: `${theme.text.primary}`,
    cursor: 'pointer',
    fontWeight: 900,
    maxHeight: 'fit-content !important'
  },
  // '& .MuiDataGrid-cell': {
  //   overflow: 'unset !important',
  //   whiteSpace: 'unset !important',
  //   wordBreak: 'break-word',
  //   maxHeight: 'fit-content !important',
  //   textAlign: 'center'
  // },
  '& .MuiDataGrid-row.disabledRow:hover': {
    backgroundColor: '#fff',
    color: '#bdbdbd',
    cursor: 'unset'
  },
  '& .MuiDataGrid-row.enabledRow': {
    maxHeight: 'fit-content !important',
  },
  '& .MuiDataGrid-row.disabledRow': {
    maxHeight: 'fit-content !important',
    color: '#bdbdbd'
  },
  '& .MuiList-root': {
    '& .MuiMenuItem-root:hover': {
      backgroundColor: `${theme.background.secondary} !important`,
    }
  },
  '& .MuiTablePagination-selectIcon': {
    color: `${theme.background.primary}`
  },
  '.MuiDataGrid-footerContainer': {
    display: display || 'flex'
  }

}));
