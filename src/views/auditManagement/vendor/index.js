import React, { useState } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { DashboardTiles, MenuNavigation, icons } from '../../../components';
import { ROUTENAME, NAVIGATION, MODULE_PERMISSION } from '../../../constants';
import { useScreenSize } from '../../../customHooks';
import {
  BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled,
} from '../../../components/styledComponents';
import { checkUserPermission } from '../../../utils';

const {
  PersonAdd,
  PersonIcon
} = icons;

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;

const AuditManagement = () => {
  const screen = useScreenSize();
  const [tabData,] = useState([
    {
      name: 'Vendor Master',
      route: ROUTENAME.vendorMaster,
      icon: <PersonAdd />,
      permission: MODULE_PERMISSION.vendorUser
    },
    {
      name: 'Vendor User',
      route: ROUTENAME.vendorUser,
      icon: <PersonIcon />,
      permission: MODULE_PERMISSION.vendorUser
    }
  ]);
  const navigate = useNavigate();
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const navigationDetails = [
    {
      name: 'Dashboard',
      url: NAVIGATION.dashboard
    },
    {
      name: 'Audit Dashboard',
      url: NAVIGATION.auditManagement
    },
    {
      name: 'Vendor',
      url: NAVIGATION.vendor
    },
  ];

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomBox>
        {tabData.map((tab) => (
          checkUserPermission(tab.permission) && <DashboardTiles key={tab?.name} tab={tab} handleClick={handleClick} fontSize={(screen === 'sm' || screen === 'xs') ? '15px' : '25px'} />
        ))}
      </CustomBox>
    </>
  );
};

export default AuditManagement;
