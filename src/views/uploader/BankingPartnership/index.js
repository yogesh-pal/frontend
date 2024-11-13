/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  Box, Tab, Tabs, Typography
} from '@mui/material';
import {
  HeaderContainer, CustomContainerStyled, BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled, HeadingMaster
} from '../../../components/styledComponents';
import { MenuNavigation, ToastMessage } from '../../../components';
import { NAVIGATION } from '../../../constants';
import Mapping from './Mapping/index';
import Unmapping from './Unmapping/index';

export const CustomDiv = styled.div(({
  padding
}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  paddingLeft: '10px',
  padding,
}));

const StyledTab = styled((props) => (
  <Tab {...props} />
))(() => ({
  '&.Mui-selected': {
    color: '#502A74 !important',
    padding: '0px',
  },
  '&.MuiButtonBase-root': {
    cursor: 'pointer',
    padding: '0px',
  }
}));

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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

const index = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });

  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Uploader', url: NAVIGATION.uploader },
    { name: 'Bank Partnership', url: NAVIGATION.bankingpartnershipUploader }

  ], NAVIGATION);
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px 20px 0px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Banking Partnership
          </HeadingMaster>
        </HeaderContainer>
        <CustomDiv padding='0px 20px 20px'>
          <Box sx={{
            borderBottom: 1, borderColor: 'divider', width: '100%'
          }}
          >
            <Tabs value={activeTabIndex} onChange={(e, newValue) => setActiveTabIndex(newValue)} TabIndicatorProps={{ style: { background: '#502A74' } }}>
              <StyledTab
                label='Mapping'
                {...a11yProps(0)}
              />
              <StyledTab label='Unmapping' {...a11yProps(1)} />
            </Tabs>
          </Box>
        </CustomDiv>

        <TabPanel value={activeTabIndex} index={0}>
          <Mapping setAlertShow={setAlertShow} />
        </TabPanel>
        <TabPanel value={activeTabIndex} index={1}>
          <Unmapping setAlertShow={setAlertShow} />

        </TabPanel>
      </CustomContainerStyled>
    </>
  );
};

export default index;
