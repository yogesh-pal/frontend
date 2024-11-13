import styled from '@emotion/styled';
import { Circles } from 'react-loader-spinner';

const CustomDiv1 = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: white;
  opacity: ${(props) => props.opacity ?? 0.5};
  z-index: 1399;
  height: 100%;
  width: 100%;
`;
const CustomDiv2 = styled.div`
  position: absolute;
  top: ${(props) => props.top ?? '50%'};
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
`;

const CustomMessage = styled.h1`
text-align: center;
font-size: 18px;
color: rgb(80, 42, 116);
`;
const PageLoader = (props) => {
  const { opacity, msg } = props;
  return (
    <CustomDiv1 opacity={opacity}>
      <CustomDiv2>
        <Circles
          height='80'
          width='80'
          color='#502A74'
          ariaLabel='circles-loading'
          wrapperStyle={{}}
          wrapperClass=''
          visible
        />
      </CustomDiv2>
      {
        msg ? (
          <CustomDiv2 top='57%'>
            <CustomMessage>{msg}</CustomMessage>
          </CustomDiv2>
        ) : null
      }

    </CustomDiv1>
  );
};
export default PageLoader;
