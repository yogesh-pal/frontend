/* eslint-disable max-len */
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Grid, Dialog, DialogActions, DialogTitle,
  CircularProgress, Box
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CustomContainerStyled, HeaderContainer, HeadingMaster, LoadingButtonPrimary, ButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled
} from '../../../../components/styledComponents';
import { CustomDiv, HeadingMaster2 } from '../../styled-components';
import { MenuNavigation, ToastMessage } from '../../../../components';
import { Service } from '../../../../service';
import { NAVIGATION, MODULE_PERMISSION } from '../../../../constants';
import PermissionsTable from '../../permissionTable';
import { permissionsColumns } from '../../constant';

const Permissions = () => {
  const [open, setOpen] = useState(false);
  const [updatedPermissions, setUpdatedPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const { handleSubmit, register } = useForm();
  const { state } = useLocation();
  const { email } = useSelector((data) => data.user.userDetails);
  const navigate = useNavigate();
  const tableColumn = permissionsColumns(register);
  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'User Management', url: NAVIGATION.userManagement },
    { name: 'Permission Management', url: NAVIGATION.functionalDesignation }
  ], [NAVIGATION]);

  const getPermissionRoleMapping = async () => {
    try {
      setIsLoading({ loader: true, name: 'onLoad' });
      const permissionArr = state.permissions.split(',');
      const charge = {};
      const rate = {};
      const scheme = {};
      const user = {};
      const permission = {};
      const deputation = {};
      const circular = {};
      const customer = {};
      const loan = {};
      const repayment = {};
      const auditAssignment = {};
      const auditCase = {};
      const processAudit = {};
      const vendorUser = {};
      const role = {};
      const receipt = {};
      const collateralRelease = {};
      const partRelease = {};
      const cashAndPacket = {};
      const customerCPV = {};
      const topUp = {};
      const cashAudit = {};
      const packetAudit = {};
      const onlinePayment = {};
      const bankingPartnership = {};
      const rekycUploader = {};
      const metabase = {};
      const leadManagement = {};
      const leadManagementInsurance = {};
      const leadershipDashboard = {};
      const leadManagementGlobalAssure = {};
      const branchGrouping = {};
      const eCollectInvoice = {};
      const bankDetailsView = {};
      const assignedCollectionLead = {};
      const MFA = {};
      const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/permissions/list?page_size=1000`);
      if (data?.results.length) {
        data.results.forEach((item) => {
          const apiPermissionArray = item.name.split('_');
          const checked = permissionArr.some((ele) => ele === item.name);
          if (MODULE_PERMISSION.customer.includes(item.name.toLowerCase())) {
            customer[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.user.includes(item.name.toLowerCase())) {
            user[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.los.includes(item.name.toLowerCase())) {
            loan[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.deputation.includes(item.name.toLowerCase())) {
            deputation[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.scheme.includes(item.name.toLowerCase())) {
            scheme[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.charge.includes(item.name.toLowerCase())) {
            charge[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.circular.includes(item.name.toLowerCase())) {
            circular[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.rate.includes(item.name.toLowerCase())) {
            rate[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.permission.includes(item.name.toLowerCase())) {
            permission[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.auditAssignment.includes(item.name.toLowerCase())) {
            auditAssignment[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.auditCase.includes(item.name.toLowerCase())) {
            auditCase[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.processAudit.includes(item.name.toLowerCase())) {
            processAudit[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.vendorUser.includes(item.name.toLowerCase())) {
            vendorUser[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.role.includes(item.name.toLowerCase())) {
            role[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.receipt.includes(item.name.toLowerCase())) {
            receipt[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.collateral.includes(item.name.toLowerCase())) {
            collateralRelease[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.cashAndPacket.includes(item.name.toLowerCase())) {
            cashAndPacket[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.partRelease.includes(item.name.toLowerCase())) {
            partRelease[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.customerCPV.includes(item.name.toLowerCase())) {
            customerCPV[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.topUP.includes(item.name.toLowerCase())) {
            topUp[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.repayment.includes(item.name.toLowerCase())) {
            repayment[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.cashAudit.includes(item.name.toLowerCase())) {
            cashAudit[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.packetAudit.includes(item.name.toLowerCase())) {
            packetAudit[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.onlinePayment.includes(item.name.toLowerCase())) {
            onlinePayment[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.bankingPartnership.includes(item.name.toLowerCase())) {
            bankingPartnership[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.rekycUploader.includes(item.name.toLowerCase())) {
            rekycUploader[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.metaBase.includes(item.name.toLowerCase())) {
            metabase[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.leadManagement.includes(item.name.toLowerCase())) {
            leadManagement[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.leadManagementInsurance.includes(item.name.toLowerCase())) {
            leadManagementInsurance[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.leadershipDashboard.includes(item.name.toLowerCase())) {
            leadershipDashboard[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.leadManagementGlobalAssure.includes(item.name.toLowerCase())) {
            leadManagementGlobalAssure[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.branchGrouping.includes(item.name.toLowerCase())) {
            branchGrouping[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.eCollectInvoice.includes(item.name.toLowerCase())) {
            eCollectInvoice[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.bankDetailsView.includes(item.name.toLowerCase())) {
            bankDetailsView[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.assignedCollectionLead.includes(item.name.toLowerCase())) {
            assignedCollectionLead[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          } else if (MODULE_PERMISSION.mfa.includes(item.name.toLowerCase())) {
            MFA[apiPermissionArray[apiPermissionArray.length - 1]] = { id: item.id, isHavepermission: checked };
          }
        });
        const allPermission = [];
        if (Object.keys(charge).length) {
          allPermission.push({ id: 1, moduleName: 'CHARGE MASTER', ...charge });
        }
        if (Object.keys(rate).length) {
          allPermission.push({ id: 2, moduleName: 'RATE MASTER', ...rate });
        }
        if (Object.keys(scheme).length) {
          allPermission.push({ id: 3, moduleName: 'SCHEME MASTER', ...scheme });
        }
        if (Object.keys(user).length) {
          allPermission.push({ id: 4, moduleName: 'USER MANAGEMENT', ...user });
        }
        if (Object.keys(permission).length) {
          allPermission.push({ id: 5, moduleName: 'PERMISSION MANAGEMENT', ...permission });
        }
        if (Object.keys(deputation).length) {
          allPermission.push({ id: 6, moduleName: 'DEPUTATION', ...deputation });
        }
        if (Object.keys(circular).length) {
          allPermission.push({ id: 7, moduleName: 'CIRCULAR', ...circular });
        }
        if (Object.keys(customer).length) {
          allPermission.push({ id: 8, moduleName: 'CUSTOMER CREATION', ...customer });
        }
        if (Object.keys(loan).length) {
          allPermission.push({ id: 9, moduleName: 'LOAN CREATION', ...loan });
        }
        if (Object.keys(role).length) {
          allPermission.push({ id: 10, moduleName: 'ROLE', ...role });
        }
        if (Object.keys(auditAssignment).length) {
          allPermission.push({ id: 11, moduleName: 'AUDIT ASSIGNMENT', ...auditAssignment });
        }
        if (Object.keys(auditCase).length) {
          allPermission.push({ id: 12, moduleName: 'AUDIT CASE', ...auditCase });
        }
        if (Object.keys(processAudit).length) {
          allPermission.push({ id: 13, moduleName: 'PROCESS AUDIT', ...processAudit });
        }
        if (Object.keys(vendorUser).length) {
          allPermission.push({ id: 14, moduleName: 'VENDOR USER', ...vendorUser });
        }
        if (Object.keys(receipt).length) {
          allPermission.push({ id: 15, moduleName: 'RECEIPT', ...receipt });
        }
        if (Object.keys(collateralRelease).length) {
          allPermission.push({ id: 16, moduleName: 'COLLATERAL RELEASE', ...collateralRelease });
        }
        if (Object.keys(partRelease).length) {
          allPermission.push({ id: 17, moduleName: 'PART RELEASE', ...partRelease });
        }
        if (Object.keys(cashAndPacket).length) {
          allPermission.push({ id: 18, moduleName: 'CASH & PACKET MANAGEMENT', ...cashAndPacket });
        }
        if (Object.keys(customerCPV).length) {
          allPermission.push({ id: 19, moduleName: 'CUSTOMER CPV', ...customerCPV });
        }
        if (Object.keys(topUp).length) {
          allPermission.push({ id: 20, moduleName: 'Top Up', ...topUp });
        }
        if (Object.keys(repayment).length) {
          allPermission.push({ id: 21, moduleName: 'REPAYMENT', ...repayment });
        }
        if (Object.keys(cashAudit).length) {
          allPermission.push({ id: 22, moduleName: 'CASH AUDIT', ...cashAudit });
        }
        if (Object.keys(cashAudit).length) {
          allPermission.push({ id: 23, moduleName: 'PACKET AUDIT', ...packetAudit });
        }
        if (Object.keys(onlinePayment).length) {
          allPermission.push({ id: 24, moduleName: 'ONLINE PAYMENT', ...onlinePayment });
        }
        if (Object.keys(bankingPartnership).length) {
          allPermission.push({ id: 25, moduleName: 'BANKING PARTNERSHIP', ...bankingPartnership });
        }
        if (Object.keys(metabase).length) {
          allPermission.push({ id: 26, moduleName: 'METABASE', ...metabase });
        }

        if (Object.keys(leadManagement).length) {
          allPermission.push({ id: 27, moduleName: 'Cross Sell', ...leadManagement });
        }
        if (Object.keys(leadManagementInsurance).length) {
          allPermission.push({ id: 28, moduleName: 'Cross Sell INSURANCE', ...leadManagementInsurance });
        }
        if (Object.keys(rekycUploader).length) {
          allPermission.push({ id: 29, moduleName: 'Re-KYC Uploader', ...rekycUploader });
        }
        if (Object.keys(leadManagementGlobalAssure).length) {
          allPermission.push({ id: 30, moduleName: 'Cross Sell GLOBAL ASSURE', ...leadManagementGlobalAssure });
        }
        if (Object.keys(leadershipDashboard).length) {
          allPermission.push({ id: 31, moduleName: 'Leadership Dashboard', ...leadershipDashboard });
        }
        if (Object.keys(branchGrouping).length) {
          allPermission.push({ id: 32, moduleName: 'Branch Grouping', ...branchGrouping });
        }
        if (Object.keys(assignedCollectionLead).length) {
          allPermission.push({ id: 33, moduleName: 'Assigned Collection Leads', ...assignedCollectionLead });
        }
        if (Object.keys(eCollectInvoice).length) {
          allPermission.push({ id: 34, moduleName: 'E Collect Invoice', ...eCollectInvoice });
        }
        if (Object.keys(bankDetailsView).length) {
          allPermission.push({ id: 35, moduleName: 'Bank Details View', ...bankDetailsView });
        }
        if (Object.keys(MFA).length) {
          allPermission.push({ id: 36, moduleName: 'MFA', ...MFA });
        }

        setAllPermissions(allPermission);
        allPermission.forEach((row) => {
          if (row?.view) {
            register(row.view.id.toString(), { value: row.view.isHavepermission });
          }
          if (row?.create) {
            register(row.create.id.toString(), { value: row.create.isHavepermission });
          }
          if (row?.update) {
            register(row.update.id.toString(), { value: row.update.isHavepermission });
          }
          if (row?.maker) {
            register(row.maker.id.toString(), { value: row.maker.isHavepermission });
          }
          if (row?.checker) {
            register(row.checker.id.toString(), { value: row.checker.isHavepermission });
          }
        });
      }
    } catch (err) {
      console.log('err', err);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    getPermissionRoleMapping();
  }, []);

  const saveHandler = async (values) => {
    setUpdatedPermissions(values);
    setOpen(true);
  };

  const handleClose = async () => {
    try {
      setOpen(false);
      setIsLoading({ loader: true, name: 'onSave' });
      let permissions = '';
      Object.keys(updatedPermissions).forEach((item) => {
        if (updatedPermissions[item]) {
          permissions += (permissions.length ? `,${item}` : item);
        }
      });
      if (!permissions.length) {
        setAlertShow({ open: true, msg: 'Please select atleast one permission.', alertType: 'error' });
        return;
      }
      const { data } = await Service.put(`${process.env.REACT_APP_USER_SERVICE}/roles/edit/${state.id}`, {
        permissions,
        updated_by: email
      });
      if (data?.status) {
        setAlertShow({ open: true, msg: 'Permissions updated successfully.', alertType: 'success' });
        setTimeout(() => {
          navigate(NAVIGATION.functionalDesignation);
        }, 300);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong.Please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px 20px 0px !important' overflow='auto'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <Dialog
          fullScreen={false}
          open={open}
          disableEscapeKeyDown
          aria-labelledby='responsive-dialog-title'
        >
          <DialogTitle id='responsive-dialog-title'>
            Are you sure you want to submit selected permissions?
          </DialogTitle>
          <DialogActions>
            <ButtonPrimary onClick={() => handleClose()}>Yes</ButtonPrimary>
            <ButtonPrimary onClick={() => setOpen(false)}>No</ButtonPrimary>
          </DialogActions>
        </Dialog>
        <HeaderContainer item xs={12} padding='20px 0px 20px !important'>
          <HeadingMaster>Permissions</HeadingMaster>
        </HeaderContainer>
        {
            isLoading.loader && isLoading.name === 'onLoad' ? (
              <Box sx={{
                display: 'flex', height: '100px', justifyContent: 'center', alignItems: 'center'
              }}
              >
                <CircularProgress style={{ color: '#502A74' }} />
              </Box>
            ) : (
              <>
                <HeadingMaster2>
                  Designation:
                  {' '}
                  {state.name}
                </HeadingMaster2>
                <form onSubmit={handleSubmit(saveHandler)}>
                  <Grid item xs={12}>
                    <div style={{ width: '100%', overflow: 'auto' }}>
                      <PermissionsTable
                        rows={allPermissions}
                        columns={tableColumn}
                      />
                    </div>
                  </Grid>
                  {allPermissions.length ? (
                    <CustomDiv>
                      <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onSave'} type='submit'>
                        Save
                      </LoadingButtonPrimary>
                    </CustomDiv>
                  ) : null}
                </form>
              </>
            )
        }
      </CustomContainerStyled>
    </>
  );
};

export default Permissions;
