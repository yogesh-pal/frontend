/* eslint-disable max-len */
import { useEffect, useMemo, useState } from 'react';
import {
  Grid, Dialog, DialogActions, DialogTitle, Backdrop, CircularProgress
} from '@mui/material';
import { useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';
import RateMasterTable from './Table';
import {
  ButtonPrimary, TextFieldStyled, CustomContainerStyled, LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, HeadingMaster, SelectMenuStyle
} from '../../components/styledComponents';
import {
  WrapperDiv, RPGReportWrapper, formConfig, rateMasterColumnFields, setTableData, rpgDays
} from './constants';
import { MenuNavigation, ToastMessage, FormGenerator } from '../../components';
import { NAVIGATION } from '../../constants';
import { useScreenSize } from '../../customHooks';
import { Service } from '../../service';

const CustomForm = styled(({ screen, ...other }) => <form {...other} />)`
display: flex;
width: ${(props) => (props.screen === 'xs' || props.screen === 'sm' ? '100%' : '30%')};
`;
const CustomDiv = styled(({ screen, ...other }) => <div {...other} />)`
display: ${(props) => (props.screen === 'xs' || props.screen === 'sm' ? 'block' : 'flex')};
justify-content: space-between;
margin-bottom: 20px;
`;

const CustomDialog = styled(Dialog)(() => ({
  '.MuiDialog-paper': {
    minWidth: '200px',
    width: '400px',
    maxHeight: '190px',
    height: '190px'

  },
  '.MuiDialogContentText-root': {
    display: 'flex',
    justifyContent: 'center'
  }
}));

const RateMaster = () => {
  const [id, setId] = useState(null);
  const [open, setOpen] = useState(false);
  const [aglocRPG, setAglocRPG] = useState(0.00);
  const [ourMaxRPG, setOurMaxRPG] = useState(0.00);
  const [rateMasterData, setRateMasterData] = useState([]);
  const [rateMasterData2, setRateMasterData2] = useState([]);
  const [formDetails, setFormDetails] = useState(formConfig);
  const [rateMasterColumns, setRateMasterColumns] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [isSpotPricePunched, setIsSpotPricePunched] = useState(false);
  const [formData, setFormData] = useState({ spotPriceBBA: null, spotPriceMCX: null, spotPriceAvg: null });
  const [rpg75, setRPG75] = useState({ bba: null, mcx: null });
  const [apiResponse, setApiREsponse] = useState(null);
  const theme1 = useTheme();
  const screen = useScreenSize();
  const fullScreen = useMediaQuery(theme1.breakpoints.down('md'));
  const { email } = useSelector((state) => state.user.userDetails);
  const { register, handleSubmit } = useForm();

  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Rate Master', url: NAVIGATION.rate }
  ], NAVIGATION);
  const checkRPAStatus = async () => {
    try {
      setIsLoading({ loader: true, name: 'onInitialLoading' });
      const { data } = await Service.get(process.env.REACT_APP_RPA_STATUS_SERVICE);
      if (data.status) {
        const res = await Service.get(process.env.REACT_APP_GET_RPA_SERVICE);
        setId(res.data.id);
        setApiREsponse(res.data);
        setRPG75({ bba: res.data.rpg_75_bba, mcx: res.data.rpg_75_mcx });
        setAglocRPG(Number(res.data.max_rpg_agloc));
        setOurMaxRPG(Number(res.data.max_rpg_our));
        await setTableData(res.data, setRateMasterData, setRateMasterData2, Number(res.data.max_rpg_agloc), Number(res.data.max_rpg_our));
        setIsSpotPricePunched(true);
      }
    } catch (err) {
      console.log(err);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    checkRPAStatus();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line max-len
    setRateMasterColumns(rateMasterColumnFields(setAglocRPG, setOurMaxRPG, setAlertShow, aglocRPG, ourMaxRPG, rpg75));
    if (apiResponse) {
      setTableData(apiResponse, setRateMasterData, setRateMasterData2, aglocRPG, ourMaxRPG);
    }
  }, [aglocRPG, ourMaxRPG, rpg75]);

  const formHandler = ({ spotPriceBBA, spotPriceMCX, spotPriceAvg }) => {
    if (spotPriceBBA <= 0) {
      setAlertShow({ open: true, msg: 'SPOT Price BBA should be greater than 0.', alertType: 'error' });
      return;
    }
    if (spotPriceMCX <= 0) {
      setAlertShow({ open: true, msg: 'SPOT Price MCX should be greater than 0.', alertType: 'error' });
      return;
    }
    if (spotPriceAvg <= 0) {
      setAlertShow({ open: true, msg: 'SPOT Price Avg should be greater than 0.', alertType: 'error' });
      return;
    }
    setOpen(true);
    setFormData({ spotPriceBBA, spotPriceMCX, spotPriceAvg });
  };
  const handleClose = async () => {
    try {
      setOpen(false);
      if (isSpotPricePunched) {
        setIsLoading({ loader: true, name: 'onRPGUpdate' });
        const { data } = await Service.put(`${process.env.REACT_APP_SPOT_PRICE_SERVICE}/${id}`, {
          max_rpg_agloc: aglocRPG,
          max_rpg_our: ourMaxRPG,
          updated_by: email
        });
        if (data?.success) {
          setAlertShow({ open: true, msg: 'AGLOC RPG and Our Max RPG updated successfully.', alertType: 'success' });
        }
      } else {
        setIsLoading({ loader: true, name: 'onSpotPricePunch' });
        await Service.post(process.env.REACT_APP_SPOT_PRICE_SERVICE, {
          spot_price_bba: formData.spotPriceBBA,
          spot_price_mcx: formData.spotPriceMCX,
          input_avg_price_30_days: formData.spotPriceAvg,
          created_by: email
        });
        const res = await Service.get(process.env.REACT_APP_GET_RPA_SERVICE);
        setId(res.data.id);
        setApiREsponse(res.data);
        setRPG75({ bba: res.data.rpg_75_bba, mcx: res.data.rpg_75_mcx });
        setAglocRPG(Number(res.data.max_rpg_agloc));
        setOurMaxRPG(Number(res.data.max_rpg_our));
        await setTableData(res.data, setRateMasterData, setRateMasterData2, Number(res.data.max_rpg_agloc), Number(res.data.max_rpg_our));
        setIsSpotPricePunched(true);
      }
    } catch (err) {
      if (err?.response?.data?.spot_price_bba && err?.response?.data?.spot_price_bba.length) {
        setAlertShow({ open: true, msg: `Spot Price BBA ${err?.response?.data?.spot_price_bba[0]}`, alertType: 'error' });
      } else if (err?.response?.data?.spot_price_mcx && err?.response?.data?.spot_price_mcx.length) {
        setAlertShow({ open: true, msg: `Spot Price MCX ${err?.response?.data?.spot_price_mcx[0]}`, alertType: 'error' });
      } else if (err?.response?.data?.max_rpg_agloc && err?.response?.data?.max_rpg_agloc.length) {
        setAlertShow({ open: true, msg: `AGLOC RPG ${err?.response?.data?.max_rpg_agloc[0]}`, alertType: 'error' });
      } else if (err?.response?.data?.max_rpg_our && err?.response?.data?.max_rpg_our.length) {
        setAlertShow({ open: true, msg: `Our Max RPG ${err?.response?.data?.max_rpg_our[0]}`, alertType: 'error' });
      } else if (err?.response?.data?.non_field_errors && err?.response?.data?.non_field_errors.length) {
        setAlertShow({ open: true, msg: err?.response?.data?.non_field_errors[0], alertType: 'error' });
      } else if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };
  const rpgReportSubmit = async ({ rpgDaysValue }) => {
    try {
      setIsLoading({ loader: true, name: 'onRPGReportDownload' });
      const { data } = await Service.post(
        process.env.REACT_APP_RPA_DATA_SERVICE,
        { days: rpgDaysValue }
      );
      window.open(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data?.data}`);
    } catch (err) {
      console.log(err);
      setAlertShow({ open: true, msg: 'Something went wrong! Please try again.', alertType: 'error' });
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  const submitRPG = () => {
    if (aglocRPG === 0 || ourMaxRPG === 0) {
      setAlertShow({ open: true, msg: `${aglocRPG === 0 ? 'AGLOC RPG' : 'Our Max RPG'} should be greater than 0.`, alertType: 'error' });
      return;
    }
    setOpen(true);
  };

  const renderTable = (rows, columns) => (
    <WrapperDiv>
      <RateMasterTable
        rows={rows}
        columns={columns}
      />
    </WrapperDiv>
  );

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <Grid container alignItems='center' justifyContent='center'>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='20px 20px 0px'>
            <HeadingMaster>Rate Master</HeadingMaster>
          </Grid>
          {isLoading.loader && isLoading.name === 'onInitialLoading' ? (
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open
            >
              <CircularProgress color='inherit' />
            </Backdrop>
          )
            : (
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='0px 20px'>
                {!isSpotPricePunched
                  ? (
                    <FormGenerator
                      isLoading={isLoading.loader && isLoading.name === 'onSpotPricePunch'}
                      formHandler={formHandler}
                      formDetails={formDetails}
                      alertShow={alertShow}
                      setAlertShow={setAlertShow}
                      setFormDetails={setFormDetails}
                    />
                  )
                  : null}
                <CustomDialog
                  fullScreen={fullScreen}
                  open={open}
                  disableEscapeKeyDown
                  aria-labelledby='responsive-dialog-title'
                >
                  <DialogTitle id='responsive-dialog-title'>
                    {
                  isSpotPricePunched ? 'Are you sure you want to submit “Our Max RPG” for today?' : 'Are you sure you want to submit SPOT for today?'
                }
                  </DialogTitle>
                  <DialogActions>
                    <ButtonPrimary onClick={() => handleClose()}>Yes</ButtonPrimary>
                    <ButtonPrimary onClick={() => setOpen(false)}>No</ButtonPrimary>
                  </DialogActions>
                </CustomDialog>
                { isSpotPricePunched
                  ? (
                    <>
                      { renderTable(rateMasterData, rateMasterColumns) }
                      { renderTable(rateMasterData2, rateMasterColumns) }
                      <CustomDiv screen={screen}>
                        <CustomForm screen={screen} onSubmit={handleSubmit(rpgReportSubmit)}>
                          <RPGReportWrapper>RPG Report</RPGReportWrapper>
                          <TextFieldStyled
                            label='No. of Days'
                            select
                            required
                            {...register('rpgDaysValue')}
                          >
                            {rpgDays.map((option) => (
                              <SelectMenuStyle
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectMenuStyle>
                            ))}
                          </TextFieldStyled>
                          <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onRPGReportDownload'} type='submit'>
                            Download
                          </LoadingButtonPrimary>
                        </CustomForm>
                        <LoadingButtonPrimary
                          loading={isLoading.loader && isLoading.name === 'onRPGUpdate'}
                          onClick={submitRPG}
                        >
                          Submit
                        </LoadingButtonPrimary>
                      </CustomDiv>
                    </>
                  ) : null}
              </Grid>
            )}
        </Grid>
      </CustomContainerStyled>
    </>
  );
};
export default RateMaster;
