/* eslint-disable max-len */
/* eslint-disable camelcase */
import {
  useEffect, useMemo, useState, useTransition
} from 'react';
import { cloneDeep } from 'lodash';
import {
  TableBody, TableCell, TableHead, TableRow, FormControlLabel,
  FormGroup, Grid, CircularProgress, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import moment from 'moment';
import {
  useSelector
} from 'react-redux';
import { Service } from '../../../service';
import {
  MenuNavigation, DialogBox, ToastMessage
} from '../../../components';
import {
  HeaderContainer, CheckboxPrimary, ButtonPrimary, TextFieldStyled,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, HeadingMaster, SelectMenuStyle,
  CenterContainerStyled, LoadingButtonSecondaryPrimary, ContainerStyled
} from '../../../components/styledComponents';
import { NAVIGATION, VARIABLE } from '../../../constants';
import {
  CustomTable
} from '../helper';
import ProcessForm from './form';
import { useScreenSize } from '../../../customHooks';

const TableWrapper = styled('div')(({ width, screen }) => ({
  padding: ['xs', 'sm'].includes(screen) ? '0px 0px 20px 0px' : '0px 20px 20px',
  margin: ['xs', 'sm'].includes(screen) ? '0px 20px 0px 20px' : '0px',
  overflow: 'auto',
  width
}));
// const TableWrapper = styled.div`
//   padding: 0px 20px 20px;
//   overflow: auto;
// `;
const ProcessAudit = () => {
  const {
    branchCodes, selectedBranch, name, empCode
  } = useSelector((state) => state.user.userDetails);
  const screen = useScreenSize();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [confirmationModel, setConfirmationModel] = useState('CLOSE');
  const [branchDetails, setBranchDetails] = useState();
  const [alertShow, setAlertShow] = useState({ open: false, msg: null, alertType: null });
  const [branchName, setBranchName] = useState({});
  const [details, setDetails] = useState();
  const [, startTransition] = useTransition();
  const [checkboxOption,] = useState([
    {
      name: 'I certify that I have completed Audit of the branch',
      status: false
    },
    {
      name: 'I certify that the information shared by me in the Audit Checklist is correct',
      status: false
    },
    {
      name: 'I have thoroughly checked the processes followed by the branch',
      status: false
    },
  ]);
  const navigate = useNavigate();
  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Audit Management', url: NAVIGATION.auditManagement },
    { name: 'Process Audit', url: NAVIGATION.processAudit },
  ], [NAVIGATION]);

  const message = {
    SUBMIT: 'Are you sure you want to submit Audit Checklist?',
    CANCEL: 'Are you sure you want to cancel and close Audit Checklist?',
    DONE: 'The Auditor checklist has been submitted successfully.'
  };
  const formHandler = async () => {
    try {
      if (confirmationModel === 'CANCEL') {
        navigate(NAVIGATION.dashboard);
        return;
      }

      if (branchName?.branchCode === VARIABLE.BRANCHALL || !branchName?.branchCode) {
        setAlertShow({
          open: true,
          msg: 'Please select branch code.',
          alertType: 'error'
        });
        return;
      }
      setIsSubmitLoading(true);
      let type = false;
      let remarks = false;
      const tempDetails = details;

      tempDetails.forEach((item) => {
        item.process_description.forEach((subItem) => {
          if (subItem.aom_input !== 'Yes'
            && subItem.aom_input !== 'No') {
            subItem.notSelected = true;
            type = true;
          }
          if (subItem?.error) {
            remarks = true;
          }
        });
      });

      if (type || remarks) {
        if (type && remarks) {
          setAlertShow({
            open: true,
            msg: 'Category Auditor input and remarks are missing.',
            alertType: 'error'
          });
        }

        if (type && !remarks) {
          setAlertShow({
            open: true,
            msg: 'Category Auditor input is missing.',
            alertType: 'error'
          });
        }

        if (remarks && !type) {
          setAlertShow({
            open: true,
            msg: 'Category remarks is missing.',
            alertType: 'error'
          });
        }
        setDetails(tempDetails);
        setConfirmationModel('CLOSE');
        setIsSubmitLoading(false);

        return;
      }

      const obj = {
        branch_code: branchName?.branchCode,
        category_remarks: details?.map((item) => ({
          category_id: item?.category_id,
          process_description: item.process_description.map((subItem) => {
            const temp = {
              process_id: subItem.process_id,
              aom_input: subItem?.aom_input,
            };
            if (subItem?.remarks.length) {
              temp.remarks = subItem?.remarks;
            }

            return temp;
          })
        })),
        declarations: checkboxOption,
      };

      const { status } = await Service.post(process.env.REACT_APP_PROCESS_AUDIT, obj);
      if (status === 201) {
        setIsSubmitLoading(false);
        setConfirmationModel('DONE');
        setAlertShow({
          open: true,
          msg: 'Process audit details submitted successfully.',
          alertType: 'success'
        });
        return;
      }
      setAlertShow({
        open: true,
        msg: 'Process audit API fail while submitted.',
        alertType: 'error'
      });
      setIsSubmitLoading(false);
    } catch (e) {
      console.log('Error', e);
      setAlertShow({ open: true, msg: 'Process audit API fail. Try Again.', alertType: 'error' });
      setIsSubmitLoading(false);
    }
  };
  const submitButtonHandler = (processDetails) => {
    try {
      const validStatus = checkboxOption.filter((item) => item.status);
      if (validStatus.length !== checkboxOption.length) {
        setIsDisabled(true);
        return;
      }
      const tempDetails = processDetails;

      const isEnable = tempDetails.some((item) => item?.process_description.find((subDesc) => {
        if (!subDesc?.aom_input) {
          return true;
        }
        if (subDesc?.aom_input === 'Yes' || subDesc?.aom_input === 'No') {
          if (subDesc?.aom_input === 'No' && !subDesc?.remarks?.length) {
            return true;
          }
        }
        return false;
      }));
      setIsDisabled(isEnable);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const checkboxHandler = (value, index) => {
    try {
      checkboxOption[index].status = value;
      submitButtonHandler(details);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const detailsHandler = (value, categoryIndex, subCategoryIndex, type) => {
    try {
      const tempValue = cloneDeep(details);
      if (type === 'remarks') {
        const { aom_input } = tempValue[categoryIndex].process_description[subCategoryIndex];
        tempValue[categoryIndex].process_description[subCategoryIndex][type] = value;
        if ((aom_input === 'No' && (value?.length <= 0 || value?.length > 300))
        || (aom_input === 'Yes' && value?.length > 300)
        ) {
          tempValue[categoryIndex].process_description[subCategoryIndex].error = true;
        } else {
          delete tempValue[categoryIndex].process_description[subCategoryIndex].error;
        }
      }

      if (type === 'aom_input') {
        const { remarks } = tempValue[categoryIndex].process_description[subCategoryIndex];
        tempValue[categoryIndex].process_description[subCategoryIndex][type] = value;
        if ((value === 'No' && (remarks?.length <= 0 || remarks?.length > 300))
        || (value === 'Yes' && remarks?.length > 300)) {
          tempValue[categoryIndex].process_description[subCategoryIndex].error = true;
        } else {
          delete tempValue[categoryIndex].process_description[subCategoryIndex].error;
        }
        tempValue[categoryIndex].process_description[subCategoryIndex].notSelected = false;
      }
      tempValue[categoryIndex].process_description[subCategoryIndex][type] = value;
      startTransition(() => {
        setDetails(tempValue);
        submitButtonHandler(tempValue);
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const branchDetailsHandler = async () => {
    try {
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);

      const tempBranch = {};

      data?.branches.forEach((item) => { tempBranch[item.branchCode] = item.branchName; });
      setBranchDetails(tempBranch);
      setBranchName({
        name: tempBranch[selectedBranch],
        branchCode: selectedBranch
      });
    } catch (e) {
      setAlertShow({ open: true, msg: 'Branch Details API fail. Try Again.', alertType: 'error' });
      console.log('Error', e);
    }
  };

  const proccessListHandler = async () => {
    try {
      setIsLoading(true);
      const { data } = await Service.get(`${process.env.REACT_APP_PROCESS_AUDIT_LIST}`);
      const processTemp = data.data.map((item) => ({
        category: item.category,
        category_id: item.category_id,
        table_id: item?.table_id,
        process_description: item.process_description.map((procDesc) => ({
          ...procDesc,
          aom_input: '',
          remarks: ''
        }))
      }));
      setDetails(processTemp);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      setAlertShow({ open: true, msg: 'Soemthing went wrong while fetching category. Try Again.', alertType: 'error' });
      console.log('Error', e);
    }
  };

  useEffect(() => {
    proccessListHandler();
    branchDetailsHandler();
  }, []);

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <DialogBox
        isOpen={confirmationModel !== 'CLOSE'}
        title=''
        handleClose={() => {
          if (!isSubmitLoading) {
            setConfirmationModel('CANCEL');
            setIsLoading(false);
          }
        }}
        width='auto'
        padding='40px'
      >
        {
          message[confirmationModel]
        }
        {
          confirmationModel !== 'DONE'
            ? (
              <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
                <LoadingButtonSecondaryPrimary
                  variant='contained'
                  onClick={formHandler}
                  loading={isSubmitLoading}
                >
                  Yes
                </LoadingButtonSecondaryPrimary>
                <ButtonPrimary disabled={isSubmitLoading} onClick={() => setConfirmationModel('CLOSE')}>No</ButtonPrimary>
              </CenterContainerStyled>
            )
            : (
              <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
                <ButtonPrimary onClick={() => {
                  setConfirmationModel('CLOSE');
                  navigate(NAVIGATION.dashboard, { replace: true });
                }}
                >
                  OK
                </ButtonPrimary>
              </CenterContainerStyled>
            )

        }
      </DialogBox>
      <ContainerStyled padding='0 !important'>
        <HeaderContainer item xs={12}>
          <HeadingMaster>Process Audit</HeadingMaster>
        </HeaderContainer>
        <ProcessForm
          branchCodes={branchCodes}
          selectedBranch={selectedBranch !== VARIABLE.BRANCHALL ? selectedBranch : null}
          name={name}
          empCode={empCode}
          branchDetails={branchDetails}
          branchName={branchName}
          setBranchName={setBranchName}
        />
        {
       !isLoading ? (
         <>
           <Grid continer display='flex' xs={12}>
             <TableWrapper width={['xs', 'sm'].includes(screen) ? '95%' : '100%'} screen={screen}>
               <CustomTable screen={screen}>
                 <TableHead>
                   <TableRow>
                     <TableCell colSpan={4} align='center'>
                       To check working of all the Security system & Physical Security Guard
                     </TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell width='10%'>Sr. No.</TableCell>
                     {/* <TableCell width='25%'>Category</TableCell> */}
                     <TableCell width='52%'>Process Description - Points to be checked</TableCell>
                     <TableCell width='18%'>{'Auditor\'s Input (Yes/No)*'}</TableCell>
                     <TableCell width='20%'>Remarks</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {details?.map((item, index) => (
                     item.table_id === 1 ? (
                       item.process_description.map((detail, subDescIndex) => (
                         <TableRow>
                           <TableCell>{subDescIndex + 1}</TableCell>
                           <TableCell>{detail.name}</TableCell>
                           <TableCell>
                             <FormControl fullWidth>
                               <TextFieldStyled
                                 label='Select'
                                 select
                                 error={details
                                  && details[index].process_description[subDescIndex]?.notSelected}
                                 onChange={(e) => detailsHandler(e.target.value, index, subDescIndex, 'aom_input')}
                               >
                                 <SelectMenuStyle key='Yes' value='Yes'>Yes</SelectMenuStyle>
                                 <SelectMenuStyle key='No' value='No'>No</SelectMenuStyle>
                               </TextFieldStyled>
                             </FormControl>
                           </TableCell>
                           <TableCell>
                             <TextFieldStyled
                               error={details
                                    && details[index].process_description[subDescIndex]?.error}
                               multiline
                               inputProps={{
                                 maxLength: 300,
                               }}
                               placeholder='Remark'
                               onChange={(e) => detailsHandler(e.target.value?.trim(), index, subDescIndex, 'remarks')}
                             />
                           </TableCell>
                         </TableRow>
                       ))
                     ) : null
                   ))}
                 </TableBody>
               </CustomTable>
             </TableWrapper>
           </Grid>
           <Grid continer display='flex' xs={12}>
             <TableWrapper width={['xs', 'sm'].includes(screen) ? '95%' : '100%'} screen={screen}>
               <CustomTable screen={screen}>
                 <TableHead>
                   <TableRow>
                     <TableCell colSpan={4} align='center'>
                       Notice Board, Register, Certificates and other compliance related
                       process to be checked
                     </TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell width='10%'>Sr. No.</TableCell>
                     {/* <TableCell width='25%'>Category</TableCell> */}
                     <TableCell width='52%'>Process Description - Points to be checked</TableCell>
                     <TableCell width='18%'>{'Auditor\'s Input (Yes/No)*'}</TableCell>
                     <TableCell width='20%'>Remarks</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {details?.map((item, index) => (
                     item.table_id === 2 && (
                     <>
                       <TableRow>
                         <TableCell
                           colSpan={4}
                           align='center'
                           sx={{
                             fontWeight: 'bold',
                             padding: '16px !important',
                             backgroundColor: 'rgba(0, 0, 0, 0.08)'
                           }}
                         >
                           {item.category}
                         </TableCell>
                       </TableRow>
                       {item.process_description.map((detail, subDescIndex) => (
                         <TableRow>
                           <TableCell>{subDescIndex + 1}</TableCell>
                           <TableCell>{detail.name}</TableCell>
                           <TableCell>
                             <FormControl fullWidth>
                               <TextFieldStyled
                                 label='Select'
                                 select
                                 error={details?.[index]?.process_description?.[subDescIndex]?.notSelected}
                                 onChange={(e) => detailsHandler(e.target.value, index, subDescIndex, 'aom_input')}
                               >
                                 <SelectMenuStyle key='Yes' value='Yes'>Yes</SelectMenuStyle>
                                 <SelectMenuStyle key='No' value='No'>No</SelectMenuStyle>
                               </TextFieldStyled>
                             </FormControl>
                           </TableCell>
                           <TableCell>
                             <TextFieldStyled
                               error={details?.[index]?.process_description?.[subDescIndex]?.error}
                               multiline
                               inputProps={{
                                 maxLength: 300,
                               }}
                               placeholder='Remark'
                               onChange={(e) => detailsHandler(e.target.value?.trim(), index, subDescIndex, 'remarks')}
                             />
                           </TableCell>
                         </TableRow>
                       ))}
                     </>
                     )
                   ))}
                 </TableBody>
               </CustomTable>
             </TableWrapper>
           </Grid>
           <Grid continer display='flex' justifyContent='center' alignItems='center' padding='20px'>
             <FormGroup>
               {checkboxOption?.map((option, index) => (
                 <FormControlLabel
                   key={option?.name}
                   value={option?.name}
                   control={(
                     <CheckboxPrimary
                       defaultChecked={option?.status}
                       onChange={(e) => {
                         checkboxHandler(e.target.checked, index);
                       }}
                     />
                  )}
                   label={option?.name}
                 />
               ))}
             </FormGroup>
           </Grid>
           <Grid continer display='flex' justifyContent='center' alignItems='center' padding='10px'>
             <ButtonPrimary disabled={isDisabled} onClick={() => setConfirmationModel('SUBMIT')}>
               Submit
             </ButtonPrimary>
             <ButtonPrimary onClick={() => setConfirmationModel('CANCEL')}>
               Cancel
             </ButtonPrimary>
           </Grid>
           <Grid continer display='flex' justifyContent='flex-start' alignItems='center' padding='20px'>
             <TextFieldStyled
               width='200px'
               disabled
               label='Date'
               value={moment().format('DD/MM/YYYY')}
             />
           </Grid>
         </>
       )
         : (
           <CenterContainerStyled padding='40px'>
             <CircularProgress color='secondary' />
           </CenterContainerStyled>
         )
      }
      </ContainerStyled>

    </>
  );
};
export default ProcessAudit;
