/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { DashboardTiles, MenuNavigation } from '../../../components';
import { ROUTENAME, MODULE_PERMISSION } from '../../../constants';
import { checkUserPermission } from '../../../utils';
import { useScreenSize } from '../../../customHooks';
import { navigationDetails } from '../helper';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../../components/styledComponents';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;

const GoldAudit = () => {
  const [tabData, setTabData] = useState([]);
  const navigate = useNavigate();
  const screen = useScreenSize();
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  useEffect(() => {
    const tilesToShow = [];
    if (checkUserPermission(MODULE_PERMISSION.auditAssignment)) {
      tilesToShow.push({ name: 'Audit Assignment', route: ROUTENAME.auditAssignment, icon: <PersonAddIcon /> });
    }
    if (checkUserPermission(MODULE_PERMISSION.auditCase)) {
      tilesToShow.push({ name: 'Audit Case', route: ROUTENAME.auditCase, icon: <AssignmentIcon /> });
    }
    setTabData(tilesToShow);
  }, []);

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomBox>
        {tabData.map((tab) => (
          <DashboardTiles key={tab?.name} tab={tab} handleClick={handleClick} fontSize={(screen === 'sm' || screen === 'xs') ? '15px' : '25px'} />
        ))}
      </CustomBox>
    </>
  );
};

export default GoldAudit;
