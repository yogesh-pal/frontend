import jwtDecode from 'jwt-decode';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  icons
} from '../../../../components';
import store from '../../../../redux/store';
import { PERMISSION } from '../../../../constants';

const EditIcon = icons.Edit;
const ViewIcon = icons.View;
const CustomerAddIcon = icons.PersonAddAltIcon;

const IconContainer = styled(Box)(() => ({
  cursor: 'pointer'
}));

const Container = styled(Box)(() => ({
}));

export const columnFields = ({
  viewCustomerDetailsHandler,
  editCustomerDetailsHandler,
  userDetails,
  updateCustomerGoldhandler
}) => {
  const state = store.getState();
  const decodedToken = jwtDecode(state.user.accessToken);
  const permissionsArray = decodedToken.permissions.split(',');
  const columns = [
    {
      field: 'first_name',
      headerName: 'First Name',
      minWidth: 100,
      sortable: false,
      flex: 1,
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
      field: 'dob',
      headerName: 'DOB',
      minWidth: 100,
      sortable: false,
      flex: 1,
    },
    {
      field: 'pan_no',
      headerName: 'PAN',
      minWidth: 100,
      sortable: false,
      flex: 1,
    },
    {
      field: 'kyc_date',
      headerName: 'KYC Date',
      minWidth: 100,
      sortable: false,
      flex: 1,
    },
    {
      field: 'action',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      align: 'center',
      renderCell: (cellValues) => (
        <Container>
          {
            !cellValues?.row?.exists_in_goldloan ? (
              <IconContainer
                onClick={() => updateCustomerGoldhandler(cellValues)}
              >
                <CustomerAddIcon />
              </IconContainer>
            )
              : (
                <>
                  <ViewIcon onClick={() => viewCustomerDetailsHandler(cellValues)} />
                  {
          userDetails?.branchCodes?.length === 1 && permissionsArray
          && permissionsArray.includes(PERMISSION.customerUpdate) ? (
            <EditIcon onClick={() => editCustomerDetailsHandler(cellValues)} />) : null
          }
                </>
              )
    }
        </Container>
      )
    },
  ];

  return columns;
};
