import React from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { useScreenSize } from '../../../customHooks';
import {
  DashboardTiles, MenuNavigation
} from '../../../components';
import { ROUTENAME, NAVIGATION, PERMISSION } from '../../../constants';
import {
  BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled,
} from '../../../components/styledComponents';
import { checkUserPermission } from '../../../utils';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;

const tabData = [
  {
    name: 'Customer Creation', route: ROUTENAME.customerSearch, icon: <PersonAddIcon />, permission: [[PERMISSION.customerCreate], [PERMISSION.customerMaker], [PERMISSION.customerUpdate]]
  },
  {
    name: 'Customer Summary', route: ROUTENAME.customerSummary, icon: <AssignmentIcon />, permission: [PERMISSION.customerView]
  },
  {
    name: 'Customer Creation Queue', route: ROUTENAME.customerCreationQueue, icon: <VerifiedUserIcon />, permission: [PERMISSION.customerChecker]
  },
  {
    name: 'Contact Point Verification', route: ROUTENAME.contactPointVerification, icon: <VerifiedUserIcon />, permission: [[PERMISSION.cpvView], [PERMISSION.cpvUpdate], [PERMISSION.cpvChecker]]
  },
];
const index = () => {
  const navigate = useNavigate();
  const screen = useScreenSize();
  const navigationDetails = [
    {
      name: 'Dashboard',
      url: NAVIGATION.dashboard
    },
    {
      name: 'Customer 360',
      url: NAVIGATION.customerDashboard
    },
  ];
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomBox>
        {tabData.map((tab) => {
          if (tab?.permission?.length) {
            if (Array.isArray(tab.permission[0])
            && tab.permission.some((ele) => checkUserPermission(ele))) {
              return <DashboardTiles key={tab?.name} tab={tab} handleClick={handleClick} fontSize={(screen === 'sm' || screen === 'xs') ? '15px' : '25px'} />;
            } if (checkUserPermission(tab.permission)) {
              return <DashboardTiles key={tab?.name} tab={tab} handleClick={handleClick} fontSize={(screen === 'sm' || screen === 'xs') ? '15px' : '25px'} />;
            }
            return null;
          }
          return <DashboardTiles key={tab?.name} tab={tab} handleClick={handleClick} fontSize={(screen === 'sm' || screen === 'xs') ? '15px' : '25px'} />;
        })}
      </CustomBox>
    </>
  );
};

export default index;
