/* eslint-disable no-unused-vars */
import { Box } from '@mui/material';

import { styled } from '@mui/material/styles';
import { STOPWATCHTYPE } from '../../../../constants';

const StopWatchContainerStyled = styled(Box)(() => ({
  height: '150px',
  width: '150px',
  borderRadius: '100%',
  border: '2px dotted #502a74bf',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#502a74bf',
  fontWeight: 900
}));

const StopWatchContainerFlatStyled = styled(Box)(() => ({
  border: '2px dotted #ffffff',
  background: '#502a74',
  padding: '10px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#ffffff',
  borderRadius: '16px',
  fontWeight: 900
}));

const CircleStopWatch = (props) => {
  const { timer, input } = props;
  const { hr, min, sec } = timer;
  return (
    <div style={{
      position: 'relative',
      height: '150px',
      width: '150px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...input?.style?.stopWatch
    }}
    >
      <div
        style={{
          height: '25px',
          width: '30px',
          border: '7px solid #502a74bf',
          position: 'absolute',
          top: '-24px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '10px 10px 0 0'
        }}
      />
      <StopWatchContainerStyled>
        {`${hr < 10 ? `0${hr}` : hr} : ${min < 10 ? `0${min}` : min} : ${sec < 10 ? `0${sec}` : sec}`}
      </StopWatchContainerStyled>
    </div>
  );
};

const FlatStopWatch = (props) => {
  const { timer, input } = props;
  const { hr, min, sec } = timer;
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...input?.style?.stopWatch
    }}
    >
      <StopWatchContainerFlatStyled>
        {`${hr < 10 ? `0${hr}` : hr} : ${min < 10 ? `0${min}` : min} : ${sec < 10 ? `0${sec}` : sec}`}
      </StopWatchContainerFlatStyled>
    </div>
  );
};

const StopWatch = (props) => {
  const { input } = props;
  console.log('input', input);
  const WatchMapping = {
    [STOPWATCHTYPE.CIRCULAR]: CircleStopWatch(props),
    [STOPWATCHTYPE.FLAT]: FlatStopWatch(props)
  };

  return (WatchMapping[input?.WatchType]);
};

export default StopWatch;
