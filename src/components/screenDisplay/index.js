import { Chip, Stack, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useScreenSize } from '../../customHooks';

const StackContainer = styled(Stack)(() => ({
  position: 'fixed',
  bottom: '60px',
  right: '10px',
}));

const screenSizeDisplay = () => {
  const theme = useScreenSize();
  return (
    <Tooltip title='Added only for development purpose' arrow>
      <StackContainer direction='row' spacing={1}>
        <Chip label={theme} color='secondary' />
      </StackContainer>
    </Tooltip>
  );
};

export default screenSizeDisplay;
