import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import SummarizeSharpIcon from '@mui/icons-material/SummarizeSharp';
import { useNavigate } from 'react-router-dom';
import { DashboardTiles, MenuNavigation } from '../../components';
import { checkUserPermission } from '../../utils';
import { ROUTENAME, MODULE_PERMISSION, NAVIGATION } from '../../constants';
import { useScreenSize } from '../../customHooks';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../components/styledComponents';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;

const Reports = () => {
  const [tabData, setTabData] = useState([]);
  const navigate = useNavigate();
  const screen = useScreenSize();
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Reports', url: NAVIGATION.reports },

  ], NAVIGATION);

  useEffect(() => {
    const tilesToShow = [];
    if (checkUserPermission(MODULE_PERMISSION.metaBase)) {
      tilesToShow.push({ name: 'Interest Due Calling Report', route: ROUTENAME.metabase, icon: <SummarizeSharpIcon /> });
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

export default Reports;
