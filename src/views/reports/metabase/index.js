import React, {
  useEffect, useMemo, useState, forwardRef
} from 'react';
import {
  styled, Box, OutlinedInput, ListItemText, FormControl
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import { useSelector } from 'react-redux';
import MuiAlert from '@mui/material/Alert';
import { MenuNavigation } from '../../../components';
import {
  NAVIGATION, SERVICEURL, VARIABLE
} from '../../../constants';
import { Service } from '../../../service';
import {
  BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled,
  SelectLabelStyled,
  SelectMenuStyle,
  SelectStyled,
  ButtonPrimary,
  CheckboxPrimary
} from '../../../components/styledComponents';

import Loader from '../../../components/PageLoader';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const IframeStyled = styled('iframe')(() => ({
  border: 'none',
  width: '100%',
  height: 'calc(100vh - 300px)',
}));

const ContainerStyled = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '0 0 10px 0'
}));

const MetabaseReport = () => {
  const { branchCodes, selectedBranch } = useSelector((state) => state.user.userDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState({});
  const [branchCodesDetails, setBranchCodesDetails] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [branchOptionSelected, setBanchOptionSelected] = useState([]);

  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Reports', url: NAVIGATION.reports },
    { name: 'Metabase Report', url: NAVIGATION.metabase },

  ], NAVIGATION);

  const reportHandler = async (branch) => {
    try {
      setIsLoading(true);
      const configResponse = await Service.get(SERVICEURL.CIRCULAR.METABASEREPORTCONFIG);
      const { dashboard } = configResponse.data;

      const { data } = await Service.post(SERVICEURL.CIRCULAR.METABASEREPORT, {
        dashboard_identifier: dashboard?.CUSTOMER,
        branch_code: branch
      });
      setDetails(data?.data);
    } catch (err) {
      const errors = err?.response?.data?.message;
      setAlertShow({ open: true, msg: errors || 'Something went wrong, please try again.', alertType: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event, valueCl) => {
    try {
      const {
        target: { value },
      } = event;
      const selectedValue = valueCl?.props.value;
      const valueTemp = value.includes(VARIABLE.BRANCHALL);

      if (selectedValue === VARIABLE.BRANCHALL && valueTemp) {
        setBanchOptionSelected([VARIABLE.BRANCHALL, ...branchCodes]);
      } else if (!valueTemp && selectedValue === VARIABLE.BRANCHALL) {
        setBanchOptionSelected([]);
      } else if (selectedValue !== VARIABLE.BRANCHALL && valueTemp) {
        const filterArr = value.filter((item) => item !== VARIABLE.BRANCHALL);
        setBanchOptionSelected(filterArr);
      } else {
        setBanchOptionSelected(
          typeof value === 'string' ? value.split(',') : value,
        );
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const searchHandler = () => {
    try {
      const findDetails = branchOptionSelected.includes(VARIABLE.BRANCHALL);
      reportHandler(findDetails ? [] : branchOptionSelected);
    } catch (err) {
      console.log('Error', err);
    }
  };

  const updateBranchDetailsHandler = () => {
    try {
      setBranchCodesDetails([VARIABLE.BRANCHALL, ...branchCodes]);
      const isAllBranch = (selectedBranch === VARIABLE.BRANCHALL) || branchCodes.length === 1;
      if (isAllBranch) {
        setBanchOptionSelected([VARIABLE.BRANCHALL, ...branchCodes]);
      } else {
        setBanchOptionSelected([selectedBranch]);
      }
      reportHandler(isAllBranch ? [] : [selectedBranch]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    updateBranchDetailsHandler();
  }, []);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <ContainerStyled>
        <FormControl sx={{ m: 1, width: 300 }}>
          <SelectLabelStyled id='demo-multiple-checkbox-label'>Branch ID</SelectLabelStyled>
          <SelectStyled
            labelId='demo-multiple-checkbox-label'
            id='demo-multiple-checkbox'
            multiple
            value={branchOptionSelected}
            onChange={handleChange}
            input={<OutlinedInput label='Branch ID' />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {branchCodesDetails.map((name) => (
              <SelectMenuStyle key={name} value={name}>
                <CheckboxPrimary checked={branchOptionSelected.indexOf(name) > -1} />
                <ListItemText primary={name} />
              </SelectMenuStyle>
            ))}
          </SelectStyled>
        </FormControl>
        <ButtonPrimary disabled={isLoading} onClick={searchHandler}> Apply </ButtonPrimary>
      </ContainerStyled>
      {
        !isLoading ? (
          <IframeStyled
            allowtransparency
            src={details?.iframeURL}
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

export default MetabaseReport;
