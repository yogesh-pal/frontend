/* eslint-disable no-unreachable */
/* eslint-disable max-len */
import axios from 'axios';
import { cloneDeep } from 'lodash';
import { useState, useEffect } from 'react';
import { useSelector, connect } from 'react-redux';
import { Service } from '../../service/index';
import SchemeTable from '../../components/table';
import { getAddFormConfiguration } from './addJson';
import { getEditFormConfiguration } from './editJson';
import { NAVIGATION, MODULE_PERMISSION } from '../../constants';
import {
  FormGenerator, DialogBox, MenuNavigation, ToastMessage
} from '../../components';
import { saveFormValues, saveState, saveRpg } from '../../redux/reducer/login';
import {
  unclaimedColumnFields, errorMessageHandler, getRepaymentFrequency, reserveAmountEnum
} from './constant';
import {
  CustomContainerStyled, BreadcrumbsContainerStyled, LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled, HeadingMaster, HeaderContainer
} from '../../components/styledComponents';
import { checkUserPermission } from '../../utils';
import SchemeMasterBranchUsers from './branchUserView';

const mapStateToProps = (state) => ({
  ...state,
});

const SchemeMaster = (props) => {
  const {
    saveStateData, user, saveFormValuesInRedux, saveRpgData
  } = props;
  const [rowCount, setRowCount] = useState(0);
  const [formDetails, setFormDetails] = useState();
  const [schemeData, setSchemeData] = useState([]);
  const [editFormJson, setEditFormJson] = useState({});
  const [selectedScheme, setSelectedScheme] = useState({});
  const [rateChartCode, setRateChartCode] = useState(null);
  const [rebatestepUprateChartCode, setRebatesteupupchartcode] = useState(null);
  const [schemeForOptions, setSchemeForOptions] = useState([]);
  const [schemeValidations, setSchemeValidations] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [formMode, setFormMode] = useState({ mode: 'EDIT', show: false });
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 10 });
  const [isLoading, setIsLoading] = useState({ loader: false, id: null, name: 'TABLE' });

  const rpg = useSelector((state) => state.user.rpg);
  const userDetails = useSelector((state) => state.user.userDetails);
  const submitFormValues = useSelector((state) => state.user.submitFormValues);

  const navigationDetails = [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Scheme Master', url: NAVIGATION.scheme }
  ];

  const getSchemeCount = async () => {
    try {
      setIsLoading({ loader: true, id: null, name: 'TABLEDATA' });
      const { data } = await Service.post(process.env.REACT_APP_SCHEME_COUNT, {
        scheme_ids: [],
        is_active: null
      });
      setRowCount(data.schemes_count);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading({ loader: false, id: null, name: null });
    }
  };

  const getSchemeList = async (pageNumber, pageSize) => {
    try {
      setIsLoading({ loader: true, id: null, name: 'TABLEDATA' });
      const requestBody = {
        branches_code: [],
        is_active: null
      };
      const { data } = await Service.post(`${process.env.REACT_APP_SCHEME_LIST}?page_size=${pageSize}&page=${pageNumber}`, requestBody);

      if (data?.results?.length > 0) {
        const res = [];
        data?.results.forEach((item) => {
          res.push({
            _id: item.scheme.code,
            Scheme_Name: item.scheme.name,
            Scheme_Code: item.scheme.code,
            Scheme_Type: item.scheme.type,
            Scheme_RPG_LTV: item.scheme.rpg_ltv,
            status: (item.scheme.is_status) ? 'ACTIVE' : 'INACTIVE',
            fullData: item
          },);
        });
        setSchemeData(res);
      } else {
        setSchemeData([]);
      }
    } catch (e) {
      console.log('Error', e);
    } finally {
      setIsLoading({ loader: false, id: null, name: null });
    }
  };

  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
    getSchemeList(pageInfo.pageNumber, pageSize);
  };

  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
    getSchemeList(pageNumber, pageInfo.pageSize);
  };
  const editHandler = (value) => {
    setIsLoading({ loader: true, id: value.id });
    const finalData = {
      scheme_id: value.id,
      is_active: value.row.status !== 'ACTIVE',
      updated_by: userDetails.email,
    };
    Service.put(process.env.REACT_APP_SCHEME_UPDATE, finalData).then((res) => {
      console.log(res);
      getSchemeList(pageInfo.pageNumber, pageInfo.pageSize);
      setIsLoading({ loader: false, id: value.id });
      setAlertShow({ open: true, msg: 'Scheme status updated successfully', alertType: 'success' });
    }).catch(() => {
      setAlertShow({ open: true, msg: 'oops! Something went wrong', alertType: 'error' });
      setIsLoading({ loader: false, id: null });
    });
  };

  const stateDetailsHandler = (values, callback) => {
    try {
      callback(Object.keys(user?.stateData));
    } catch (e) {
      console.log('Error', e);
    }
  };

  const cityDetailsHandler = (values, callback, index, setValue) => {
    try {
      let data = [];
      if (values?.scheme_state.length > 0) {
        values?.scheme_state.forEach((item) => {
          data = [...data, ...Object.keys(user?.stateData[item])];
        });
      }
      const dataBranch = [];
      data.forEach((item) => {
        if (values.scheme_city.includes(item)) {
          dataBranch.push(item);
        }
      });
      setValue('scheme_city', dataBranch);
      callback({ city: data, branch: [] });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const branchDetailHandler = (values, callback, index, setValue) => {
    try {
      let data = [];
      if (values?.scheme_state.length > 0) {
        values?.scheme_state.forEach((state) => {
          values?.scheme_city.forEach((city) => {
            if (user?.stateData[state] !== undefined
                && user?.stateData[state][city] !== undefined) {
              data = [...data, ...user.stateData[state][city]];
            }
          });
        });
      }
      const dataBranch = [];
      data.forEach((item) => {
        if (values.scheme_branch.includes(item.value)) {
          dataBranch.push(item.value);
        }
      });
      setValue('scheme_branch', dataBranch);
      callback(data);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const changePrepaymentEndSlab = (values, callback, index, setValue) => {
    if (index !== '') {
      const newIndex = index.replace('__', '');
      setValue(`start_slab_of_pre_payment__${(parseInt(newIndex, 10) + 1)}`, parseInt(values[`end_slab_of_pre_payment${index}`], 10) + 1);
    } else {
      setValue('start_slab_of_pre_payment__1', parseInt(values[`end_slab_of_pre_payment${index}`], 10) + 1);
    }
    setValue('start_slab_of_pre_payment', 0);
  };

  const updateSlabValidation = (input, value) => {
    const { name } = input;
    const tempInput = cloneDeep(input);
    const nameArray = name.split('__');
    if (name.includes('start_slab_of_pre_payment')) {
      let index3 = '';
      if ((parseInt(nameArray[nameArray.length - 1], 10) - 1) === 0) {
        index3 = '';
      } else {
        index3 = (nameArray.length > 1) ? `__${parseInt(nameArray[nameArray.length - 1], 10) - 1}` : '';
      }
      tempInput.defaultValue = parseInt(([undefined, null, ''].includes(value[`end_slab_of_pre_payment${index3}`]) === false) ? value[`end_slab_of_pre_payment${index3}`] : -1, 10) + 1;
    }
    return tempInput;
  };

  const calculateRpg = (values, callback) => {
    const data = (rpg * parseFloat(values.scheme_rpg_ltv)) / 100;
    // eslint-disable-next-line no-restricted-globals
    callback(isNaN(data) ? 0 : data.toFixed(2));
  };

  const fetchInitialData = async () => {
    const request1 = axios.get(process.env.REACT_APP_SCHEME_VALIDATION);
    const request2 = Service.get(`${process.env.REACT_APP_SCHEME_RPA}`);
    const request3 = Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
    const request4 = Service.get(process.env.REACT_APP_LOS_CONFIG_SERVICE);

    await Promise.all([request1, request2, request3, request4]).then(([response1, response2, response3, response4]) => {
      const schemeOptionArray = [];
      Object.keys(response4?.data).forEach((ele) => {
        if (ele !== '_default') {
          schemeOptionArray.push({ label: response4.data[ele].display_name, value: ele });
        }
      });
      const schemeTypeWithValidation = response1.data.scheme.type;
      Object.keys(schemeTypeWithValidation).forEach((key1) => {
        if (Object.keys(schemeTypeWithValidation[key1].validations).length === 0) {
          schemeTypeWithValidation[key1].validations = schemeTypeWithValidation.DEFAULT.validations;
        }
      });
      const allRateChartCode = response1.data.rebate_rate_chart;
      const activeRateChartCode = {};
      Object.keys(allRateChartCode).forEach((item) => {
        if (allRateChartCode[item].active) {
          Object.assign(activeRateChartCode, { [item]: allRateChartCode[item] });
        }
      });
      const allRebateStepupRateChartCode = response1.data.rebate_step_up_rate_chart;
      const rebatestepupratechartCode = {};
      Object.keys(allRebateStepupRateChartCode).forEach((item) => {
        if (allRebateStepupRateChartCode[item].active) {
          Object.assign(rebatestepupratechartCode, { [item]: allRebateStepupRateChartCode[item] });
        }
      });
      setRateChartCode(activeRateChartCode);
      setRebatesteupupchartcode(rebatestepupratechartCode);
      setSchemeValidations(schemeTypeWithValidation);
      setSchemeForOptions(schemeOptionArray);

      saveRpgData(response2.data.price);

      const obj = {};
      response3.data?.branches?.forEach((item) => {
        if (obj.hasOwnProperty(item?.stateName)) {
          if (obj[item?.stateName].hasOwnProperty(item?.locationName)) {
            obj[item?.stateName][item.locationName].push(
              { label: item.branchName, value: item.branchCode }
            );
          } else {
            obj[item?.stateName][item?.locationName] = [
              { label: item.branchName, value: item.branchCode }];
          }
        } else {
          obj[item?.stateName] = {};
          obj[item?.stateName][item?.locationName] = [
            { label: item.branchName, value: item.branchCode }];
        }
      });
      saveStateData(obj);
      getSchemeCount();
      getSchemeList(pageInfo.pageNumber, pageInfo.pageSize);
    }).catch((err) => {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Something went wrong while fetching scheme data', alertType: 'error' });
    });
  };

  useEffect(() => {
    saveFormValuesInRedux({});
    fetchInitialData();
  }, []);

  const addSchemeFunction = () => {
    setFormDetails(getAddFormConfiguration(
      stateDetailsHandler,
      cityDetailsHandler,
      branchDetailHandler,
      changePrepaymentEndSlab,
      getRepaymentFrequency,
      submitFormValues,
      updateSlabValidation,
      calculateRpg,
      schemeValidations,
      rateChartCode,
      rebatestepUprateChartCode,
      schemeForOptions
    ));
    saveFormValuesInRedux({});
    setFormMode({ mode: 'NEW', show: true });
  };

  const editFunction = (cellValues) => {
    setFormMode({ mode: 'EDIT', show: true });
    setSelectedScheme(cellValues.row.fullData);
    const editjsonData = getEditFormConfiguration(
      cellValues.row,
      stateDetailsHandler,
      cityDetailsHandler,
      branchDetailHandler,
      rateChartCode,
      rebatestepUprateChartCode,
      user
    );
    setEditFormJson(editjsonData);
  };

  const closeModelHandler = (event, reason) => {
    if (reason === 'backdropClick') return;
    setFormMode({ mode: 'NONE', show: false });
  };

  const formHandler = (formValues) => {
    const keys = Object.keys(formValues);
    const rebateArray = formValues.scheme_type === 'REB' ? rateChartCode[formValues.rate_chart_code]?.slabs ?? [] : rebatestepUprateChartCode[formValues.rate_chart_code]?.slabs ?? [];
    const feeArray = keys.filter((item) => formValues[item] && item.includes('fee_name'));
    const prePaymentArray = keys.filter((item) => item.includes('start_slab_of_pre_payment'));
    const feeData = [];
    const prePaymentData = [];
    const rebateData = rebateArray.map((item) => ({
      from: item.from,
      to: item.to,
      slab: `${item.from}-${item.to}`,
      interest: item.interest
    }));
    feeArray.forEach((item) => {
      const nameArray = item.split('__');
      const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
      feeData.push({
        name: formValues[`fee_name${index}`],
        type: formValues[`fee_type${index}`],
        value: formValues[`fee_value${index}`],
        cgst: 9,
        sgst: 9
      });
    });
    prePaymentArray.forEach((item) => {
      const nameArray = item.split('__');
      const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
      if (formValues[`end_slab_of_pre_payment${index}`] !== undefined) {
        prePaymentData.push({
          from: formValues[`start_slab_of_pre_payment${index}`],
          to: formValues[`end_slab_of_pre_payment${index}`],
          slab: `${formValues[`start_slab_of_pre_payment${index}`]}-${formValues[`end_slab_of_pre_payment${index}`]}`,
          interest: formValues[`value_of_pre_payment${index}`],
          cgst: formValues.prepayment_tax_cgst,
          sgst: formValues.prepayment_tax_sgst,
        });
      }
    });
    const finalData = {
      scheme: {
        name: formValues.scheme_name,
        description: formValues.scheme_description,
        type: formValues.scheme_type,
        state: formValues.is_pan_india === 'YES' ? 'ALL' : formValues.scheme_state.join(','),
        city: formValues.is_pan_india === 'YES' ? 'ALL' : formValues.scheme_city.join(','),
        rpg_ltv: formValues.scheme_rpg_ltv,
        min_loan_amount: formValues.min_loan_amt,
        max_loan_amount: formValues.max_loan_amt,
        roi: formValues.scheme_roi,
        loan_tenure: formValues.loan_tenure,
        additional_interest: formValues.additional_interest,
        repayment_frequency: formValues.repayment_frequency,
        prepayment_allowed: formValues.pre_payment,
        reserve_amount: (formValues?.scheme_type === 'STD' ? reserveAmountEnum[formValues.reserve_amount] : 0),
        rpg_value: formValues.scheme_rpg,
        rebate: (rebateData.length > 0) ? JSON.stringify(rebateData) : null,
        fee: (feeData.length > 0) ? JSON.stringify(feeData) : null,
        prepayment_charges: (prePaymentData.length > 0) ? JSON.stringify(prePaymentData) : null,
        is_status: true,
        updated_by: userDetails.email,
        created_by: userDetails.email,
        pan_india: formValues.is_pan_india === 'YES',
        fc_rebate_rate_chart_code: (formValues?.scheme_type === 'STD' ? formValues?.reserve_amount : formValues?.rate_chart_code),
        colender: formValues.scheme_for
      },
      branch_code: formValues.scheme_branch.join(','),
      updated_by: userDetails.email,
      created_by: userDetails.email,
      is_status: true,
    };
    Service.post(process.env.REACT_APP_SCHEME_CREATE, finalData).then((res) => {
      if (res.status === 201 || res.status === 200) {
        setAlertShow({
          open: true,
          msg: 'Scheme created successfully',
          alertType: 'success'
        });
        getSchemeList(1, pageInfo.pageSize);
        closeModelHandler();
      } else {
        const errorMessage = errorMessageHandler(res.data?.scheme);
        setAlertShow({
          open: true,
          msg: errorMessage.length ? errorMessage : 'Something went wrong!',
          alertType: 'error'
        });
      }
    }).catch((e) => {
      const { scheme } = e.response.data;
      const errorMessage = errorMessageHandler(scheme);
      setAlertShow({
        open: true,
        msg: errorMessage.length ? errorMessage : 'oops! Something went wrong',
        alertType: 'error'
      });
    });
  };
  const formHandlerUpdate = (formValues) => {
    const unmapBranch = [];
    const previousBranch = (selectedScheme.branch_code !== '' && selectedScheme.branch_code !== null) ? selectedScheme.branch_code?.split(',') : [];
    previousBranch.forEach((item) => {
      if (!formValues.scheme_branch.includes(item)) {
        unmapBranch.push(item);
      }
    });
    const mapBranchCode = formValues.scheme_branch?.filter((ele) => ele.trim().length);
    const filteredUnmapBranch = unmapBranch?.filter((ele) => ele.trim().length);
    const finalData = {
      scheme_id: formValues.scheme_code,
      map_branch_code: mapBranchCode,
      unmap_branch_code: filteredUnmapBranch,
      updated_by: userDetails.email,
      pan_india: formValues.is_pan_india === 'YES',
      state: formValues.is_pan_india === 'YES' ? 'ALL' : formValues.scheme_state.join(','),
      city: formValues.is_pan_india === 'YES' ? 'ALL' : formValues.scheme_city.join(','),
    };
    Service.put(process.env.REACT_APP_SCHEME_EDIT, finalData).then(() => {
      setAlertShow({
        open: true,
        msg: 'Scheme updated successfully',
        alertType: 'success'
      });
      getSchemeList(1, pageInfo.pageSize);
      closeModelHandler();
    }).catch((e) => {
      const { scheme } = e.response.data;
      const errorMessage = errorMessageHandler(scheme);
      setAlertShow({
        open: true,
        msg: errorMessage.length ? errorMessage : 'oops! Something went wrong',
        alertType: 'error'
      });
    });
  };

  return (
    checkUserPermission(MODULE_PERMISSION.scheme) ? (
      <>
        <BreadcrumbsWrapperContainerStyled>
          <BreadcrumbsContainerStyled>
            <MenuNavigation navigationDetails={navigationDetails} />
          </BreadcrumbsContainerStyled>
        </BreadcrumbsWrapperContainerStyled>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <CustomContainerStyled padding='0 !important'>
          <HeaderContainer item xs={12} padding='20px 20px 0px 20px'>
            <HeadingMaster>
              Scheme Master
            </HeadingMaster>
            <LoadingButtonPrimary
              onClick={addSchemeFunction}
              disabled={rateChartCode === null}
            >
              Add Scheme
            </LoadingButtonPrimary>
          </HeaderContainer>

          <SchemeTable
            rows={schemeData}
            columns={unclaimedColumnFields(isLoading, editFunction, editHandler)}
            checkboxAllowed={false}
            loading={isLoading?.loader && isLoading?.name === 'TABLEDATA'}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            rowCount={rowCount}
          />
          <DialogBox
            isOpen={formMode?.show}
            handleClose={closeModelHandler}
            title={formMode.mode === 'EDIT' ? 'Edit Scheme' : 'Add Scheme'}
            padding='0px'
          >
            <FormGenerator
              isLoading={false}
              formDetails={(formMode.mode === 'EDIT') ? editFormJson : formDetails}
              formHandler={(formMode.mode === 'EDIT') ? formHandlerUpdate : formHandler}
              setFormDetails={(formMode.mode === 'EDIT') ? setEditFormJson : setFormDetails}
              alertShow={alertShow}
              setAlertShow={setAlertShow}
            />
          </DialogBox>
        </CustomContainerStyled>
      </>
    ) : <SchemeMasterBranchUsers />
  );
};

const mapDispatchToProps = (dispatch) => ({
  saveFormValuesInRedux: (payload) => dispatch(saveFormValues(payload)),
  saveStateData: (payload) => dispatch(saveState(payload)),
  saveRpgData: (payload) => dispatch(saveRpg(payload)),
});
export default connect(mapStateToProps, mapDispatchToProps)(SchemeMaster);
