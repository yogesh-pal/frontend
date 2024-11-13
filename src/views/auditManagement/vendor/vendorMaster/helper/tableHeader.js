import {
  icons,
} from '../../../../../components';

const { PersonAdd } = icons;

export const columnFields = ({
  viewVendorDetailsHandler
}) => [
  {
    field: 'vendor_code',
    headerName: 'Vendor Code',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'vendor_name',
    headerName: 'Vendor Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'mobile_number',
    headerName: 'Mobile',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'email_id',
    headerName: 'Email',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'gst_number',
    headerName: 'GST No.',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'action',
    headerName: 'Add User',
    width: 120,
    sortable: false,
    align: 'center',
    renderCell: (cellValues) => (
      <PersonAdd
        onClick={() => viewVendorDetailsHandler(cellValues)}
      />
    )
  },
];
