/* eslint-disable max-len */
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import { PERMISSION, ROUTENAME } from '../../../../constants';
import { DashboardTiles, MenuNavigation } from '../../../../components';
import { collateralReleaseNavigation } from '../../helper';
import { BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled } from '../../../../components/styledComponents';
import { checkUserPermission } from '../../../../utils';

const CustomBox = styled(Box)`
display: flex;
flex-wrap: wrap;
justify-content: center;
`;
const tabData = [
  {
    name: 'Collateral Release Maker',
    route: ROUTENAME.collateralReleaseMaker,
    icon: <DescriptionIcon />,
    permission: [
      [PERMISSION.collateralView, PERMISSION.collateralMaker]
    ]
  },
  {
    name: 'Collateral Release Checker',
    route: ROUTENAME.collateralReleaseChecker,
    icon: <DescriptionIcon />,
    permission: [
      [PERMISSION.collateralView, PERMISSION.collateralMaker],
      [PERMISSION.collateralView, PERMISSION.collateralChecker]
    ]
  }
];

const CollateralRelease = () => {
  const navigate = useNavigate();
  const handleClick = (route) => {
    if (route) {
      navigate(route);
    }
  };
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={collateralReleaseNavigation} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomBox>
        {tabData.map((tab) => {
          if (tab.permission.length && Array.isArray(tab.permission[0]) && tab.permission.some((ele) => checkUserPermission(ele))) {
            return <DashboardTiles key={tab.name} tab={tab} handleClick={handleClick} />;
          }
          return null;
        })}
      </CustomBox>
    </>
  );
};
export default CollateralRelease;
