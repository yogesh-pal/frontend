/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import React, { useRef } from 'react';
import { Service } from '../../../service';
import {
  ContainerItemStyled, LoadingButtonPrimary, WebCamContainerStyled,
  WebCamStyled
} from '../../styledComponents';
import { customerConfigHandler } from '../../../views/customer360/utils';

const FACING_MODE_USER = 'user';

const livenessAPIImages = ['document_live_photo_customer'];

const videoConstraints = {
  width: 940,
  height: 700,
  facingMode: FACING_MODE_USER,
};

const screen = {
  height: 700,
  width: 940
};

const MultipleLivePhoto = (props) => {
  const {
    input, setLoading, isMaskAPIFailed,
    setImagesPreviewDetails, setAlertShow, facingMode, item,
    loading
  } = props;
  const livelinessAPIFailed = useRef(0);

  const checkLiveliness = async (imageSrc) => {
    try {
      const humanBase64 = imageSrc.split('data:image/jpeg;base64,')[1];
      const { data: response } = await Service.post(process.env.REACT_APP_LIVENESS_SERVICE, {
        file_base64: humanBase64
      });
      if (!response?.data?.result?.isLive || response?.data?.result?.multipleFacesDetected) {
        const check = window.confirm('Image captured by the user is not clear. Do you still want to continue?');
        if (!check) {
          return false;
        }
      }
      livelinessAPIFailed.current = 0;
      return true;
    } catch (err) {
      console.log('Error', err);
      const livelinessFailureConfig = await customerConfigHandler();

      livelinessAPIFailed.current += 1; // Increment the failure count

      // Check if the failure count has reached the retry_count specified in config
      if (livelinessAPIFailed.current >= livelinessFailureConfig?.liveliness?.default?.retry_count) {
        if (livelinessFailureConfig?.liveliness?.default?.stop) { // If hard stop is enabled
          window.alert('Too many failures in validating liveliness. Please refresh the page and try again.');
          return false;
        }

        // If not hard stop enabled
        const check = window.confirm('Unable to validate liveliness. Do you still want to continue?');
        livelinessAPIFailed.current = 0; // Reset the count after the confirmation
        return check; // Return the user's decision
      }

      window.alert('Unable to validate liveliness. Try again!');
      return false; // Return false for failures lesser than retry count
    }
  };

  const webcamRef = useRef(null);
  // eslint-disable-next-line
  const capture = React.useCallback(async (item) => {
    try {
      console.log('ITEM details --', item);
      setLoading({ loader: true, name: 'onMasking' });
      const imageSrc = webcamRef.current.getScreenshot();
      if (livenessAPIImages.includes(input.name)) {
        const flag = await checkLiveliness(imageSrc);
        if (!flag) {
          return;
        }
      }
      if ((!(item.name in isMaskAPIFailed.current) || isMaskAPIFailed.current[item.name] <= 1) && input?.enableMasking) {
        const aadhaarBase64 = imageSrc.split('data:image/jpeg;base64,')[1];
        const { data } = await Service.post(process.env.REACT_APP_MASK_AADHAR, {
          image_b64: aadhaarBase64
        });
        if (data?.data?.status === 1) {
          isMaskAPIFailed.current[item.name] = 0;
          setImagesPreviewDetails((pre) => ({
            ...pre,
            [item.name]: {
              file: `data:image/jpeg;base64,${data.data.image}`,
              name: `${input.label}.jpeg`,
              type: 'image/jpeg',
              url: ''
            }
          }));
        } else {
          if (item.name in isMaskAPIFailed.current) {
            isMaskAPIFailed.current[item.name] += 1;
          } else {
            isMaskAPIFailed.current[item.name] = 1;
          }
          if (isMaskAPIFailed.current[item.name] === 1) {
            setAlertShow({ open: true, msg: 'The image is not captured properly. Please capture the image again.', alertType: 'error' });
          } else if (isMaskAPIFailed.current[item.name] === 2) {
            setAlertShow({ open: true, msg: 'The Aadhaar masking of the image has failed. Please capture the image again after masking the Aadhaar manually.', alertType: 'error' });
          } else {
            setAlertShow({ open: true, msg: data?.data?.message ?? 'Something went wrong, Please try again', alertType: 'error' });
          }
        }
      } else {
        setImagesPreviewDetails((pre) => ({
          ...pre,
          [item.name]: {
            file: imageSrc,
            name: `${input?.label}.jpeg`,
            type: 'image/jpeg',
            url: '',
          }
        }));
      }
    } catch (err) {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Document could not be captured, Please try again.', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  });

  return (
    <ContainerItemStyled>
      <WebCamContainerStyled>
        <WebCamStyled
          audio={false}
          height={screen.height}
          ref={webcamRef}
          screenshotQuality={1}
          screenshotFormat='image/jpeg'
          width={screen.width}
          videoConstraints={{ videoConstraints, facingMode }}
          style={{ borderRadius: '15px', marginTop: '5px' }}
        />
      </WebCamContainerStyled>
      <LoadingButtonPrimary
        disabled={loading?.loader}
        onClick={(e) => {
          e.preventDefault();
          capture(item);
        }}
        loading={loading.loader && loading.name === 'onMasking'}
      >
        Take Snapshot
      </LoadingButtonPrimary>
    </ContainerItemStyled>
  );
};

export default MultipleLivePhoto;
