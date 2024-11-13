/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import { Grid, CircularProgress, FormHelperText } from '@mui/material';
import moment from 'moment';
import styled from '@emotion/styled';
import { cloneDeep } from 'lodash';
import store from '../../../redux/store';
import BoxFormat from './BoxFormat';
import TableFormat from './TableFormat';
import { Service } from '../../../service';
import { CenterContainerStyled, TextFieldStyled } from '../../styledComponents';
import CustomToaster from '../../mesaageToaster';
import { constData } from '../../../views/loanDisbursal/loanCreation/loanCreationReadOnlyFields';
import './CAM.css';
import { CASH_HANDLING } from '../../../views/loanDisbursal/loanCreation/helper';

const Atag = styled.a`
  text-decoration: underline;
  color: #502A74!important;
`;

const CAM = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [applicantData, setApplicantData] = useState([]);
  const [viewedDocMap, setViewedDocMap] = useState(null);
  const [makerCheckerInfo, setMakerCheckerInfo] = useState([]);
  const [schemeRebateSlabs, setSchemeRebateSlabs] = useState([]);
  const [tareWeightDetails, settareWeightDetails] = useState([]);
  const [consolidateDetails, setConsolidateDetails] = useState([]);
  const [manualDeviationData, setManualDeviationData] = useState([]);
  const [collateralComponents, setCollateralComponents] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });

  const state = store.getState();
  const { formData } = state.loanMaker;
  const { customerFullDetails } = formData;
  const udyamData = customerFullDetails?.udyam_data;
  const {
    isAfterDisburse, setIsCertificateViewed, register, errors, setValue
  } = props;
  let aadhaarRegex;
  if (['BOB', 'KVB'].includes(formData.colender) && formData.status === 'MKR') {
    const aadhaarLastDigits = formData.customerFullDetails.aadhaar_no.slice(8).split('');
    const fiD = Number(aadhaarLastDigits[0]);
    const seD = Number(aadhaarLastDigits[1]);
    const thD = Number(aadhaarLastDigits[2]);
    const foD = Number(aadhaarLastDigits[3]);
    aadhaarRegex = new RegExp(`^[2-9]{1}[0-9]{3}[0-9]{4}[${fiD}]{1}[${seD}]{1}[${thD}]{1}[${foD}]{1}`, 'i');
  }

  const normalizeCustomerProofs = (customerProofsData) => {
    if (customerProofsData?.id_proof_url && !Array.isArray(customerProofsData.id_proof_url)) {
      customerProofsData.id_proof_url = [customerProofsData.id_proof_url];
    }

    if (customerProofsData?.address_proof_url && !Array.isArray(customerProofsData.address_proof_url)) {
      customerProofsData.address_proof_url = [customerProofsData.address_proof_url];
    }

    if (customerProofsData?.pan_proof_url && !Array.isArray(customerProofsData.pan_proof_url)) {
      customerProofsData.pan_proof_url = [customerProofsData.pan_proof_url];
    }

    return customerProofsData;
  };

  const fetchInitialData = async () => {
    try {
      const collateralCom = [];
      let documentRequests = [];
      const camItems = {};
      formData?.items?.forEach((element) => {
        camItems[element._id] = cloneDeep(element);
        const request = Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${element.item_pic}`);
        documentRequests.push(request);
      });

      formData?.part_release_history?.forEach((partReleaseItem) => {
        partReleaseItem?.released_items?.forEach((element) => {
          if (element?._id in camItems) {
            const tempElement = cloneDeep(element);
            camItems[element._id].item_count += tempElement.item_count;
            camItems[element._id].net_weight_gm += tempElement.net_weight_gm;
            camItems[element._id].total_weight_gm += tempElement.total_weight_gm;
            camItems[element._id].stone_weight_gm += tempElement.stone_weight_gm;
          } else {
            camItems[element._id] = element;
          }
        });
      });
      const collateralItemsTemp = [];

      Object.keys(camItems).forEach((collateralId) => {
        collateralItemsTemp.push(camItems[collateralId]);
      });

      await Promise.all(documentRequests).then((responses) => {
        collateralItemsTemp?.forEach((element, index) => {
          const collateralItems = [];
          collateralItems.push({
            label: 'Gold Item',
            value: element.full_name ? element.full_name : 'N/A',
            style: { xs: 12 }
          });
          collateralItems.push({
            label: 'Item Name',
            value: element.full_name ? element.full_name : 'N/A',
            style: { xs: 3 }
          });
          collateralItems.push({
            label: 'Item Count',
            value: element?.item_count,
            style: { xs: 3 }
          });
          collateralItems.push({
            label: 'Total Weight of Item(in gms)',
            value: element?.total_weight_gm?.toFixed(2),
            style: { xs: 3 }
          });
          collateralItems.push({
            label: 'Beads/Stone Weights(in gms)',
            value: element?.stone_weight_gm?.toFixed(2),
            style: { xs: 3 }
          });
          collateralItems.push({
            label: 'Purity(in Carat)',
            value: element?.purity,
            style: { xs: 3 }
          });
          collateralItems.push({
            label: 'Net Weight after Purity(in gms)',
            value: element?.net_weight_gm?.toFixed(2),
            style: { xs: 3 }
          });
          collateralItems.push({
            label: null,
            value: <Atag href={responses[index].data.data.full_path} target='_blank' rel='noreferrer'>ORNAMENT LIVE PHOTO</Atag>,
            style: { xs: 6 }
          });
          if (index === 0) {
            collateralCom.push(<BoxFormat header='COLLATERAL DETAILS & GOLD INFORMATION' data={collateralItems} />);
          } else {
            collateralCom.push(<BoxFormat header={null} data={collateralItems} />);
          }
        });
        setCollateralComponents(collateralCom);
      });
      const { data: customerImage } = await Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${formData.customer_photo}`);
      const customerProofsData = {
        id_proof_url: customerFullDetails?.id_proof_url,
        address_proof_url: customerFullDetails?.address_proof_url,
        pan_proof_url: customerFullDetails?.pan_url
      };
      const customerProofs = normalizeCustomerProofs(customerProofsData);

      const customerProof = { value: true };
      const isMultipleIdProof = customerProofs?.id_proof_url?.length > 1;
      const isMultipleAddressProof = customerProofs?.address_proof_url?.length > 1;
      const requests = [];
      if (customerProofs?.id_proof_url) {
        customerProofs.id_proof_url.forEach((idProof) => requests.push(Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${idProof}`)));
      }
      if (customerProofs?.address_proof_url) {
        customerProofs.address_proof_url.forEach((idProof) => requests.push(Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${idProof}`)));
      }
      if (customerProofs?.pan_proof_url) {
        customerProofs.pan_proof_url.forEach((idProof) => requests.push(Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${idProof}`)));
      }
      await Promise.all(requests).then((responses) => {
        if (customerProofs?.id_proof_url) {
          if (isMultipleIdProof) {
            customerProof.id_proof_url_front = responses[0].data.data.full_path;
            customerProof.id_proof_url_back = responses[1].data.data.full_path;
          } else {
            customerProof.id_proof_url = responses[0].data.data.full_path;
          }
        }

        if (customerProofs?.address_proof_url) {
          if (isMultipleIdProof && isMultipleAddressProof) {
            customerProof.address_proof_url_front = responses[2].data.data.full_path;
            customerProof.address_proof_url_back = responses[3].data.data.full_path;
          } else if (!isMultipleIdProof && isMultipleAddressProof) {
            customerProof.address_proof_url_front = responses[1].data.data.full_path;
            customerProof.address_proof_url_back = responses[2].data.data.full_path;
          } else if (isMultipleIdProof && !isMultipleAddressProof) {
            customerProof.address_proof_url = responses[2].data.data.full_path;
          } else if (!isMultipleIdProof && !isMultipleAddressProof) {
            customerProof.address_proof_url = responses[1].data.data.full_path;
          }
        }

        if (customerProofs?.pan_proof_url) {
          customerProof.pan_proof_url = responses[responses.length - 1].data.data.full_path;
        }
      }).catch((err) => {
        console.log('Error', err);
        customerProof.value = false;
        setAlertShow({ open: true, msg: 'Something went wrong while fetching documents.', alertType: 'error' });
      });

      const firstName = formData?.first_name || '';
      const middleName = formData?.middle_name || '';
      const lastName = formData?.last_name || '';
      const FullName = `${firstName} ${middleName} ${lastName}`;

      const idProofName = customerFullDetails?.id_proof_name || '';
      const idProofNumber = customerFullDetails?.id_proof_number || '';
      const idProofValue = `${idProofName} ${idProofNumber}`;

      const addressProofName = customerFullDetails?.address_proof_name || '';
      const addressProofNumber = customerFullDetails?.address_proof_number || '';
      const addressProofValue = `${addressProofName} ${addressProofNumber}`;

      const aadhaarAddress1 = customerFullDetails?.address_1 || '';
      const aadhaarAddress2 = customerFullDetails?.address_2 || '';
      const aadhaarPincode = customerFullDetails?.pincode || '';
      const aadhaarState = customerFullDetails?.state || '';
      const aadhaarCity = customerFullDetails?.city || '';
      const aadhaarFullAddress = `${aadhaarAddress1} ${aadhaarAddress2} ${aadhaarCity} ${aadhaarState} ${aadhaarPincode}`;

      const occupationAddress1 = customerFullDetails?.occupation_address_1 || '';
      const occupationAddress2 = customerFullDetails?.occupation_address_2 || '';
      const occupationPincode = customerFullDetails?.occupation_pincode || '';
      const occpationCity = customerFullDetails?.occupation_city || '';
      const occupationState = customerFullDetails?.occupation_state || '';
      const occupationFullAddress = `${occupationAddress1} ${occupationAddress2} ${occpationCity} ${occupationState} ${occupationPincode}`;
      const proofsArray = (
        <>
          <Atag href={customerImage?.data?.full_path} target='_blank' rel='noreferrer'>CUSTOMER PHOTO</Atag>
          {' | '}
          { customerProof.value ? isMultipleIdProof ? (
            <>
              <Atag href={customerProof?.id_proof_url_front} target='_blank' rel='noreferrer'>ID PROOF FRONT</Atag>
              {' | '}
              <Atag href={customerProof?.id_proof_url_back} target='_blank' rel='noreferrer'>ID PROOF BACK</Atag>
              {' | '}
            </>
          ) : (
            <>
              <Atag href={customerProof?.id_proof_url} target='_blank' rel='noreferrer'>ID PROOF</Atag>
              {' | '}
            </>
          ) : null }
          { customerProof.value ? isMultipleAddressProof ? (
            <>
              <Atag href={customerProof?.address_proof_url_front} target='_blank' rel='noreferrer'>ADDRESS PROOF FRONT</Atag>
              {' | '}
              <Atag href={customerProof?.address_proof_url_back} target='_blank' rel='noreferrer'>ADDRESS PROOF BACK</Atag>
              {' | '}
            </>
          ) : (
            <>
              <Atag href={customerProof?.address_proof_url} target='_blank' rel='noreferrer'>ADDRESS PROOF</Atag>
              {' | '}
            </>
          ) : null }
          { customerProof.value && customerProof?.pan_proof_url && <Atag href={customerProof?.pan_proof_url} target='_blank' rel='noreferrer'>PAN PROOF</Atag> }
        </>
      );

      setApplicantData([
        {
          label: 'Name',
          value: FullName && FullName.trim().length ? FullName : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Aadhaar No',
          value: customerFullDetails?.aadhaar_no ? customerFullDetails?.aadhaar_no : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Aadhaar OSV',
          value: customerFullDetails?.aadhaar_osv_done ? customerFullDetails?.aadhaar_osv_done : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'PAN',
          value: customerFullDetails?.pan_no ? customerFullDetails.pan_no : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'ID Proof',
          value: idProofValue ?? 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'ID Proof OSV',
          value: customerFullDetails?.id_proof_osv_done ? customerFullDetails?.id_proof_osv_done : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Address Proof',
          value: addressProofValue ?? 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Address Proof OSV',
          value: customerFullDetails?.address_proof_osv_done ? customerFullDetails?.address_proof_osv_done : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Date of Birth',
          value: formData?.customer_dob ? formData?.customer_dob : 'N/A',
          style: { xs: 12, md: 3 }
        },
        {
          label: 'Education',
          value: customerFullDetails?.education ? customerFullDetails?.education : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Number of years in current residence',
          value: customerFullDetails?.no_years_current_residence ? customerFullDetails?.no_years_current_residence : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Primary Contact No',
          value: customerFullDetails?.primary_mobile_number ? customerFullDetails?.primary_mobile_number : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Secondary Contact',
          value: customerFullDetails?.secondary_mobile_number ? customerFullDetails?.secondary_mobile_number : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Email',
          value: customerFullDetails?.email_id ? customerFullDetails?.email_id : 'N/A',
          style: { xs: 12, md: 3 }
        },
        {
          label: 'Marital Status',
          value: customerFullDetails?.marital_status ? customerFullDetails?.marital_status : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Gender',
          value: customerFullDetails?.gender ? customerFullDetails?.gender : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Customer Occupation',
          value: customerFullDetails?.customer_occupation ? customerFullDetails?.customer_occupation : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Annual Income',
          value: customerFullDetails?.annual_income ? customerFullDetails?.annual_income : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Customer Risk Categorisation',
          value: customerFullDetails?.risk_rating ?? 'N/A',
          style: { xs: 12, md: 6 }
        },
        {
          label: 'Aadhaar Address',
          value: aadhaarFullAddress ?? 'N/A',
          style: { xs: 12 }
        },
        {
          label: 'Occupational Address',
          value: customerFullDetails?.occupation_address === 'No' ? 'N/A' : (occupationFullAddress ?? 'N/A'),
          style: { xs: 12 }
        },
        {
          label: null,
          value: proofsArray,
          style: { xs: 12 }
        }
      ]);

      const { data: consolidatedItemsPic } = await Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${formData.items_pic}`);

      const formatCheckerDetails = () => {
        const makerCheckerDerails = [
          {
            label: 'Maker',
            value: formData?.maker_name ? `${formData?.maker_name} || ${formData?.maker_emp_code}` : 'N/A',
            style: { xs: 6 }
          },
          {
            label: 'Checker',
            value: formData?.checker_name ? `${formData?.checker_name} || ${formData?.checker_emp_code}` : 'N/A',
            style: { xs: 6 }
          }
        ];
        let checkerMap = {};
        formData?.deviations?.forEach((item) => {
          makerCheckerDerails.push({
            label: '',
            value: null,
            style: { xs: 6 }
          });
          if (formData?.checker_name) {
            checkerMap = {
              label: 'Checker',
              value: item.checker_name ? `${item?.checker_name} || ${item?.checker_emp_code}` : 'N/A',
              style: { xs: 6 }
            };
            makerCheckerDerails.push(checkerMap);
          } else {
            checkerMap = {
              label: 'Checker',
              value: item.primary_checker_name ? `${item?.primary_checker_name} || ${item?.primary_checker_emp_code}` : 'N/A',
              style: { xs: 6 }
            };
            makerCheckerDerails.push(checkerMap);
          }
        });
        return makerCheckerDerails;
      };
      const consolidatedDetails = formData?.part_release_history ? formData?.part_release_history[0] : formData;
      setConsolidateDetails([
        {
          label: 'Total Weight of All items(in gms)',
          value: consolidatedDetails?.total_weight_gm ?? 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Total Net Count of All items',
          value: consolidatedDetails?.total_count ?? 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Total Net Weight of All items(in gms)',
          value: consolidatedDetails?.total_net_weight_gm ?? 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Total Net Beads/Stone Weight of All items(in gms)',
          value: consolidatedDetails?.total_stone_weight_gm ?? 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Market Value',
          isAmount: true,
          value: Math.floor(((consolidatedDetails.total_net_weight_gm * formData.loan_rpg) * 4) / 3),
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Employee Code',
          value: formData?.maker_emp_code ? formData?.maker_emp_code : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Gold Appraiser/Maker Name',
          value: formData?.maker_name ? formData?.maker_name : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Source of Gold',
          value: formData.source_of_gold ? constData[formData.source_of_gold] : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: ' End Use of Loan',
          value: formData.end_use_loan ? constData[formData.end_use_loan] : 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: null,
          value: <Atag href={consolidatedItemsPic.data.full_path} target='_blank' rel='noreferrer'>CONSOLIDATED LIVE PHOTO OF ORNAMENTS</Atag>,
          style: { xs: 12, md: 9 }
        }
      ]);

      setMakerCheckerInfo(formatCheckerDetails);

      const sumOfValues = formData?.interaccounts?.reduce((accumulator, currentValue) => {
        if (!currentValue.loan_amount_transfer) {
          return accumulator;
        }
        if (typeof currentValue.loan_amount_transfer === 'string') {
          return accumulator + Number(currentValue.loan_amount_transfer?.replace(/,/g, ''));
        }
        return accumulator + currentValue.loan_amount_transfer;
      }, 0);
      const tareWeightDetail = [
        {
          label: 'Net Disbursal to Inter Account Fund Transfer',
          isAmount: true,
          value: sumOfValues,
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Net Disbursal to Customer',
          isAmount: true,
          value: formData?.net_disbursment ?? '0',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'TARE Weight of Gold Packet(in gms)',
          value: consolidatedDetails?.tare_weight_gold_pouch ?? 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Gold Pouch Number',
          value: consolidatedDetails?.gold_pouch_number ?? 'N/A',
          style: { xs: 6, md: 3 }
        },
        {
          label: 'Cash Amount',
          value: formData?.cash_disbursment ?? '0',
          isAmount: true,
          style: { xs: 6, md: 3 }
        },
        {
          label: 'IMPS/NEFT/RTGS/UPI',
          value: formData?.online_disbursment ?? '0',
          isAmount: true,
          style: { xs: 6, md: 3 }
        },
        {
          label: 'End Use of Loan',
          value: formData.end_use_loan ? constData[formData.end_use_loan] : 'N/A',
          style: { xs: 12, md: 6 }
        }
      ];
      if (['BNS', 'AGR'].includes(formData.end_use_loan)) {
        tareWeightDetail.push({
          label: formData.end_use_loan === 'BNS' ? 'Udyam Registration Number' : 'Agriculture Record Number',
          value: formData.end_use_loan === 'BNS' ? udyamData?.reg_no ?? formData?.end_use_loan_details?.udyam_meta_data?.reg_no ?? 'N/A'
            : formData?.end_use_loan_details?.id,
          style: { xs: 12, md: 6 }
        });
        documentRequests = [];
        const docMap = {};
        let udyamCertificateLink;
        if (formData.colender === 'IOB - BUSINESS') {
          udyamCertificateLink = udyamData?.proof ?? formData?.end_use_loan_details?.udyam_meta_data?.proof ?? [];
        } else {
          udyamCertificateLink = formData?.end_use_loan_details?.proof;
        }
        udyamCertificateLink.forEach((element, ind) => {
          docMap[ind] = false;
          const request = Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${element}`);
          documentRequests.push(request);
        });
        let dochyperLinks = null;
        await Promise.all(documentRequests).then((responses) => {
          responses.forEach((ele, ind) => {
            dochyperLinks = (
              <>
                {dochyperLinks}
                <Atag
                  href={ele.data.data.full_path}
                  target='_blank'
                  rel='noreferrer'
                  onClick={() => {
                    docMap[ind] = true;
                    setViewedDocMap({ ...docMap });
                  }}
                >
                  CERTIFICATE LINK
                  {responses.length > 1 ? ind + 1 : null}
                  {' '}
                </Atag>
                &nbsp;&nbsp;
              </>
            );
          });
          tareWeightDetail.push({
            label: formData.end_use_loan === 'BNS' ? 'Udyam Certificate Link' : 'Agriculture Certificate Link',
            value: dochyperLinks,
            style: { xs: 12, md: 6 }
          });
        });
      }
      settareWeightDetails(tareWeightDetail);
      const deviationDocumentRequests = [];
      formData?.manual_deviations?.forEach((element) => {
        const request = Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${element.file_url}`);
        deviationDocumentRequests.push(request);
      });
      await Promise.all(deviationDocumentRequests).then((responses) => {
        const manualDeviationArray = [];
        formData?.manual_deviations?.forEach((deviation, index) => {
          manualDeviationArray.push({
            label: null,
            value: <Atag href={responses[index].data.data.full_path} target='_blank' rel='noreferrer'>MANUAL DEVIATION UPLOAD</Atag>,
            style: { xs: 6 }
          });
          manualDeviationArray.push({
            label: 'Deviation Name',
            value: deviation?.name ?? 'N/A',
            style: { xs: 6 }
          });
        });
        if (!manualDeviationArray.length) {
          setManualDeviationData([
            {
              label: 'Manual Deviation Upload',
              value: 'N/A',
              style: { xs: 6 }
            },
            {
              label: 'Deviation Name',
              value: 'N/A',
              style: { xs: 6 }
            }
          ]);
        } else {
          setManualDeviationData(manualDeviationArray);
        }
      });
      const schemeSlabs = formData?.scheme_rebate_slabs.map((item) => [
        item?.from, item?.to ?? '-', item?.interest
      ]);
      setSchemeRebateSlabs(schemeSlabs);
      setIsLoading(false);
    } catch (err) {
      console.log('Error', err);
      setAlertShow('Something went wrong while fetching CAM details.');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (setIsCertificateViewed && viewedDocMap && Object.keys(viewedDocMap).every((ele) => viewedDocMap[ele])) {
      setIsCertificateViewed(true);
    }
  }, [viewedDocMap]);

  const appraisalData = [
    {
      label: 'Branch Code',
      value: formData?.maker_branch ?? 'N/A',
      style: { xs: 6, md: 3 }
    },
    {
      label: 'Loan Application No',
      value: formData?.application_no ?? 'N/A',
      style: { xs: 6, md: 3 }
    },
    {
      label: 'Customer ID',
      value: formData?.customer_id ?? 'N/A',
      style: { xs: 6, md: 3 }
    },
    {
      label: 'Applied Date',
      value: isAfterDisburse ? moment(formData.disbursed_on).format('DD-MM-YYYY') : moment(new Date()).format('DD-MM-YYYY'),
      style: { xs: 6, md: 3 }
    },
    {
      label: 'Product/Program',
      value: 'Gold Loan Creation',
      style: { xs: 6, md: 3 }
    },
    {
      label: 'PSL Status',
      value: customerFullDetails?.psl_status ? customerFullDetails?.psl_status : 'N/A',
      style: { xs: 6, md: 3 }
    },
    {
      label: 'PSL Sub Category',
      value: customerFullDetails?.psl_category ? customerFullDetails?.psl_category : 'N/A',
      style: { xs: 12, md: 3 }
    },
    {
      label: 'Loan Account No',
      value: formData?.loan_account_no ?? 'N/A',
      style: { xs: 12, md: 3 }
    }
  ];

  const bankDetailsHeaders = ['Account Number', 'Bank Name', 'Branch Name', 'IFSC CODE'];
  const bankStyle = {
    0: { xs: 3 }, 1: { xs: 3 }, 2: { xs: 3 }, 3: { xs: 3 }
  };
  const bankDetail = formData?.customer_bank_details;

  const bankDetailsValues = [[
    bankDetail?.account_number && bankDetail?.account_number.trim().length ? bankDetail.account_number : 'N/A',
    bankDetail?.bank_name && bankDetail?.bank_name.trim().length ? bankDetail.bank_name : 'N/A',
    bankDetail?.branch_name && bankDetail?.branch_name.trim().length ? bankDetail?.branch_name : 'N/A',
    bankDetail?.ifsc && bankDetail?.ifsc.trim().length ? bankDetail.ifsc : 'N/A'
  ]];

  const disbursalDetails = [
    {
      label: 'Gold Loan Scheme',
      value: formData?.scheme_name ? formData?.scheme_name : 'N/A',
      style: { xs: 6 }
    },
    {
      label: 'Rate of Interest(in %)',
      value: formData?.rate_of_interest ? formData?.rate_of_interest : 'N/A',
      style: { xs: 6 }
    },
    {
      label: 'Loan Tenure(in Months)',
      value: formData?.tenure ? formData?.tenure : 'N/A',
      style: { xs: 12 }
    }
  ];

  const eligibleLoanAmountDetails = [
    {
      isAmount: true,
      label: 'Eligible Gold Loan Amount',
      value: formData?.max_eligible_loan_amount ?? '0',
      style: { xs: 12 }
    }];

  const requestedLoanAmountDetails = [
    {
      isAmount: true,
      label: 'Disbursal Gold Loan Amount',
      value: formData?.requested_loan_amount ?? '0',
      style: { xs: 12 }
    }];

  let interAccountDetails = [];
  formData?.interaccounts?.forEach((account) => {
    interAccountDetails.push({
      label: 'Gold Loan Account Number',
      style: { xs: 8 },
      value: account?.loan_account_no ? account?.loan_account_no : 'N/A',
    });
    interAccountDetails.push({
      isAmount: true,
      label: 'Amount',
      style: { xs: 4 },
      value: account?.loan_amount_transfer ?? '0',
    });
  });

  if (!interAccountDetails.length) {
    interAccountDetails = [
      {
        label: 'Gold Loan Account Number',
        style: { xs: 8 },
        value: 'N/A',
      },
      {
        label: 'Amount',
        isAmount: true,
        value: '0',
        style: { xs: 4 },
      }
    ];
  }

  let deviationHeaders = ['DEVIATION PARAMETER', 'APPROVING USERS', 'JUSTIFICATION'];
  let deviationStyle = {
    0: { xs: 4 },
    1: { xs: 4 },
    2: { xs: 4 }
  };
  let deviationValues = [];
  formData?.deviations?.forEach((dev) => {
    const entry = [];
    entry.push(dev?.deviation_type);
    if (dev.status === 'OPN') {
      const words = dev?.primary_checker_role?.split(' ');
      const firstCharacters = words.map((word) => word.charAt(0));
      entry.push(`${dev?.primary_checker_name} (${firstCharacters.join('')})`);
    } else {
      const words = dev?.checker_role?.split(' ');
      const firstCharacters = words.map((word) => word.charAt(0));
      entry.push(`${dev?.checker_name} (${firstCharacters.join('')})`);
    }
    entry.push(dev?.maker_remarks);
    if (dev.status !== 'OPN') {
      entry.push(dev?.checker_remarks);
      dev?.status === 'APV' ? entry.push('Approved') : entry.push('Rejected');
    }
    deviationValues.push(entry);
  });
  if (deviationValues.length && deviationValues.some((deviation) => deviation.length > 3)) {
    deviationValues = deviationValues.map((deviation) => {
      if (deviation.length === 3) {
        deviation = [...deviation, 'NA', 'NA'];
      }
      return deviation;
    });
    deviationHeaders = [...deviationHeaders, 'DEVIATION REMARK', 'DECISION'];
    deviationStyle = {
      0: { xs: 3 },
      1: { xs: 2 },
      2: { xs: 2 },
      3: { xs: 3 },
      4: { xs: 2 }
    };
  }
  const getChangeName = (name) => {
    if (name === 'STAMPDUTYRJ') {
      return 'Stamp Duty Rajasthan';
    }
    if (name === CASH_HANDLING) {
      return 'Cash Handling Charge';
    }
    return name;
  };
  const getTaxType = (charge) => {
    if (charge.name === CASH_HANDLING) {
      return 'GST';
    }
    return 'CESS';
  };
  const getTaxValue = (charge) => {
    if (charge.name === CASH_HANDLING) {
      return charge.amount.gst;
    }
    return (charge.amount.sgst + charge.amount.cgst).toFixed(2);
  };
  let consolidatedFeeandCharges = 0;
  const feeChargeComponents = [];
  formData?.fees?.forEach((ch, index) => {
    const entry = [];
    entry.push({
      label: 'Fee Name',
      value: ch?.name ?? 'N/A',
      style: { xs: 3 }
    });
    entry.push({
      label: 'Fee Amount',
      isAmount: true,
      value: ch?.amount?.amount ?? '0',
      style: { xs: 3 }
    });
    entry.push({
      label: 'CGST',
      isAmount: true,
      value: ch?.amount?.cgst ?? '0',
      style: { xs: 3 }
    });
    entry.push({
      label: 'SGST',
      isAmount: true,
      value: ch?.amount?.sgst ?? '0',
      style: { xs: 3 }
    });
    consolidatedFeeandCharges += ch?.amount?.amount ? ch.amount.amount : 0;
    consolidatedFeeandCharges += ch?.amount?.cgst ? ch.amount.cgst : 0;
    consolidatedFeeandCharges += ch?.amount?.sgst ? ch.amount.sgst : 0;

    const header = index === 0 ? 'FEES & CHARGES' : null;

    feeChargeComponents.push(<BoxFormat header={header} data={entry} />);
  });
  formData?.charge?.forEach((ch, index) => {
    const entry = [];
    entry.push({
      label: ch.name !== CASH_HANDLING ? 'Charge Name' : '',
      value: getChangeName(ch.name),
      style: { xs: 3, md: 3 }
    });
    entry.push({
      label: 'Charge Amount',
      isAmount: true,
      value: ch?.amount?.amount ?? '0',
      style: { xs: 3, md: 3 }
    });
    const isApplicable = !['INSURANCE'].includes(ch?.name);
    entry.push({
      label: isApplicable ? getTaxType(ch) : '',
      isAmount: !!isApplicable,
      value: isApplicable ? getTaxValue(ch) : '',
      style: { xs: 6, md: 6 }
    });
    consolidatedFeeandCharges += ch?.amount?.amount ? ch.amount.amount : 0;
    consolidatedFeeandCharges += ch?.amount?.cgst ? ch.amount.cgst : 0;
    consolidatedFeeandCharges += ch?.amount?.sgst ? ch.amount.sgst : 0;
    if (ch.name === CASH_HANDLING) {
      consolidatedFeeandCharges += ch?.amount?.gst ? ch.amount.gst : 0;
    }

    const header = index === 0 ? 'FEES & CHARGES' : null;
    feeChargeComponents.push(<BoxFormat header={formData.fees.length === 0 ? header : null} data={entry} />);
  });
  const btFromVeefinDetails = [
    {
      label: 'Remarks',
      value: formData?.balance_transfer_mode === 'CSH' ? formData?.utr_reference_number : 'N/A',
      style: { xs: 8 }
    },
    {
      label: 'Amount',
      isAmount: true,
      value: formData?.balance_transfer_mode === 'CSH' ? formData?.balance_amount_transfer : '0',
      style: { xs: 4 }
    }
  ];

  const btFromonlineCompDetails = [
    {
      label: 'Remarks',
      value: formData?.balance_transfer_mode === 'OLN' ? formData?.utr_reference_number : 'N/A',
      style: { xs: 8 }
    },
    {
      label: 'Amount',
      isAmount: true,
      value: formData?.balance_transfer_mode === 'OLN' ? formData?.balance_amount_transfer : '0',
      style: { xs: 4 }
    }
  ];

  const nomineeStyle = {
    0: { xs: 3 },
    1: { xs: 3 },
    2: { xs: 3 },
    3: { xs: 3 }
  };
  const employeeDedupeStyle = {
    0: { xs: 4 },
    1: { xs: 4 },
    2: { xs: 4 },
  };

  const isEmpDepupeEnabled = !!formData?.employee_dedupe?.hasOwnProperty('is_match');

  const employeeFields = [{ key: 'employee_name', heading: 'Name' }, { key: 'employee_mobile_number', heading: 'Mobile Number' }, { key: 'employee_branch_code', heading: 'Branch Code' }, { key: 'employee_branch_name', heading: 'Branch Name' }];

  const employeeDetailsHandler = (val) => (val ? `${val} \n` : '');
  const employeeDedupeDetailsProvider = () => {
    let empDetails;
    if (formData?.employee_dedupe?.is_match) {
      empDetails = formData?.employee_dedupe?.employee_details?.map((ele) => {
        const employeeInfo = employeeFields.map((field) => `${field.heading} : ${employeeDetailsHandler(ele?.[field.key])}`).join('');
        return ['Yes', `${ele.match_parameter}`, `${employeeInfo}`];
      });
      return empDetails;
    }
    return [['No', 'NA', 'NA']];
  };

  const nomineeHeaders = ['Nominee', 'Nominee Name', 'Mobile No.', 'DOB'];
  const employeeDedupHeader = ['MATCH', 'MATCH CRITERIA', 'EMPLOYEE DETAILS'];
  const employeeDedupValues = [...employeeDedupeDetailsProvider()];
  const nomineeValues = [[customerFullDetails?.nominee_relationship, customerFullDetails?.nominee_name, customerFullDetails?.nominee_mobile, customerFullDetails?.nominee_dob]];
  const schemeRebateSlabHeader = ['Start Days', 'End Days', 'Rebate Rate'];
  const schemeRebateSlabStyle = {
    0: { xs: 4 }, 1: { xs: 4 }, 2: { xs: 4 }
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error style={{ margin: '3px 0px' }}>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <>
      <CustomToaster
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {
    isLoading
      ? (
        <CenterContainerStyled padding='40px'>
          <CircularProgress color='secondary' />
        </CenterContainerStyled>
      )
      : (
        <div>
          <Grid container className='border-div parent'>
            <BoxFormat header='CREDIT APPRAISAL MEMO' data={appraisalData} />
            <BoxFormat header='APPLICANT DETAILS' data={applicantData} />
          </Grid>
          {
        nomineeValues?.length > 0 ? (
          <Grid container className='parent'>
            <TableFormat topHeader='NOMINEE DETAILS' headers={nomineeHeaders} values={nomineeValues} styles={nomineeStyle} />
          </Grid>
        ) : null
      }
          {
        bankDetailsValues?.length > 0 ? (
          <Grid container className='parent'>
            <TableFormat topHeader='BANK DETAILS' headers={bankDetailsHeaders} values={bankDetailsValues} styles={bankStyle} />
          </Grid>
        ) : null
      }
          <Grid container className='border-div parent'>
            { collateralComponents.map((comp) => comp) }
          </Grid>
          <Grid container className='border-div parent'>
            <BoxFormat header='CONSOLIDATE COLLATERAL DETAILS' data={consolidateDetails} />
          </Grid>
          <Grid container className='border-div parent'>
            <BoxFormat header='DISBURSAL DETAILS' data={disbursalDetails} />
          </Grid>
          {
            schemeRebateSlabs.length ? (
              <Grid container className='parent'>
                <TableFormat topHeader='REBATE RATE CHART' headers={schemeRebateSlabHeader} values={schemeRebateSlabs} styles={schemeRebateSlabStyle} />
              </Grid>
            ) : null
          }
          <Grid container className='border-div parent'>
            <BoxFormat header='ELIGIBILITY LOAN AMOUNT INFORMATION' data={eligibleLoanAmountDetails} />
          </Grid>
          <Grid container className='border-div parent'>
            <BoxFormat data={requestedLoanAmountDetails} header='REQUESTED LOAN AMOUNT INFORMATION' />
          </Grid>
          <Grid container className='border-div parent'>
            <BoxFormat header='INTER ACCOUNT FUNDS TRANSFER' data={interAccountDetails} />
          </Grid>
          <Grid container className='border-div parent'>
            <BoxFormat header='BT FROM VEEFIN' data={btFromVeefinDetails} />
          </Grid>
          <Grid container className='border-div parent'>
            <BoxFormat header='BT FROM COMPETITOR ONLINE' data={btFromonlineCompDetails} />
          </Grid>
          <Grid container className='border-div parent'>
            <BoxFormat header={null} data={tareWeightDetails} />
          </Grid>
          <Grid container className='border-div parent'>
            { feeChargeComponents.map((comp) => comp)}
            {
          feeChargeComponents.length > 0 ? (
            <BoxFormat
              data={[{
                label: 'Consolidated Fees/Charges',
                value: Math.ceil(consolidatedFeeandCharges),
                isAmount: true,
                style: {
                  xs: 12
                }
              }]}
              header={null}
            />
          ) : null
        }
          </Grid>
          <Grid container className='border-div parent'>
            <BoxFormat header='MANUAL DEVIATION' data={manualDeviationData} />
          </Grid>
          {
        deviationValues?.length > 0 ? (
          <Grid container className='parent'>
            <TableFormat topHeader={null} headers={deviationHeaders} values={deviationValues} styles={deviationStyle} />
          </Grid>
        ) : null
      }
          {
        (isEmpDepupeEnabled && employeeDedupValues?.length > 0) ? (
          <Grid container className='parent'>
            <TableFormat topHeader='Employee De-dup Check' headers={employeeDedupHeader} values={employeeDedupValues} styles={employeeDedupeStyle} />
          </Grid>
        ) : null
      }
          <Grid container className='border-div parent'>
            <BoxFormat header='MAKER - CHECKER' data={makerCheckerInfo} />
          </Grid>
        </div>
      )
    }
      { ['BOB', 'KVB'].includes(formData.colender) && formData.status === 'MKR'
        ? (
          <Grid container>
            <Grid item xs={12} sm={6} md={6} lg={3} xl={3}>
              <TextFieldStyled
                label='Customer Aadhaar Number'
                {...register('cam', {
                  onChange: (e) => setValue('cam', e.target.value, { shouldValidate: true }),
                  required: 'Please enter your aadhaar number',
                  pattern: { value: aadhaarRegex, message: 'Please enter valid aadhaar number' }
                })}
              />
              {renderError('cam')}
            </Grid>
          </Grid>
        )
        : null}
      {
          formData.colender === 'BOB' && !['MKR', 'CLP', 'CLR', 'CDP', 'CDR'].includes(formData.status) ? (
            <Grid container className='border-div'>
              <BoxFormat
                header='Bank Status'
                data={[
                  {
                    label: 'Status',
                    value: <span>Approved</span>,
                    style: { xs: 12 }
                  },
                ]}
              />
            </Grid>
          ) : null
      }
    </>
  );
};

export default CAM;
