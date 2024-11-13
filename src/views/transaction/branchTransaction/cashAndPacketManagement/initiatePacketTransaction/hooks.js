/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import {
  AREAMANAGER, ASSISTANTBRANCHMANAGER, BRANCHMANAGER, GOLDVALUER, IBGTcategory, MAKER, ModesofTransprt, REGIONALMANAGER,
  alreadyExists, getTotalPOS, handleError
} from './constants';
import { Service } from '../../../../../service';
import { IBGTStatus } from '../../../helper';

export const useIBGTMaker = ({
  trigger, getValues, resetField, selectedBranch, userType, setValue, rowData
}) => {
  const [transactionData, setTransactionData] = useState(null);
  const [transformingPerson, setTransformingPerson] = useState([]);
  const [goldPackets, setGoldPackets] = useState([]);
  const [alertShow, setAlertShow] = useState(false);
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [branchList, setBranchList] = useState([]);

  const handleEmpdeletion = (temp) => {
    const updatedRows = transformingPerson.filter((row) => row.id !== temp.row.id);
    setTransformingPerson(updatedRows);
  };

  const handleLandeletion = (temp) => {
    const updatedRows = goldPackets.filter((row) => row.id !== temp.row.id);
    setValue('mode', '');
    setGoldPackets(updatedRows);
  };

  const allowedTransitPersons = () => {
    const totalPOS = getTotalPOS(goldPackets);
    if (totalPOS <= 1000000) {
      return [BRANCHMANAGER, ASSISTANTBRANCHMANAGER, GOLDVALUER];
    } if (totalPOS <= 2500000) {
      return [BRANCHMANAGER, ASSISTANTBRANCHMANAGER, GOLDVALUER, AREAMANAGER];
    }
    return [BRANCHMANAGER, ASSISTANTBRANCHMANAGER, GOLDVALUER, AREAMANAGER, REGIONALMANAGER];
  };

  const handleEmpaddition = async () => {
    const validation = await trigger('empID');
    if (validation) {
      try {
        setLoading({ loader: true, name: 'empAddition' });
        const empValue = getValues('empID');
        if (alreadyExists(transformingPerson, 'empID', empValue)) {
          setAlertShow({ open: true, msg: 'Employee already added.', alertType: 'error' });
          return;
        }
        if (getTotalPOS(goldPackets) <= 1000000 && transformingPerson.length === 1) {
          setAlertShow({ open: true, msg: 'Only one employee is allowed for Amount less than 10L.', alertType: 'error' });
          return;
        }
        if (transformingPerson.length === 2) {
          setAlertShow({ open: true, msg: 'Only two employees are allowed.', alertType: 'error' });
          return;
        }
        const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/users/get/${empValue}`);
        const allowedPersons = allowedTransitPersons();
        if (!allowedPersons.includes(data?.functional_designation)) {
          setAlertShow({ open: true, msg: 'This Employee is not allowed for this transit.', alertType: 'error' });
          return;
        }
        setTransformingPerson([...transformingPerson, {
          id: data.id,
          empID: data?.emp_code,
          empName: data?.emp_name,
          funcDesignation: data?.functional_designation
        }]);
        // reset('empID', { shouldValidate: true });
        resetField('empID');
      } catch (err) {
        console.log('error', err);
        const errorMessage = handleError(err);
        setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
      } finally {
        setLoading({ loader: false, name: null });
      }
    }
  };

  const getAllBranches = async () => {
    try {
      // setLoading({ loader: true, name: 'onLoad' });
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      const filteredBranches = data?.branches?.filter((item) => item.branchCode !== selectedBranch);
      const mapping = filteredBranches?.map((item) => ({ label: item.branchCode, value: item.branchCode }));
      return {
        mapping
      };
    } catch (err) {
      // setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      throw new Error(err);
    }
  };

  const handleLANaddition = async () => {
    // e.preventDefault();
    const validation = await trigger('lan');
    if (validation) {
      try {
        const lanValue = getValues('lan');
        if (alreadyExists(goldPackets, 'lan', lanValue)) {
          setAlertShow({ open: true, msg: 'LAN already added.', alertType: 'error' });
          return;
        }
        setLoading({ loader: true, name: 'lanAddition' });
        const { data } = await Service.post(process.env.REACT_APP_LAN_POS, {
          loan_account_no: lanValue
        });
        const decodeToken = jwtDecode(data.data);
        const lanData = decodeToken.lan_data;
        setValue('mode', '');
        resetField('lan');
        setGoldPackets((prev) => [...prev, {
          id: lanValue, lan: lanValue, pos: lanData.pos, token: data.data, packet: lanData.packet
        }]);
      } catch (err) {
        console.log('error', err);
        const errorMsg = handleError(err);
        setAlertShow({ open: true, msg: errorMsg, alertType: 'error' });
      } finally {
        setLoading({ loader: false, name: null });
      }
    }
  };

  const fetchModes = () => {
    const totalPOS = getTotalPOS(goldPackets);
    if (totalPOS <= 1000000) { return [{ label: 'Two-Wheeler', value: ModesofTransprt['Two-Wheeler'] }, { label: 'Public Transport', value: ModesofTransprt['Public Transport'] }]; }
    return [{ label: 'Own Car', value: ModesofTransprt['Own Car'] }, { label: 'Hired Vehicle', value: ModesofTransprt['Hired Vehicle'] }];
  };

  const fetchTransactionID = async () => {
    try {
      const { data } = await Service.get(process.env.REACT_APP_IBGT_GENERATE_TRANSACTIONID);
      return data.data;
    } catch (err) {
      throw new Error(err);
    }
  };
  const getIBGTStatus = (status) => (
    Object.keys(IBGTStatus).find((key) => (IBGTStatus[key] === status))
  );
  const fetchPrefilledData = async (txnId, status) => {
    try {
      const obj = {
        transaction_id: txnId,
        status: getIBGTStatus(status)

      };
      const queryParams = `${Object.keys(obj).map((key) => `${key}=${obj[key]}`).join('&')}`;
      const { data } = await Service.get(`${process.env.REACT_APP_GET_PREFILLED_DATA}?${queryParams}`);
      const preData = data.data;
      return {
        type: 'IBGT-OUT',
        category: IBGTcategory,
        amount: preData.amount,
        armedGuard: preData.armed_guard_opt_in,
        packetToBranch: preData.packet_to_branch,
        mode: preData.mode,
        status: rowData.status,
        maker_remarks: preData.maker_remarks,
        maker_name: rowData.requestRaisedBy,
        approver_name: preData.approver_name,
        approver_remarks: preData.approver_remarks,
        acknowledger_name: preData.acknowledger_name,
        acknowledger_remarks: preData.acknowledger_remarks,
        packetFromBranch: rowData.packetFromBranch,
        vehicleRegNum: preData.vehicle_details,
        transferingPerson: preData.transferring_employees.map((item) => ({
          id: item.emp_code, empName: item.emp_name, empCode: item.emp_code, funcDesignation: item.func_des
        })),
        lans: preData.loan_account_numbers.map((item) => ({
          id: item.lan, lan: item.lan, pos: item.pos, selected: item.status
        }))
      };
    } catch (err) {
      throw new Error(err);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading({ loader: true, name: 'onLoad' });
      if (userType === MAKER && !rowData) {
        const res = await Promise.all([getAllBranches(), fetchTransactionID()]);
        const [branchData, transactionRes] = res;
        setBranchList(branchData.mapping);
        setTransactionData({
          txnNo: transactionRes.transaction_id,
          type: 'Gold Packet Out',
          packetFromBranch: selectedBranch,
          amount: 0,
          category: IBGTcategory
        });
      } else {
        const res = await Promise.all([getAllBranches(), fetchPrefilledData(rowData.transactionNumber, rowData.status)]);
        const [branchData, preFilledRes] = res;
        setValue('goldPacketToBranch', preFilledRes.packetToBranch);
        setValue('mode', preFilledRes.mode);
        setValue('armedGuard', preFilledRes.armedGuard);
        setValue('vehicleRegNum', preFilledRes.vehicleRegNum);
        setBranchList(branchData.mapping);
        setTransactionData({
          txnNo: rowData.transactionNumber,
          type: preFilledRes.type,
          packetFromBranch: preFilledRes.packetFromBranch,
          amount: preFilledRes.amount,
          category: preFilledRes.category,
          mode: preFilledRes.mode,
          packetToBranch: preFilledRes.packetToBranch,
          armedGuard: preFilledRes.armedGuard,
          vehicleRegNum: preFilledRes.vehicleRegNum,
          // remarks: preFilledRes.remarks,
          makerName: preFilledRes.maker_name,
          makerRemarks: preFilledRes.maker_remarks,
          acknowledgerName: preFilledRes.acknowledger_name,
          acknowledgerRemarks: preFilledRes.acknowledger_remarks,
          approverName: preFilledRes.approver_name,
          approverRemarks: preFilledRes.approver_remarks
        });
        setTransformingPerson((prev) => [...prev, ...preFilledRes.transferingPerson]);
        const prefilledLanData = preFilledRes.lans.map((item) => ({ ...item, selected: item.selected }));
        setGoldPackets((prev) => [...prev, ...prefilledLanData]);
      }
    } catch (err) {
      console.log('eror is', err);
      const errorMsg = handleError(err);
      setAlertShow({ open: true, msg: errorMsg, alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleSelectionModelChange = (newSelection) => {
    const newSelectionArray = goldPackets.map((row) => ({
      ...row,
      selected: newSelection.includes(row.id),
    }));
    setGoldPackets(() => [...newSelectionArray]);
  };

  useEffect(() => {
    // getAllBranches();
    fetchInitialData();
  }, []);

  return {
    transactionData,
    setTransactionData,
    transformingPerson,
    setTransformingPerson,
    goldPackets,
    setGoldPackets,
    handleEmpdeletion,
    handleLandeletion,
    alertShow,
    setAlertShow,
    loading,
    setLoading,
    branchList,
    setBranchList,
    allowedTransitPersons,
    handleEmpaddition,
    getAllBranches,
    handleLANaddition,
    fetchModes,
    fetchTransactionID,
    handleSelectionModelChange,
    getIBGTStatus
  };
};
