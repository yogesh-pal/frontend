import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  Box, Tab, Tabs, Typography
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../constants';
import { MenuNavigation } from '../../../components';
import FormGenerator from '../../../components/formGenerator';
import {
  HeaderContainer, CustomContainerStyled, BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled, HeadingMaster
} from '../../../components/styledComponents';
import UserPermission from '../userPermission';
import { CustomDiv } from '../styled-components';
import { userDetailFormConfig, ExternalUserformConfig } from '../constant';
import { Service } from '../../../service';
import { existingUserDetails, externalUserDetails } from '../../../redux/reducer/userManagement';
import UserBranch from '../userBranch';

const StyledTab = styled((props) => (
  <Tab {...props} />
))(() => ({
  '&.Mui-selected': {
    color: '#502A74 !important',
    padding: '0px',
  },
  '&.MuiButtonBase-root': {
    cursor: 'unset',
    padding: '0px',
  }
}));

const TabPanel = (props) => {
  const {
    children, value, index, ...other
  } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const UserDetail = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [formDetails, setFormDetails] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const { state, pathname } = useLocation();
  const dispatch = useDispatch();
  const existingUser = useSelector((data) => data.userManagement.existingUser);
  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'User Management', url: NAVIGATION.userManagement }
  ], NAVIGATION);
  let isUserDetailPage = false;
  if (pathname === '/user-detail') {
    isUserDetailPage = true;
    navigationDetails.push({ name: 'User Details', url: NAVIGATION.userDetail });
  } else {
    navigationDetails.push({ name: 'Add External User', url: NAVIGATION.addUser });
  }
  const handleExternalUser = async () => {
    try {
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      if (data?.branches) {
        const branchCodeArray = [];
        data.branches.map((ele) => branchCodeArray.push(ele.branchCode));
        const config = ExternalUserformConfig(data.branches, branchCodeArray);
        setFormDetails({ form: config });
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  const handlerExistingUser = async () => {
    let permissionsString = '';
    let mappedBranches = [];
    const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/permissions/list?page_size=1000`);
    if (data?.results.length) {
      if (state?.permissions) {
        state.permissions.split(',').forEach((item) => {
        // eslint-disable-next-line max-len
          const permissionArray = data.results.filter((ele) => ele.name.toLowerCase() === item.toLowerCase());
          if (permissionArray.length) {
            permissionsString += (permissionsString.length ? `,${permissionArray[0].id}` : permissionArray[0].id);
          }
        });
      }
      if (state?.mapped_branches) {
        mappedBranches = state.mapped_branches.filter((ele) => ele.is_active);
      }
    }
    dispatch(existingUserDetails({
      ...state,
      permissions:
      permissionsString,
      mapped_branches: mappedBranches
    }));
    const config = userDetailFormConfig(state);
    setFormDetails({ form: config });
  };

  useEffect(() => {
    if (isUserDetailPage) {
      if (!Object.keys(existingUser).length) {
        handlerExistingUser();
      } else {
        const config = userDetailFormConfig(existingUser);
        setFormDetails({ form: config });
      }
    } else {
      handleExternalUser();
    }
  }, [activeTabIndex]);

  const formHandler = (values) => {
    if (isUserDetailPage) {
      const data = { ...existingUser, ...values };
      delete data.activeAddMore;
      delete data.activeFormIndex;
      dispatch(existingUserDetails(data));
    } else {
      dispatch(externalUserDetails(values));
    }
    setActiveTabIndex(activeTabIndex + 1);
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px 20px 0px !important'>
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            {isUserDetailPage ? 'User Details' : 'Add External User'}
          </HeadingMaster>
        </HeaderContainer>
        <CustomDiv padding='0px 20px 20px'>
          <Box sx={{
            borderBottom: 1, borderColor: 'divider', width: '100%'
          }}
          >
            <Tabs value={activeTabIndex} TabIndicatorProps={{ style: { background: '#502A74' } }}>
              <StyledTab
                label='User'
                {...a11yProps(0)}
              />
              <StyledTab label='Permission' {...a11yProps(1)} disabled={!isUserDetailPage && activeTabIndex < 1} />
              <StyledTab label='Branch' {...a11yProps(2)} disabled={!isUserDetailPage && activeTabIndex < 2} />
            </Tabs>
          </Box>
        </CustomDiv>
        <TabPanel value={activeTabIndex} index={0}>
          {
            formDetails && (
            <FormGenerator
              isLoading={false}
              formHandler={formHandler}
              formDetails={formDetails}
              alertShow={alertShow}
              setAlertShow={setAlertShow}
              setFormDetails={setFormDetails}
            />
            )
          }
        </TabPanel>
        <TabPanel value={activeTabIndex} index={1}>
          <UserPermission
            empData={existingUser}
            setActiveTabIndex={setActiveTabIndex}
            isUserDetailPage={isUserDetailPage}
          />
        </TabPanel>
        <TabPanel value={activeTabIndex} index={2}>
          <UserBranch
            setActiveTabIndex={setActiveTabIndex}
          />
        </TabPanel>
      </CustomContainerStyled>
    </>
  );
};

export default UserDetail;
