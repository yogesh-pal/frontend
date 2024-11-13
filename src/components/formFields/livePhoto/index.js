/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import moment from 'moment';
import {
  IconButton, Tooltip, Grid, Button,
  Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, {
  useState, useEffect, forwardRef, useRef
} from 'react';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import ErrorText from '../errorHandler';
import PageLoader from '../../PageLoader';
import { Service } from '../../../service';
import CustomFileList from './customfileList';
import CustomToaster from '../../mesaageToaster';
import ImageWithWatermark from '../../WaterMarkImage';
import {
  LoadingButtonPrimary, DialogTitleStyled, DialogStyled, DialogClose,
  DialogContentStyled, ContainerItemStyled,
  WebCamContainerStyled, WebCamStyled
} from '../../styledComponents';
import { customerConfigHandler } from '../../../views/customer360/utils';

const Transition = forwardRef((props, ref) => <Slide direction='up' ref={ref} {...props} />);

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.input.primary,
  position: 'absolute',
  bottom: '10px',
  right: '10px'
}));

const LivePhotoUploadStyled = styled(Button)(({ theme }) => ({
  color: theme.button.primary,
  backgroundColor: theme.button.secondary,
  height: '100%',
  '&.MuiButton-root': {
    backgroundColor: theme.button.secondary,
    width: '100%',
    height: '56px'
  }
}));

const FACING_MODE_USER = 'user';
const FACING_MODE_ENVIRONMENT = 'environment';

const videoConstraints = {
  width: 940,
  height: 700,
  facingMode: FACING_MODE_USER,
};

const livenessAPIImages = ['customer_image_url', 'customer_photo', 'customer_live_photo', 'nominee_live_photo', 'third_party_live_photo'];

const LivePhoto = (props) => {
  const {
    register, errors, input, setValue, getValues,
  } = props;

  const [open, setOpen] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);
  const [screen, setScreen] = useState({ height: 700, width: 940 });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [facingMode, setFacingMode] = React.useState(FACING_MODE_USER);
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [image, setImage] = useState({ url: getValues(input.name) ?? null });
  const isMaskAPIFailed = useRef(0);
  const livelinessAPIFailed = useRef(0);

  const getFullUrl = (path) => {
    Service.get(
      `${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${path}`
    ).then((response) => {
      setImage({
        file: null,
        name: `${input.label}.jpeg`,
        type: 'image/jpeg',
        url: response?.data?.data?.full_path
      });
    }).catch((error) => {
      console.log(error);
    });
  };
  useEffect(() => {
    const val = getValues(input?.name);
    if (val !== undefined && val !== null && !Array.isArray(val)) {
      getFullUrl(val);
    } else if (Array.isArray(val)) {
      const allImgUrls = val.map((p) => Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${p}`));
      Promise.all(allImgUrls).then((allImages) => {
        const imageArray = allImages.map((img, ind) => ({
          ind,
          file: null,
          name: `${input.label}.jpeg`,
          type: 'image/jpeg',
          url: img?.data?.data?.full_path
        }));
        setImage(imageArray);
      }).catch((err) => console.log(err));
    } else if (input?.getFilePath) {
      getFullUrl(input.getFilePath);
    } else {
      setImage(null);
    }
  }, []);

  useEffect(() => {
    if (livenessAPIImages.includes(input.name)) {
      setLoading({ loader: true, name: 'onFetchingGeolocation' });
      const location = window.navigator && window.navigator.geolocation;
      if (location) {
        location.getCurrentPosition((position) => {
          setGeoLocation({ lat: position.coords.latitude, long: position.coords.longitude });
          setLoading({ loader: false, name: null });
        }, (error) => {
          console.log(error);
          let message = 'Something went wrong. Please try again.';
          switch (error?.code) {
            case error?.PERMISSION_DENIED:
              message = 'Please allow the location permission for further actions.';
              break;
            case error?.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error?.TIMEOUT:
              message = 'The request to get user location timed out.';
              break;
            default:
          }
          if (message) {
            console.log(message);
            setAlertShow({
              open: true,
              msg: message,
              alertType: 'error'
            });
          }
        });
      } else {
        setAlertShow({
          open: true,
          msg: 'Geolocation is not supported by this browser.',
          alertType: 'error'
        });
      }
    }
  }, []);

  const handleSwitch = React.useCallback(() => {
    setFacingMode((prevState) => (prevState === FACING_MODE_USER ? FACING_MODE_ENVIRONMENT
      : FACING_MODE_USER));
  }, []);

  const handleOpen = (e) => {
    e.preventDefault();
    if (input?.disable) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setImage(null);
    setValue(input.name, null);
    setOpen(false);
    isMaskAPIFailed.current = 0;
  };

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

  const webcamRef = React.useRef(null);
  const capture = React.useCallback(async () => {
    try {
      setLoading({ loader: true, name: 'onMasking' });
      const imageSrc = webcamRef.current.getScreenshot();
      if (livenessAPIImages.includes(input.name)) {
        const flag = await checkLiveliness(imageSrc);
        if (!flag) {
          return;
        }
      }
      if (isMaskAPIFailed.current <= 1 && ((input.name === 'id_proof_url' && getValues('id_proof_name') === 'Aadhaar Card')
      || (input.name === 'address_proof_url' && getValues('address_proof_name') === 'Aadhaar Card'))) {
        const aadhaarBase64 = imageSrc.split('data:image/jpeg;base64,')[1];
        const { data } = await Service.post(process.env.REACT_APP_MASK_AADHAR, {
          image_b64: aadhaarBase64
        });
        if (data?.data?.status === 1) {
          isMaskAPIFailed.current = 0;
          setImage({
            file: `data:image/jpeg;base64,${data.data.image}`,
            name: `${input.label}.jpeg`,
            type: 'image/jpeg',
            url: ''
          });
        } else {
          isMaskAPIFailed.current += 1;
          if (isMaskAPIFailed.current === 1) {
            setAlertShow({ open: true, msg: 'The Image of the proof is not captured properly. Please capture the image again.', alertType: 'error' });
          } else if (isMaskAPIFailed.current === 2) {
            setAlertShow({ open: true, msg: 'The Aadhaar masking of the image has failed. Please capture the image again after masking the Aadhaar manually.', alertType: 'error' });
          } else {
            setAlertShow({ open: true, msg: data?.data?.message ?? 'Something went wrong, Please try again', alertType: 'error' });
          }
        }
      } else {
        setImage({
          file: imageSrc,
          name: `${input.label}.jpeg`,
          type: 'image/jpeg',
          url: ''
        });
      }
    } catch (err) {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Document could not be captured, Please try again.', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  });

  const dataURLtoFile = (dataurl, filename) => (fetch(dataurl)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: 'image/jpeg' }))
  );

  const uploadimage = async () => {
    try {
      setLoading({ loader: true, name: 'onUpload' });
      const formData = new FormData();
      formData.append('module', 'GOLD');
      const fileToUpload = await dataURLtoFile(image.file, image.name);

      let URL = `${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${image.name}`;

      const { filePath } = input;

      if (filePath) {
        URL = `${URL}&path=${filePath}`;
      }

      const { data, status } = await Service.get(URL);
      if (data?.success && status === 200) {
        const res = await Service.putWithFile(data.data.put, fileToUpload, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Access-Control-Allow-Origin': '*'
          }
        });
        if (res.status === 200) {
          setImage({ ...image, url: data.data.get });
          setValue(input.name, data.data.path, { shouldValidate: true });
          if ((input?.name === 'id_proof_url' && getValues('id_proof_name') === 'Aadhaar Card')) {
            setValue('id_proof_number', getValues('aadhaar_verification_mode') === 'Offline' ? getValues('aadharCardOffline') : getValues('aadharCardOnline'));
          }
          if ((input?.name === 'address_proof_url' && getValues('address_proof_name') === 'Aadhaar Card')) {
            setValue('address_proof_number', getValues('aadhaar_verification_mode') === 'Offline' ? getValues('aadharCardOffline') : getValues('aadharCardOnline'));
          }
        }
      }
    } catch (err) {
      console.log('err', err);
      setImage(null);
      setValue(input.name, null, { shouldValidate: true });
      setAlertShow({ open: true, msg: 'Document could not be uploaded, Please try again', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleConfirmClick = (e) => {
    e.preventDefault();
    uploadimage();
    setOpen(false);
    isMaskAPIFailed.current = 0;
  };
  const removeImg = (ind) => {
    // eslint-disable-next-line no-alert
    const check = window.confirm('Do you want to delete the file');
    if (check) {
      let newImages = null;
      if (image && Array.isArray(image) && image.length > 1) {
        newImages = image.filter((i) => i.ind !== ind);
      }
      setImage(newImages);
      setValue(input.name, newImages);
      if ((input?.name === 'id_proof_url' && getValues('id_proof_name') === 'Aadhaar Card')) {
        setValue('id_proof_number', null);
      }
      if ((input?.name === 'address_proof_url' && getValues('address_proof_name') === 'Aadhaar Card')) {
        setValue('address_proof_number', null);
      }
    }
  };

  return (
    <>
      {
          loading.loader && (loading.name === 'onUpload' || loading.name === 'onFetchingGeolocation') ? <PageLoader /> : null
      }
      {
      image?.url || (image && Array.isArray(image) && image.length > 0)
        ? (
          <CustomFileList img={Array.isArray(image) ? image : [image]} removeImg={removeImg} disabled={input?.disable ?? false} input={input} />
        )
        : (
          <LivePhotoUploadStyled onClick={!loading.loader && handleOpen} type='button' style={{ color: '#666666' }}>
            {
              input?.validation?.isRequired ? `${input.label}* ${input?.notUploaded ? '- Not Uploaded' : ''}` : `${input.label} ${input?.notUploaded ? '- Not Uploaded' : ''}`
            }
          </LivePhotoUploadStyled>
        )
      }
      <ErrorText input={input} errors={errors} />
      <CustomToaster
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <div
        {...register(input?.name, { required: input?.validation?.isRequired })}
      />
      <DialogStyled
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <DialogTitleStyled>
          <span>{input.label}</span>
          <DialogClose
            onClick={handleClose}
          >
            x
          </DialogClose>
        </DialogTitleStyled>
        <DialogContentStyled>
          <Grid container rowSpacing={1} columnSpacing={2}>
            <Grid item xs={12} md={image?.file ? 6 : 12}>
              <ContainerItemStyled>
                <WebCamContainerStyled>
                  <WebCamStyled
                    audio={false}
                    height={screen.height}
                    ref={webcamRef}
                    screenshotFormat='image/jpeg'
                    width={screen.width}
                    screenshotQuality={1}
                    videoConstraints={{ videoConstraints, facingMode }}
                    style={{ borderRadius: '15px', marginTop: '5px' }}
                  />
                </WebCamContainerStyled>
                <LoadingButtonPrimary
                  onClick={(e) => {
                    e.preventDefault();
                    capture();
                  }}
                  loading={loading.loader && loading.name === 'onMasking'}
                >
                  Take Snapshot
                </LoadingButtonPrimary>
              </ContainerItemStyled>
            </Grid>
            {
              image?.file && (
                <Grid item xs={12} md={6}>
                  <ContainerItemStyled>
                    {
                    livenessAPIImages.includes(input.name)
                      ? <ImageWithWatermark image={image} setImage={setImage} imageUrl={image.file} watermarkText={`Latitude:${geoLocation.lat} Longitude:${geoLocation.long}\nDate&Time: ${moment(new Date()).format('DD-MM-YYYY HH:mm:ss')}`} />
                      : (
                        <img
                          src={image?.file}
                          width='auto'
                          height='auto'
                          alt='imageFromCam'
                          style={{
                            borderRadius: '15px', marginTop: '5px', marginBottom: '6.4px'
                          }}
                        />
                      )
                    }
                    <LoadingButtonPrimary
                      onClick={handleConfirmClick}
                    >
                      Confirm
                    </LoadingButtonPrimary>
                  </ContainerItemStyled>
                </Grid>
              )
            }
          </Grid>
          <Tooltip title='Switch Camera'>
            <CustomIconButton onClick={handleSwitch}>
              <FlipCameraAndroidIcon />
            </CustomIconButton>
          </Tooltip>
        </DialogContentStyled>
      </DialogStyled>
    </>
  );
};

export default React.memo(LivePhoto);
