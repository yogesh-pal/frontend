/* eslint-disable no-underscore-dangle */
import moment from 'moment';
import { ButtonPrimary } from '../../../components/styledComponents';

export const togglerGroup = {
  defaultValue: 'customer_id',
  values: [
    {
      name: 'Customer ID',
      value: 'customer_id',
    },
    {
      name: 'Mobile No',
      value: 'primary_mobile_number',
    },
  ]
};

export const columnFields = () => [
  {
    field: 'first_name',
    headerName: 'First Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'last_name',
    headerName: 'Last Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: ({ row }) => row.last_name || 'NA'
  },
  {
    field: 'customer_id',
    headerName: 'Customer ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'primary_mobile_number',
    headerName: 'Mobile No',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'active_pos',
    headerName: 'POS Value',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'cpv_status',
    headerName: 'CPV Status',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'primary_checker_role',
    headerName: 'Assigned To',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'checker_role',
    headerName: 'Approved By',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: ({ row }) => row.checker_role || 'NA'

  },
  {
    field: 'created_on',
    headerName: 'Date & Time',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: ({ row }) => (row.created_on ? moment.unix(row.created_on).format('DD-MM-YYYY hh:mm a') : 'N/A')
  },
  {
    field: 'documents',
    headerName: 'Documents',
    minWidth: 50,
    sortable: false,
    flex: 1,
    renderCell: ({ row }) => (row.cpv_status === 'Pending' ? 'NA' : (
      <ButtonPrimary onClick={(e) => {
        e.stopPropagation();
        window.open(`/cam-report-cpv/${row.customer_id}-${row._id}`, '_blank');
      }}
      >
        CAM
      </ButtonPrimary>
    ))
  }
];

export const addressProvider = (address1, address2, city, state, pincode) => {
  const formattedAddress1 = address1 ?? '';
  const formattedAddress2 = address2 ?? '';
  const formattedCity = city ?? '';
  const formattedState = state ?? '';
  const formattedPincode = pincode ?? '';
  const finalAns = `${formattedAddress1}  ${formattedAddress2}  ${formattedCity}  ${formattedState}  ${formattedPincode}`;
  return finalAns.trim();
};

export const queryStringProvider = (obj) => {
  const keyValueString = Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join('&');
  return keyValueString;
};

export const imageProvider = (obj, key) => {
  const images = [];
  Object.keys(obj).forEach((ele) => {
    if (ele.includes(key)) {
      images.push(obj[ele]);
    }
  });
  return images;
};
