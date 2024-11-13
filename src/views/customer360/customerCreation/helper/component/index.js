import styled from '@emotion/styled';
// import { CircularProgress } from '@mui/material';
import PageLoader from '../../../../../components/PageLoader';
import DialogBox from '../../../../../components/dialogBox';
import { CenterContainer } from '../style';

const LoadingContainer = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  padding: '40px 0'
}));

const TextStyled = styled('p')(() => ({
  padding: '20px',
  paddingTop: '75px',
  fontSize: '17px',
  fontWeight: 600,
  color: '#502a74ab'
}));

const biometricComponent = (props) => {
  const {
    setDetails,
    input,
    refComponent,
    details
  } = props;

  const handleClose = async (event, reason) => {
    try {
      if (reason && reason === 'backdropClick') {
        return;
      }

      setDetails((pre) => ({
        ...pre,
        isFetching: true
      }));

      refComponent.current = {
        ...refComponent.current,
      };
      if (input?.onCloseHandler) {
        await input?.onCloseHandler(props);
      }
    } catch (err) {
      console.log('Error', err);
    } finally {
      if (reason !== 'backdropClick') {
        setDetails((pre) => ({
          ...pre,
          isShowComponent: false,
          isLoading: false,
          isFetching: false
        }));
      }
    }
  };

  console.log('refComponent', refComponent, details);

  return (
    <DialogBox
      isOpen
      title='Biometric Verification'
      padding='0px'
      width='80%'
      handleClose={!details?.isFetching && handleClose}
    >
      <CenterContainer>
        {
          details?.isLoading || details?.isFetching ? (
            <LoadingContainer>
              {/* <CircularProgress color='secondary' /> */}
              {/* {details?.isLoading ? <CircularProgress color='secondary' /> : null } */}
              {details?.isLoading ? <PageLoader /> : null }
              <TextStyled>
                {
                details?.isLoading
                  ? 'Loading Details for the biometric verification'
                  : 'Fetching biometric verified details.'
              }
              </TextStyled>
            </LoadingContainer>

          ) : (
            <iframe
              src={refComponent.current.url}
              title='Biometric Metrix'
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                minWidth: '80%',
                minHeight: '500px',
              }}
            />
          )
        }
      </CenterContainer>
    </DialogBox>
  );
};

export {
  biometricComponent
};
