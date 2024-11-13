/* eslint-disable max-len */
import { cloneDeep } from 'lodash';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { Service } from '../../service';
import {
  FormDetails, navigationDetails, columnFields
} from './helper';
import { CHARGES_ENUM_VALUES } from '../../constants';
import { FormViewer, ToastMessage, MenuNavigation } from '../../components';
import {
  CustomContainerStyled, BreadcrumbsContainerStyled, LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled, HeadingMaster, HeaderContainer
} from '../../components/styledComponents';

const ChargeMaster = () => {
  const [stateDetails, setStateDetails] = useState();
  const [branchDetails, setBranchDetails] = useState();
  const [updateObjectDetails, setUpdateDetails] = useState();
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [formMode, setFormMode] = useState({ mode: 'EDIT', show: false });
  const [formDetails, setFormDetails] = useState(cloneDeep(FormDetails({ stateDetails })));
  const [isLoading, setIsLoading] = useState({ loader: true, id: null, name: 'TABLEDATA' });
  const [chargeDetails, setChargeDetails] = useState({
    data: [],
    rowCount: 0,
    pageNumber: 1,
    pageSize: 10
  });
  const userDetails = useSelector((state) => state.user.userDetails);

  const getChargeDetails = async (pageNumber, pageSize, details) => {
    try {
      const { data } = await Service.post(`${process.env.REACT_APP_CHARGE_GET}?page_size=${pageSize}&&page=${pageNumber}`, {
        branches_code: [],
        is_active: null
      });
      if (data?.results?.length > 0) {
        const response = data.results.map((item) => {
          const tempBranch = item.branch_code.split(',');
          let tempBranchDetails = '';
          tempBranch.forEach((brh, index) => {
            if (tempBranch.length - 1 === index) {
              tempBranchDetails += details[brh];
            } else {
              tempBranchDetails += `${details[brh]},`;
            }
          });
          let chargeName;
          if (CHARGES_ENUM_VALUES[item?.charge?.name]) {
            chargeName = CHARGES_ENUM_VALUES[item?.charge?.name];
          } else {
            chargeName = item?.charge?.name;
          }
          return {
            _id: item?.charge?.id,
            ...item?.charge,
            name: chargeName,
            pan_india: item?.charge?.pan_india ? 'YES' : 'NO',
            branch_code_preview: tempBranchDetails,
            branch_code: item.branch_code,
            status: item?.charge?.is_status ? 'ACTIVE' : 'INACTIVE'
          };
        });
        setChargeDetails((pre) => ({
          ...pre,
          data: response
        }));
      } else {
        setChargeDetails((pre) => ({
          ...pre,
          data: []
        }));
      }
      setIsLoading({ loader: false, id: null, name: null });
    } catch (e) {
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong!.', alertType: 'error' });
      }
      setIsLoading({ loader: false, id: null, name: null });
      console.log(e);
    }
  };

  const getChargeCount = async () => {
    try {
      const { data } = await Service.post(process.env.REACT_APP_CHARGE_GET_COUNT, {
        branches_code: [],
        is_active: null
      });
      setChargeDetails((pre) => ({
        ...pre,
        rowCount: data.charges_count
      }));
    } catch (e) {
      setAlertShow({ open: true, msg: 'Something went wrong!.', alertType: 'error' });
      console.log(e);
    }
  };

  const editChargeDetailsHandler = async (value) => {
    try {
      const chargeNameArray = Object.entries(CHARGES_ENUM_VALUES).filter((item) => item[1] === value.row.name);
      let chargeName;
      if (chargeNameArray.length) {
        // eslint-disable-next-line prefer-destructuring
        chargeName = chargeNameArray[0][0];
      } else {
        chargeName = value.row.name;
      }
      setIsLoading({ loader: true, id: value.id });
      setUpdateDetails({ ...value.row, name: chargeName });
      const updatedForm = cloneDeep(FormDetails({ stateDetails, defaultValue: { ...value.row, name: chargeName } }));
      setFormDetails(updatedForm);
      setFormMode({ mode: 'EDIT', show: true });
      setIsLoading({ loader: false, id: null });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const editChargeStatusHandler = async (value) => {
    try {
      setIsLoading({ loader: true, id: value.id });
      const { status } = await Service.put(process.env.REACT_APP_CHARGE_PUT, {
        charge_id: value.row.id,
        is_active: !value.row.is_status,
        updated_by: userDetails?.email,
      });
      if (status === 200) {
        getChargeDetails(chargeDetails?.pageNumber, chargeDetails?.pageSize, branchDetails);
        setAlertShow({ open: true, msg: 'Charge status updated successfully.', alertType: 'success' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong!', alertType: 'success' });
      }
      setIsLoading({ loader: false, id: null });
    } catch (e) {
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong!.', alertType: 'error' });
      }
      console.log('Error', e);
    }
  };

  const addNewChargeHandler = () => {
    try {
      setFormMode({ mode: 'NEW', show: true });
      setFormDetails(cloneDeep(FormDetails({ stateDetails })));
    } catch (e) {
      console.log('Error', e);
    }
  };

  const closeModelHandler = () => {
    setFormMode({ mode: 'NONE', show: false });
  };

  const branchDetailsHandler = async () => {
    try {
      setIsLoading({ name: 'TABLEDATA', loader: true });
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);

      const tempBranch = {};

      data?.branches.forEach((item) => { tempBranch[item.branchCode] = item.branchName; });

      getChargeDetails(chargeDetails.pageNumber, chargeDetails.pageSize, tempBranch);
      setBranchDetails(tempBranch);
      const obj = {};
      data?.branches?.forEach((item) => {
        if (obj.hasOwnProperty(item?.stateName)) {
          if (obj[item?.stateName].hasOwnProperty(item?.locationName)) {
            obj[item?.stateName][item.locationName].push({
              label: item.branchName, value: item.branchCode
            });
          } else {
            obj[item?.stateName][item?.locationName] = [{
              label: item.branchName, value: item.branchCode
            }];
          }
        } else {
          obj[item?.stateName] = {};
          obj[item?.stateName][item?.locationName] = [{
            label: item.branchName, value: item.branchCode
          }];
        }
      });
      setStateDetails(obj);
      const tempForm = cloneDeep(FormDetails({ stateDetails: obj }));
      setFormDetails(tempForm);
    } catch (e) {
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong!.', alertType: 'error' });
      }
      console.log('Error', e);
    }
  };

  const errorMessageHandler = (message) => {
    try {
      let msg = '';
      if (typeof (message) === 'object') {
        Object.keys(message).forEach((item) => {
          msg += message[item][0];
        });
      }
      return msg;
    } catch (e) {
      console.log('Error', e);
    }
  };

  const formHandler = async (value) => {
    try {
      const obj = {
        charge: {
          name: value.name,
          type: value.type,
          state: value.pan_india === 'YES' ? 'ALL' : value.state.toString(),
          city: value.pan_india === 'YES' ? 'ALL' : value.city.toString(),
          value: value.type === 'FLT' ? value.valueFLT : value.valuePER,
          cgst: value.cgst,
          sgst: value.sgst,
          pan_india: value.pan_india,
          is_status: value.status === 'ACTIVE',
          updated_by: userDetails?.email,
          created_by: userDetails?.email,
        },
        is_status: value.status === 'ACTIVE',
        branch_code: value.pan_india === 'YES' ? 'ALL' : value.branch_code.toString(),
        updated_by: userDetails?.email,
        created_by: userDetails?.email,
      };

      const updateObj = {
        charge_id: updateObjectDetails?.id,
        state: value.pan_india === 'YES' ? 'ALL' : value.state.toString(),
        city: value.pan_india === 'YES' ? 'ALL' : value.city.toString(),
        pan_india: value.pan_india,
        map_branch_code: value.pan_india === 'YES' ? ['ALL'] : value.branch_code.filter((item) => item.length),
        unmap_branch_code: [],
        updated_by: userDetails?.email,
      };

      if (formMode.mode === 'EDIT') {
        const unmapBranch = [];
        const previousBranch = (updateObjectDetails.branch_code !== '' && updateObjectDetails.branch_code !== null) ? updateObjectDetails.branch_code?.split(',') : [];
        previousBranch.forEach((item) => {
          if (!value.branch_code.includes(item)) {
            unmapBranch.push(item);
          }
        });
        const filteredUnmapBranch = unmapBranch?.filter((ele) => ele.trim().length);
        updateObj.unmap_branch_code = filteredUnmapBranch;
      }
      setIsLoading({
        loader: true,
        id: null,
        name: 'SUBMIT'
      });
      const { status, data } = await
      Service[formMode.mode === 'EDIT' ? 'put' : 'post'](formMode.mode === 'EDIT' ? process.env.REACT_APP_CHARGE_CONNECTOR_DETAILS : process.env.REACT_APP_CHARGE_POST, formMode.mode === 'EDIT' ? updateObj : obj);
      if (status === 201 || status === 200) {
        setFormMode({
          mode: null,
          show: false
        });
        getChargeDetails(1, chargeDetails?.pageSize, branchDetails);
        setAlertShow({
          open: true,
          msg: formMode.mode === 'EDIT' ? 'Charge updated successfully.' : 'Charge created successfully.',
          alertType: 'success'
        });
        return;
      }
      const errorMessage = errorMessageHandler(data?.charge);
      setAlertShow({
        open: true,
        msg: errorMessage.length ? errorMessage : 'Something went wrong!',
        alertType: 'error'
      });
      setIsLoading({
        loader: false,
        id: null,
        name: null
      });
    } catch (e) {
      const { charge } = e.response.data;
      const errorMessage = errorMessageHandler(charge);
      setAlertShow({
        open: true,
        msg: errorMessage?.length ? errorMessage : 'Something went wrong!',
        alertType: 'error'
      });
      setIsLoading({
        loader: false,
        id: null,
        name: null
      });
      console.log('Error', e);
    }
  };

  const onPageSizeChange = (pageSize) => {
    try {
      setChargeDetails((pre) => ({
        ...pre,
        pageSize
      }));
      getChargeDetails(chargeDetails.pageNumber, pageSize, branchDetails);
    } catch (e) {
      console.log(e);
    }
  };

  const onPageChange = (pageNumber) => {
    try {
      setIsLoading({ loader: true, id: null, name: 'TABLEDATA' });
      setChargeDetails((pre) => ({
        ...pre,
        pageNumber
      }));
      getChargeDetails(pageNumber, chargeDetails.pageSize, branchDetails);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setIsLoading({ loader: true, id: null, name: 'TABLEDATA' });
    branchDetailsHandler();
    getChargeCount();
  }, []);

  const chargeMasterColumns = useMemo(() => columnFields(
    isLoading,
    editChargeDetailsHandler,
    editChargeStatusHandler
  ), [isLoading, userDetails]);

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
        <HeaderContainer item xs={12} padding='20px 20px 0px 20px'>
          <HeadingMaster>
            Charge Master
          </HeadingMaster>
          <LoadingButtonPrimary
            onClick={addNewChargeHandler}
          >
            Add Charge
          </LoadingButtonPrimary>
        </HeaderContainer>
        <Grid item xs={12}>
          <FormViewer
            isLoading={isLoading?.loader && isLoading?.name === 'SUBMIT'}
            loading={isLoading?.loader && isLoading?.name === 'TABLEDATA'}
            formHandler={formHandler}
            formMode={formMode}
            rows={isLoading?.loader && isLoading?.name === 'TABLEDATA' && !chargeDetails?.data?.length ? [] : chargeDetails?.data}
            columns={chargeMasterColumns}
            checkboxAllowed={false}
            formDetails={formDetails}
            closeModelHandler={closeModelHandler}
            modalTitle={formMode.mode === 'EDIT' ? 'Update Charge' : 'Add Charge'}
            onPageSizeChange={onPageSizeChange}
            onPageChange={onPageChange}
            rowCount={chargeDetails?.rowCount}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
          />
        </Grid>
      </CustomContainerStyled>
    </>
  );
};
export default ChargeMaster;
