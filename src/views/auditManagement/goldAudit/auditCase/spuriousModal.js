/* eslint-disable max-len */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import { ToastMessage } from '../../../../components';
import {
  CenterContainer, ButtonPrimary,
  LoadingButtonPrimary
} from '../../../../components/styledComponents';
import {
  CustomText, spuriousFormFields, nonSpuriousFormFields, CustomDiv
} from '../../helper';

const SpuriousModal = (props) => {
  const {
    data, spuriousSubmitHandler, spuriousItems, setSpuriousItems,
    nonSpuriousItems, setNonSpuriousItems
  } = props;
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const {
    register, unregister, handleSubmit, formState: { errors }, setValue, setError, getValues
  } = useForm();

  const handleSpuriousAddMore = () => {
    if (spuriousItems.length) {
      setSpuriousItems([...spuriousItems, spuriousItems[spuriousItems.length - 1] + 1]);
    } else {
      setSpuriousItems([1]);
    }
  };

  const handleNonSpuriousAddMore = () => {
    if (nonSpuriousItems.length) {
      setNonSpuriousItems([...nonSpuriousItems, nonSpuriousItems[nonSpuriousItems.length - 1] + 1]);
    } else {
      setNonSpuriousItems([1]);
    }
  };

  const handleSpuriousDelete = (itemNumber) => {
    setSpuriousItems(spuriousItems.filter((item) => item !== itemNumber));
    unregister([
      `spurious_count_${itemNumber}`,
      `spurious_totalWeight_${itemNumber}`,
      `spurious_remarks_${itemNumber}`,
      `bentex_${itemNumber}`
    ]);
  };

  const handleNonSpuriousDelete = (itemNumber) => {
    setNonSpuriousItems(nonSpuriousItems.filter((item) => item !== itemNumber));
    unregister([
      `nonSpurious_count_${itemNumber}`,
      `nonSpurious_totalWeight_${itemNumber}`,
      `nonSpurious_beads_stone_weight_${itemNumber}`,
      `nonSpurious_purity_${itemNumber}`,
      `nonSpurious_remarks_${itemNumber}`,
    ]);
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <>
        <CustomDiv>
          <CustomText>Spurious</CustomText>
          <ButtonPrimary onClick={handleSpuriousAddMore}><AddIcon /></ButtonPrimary>
        </CustomDiv>
        <form>
          {spuriousItems.map((itemNumber) => spuriousFormFields(data, register, setValue, errors, itemNumber, handleSpuriousDelete, nonSpuriousItems.length))}
        </form>
        <CustomDiv>
          <CustomText>Non Spurious</CustomText>
          <ButtonPrimary onClick={handleNonSpuriousAddMore}><AddIcon /></ButtonPrimary>
        </CustomDiv>
        <form onSubmit={handleSubmit(spuriousSubmitHandler)}>
          {nonSpuriousItems.map((itemNumber) => nonSpuriousFormFields(data, register, setValue, getValues, setError, errors, itemNumber, handleNonSpuriousDelete, spuriousItems.length))}
          <CenterContainer>
            <LoadingButtonPrimary type='submit'>
              Submit
            </LoadingButtonPrimary>
          </CenterContainer>
        </form>
      </>

    </>
  );
};
export default React.memo(SpuriousModal);
