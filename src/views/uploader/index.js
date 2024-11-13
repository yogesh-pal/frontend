import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { DashboardTiles, MenuNavigation } from '../../components';
import { checkUserPermission } from '../../utils';
import {
  ROUTENAME, MODULE_PERMISSION, NAVIGATION, PERMISSION
} from '../../constants';
import { useScreenSize } from '../../customHooks';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../components/styledComponents';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;

const Uploader = () => {
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
    { name: 'Uploader', url: NAVIGATION.uploader },

  ], NAVIGATION);

  useEffect(() => {
    const tilesToShow = [];
    if (checkUserPermission(MODULE_PERMISSION.bankingPartnership)) {
      tilesToShow.push({ name: 'Banking Partnership', route: ROUTENAME.bankingpartnershipUploader, icon: <PersonAddIcon /> });
    }
    if (checkUserPermission(MODULE_PERMISSION.rekycUploader)) {
      tilesToShow.push({ name: 'Re-KYC Uploader', route: ROUTENAME.rekycUpload, icon: <PersonAddIcon /> });
    }

    if (checkUserPermission([PERMISSION.branchgroupingmaker])) {
      tilesToShow.push({ name: 'Branch Group Maker', route: ROUTENAME.branchGroupUpload, icon: <PersonAddIcon /> });
    }

    if (checkUserPermission([PERMISSION.branchgroupingchecker])) {
      tilesToShow.push({ name: 'Branch Group Checker', route: ROUTENAME.branchGroupCheck, icon: <PersonAddIcon /> });
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

export default Uploader;
