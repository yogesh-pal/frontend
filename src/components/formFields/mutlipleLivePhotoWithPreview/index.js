/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import React, {
  useState, useMemo, forwardRef, useRef, useEffect
} from 'react';
import { styled } from '@mui/material/styles';
import {
  IconButton, Tooltip, Grid, Button, Typography, Slide
} from '@mui/material';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import { cloneDeep, get } from 'lodash';
import PageLoader from '../../PageLoader';
import { Service } from '../../../service';
import ErrorText from '../errorHandler';
import CustomToaster from '../../mesaageToaster';
import {
  ButtonPrimary, DialogTitleStyled, DialogStyled, DialogClose,
  DialogContentStyled, ContainerItemStyled, LoadingButtonPrimary
} from '../../styledComponents';
import ImageWithWatermark from '../../WaterMarkImage';
import WebCamComponent from './webcam';
import CustomFileList from './customFileList';

const Transition = forwardRef((props, ref) => <Slide direction='up' ref={ref} {...props} />);

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.input.primary,
  position: 'absolute',
  bottom: '10px',
  right: '10px'
}));

const HeaderStyled = styled(Button)(({ theme }) => ({
  background: theme?.button?.primary,
  color: theme?.button?.ternary,
  position: 'absolute',
  padding: '10px 12px',
  borderRadius: '10px',
  fontWeight: 'bold',
  top: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  cursor: 'default',
  fontSize: '10px',
  '&.Mui-focused': {
    background: theme?.button?.primary,
  },
  '&:hover': {
    background: theme?.button?.primary,
  },
  pointerEvents: 'none'
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

const MultipleLivePhoto = (props) => {
  const {
    register,
    errors,
    input,
    getValues,
    setError,
    setValue,
    unregister,
    updateJsonHandler
  } = props;
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [image, setImage] = useState({});
  const [imagesPreviewDetails, setImagesPreviewDetails] = useState({});
  const [images, setImages] = useState({});
  const [open, setOpen] = useState(false);
  const [facingMode, setFacingMode] = React.useState(FACING_MODE_USER);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [validationDetails, setValidationDetails] = useState({
    isValid: false
  });
  const isMaskAPIFailed = useRef({});
  const { imageDetails } = input;

  const checkMandatoryUploadHandler = (imagesPreviewTemp) => {
    try {
      let isValid = true;

      imageDetails.forEach((imgDetails) => {
        if (imgDetails?.mandatory && (!(imgDetails?.name in imagesPreviewTemp) || !imagesPreviewTemp[imgDetails.name]?.path)) {
          isValid = false;
        }
      });

      if (isValid) {
        isValid = true;
      }
      setValidationDetails((pre) => ({
        ...pre,
        isValid
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const fetchAllImages = async (matchedKeys) => {
    const requests = [];
    const pathMapping = {};
    Object.keys(matchedKeys).forEach((item, index) => {
      pathMapping[index] = item;
      requests.push(Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${matchedKeys[item]}`));
    });

    if (requests.length) {
      setLoading({ loader: true, name: 'onUpload' });
      Promise.all(requests).then((responses) => {
        const resTemp = {};
        const tempImage = {};
        responses.forEach((ele, ind) => {
          resTemp[pathMapping[ind]] = {
            name: `${input.label}.${input?.isPreview ?? 'jpeg'}`,
            type: `image/${input?.isPreview ?? 'jpeg'}`,
            url: ele?.data?.data?.full_path,
            path: matchedKeys[pathMapping[ind]],
            file: imagesPreviewDetails[pathMapping[ind]]?.file
          };
          tempImage[pathMapping[ind]] = matchedKeys[pathMapping[ind]];
        });
        console.log('resTempresTemp', resTemp);
        // setValue(input.name, resTemp, { shouldValidate: true });
        setImagesPreviewDetails(resTemp);
        setImages(resTemp);
        checkMandatoryUploadHandler(resTemp);
        setValidationDetails((pre) => ({
          ...pre,
          isValid: true
        }));
      }).catch((err) => {
        console.log('Error', err);
        setAlertShow({ open: true, msg: 'Something went wrong while fetching documents.', alertType: 'error' });
      }).finally(() => {
        setLoading({ loader: false, name: null });
      });
    } else {
      setImagesPreviewDetails({});
    }
  };

  const handleSwitch = React.useCallback(() => {
    setFacingMode((prevState) => (prevState === FACING_MODE_USER ? FACING_MODE_ENVIRONMENT
      : FACING_MODE_USER));
  }, []);

  const handleOpen = (e) => {
    e.preventDefault();
    if (input?.disabled) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    if (loading?.loader) return;
    setImage({});
    setOpen(false);
    isMaskAPIFailed.current = {};
  };

  const dataURLtoFile = (dataurl, filename) => (fetch(dataurl)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: 'image/jpeg' }))
  );

  const uploadimage = async (item) => {
    try {
      setLoading({ loader: true, name: 'onUpload' });
      const imagesPreviewTemp = { ...imagesPreviewDetails };
      const formData = new FormData();
      formData.append('module', 'GOLD');
      const fileToUpload = await dataURLtoFile(imagesPreviewTemp[item.name].file, imagesPreviewTemp[item.name].name);
      let URL = `${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${imagesPreviewTemp[item.name].name}`;
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
          imagesPreviewTemp[item.name].url = data.data.get;
          imagesPreviewTemp[item.name].path = data.data.path;
          imagesPreviewTemp[item.name].success = true;
        }
      }
      setImagesPreviewDetails(imagesPreviewTemp);
      checkMandatoryUploadHandler(imagesPreviewTemp);
    } catch (err) {
      console.log('err', err);
      setImage({});
      setAlertShow({ open: true, msg: 'Document could not be uploaded, Please try again', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleConfirmClick = (e, item) => {
    e.preventDefault();
    uploadimage(item);
    isMaskAPIFailed.current = {};
  };

  const removeImageHandler = (item) => {
    try {
      const temp = { ...imagesPreviewDetails };
      delete temp[item.name];
      setImagesPreviewDetails(temp);
      setImages(temp);
      setValidationDetails({
        isValid: false
      });
    } catch (e) {
      console.log(e);
    }
  };

  const saveHandler = () => {
    if (input?.onSaveHandler) {
      input.onSaveHandler({
        imageDetails: imagesPreviewDetails,
        updateJsonHandler,
        setValue,
        input,
        setValidationDetails,
        setImagesPreviewDetails,
        handleClose,
        setLoading,
        setImages,
        getValues
      });
    }
    setError(input?.name, null);
  };

  const removeImg = (name) => {
    // eslint-disable-next-line no-alert
    const check = window.confirm('Do you want to delete the file');
    if (check) {
      const tempImages = cloneDeep(imagesPreviewDetails);
      const imagesDetails = cloneDeep(getValues(input.name));
      delete tempImages[name];
      delete imagesDetails[name];
      if (Object.keys(tempImages).length >= 1) {
        unregister(input.name);
        setValue(input.name, imagesDetails, { shouldValidate: true });
      } else {
        setValue(input.name, '', { shouldValidate: true });
      }
      setImagesPreviewDetails(tempImages);
      setImages(tempImages);
      if (input?.onDeleteHandler) {
        input.onDeleteHandler({ input, updateJsonHandler });
      }
    }
  };

  useMemo(() => {
    if (getValues(input.name)) {
      fetchAllImages(getValues(input.name));
    } else {
      setImagesPreviewDetails({});
      setImages({});
      checkMandatoryUploadHandler({});
    }
  }, [getValues(input.name)]);

  useEffect(() => {
    register(input.name, { required: input?.validation?.isRequired });
  }, []);

  return (
    <>
      <LivePhotoUploadStyled onClick={!loading.loader && handleOpen} type='button' style={{ color: '#666666' }}>
        {
          input?.validation?.isRequired ? `${input.label}* ${input?.notUploaded ? '- Not Uploaded' : ''}` : `${input.label} ${input?.notUploaded ? '- Not Uploaded' : ''}`
        }
      </LivePhotoUploadStyled>
      {images && validationDetails?.isValid ? <CustomFileList img={images} removeImg={removeImg} disabled={(input?.disable || input?.disabled) ?? false} input={input} /> : null}
      <ErrorText input={{ ...input, name: input.name }} errors={errors} />

      <div
        {...register(input?.name, { required: input?.validation?.isRequired })}
      />
      <DialogStyled
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        {
          loading.loader && loading.name === 'onUpload' ? <PageLoader /> : null
      }
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
            <CustomToaster
              alertShow={alertShow}
              setAlertShow={setAlertShow}
            />
            {
              imageDetails?.map((item, index) => (
                <Grid item xs={12} md={6} style={{ position: 'relative', padding: '40px 0 0 0' }}>
                  <HeaderStyled>{item?.label}</HeaderStyled>
                  {
                    !imagesPreviewDetails?.[item.name]?.file ? (
                      <WebCamComponent
                        input={input}
                        setLoading={setLoading}
                        isMaskAPIFailed={isMaskAPIFailed}
                        getValues={getValues}
                        setImagesPreviewDetails={setImagesPreviewDetails}
                        setAlertShow={setAlertShow}
                        facingMode={facingMode}
                        item={item}
                        loading={loading}
                      />
                    ) : (
                      <ContainerItemStyled>
                        {
                          (input?.withWatermark && input?.watermarkContent)
                            ? <ImageWithWatermark image={image} setImage={setImage} imageUrl={imagesPreviewDetails[item.name]?.file} watermarkText={input?.watermarkContent} />
                            : (
                              <img
                                src={imagesPreviewDetails[item.name]?.file}
                                width='auto'
                                height='auto'
                                alt='imageFromCam'
                                style={{
                                  borderRadius: '15px', marginTop: '5px', marginBottom: '6.4px'
                                }}
                              />
                            )
                          }

                        <div style={{ display: 'flex' }}>
                          {
                              !imagesPreviewDetails[item.name]?.success && (
                                <ButtonPrimary
                                  disabled={loading?.loader}
                                  onClick={(e) => handleConfirmClick(e, item, index)}
                                >
                                  Confirm
                                </ButtonPrimary>
                              )
                            }
                          <LoadingButtonPrimary
                            disabled={loading?.loader}
                            onClick={(e) => {
                              e.preventDefault();
                              removeImageHandler(item);
                            }}
                          >
                            Re Take
                          </LoadingButtonPrimary>
                        </div>
                      </ContainerItemStyled>
                    )
                  }
                </Grid>
              ))
            }
          </Grid>
          <Grid container rowSpacing={1} columnSpacing={2} style={{ display: 'flex', justifyContent: 'center' }}>
            <ButtonPrimary disabled={!validationDetails?.isValid || loading?.loader} onClick={saveHandler}>Save</ButtonPrimary>
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

export default MultipleLivePhoto;
