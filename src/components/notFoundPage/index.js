/* eslint-disable max-len */
import styled from '@emotion/styled';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { CustomDiv } from '../../views/userManagement/styled-components';
import { LoadingButtonPrimary, HeadingMaster } from '../styledComponents';

const CustomDivWithMargin = styled.div`
margin-top: 30px;
text-align: center;
padding: 0px 10px;
`;

const StyledTypography = styled(Typography)`
 color: #502A74;
 font-weight: 900;
`;

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <CustomDiv>
      <CustomDivWithMargin>
        <StyledTypography variant='h3' gutterBottom><CustomDiv>This page could not be found!</CustomDiv></StyledTypography>
        <CustomDiv><HeadingMaster>We are sorry. But the page you are looking for is not available.</HeadingMaster></CustomDiv>
        <CustomDiv style={{ marginTop: '30px' }}><LoadingButtonPrimary onClick={() => navigate('/dashboard')}>BACK TO HOMEPAGE</LoadingButtonPrimary></CustomDiv>
      </CustomDivWithMargin>
    </CustomDiv>
  );
};
export default NotFoundPage;
