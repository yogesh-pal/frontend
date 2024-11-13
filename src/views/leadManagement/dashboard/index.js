import React from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
// import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
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
    name: 'New Lead', route: ROUTENAME.newLead, icon: <PersonAddIcon />, permission: [PERMISSION.leadCreate]
  },
  {
    name: 'Dashboard', route: ROUTENAME.leadDashboard, icon: <AssignmentIcon />, permission: [PERMISSION.leadView]
  },
  {
    name: 'Bima Saral Insurance Portal', route: ROUTENAME.leadInsurance, icon: <MedicalInformationOutlinedIcon />, permission: [PERMISSION.insuranceView]
  },
  {
    name: 'Capri Assure', route: ROUTENAME.globalAssure, icon: <MedicalInformationOutlinedIcon />, permission: [PERMISSION.globalAssureView]
  },
  {
    name: 'Assigned Leads', route: ROUTENAME.assignedLead, icon: <MedicalInformationOutlinedIcon />, permission: [[PERMISSION.leadView], [PERMISSION.leadUpdate]]
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
      name: 'Cross Sell',
      url: NAVIGATION.leadManagement
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
