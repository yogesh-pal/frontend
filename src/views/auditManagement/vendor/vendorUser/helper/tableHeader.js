import {
  icons,
} from '../../../../../components';

const { Edit } = icons;

export const columnFields = ({
  viewVendorDetailsHandler
}) => [
  {
    field: 'vendor_name',
    headerName: 'Vendor Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'emp_code',
    headerName: 'User ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'emp_name',
    headerName: 'User Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'mobile',
    headerName: 'Mobile',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 120,
    sortable: false,
    align: 'center',
    renderCell: (cellValues) => (
      <Edit
        onClick={() => viewVendorDetailsHandler(cellValues)}
      />
    )
  },
];
