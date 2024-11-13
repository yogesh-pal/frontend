import { useEffect, useState } from 'react';
import {
  Alert,
  Snackbar,
  styled,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { MenuNavigation } from '../../components';
import { BreadcrumbsContainerStyled, BreadcrumbsWrapperContainerStyled } from '../../components/styledComponents';
import {
  navigationDetails
} from './navigationDetails';
import { Service } from '../../service';
import { SERVICEURL } from '../../constants';
import Loader from '../../components/PageLoader';

const IframeStyled = styled('iframe')(() => ({
  border: 'none',
  width: '100%',
  height: 'calc(100vh - 300px)',
}));

const AssignedCollectionLead = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [url, setUrl] = useState('');
  const { selectedBranch } = useSelector((state) => state.user.userDetails);

  const getAssignedCollectionData = async () => {
    try {
      const res = await Service.post(SERVICEURL.CIRCULAR.ASSIGNED_COLLECTION_LEAD, {
        branch_code: selectedBranch,
      });
      if (res?.data?.status === 400) {
        setAlertShow({ open: true, msg: res?.data?.message || 'Something went wrong, please try again.', alertType: 'error' });
        return;
      }
      setUrl(res?.data?.result?.redirectUrl);
    } catch (err) {
      const errors = err?.response?.data?.message;
      setAlertShow({ open: true, msg: errors || 'Something went wrong, please try again.', alertType: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAssignedCollectionData();
  }, []);
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      {
        !isLoading ? (
          <IframeStyled
            allowtransparency
            src={url}
          />
        ) : <Loader />
      }
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={alertShow?.open}
        autoHideDuration={3000}
        key='bottom center'
        onClose={() => setAlertShow({ ...alertShow, open: false })}
      >
        <Alert
          severity={alertShow?.alertType ?? 'success'}
          sx={{ width: '100%' }}
          onClose={() => setAlertShow({ ...alertShow, open: false })}
        >
          {alertShow?.msg}
        </Alert>
      </Snackbar>
    </>
  );
};
export default AssignedCollectionLead;
