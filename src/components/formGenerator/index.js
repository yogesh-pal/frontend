/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { cloneDeep } from 'lodash';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import { styled as MUIStyeld } from '@mui/material/styles';
import {
  Grid, Box, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import React, {
  useEffect, useState, useId, forwardRef, useCallback,
} from 'react';
import Stepper from '../stepper';
import { generateFields } from './renderHelper';
import { useScreenSize } from '../../customHooks';
import { saveFormValues } from '../../redux/reducer/login';
import { FUNCTION_IDENTIFIER, IDENTIFIER } from '../../constants';
import {
  otpSuccessHandler, inputChangeHandler, formBackHandler, validateDetails
} from './utils';
import {
  ButtonPrimary, ButtonSecondary, LoadingButtonSecondaryPrimary, ContainerButtonStyled,
  ResetButton
} from '../styledComponents';
import CustomToaster from '../mesaageToaster';
import { updateFieldDetailsHandler } from './utils/filePreviewFields';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />);

const WrapperBox = styled(Box)(({ stepperDirection, isRemovePadding }) => ({
  display: 'flex',
  flexDirection: stepperDirection === 'vertical' ? 'row' : 'column',
  justifyContent: stepperDirection === 'vertical' ? 'space-around' : 'center',
  padding: isRemovePadding ? '0px' : (stepperDirection === 'vertical' ? '15px' : '20px'),
}));
const CustomForm = styled.form(({ theme, stepperDirection }) => ({
  width: '100%',
  border: stepperDirection === 'vertical' ? `1px solid ${theme?.boxShadow?.secondary}` : 'none',
  borderRadius: stepperDirection === 'vertical' ? '10px' : '0',
}));

const CustomTitle = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: '20px',
}));
const WraperAddButton = styled.div(() => ({
  display: 'flex',
  justifyContent: 'right',
  paddingBottom: '10px'
}));

const CustonButtonWrapper = MUIStyeld('div')(({ active, alignment }) => ({
  display: 'flex',
  justifyContent: alignment || (active ? 'space-between' : 'flex-end'),
  alignItems: 'center',
}));
const Wraperlabel = styled.div(() => ({
  display: 'flex',
  justifyContent: 'left',
  paddingBottom: '10px',
  paddingTop: '10px'
}));
const identifierData = [
  IDENTIFIER.INPUTNUMBER, IDENTIFIER.INPUTTEXT, IDENTIFIER.INPUTTEXT2, IDENTIFIER.DATEPICKER,
  IDENTIFIER.TIMEPICKER, IDENTIFIER.LIVEPHOTO, IDENTIFIER.FILE
];
const FormGenerator = ({
  formDetails, formHandler, alertShow, setAlertShow,
  changeEvent, saveFormValuesInRedux, setFormDetails, isLoading
}) => {
  const id = useId();
  const [, updateState] = useState();
  const [formData, setFormData] = useState({});
  const [formValues, setFormValues] = useState({});
  const [addMoreCount, setAddMoreCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [formSubmitData, setFormSubmitData] = useState({});
  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [alertMessage, setAlertMessage] = useState({ open: false, msg: '' });
  const forceUpdate = useCallback(() => updateState({}), []);

  const screen = useScreenSize();
  const {
    register, handleSubmit, formState: { errors }, watch, setValue,
    getValues, unregister, setError, reset, clearErrors, trigger
  } = useForm();

  const isFunction = (functionToCheck) => functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

  const unregisterHandler = (index) => {
    try {
      const tempForm = cloneDeep(formDetails);
      const previousForm = tempForm.form[index];
      const readFormValue = previousForm.input.map((item) => item.name);
      const previousFormValue = getValues(readFormValue);
      readFormValue.forEach((item, inputIndex) => {
        if (previousFormValue[inputIndex] === undefined) {
          unregister(item);
        }
      });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const stepperHandler = async (value) => {
    try {
      setIsDisabled(true);
      let step = activeFormIndex;
      if (value === 'INCREMENT' && step < formDetails?.stepper?.steps?.length) {
        step += 1;
      }
      if (value === 'DECREMENT' && step > 0) {
        await unregisterHandler(step);
        if (formDetails?.previousFunction) {
          formDetails.previousFunction(formValues, activeFormIndex);
        }
        const tempForm = formDetails.form[step];
        if (tempForm?.onBack) {
          formBackHandler(formDetails.form, step, setValue, unregister);
        }
        step -= 1;
      }
      setActiveFormIndex(step);
      setValue('activeFormIndex', step);
      setIsDisabled(false);
      setAddMoreCount(0);
      if (formDetails?.onLoadState) {
        formDetails?.onLoadState(setValue);
      }
    } catch (e) {
      setIsDisabled(false);
      console.log('Error', e);
    }
  };
  const showInput = (input, index) => {
    try {
      const tempformdata = { ...formData };
      if (input?.identifier === IDENTIFIER.DELETEBUTTON) {
        if (input?.index === addMoreCount) {
          return true;
        }
        return false;
      } if (input?.condition !== undefined) {
        switch (input?.condition?.type) {
          case 'show':
            return (
              formSubmitData[input?.condition?.baseOn] !== undefined
            && formSubmitData[input?.condition?.baseOn] !== null
            && formSubmitData[input?.condition?.baseOn] !== '');
          case 'showOnValueMultiple':
            return input?.condition?.baseOn.every((obj) => {
              if (Array.isArray(obj.value)) {
                let toShow = false;
                obj.value.forEach((object) => {
                  if (object.value === formSubmitData[obj.name]) {
                    toShow = true;
                  }
                });
                return toShow;
              }
              return obj.value === formSubmitData[obj.name];
            });
          case 'showOnValue':
            return formSubmitData[input?.condition?.baseOn] === input?.condition?.baseValue;
          case 'multiShowOnValue':
            return input?.condition?.baseValue.includes(formSubmitData[input?.condition?.baseOn]) || input?.condition?.isShow;
          case 'disabledOnValue':
            if (formSubmitData[input?.condition?.baseOn] === input?.condition?.baseValue) {
              tempformdata.input[index].disabled = true;
            } else {
              tempformdata.input[index].disabled = false;
            }
            setFormData(tempformdata);
            break;
          case 'dynamicShow':
            return (
              formSubmitData[input?.condition?.baseOn] !== undefined
            && formSubmitData[input?.condition?.baseOn] !== null
            && formSubmitData[input?.condition?.baseOn] !== '');
          case 'visible,showOnValue':
            return input?.condition?.isShow
              && formSubmitData[input?.condition?.baseOn] === input?.condition?.baseValue;
          case 'visible,multiShowOnValue':
            return input?.condition?.isShow
                && input?.condition?.baseValue.includes(formSubmitData[input?.condition?.baseOn]);
          case 'visible':
            return input?.condition?.isShow;
          default:
            break;
        }
      } else {
        return true;
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const updateJsonHandler = (updatedInput, response) => {
    try {
      const value = getValues();
      const tempData = formDetails.form[value.activeFormIndex];
      otpSuccessHandler(updatedInput, tempData, response, getValues, setValue);
      setFormData({ ...tempData });
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmit = async (data) => {
    try {
      const form = { ...formValues };
      const obj = {};
      let error = false;
      if (formData?.type !== 'readonly') {
        console.log('Read only', formData?.input);
        formData?.input.forEach((item) => {
          if ([IDENTIFIER.INPUTBUTTONOTP, IDENTIFIER.INPUTOTP].includes(item.identifier)
            && item.status === false) {
            if (item?.condition && item.condition.hasOwnProperty('baseOn') && getValues(item?.condition?.baseOn) === item?.condition?.baseValue) {
              error = true;
              setError(item.name, { type: 'custom', customMsg: item?.validation?.verifyMsg ?? `Please verify ${item.label.toLowerCase()}` });
            }
            if (item?.condition?.isShow) {
              error = true;
              setError(item.name, { type: 'custom', customMsg: item?.validation?.verifyMsg ?? `Please verify ${item.label.toLowerCase()}` });
            }
            if (!item.hasOwnProperty('condition')) {
              error = true;
              setError(item.name, { type: 'custom', customMsg: item?.validation?.verifyMsg ?? `Please verify ${item.label.toLowerCase()}` });
            }
            if (item.doNoValidate) error = false;
          } else if ([IDENTIFIER.INPUTTEXT].includes(item.identifier)) {
            if (item.defaultValue === 'INVALID' && item.name === 'pan_status') {
              error = true;
              setAlertMessage({ open: true, msg: 'Pan number is Invalid', alertType: 'error' });
            } else if (item.defaultValue === 'VALID' && item.name === 'pan_status') {
              error = false;
            }
          } else if ([IDENTIFIER.MULTIPLELIVEPHOTO].includes(item.identifier)) {
            const fieldError = validateDetails(data, item, setError);
            if (fieldError) error = true;
          }
          obj[item.name] = data[item.name];
        });
      }
      if (formData?.dynamicValidation !== undefined) {
        // error = await formData?.dynamicValidation(data, setError, clearErrors);
        const errorDynamic = await formData?.dynamicValidation(data, setError, clearErrors);
        if (errorDynamic) {
          error = errorDynamic;
        }
      }
      if (formData?.nextValidate !== undefined) {
        const erroNext = await formData?.nextValidate({
          data,
          setError,
          clearErrors,
          setValue,
          getValues,
          formData,
          updateJsonHandler,
          setFormData
        });
        if (erroNext) {
          error = erroNext;
        }
      }
      console.log('Error details form builder ---', error);
      if (error) {
        return;
      }
      if (formDetails?.dataFormat === 'MULTI') {
        form[formData.title] = obj;
        setFormValues(form);
        saveFormValuesInRedux(data);
        if (formDetails?.nextFunction) {
          setIsDisabled(true);
          formDetails.nextFunction(form, activeFormIndex, reset, data)?.then((value) => {
            setIsDisabled(false);
            if (!value) {
              const btnDetails = formData.buttonDetails;
              if (btnDetails.type === 'submit') return formHandler(formDetails?.dataFormat === 'MULTI' ? formValues : data);
              stepperHandler('INCREMENT');
            }
          }).catch((e) => {
            setIsDisabled(false);
            console.log('e', e);
          });
        }
      } else {
        setFormValues(data);
        saveFormValuesInRedux(data);
        const btnDetails = formData.buttonDetails;

        if (btnDetails.type === 'submit') return formHandler(formDetails?.dataFormat === 'MULTI' ? formValues : data);
        stepperHandler('INCREMENT');
      }
    } catch (e) {
      setIsDisabled(false);
      console.log('Error', e);
    }
  };

  const generaterForm = (input) => {
    const value = getValues();
    const checkRender = { ...input };
    return (
      generateFields(
        id,
        checkRender,
        register,
        errors,
        formData.alignment,
        (value && value[input.name] !== undefined) ? value[input.name] : input.defaultValue,
        setValue,
        getValues,
        formData?.variant,
        updateJsonHandler,
        setError,
        clearErrors,
        unregister,
        trigger,
        activeFormIndex,
        setActiveFormIndex
      ));
  };
  // HANDLE DYNAMIC CALL ON CHANGE
  const handleDynamicChangeCall = async (value, name, updatedFormDetails = null) => {
    try {
      const tempData = updatedFormDetails ?? formDetails.form[value?.activeFormIndex];
      // const dynamicValue = formDetails[activeFormIndex]?.form?.input?.map((item, index) => {
      const dynamicValue = formDetails.form[value?.activeFormIndex]
        ?.input?.map((item, index) => {
          if (name === item.name) {
            tempData.input[index].defaultValue = value[name];
            if ((item.hasOwnProperty('runonChange') && item.runonChange) || !item.hasOwnProperty('runonChange')) inputChangeHandler(item, tempData, setValue, name, value, unregister);
          }
          if (item.functionMethod === FUNCTION_IDENTIFIER.ON_CHANGE
        && item.functionChangeBaseOn.includes(name) && item.customFunction !== undefined) {
            const nameArray = name.split('__');
            const index2 = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
            return new Promise((resolve) => {
              item.customFunction(value, (options) => {
                if (identifierData.includes(item.identifier)) {
                  tempData.input[index].defaultValue = options;
                  setValue(item.name, options);
                } else {
                  tempData.input[index].option = options;
                }
                resolve(resolve);
              }, index2, setValue);
            });
          }
          if (item.functionMethod === FUNCTION_IDENTIFIER.ON_CHANGE_SETTER
          && item.functionChangeBaseOn === name && item.customFunction !== undefined) {
            const nameArray = name.split('__');
            const index2 = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
            return new Promise((resolve) => {
              item.customFunction(value, (options) => {
                console.log('Custom Function hanlder', value, options);
                if (options) {
                  item.setValueArr?.forEach((val) => {
                    const tempInput = tempData?.input?.filter((filterData) => filterData.name !== undefined);
                    const inputIndex = tempInput?.findIndex(
                      (inputValue) => inputValue.name === val.name
                    );
                    if (inputIndex >= 0) {
                      if (identifierData.includes(item.identifier)) {
                        tempInput[inputIndex].defaultValue = options[val.apiKey];
                        const formVal = getValues();
                        // console.log('form val', formVal, options);
                        // console.log('kdkdkdk-----', val.name, options[val.apiKey], formVal, options);
                        if (formVal[val.name] !== options[val.apiKey]) {
                          setValue(val.name, options[val.apiKey], { shouldValidate: true });
                        }
                      } else {
                        tempInput[inputIndex].option = options[val.apiKey];
                      }
                    }
                  });
                }
                resolve(resolve);
              }, index2, setValue, formDetails, setFormDetails, name);
            });
          }
          return true;
        });

      if (dynamicValue) {
        Promise.all(dynamicValue).then(() => {
          setFormData({ ...tempData });
        });
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const handledynamicInitCall = async () => {
    try {
      const tempData = formDetails.form[formSubmitData.activeFormIndex ?? activeFormIndex];
      let value = [];
      if (formDetails.form[activeFormIndex]?.type === 'readonly') {
        const readonlyData = isFunction(formDetails.form[formSubmitData.activeFormIndex ?? activeFormIndex]?.input.readonlyData)
          ? formDetails.form[formSubmitData.activeFormIndex ?? activeFormIndex]?.input.readonlyData()
          : formDetails.form[formSubmitData.activeFormIndex ?? activeFormIndex]?.input.readonlyData;
        value = readonlyData
          .map((val) => val.data.map((item, index) => {
            if (item.functionMethod === FUNCTION_IDENTIFIER.ON_INIT
          && item.customFunction !== undefined) {
              return new Promise((resolve) => {
                item.customFunction(formSubmitData ?? getValues(), (values) => {
                  if (identifierData.includes(item.identifier)) {
                    // tempData.input[index].defaultValue = values;
                    setValue(item.name, values);
                  } else {
                    tempData.input[index].option = values;
                  }
                  resolve(values);
                });
              });
            }
            return true;
          }));
      } else {
        value = formDetails.form[formSubmitData.activeFormIndex ?? activeFormIndex]?.input
          .map((item, index) => {
            const nameArray = item.name.split('__');
            const index2 = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
            if (item.functionMethod === FUNCTION_IDENTIFIER.ON_INIT
          && item.customFunction !== undefined) {
              return new Promise((resolve) => {
                item.customFunction(formSubmitData ?? getValues(), (values) => {
                  if (identifierData.includes(item.identifier)) {
                    // tempData.input[index].defaultValue = values;
                    setValue(item.name, values);
                  } else {
                    tempData.input[index].option = values;
                  }
                  resolve(values);
                }, index2, setValue);
              });
            }
            if (item.functioninitMethod === FUNCTION_IDENTIFIER.ON_INIT
              && item.custominitFunction !== undefined) {
              return new Promise((resolve) => {
                item.custominitFunction(getValues(), (values) => {
                  if (identifierData.includes(item.identifier)) {
                    setValue(item.name, values);
                  } else {
                    tempData.input[index].option = values;
                  }
                  resolve(values);
                }, setValue);
              });
            }
            return true;
          });
      }

      if (value) {
        await Promise.all(value).then(() => {
          setFormData({ ...tempData });
        });
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const initDefaultValueHandler = (index) => {
    try {
      if (formDetails?.form[index]?.type !== 'readonly') {
        const tempForm = formDetails?.form[index]?.input;
        const value = getValues();
        tempForm?.forEach((item) => {
          const nameArray = item.name.split('__');
          const index2 = (nameArray.length > 1) ? nameArray[nameArray.length - 1] : '';
          if (index2 !== '') {
            setValue('activeAddMore', index2);
            setAddMoreCount(parseInt(index2, 10));
          }
          if (item?.defaultValue) {
            setValue(item.name, (value[item.name] === undefined) ? item?.defaultValue : value[item.name]);
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    try {
      const subscription = watch((value, { name, type }) => {
        setFormSubmitData(value);
        saveFormValuesInRedux(value);
        if (formDetails.form[value?.activeFormIndex]?.type !== 'readonly') {
          const formInput = formDetails.form[value?.activeFormIndex];
          const newFormInput = formInput?.runonChangeSetter ? formInput.runonChangeSetter(formInput, name, setFormData) : null;
          handleDynamicChangeCall(value, name, newFormInput);
          if (changeEvent) changeEvent(name, type, value);
        }
        return () => subscription.unsubscribe();
      });
    } catch (e) {
      console.log('Error', e);
    }
  }, [watch]);

  useEffect(() => {
    try {
      if (activeFormIndex < formDetails.form.findIndex((ele) => ele.title === 'Gold Information')) {
        unregister('current_date_of_residence');
        unregister('permanent_date_of_residence');
      }
      setFormData(formDetails.form[activeFormIndex]);
      handledynamicInitCall();
      if (!formDetails.form[activeFormIndex]?.initDefaultValueHandlerDisabled) {
        initDefaultValueHandler(activeFormIndex);
      }
    } catch (e) {
      console.log('Error', e);
    }
  }, [activeFormIndex, formDetails]);
  useEffect(() => {
    try {
      if (formDetails?.onLoadState) {
        const index = formDetails?.onLoadState(setValue);
        setActiveFormIndex(index);
        setValue('activeFormIndex', index);
      } else {
        register('activeFormIndex', { value: 0 });
      }
    } catch (e) {
      console.log('Error', e);
    }
  }, []);
  useEffect(() => {
    try {
      register('activeAddMore', { value: '' });
      register('autoReload', { value: true });
      initDefaultValueHandler(0);
    } catch (e) {
      console.log('Error', e);
    }
  }, []);
  const renameInput = (_item, index, copyDefaultValue = true) => {
    try {
      const item = cloneDeep(_item); // decouple instance
      if (item?.isRemovePreviousSelectedOption) {
        const addedFields = formData?.input.filter((ele) => ele && ele.name.includes(_item.name));
        const newOptionToSelect = [];
        item.option.forEach((ele) => {
          if (!addedFields.some((field) => field.defaultValue && (field.defaultValue.includes(ele) || field.defaultValue.includes(ele.value)))) {
            newOptionToSelect.push(ele);
          }
        });
        item.option = newOptionToSelect;
        if (item?.onChange) {
          Object.keys(item?.onChange).forEach((ele1) => {
            Object.keys(item?.onChange[ele1]?.validation).forEach((ele2) => {
              item.onChange[ele1].validation[`${ele2}__${index}`] = item?.onChange[ele1]?.validation[ele2];
              delete item?.onChange[ele1]?.validation[ele2];
            });
          });
        }
      }
      if (item?.addMoreWithDefaultValue) {
        copyDefaultValue = true;
      }
      item.name = `${item.name}__${index}`;
      if (item.copyCondition !== undefined && item.copyCondition !== false && item.condition !== undefined) {
        item.condition.baseOn = `${item.condition.baseOn}__${index}`;
      }
      if (item.functionChangeBaseOn) {
        item.functionChangeBaseOn = `${item.name}`;
      }
      if (item.setValueArr !== undefined) {
        item.setValueArr = item.setValueArr.map((_val) => {
          const val = { ..._val };
          val.apiKey = `${val.apiKey}__${index}`;
          val.name = `${val.name}__${index}`;
          return val;
        });
      }
      if (!copyDefaultValue) {
        item.defaultValue = '';
      }
      return item; // replace original with new instance
    } catch (e) {
      console.log(e);
    }
  };
  const handleRemoveClick = async (count) => {
    try {
      const value = getValues();
      if (formDetails.form[value.activeFormIndex]?.customFunctionOnDelete) {
        await formDetails.form[value.activeFormIndex]?.customFunctionOnDelete(value, formDetails);
      }
      formDetails.form[value.activeFormIndex]?.input.forEach((item, index) => {
        if (item.name.includes(`__${count}`)) {
        // eslint-disable-next-line no-param-reassign
          delete formDetails.form[value.activeFormIndex]?.input[index];
          delete value[item.name];
        }
      });
      reset(value);
      setFormData(formDetails.form[value.activeFormIndex]);
      setFormDetails(formDetails);
      setValue('activeAddMore', value.activeAddMore - 1);
      setAddMoreCount(value.activeAddMore - 1);
      forceUpdate();
    } catch (e) {
      console.log(e);
    }
  };
  const handleClick = () => {
    try {
      const value = getValues();
      if ((addMoreCount + 2) > formDetails.form[value.activeFormIndex]?.addMoreStepLimit) {
        return null;
      }
      let count = 0;
      count = addMoreCount + 1;
      setValue('activeAddMore', count);
      setAddMoreCount(count);
      const inputData = formDetails.form[value.activeFormIndex]?.input;
      if (formDetails.form[value.activeFormIndex]?.addMoreSperatorEnable) {
        inputData.push({
          name: `sperator__${count}`,
          identifier: IDENTIFIER.SPERATOR,
          index: count,
        });
      }
      inputData.push({
        name: `deletebt__${count}`,
        identifier: IDENTIFIER.DELETEBUTTON,
        index: count,
        handleRemoveClick: () => handleRemoveClick(count),
        condition: formDetails.form[value.activeFormIndex]?.addMoreCondition
      });
      formData?.input?.forEach((item) => {
        if (!item.name.includes('__')) {
          if (formDetails.form[value.activeFormIndex]?.addMoreFields !== undefined) {
            if (formDetails.form[value.activeFormIndex]?.addMoreFields.includes(item.name)) {
              if (formDetails.form[value.activeFormIndex]?.addMoreValidation !== undefined) {
                inputData.push(formDetails.form[value.activeFormIndex]?.addMoreValidation(renameInput(item, count, formDetails.form[value.activeFormIndex]?.addMoreCopyDefaultValue), value));
              } else {
                inputData.push(renameInput(item, count, formDetails.form[value.activeFormIndex]?.addMoreCopyDefaultValue));
              }
            }
          } else if (formDetails.form[value.activeFormIndex]?.addMoreValidation !== undefined) {
            inputData.push(formDetails.form[value.activeFormIndex]?.addMoreValidation(renameInput(item, count, formDetails.form[value.activeFormIndex]?.addMoreCopyDefaultValue), value));
          } else {
            inputData.push(renameInput(item, count, formDetails.form[value.activeFormIndex]?.addMoreCopyDefaultValue));
          }
        }
      });
      setFormDetails(formDetails);
    } catch (e) {
      console.log(e);
    }
  };

  const handleClick2 = (indexCount = null) => {
    try {
      const tempFormData = cloneDeep(formDetails.form[activeFormIndex]);
      let count = 0;
      if (indexCount !== null) {
        count = indexCount;
      } else {
        count = addMoreCount + 1;
      }
      setValue('activeAddMore', count);
      setAddMoreCount(count);
      const value = getValues();
      const inputData = formDetails.form[value.activeFormIndex]?.input;
      if (formDetails.form[value.activeFormIndex]?.addMoreSperatorEnable) {
        inputData.push({
          name: `sperator__${count}`,
          identifier: IDENTIFIER.SPERATOR,
          index: count,
        });
      }
      inputData.push({
        name: `deletebt__${count}`,
        identifier: IDENTIFIER.DELETEBUTTON,
        index: count,
        handleRemoveClick: () => handleRemoveClick(count),
        condition: formDetails.form[value.activeFormIndex]?.addMoreCondition
      });
      tempFormData?.input?.forEach((item) => {
        if (!item.name.includes('__')) {
          if (formDetails.form[value.activeFormIndex]?.addMoreFields !== undefined) {
            if (formDetails.form[value.activeFormIndex]?.addMoreFields.includes(item.name)) {
              if (formDetails.form[value.activeFormIndex]?.addMoreValidation !== undefined) {
                inputData.push(formDetails.form[value.activeFormIndex]?.addMoreValidation(renameInput(item, count, formDetails.form[value.activeFormIndex]?.addMoreCopyDefaultValue), value));
              } else {
                inputData.push(renameInput(item, count, formDetails.form[value.activeFormIndex]?.addMoreCopyDefaultValue));
              }
            }
          } else if (formDetails.form[value.activeFormIndex]?.addMoreValidation !== undefined) {
            inputData.push(formDetails.form[value.activeFormIndex]?.addMoreValidation(renameInput(item, count, formDetails.form[value.activeFormIndex]?.addMoreCopyDefaultValue), value));
          } else {
            inputData.push(renameInput(item, count, formDetails.form[value.activeFormIndex]?.addMoreCopyDefaultValue));
          }
        }
      });
      setFormDetails(formDetails);
    } catch (e) {
      console.log(e);
    }
  };
  const convertName = (name) => `${name?.toLowerCase().replace(/ /g, '_').replace(/[ .,"'? +=-]/g, '')}_readyOnly`;
  const convertName2 = (name) => `${name?.toLowerCase().replace(/ /g, '_').replace(/[ .,"'? +=-]/g, '')}`;
  const genrateFields = (inputRenderData, fields, searchKey) => {
    try {
      const value = getValues();
      const keys = Object.keys(value);
      // const fields = [..._fields];
      const searchKeyArray = keys.filter((item) => item.includes(`${convertName2(searchKey)}__`));
      searchKeyArray.forEach((val, index) => {
        inputRenderData.forEach((item) => {
          fields.push(
            {
              name: `${convertName(item.name)}__${index + 1}`,
              label: item.name,
              type: 'text',
              identifier: IDENTIFIER.INPUTTEXT,
              disabled: true,
              defaultValue: value[`${item.dataKey}__${index + 1}`],
            }
          );
        });
      });
      return fields;
    } catch (e) {
      console.log('Error', e);
    }
  };
  const renderReadonly = (data) => {
    try {
      let dataFields = data?.data;
      if (data?.addMore !== undefined) {
        dataFields = genrateFields(data?.inputRenderData, data?.data, data?.datakey);
      }
      const fields = dataFields.map((item) => generaterForm(item));
      return (
        <>
          { data.label
            ? (
              <Grid item xs={12}>
                <Wraperlabel>{data.label}</Wraperlabel>
              </Grid>
            ) : null}
          {fields}
        </>
      );
    } catch (e) {
      console.log(e, data);
    }
  };
  const showAddMore = () => {
    try {
      if (formData?.addMore) {
        if (formData?.addMoreCondition !== undefined) {
          const value = getValues();
          return formData?.addMoreCondition.baseValue === value[formData?.addMoreCondition.baseOn];
        }
        return formData?.addMore;
      }
      return false;
    } catch (e) {
      console.log('Error', e);
    }
  };

  const stepperHideHandler = () => {
    try {
      if (formDetails?.stepper.hasOwnProperty('hide') && formDetails?.stepper.hide.includes(screen)) {
        return false;
      }
      return true;
    } catch (e) {
      console.log('Error', e);
    }
  };
  const [checkCall, setCheckCall] = useState(true);
  useEffect(() => {
    const value = getValues();
    if (formDetails.form[value?.activeFormIndex]?.addMoreCallAuto && checkCall) {
      const count = formDetails.form[value?.activeFormIndex]?.addMoreCallAutoCount;
      for (let index = 1; index < count; index += 1) {
        if (index === (count - 1)) {
          setCheckCall(false);
        }
        handleClick2(index);
      }
    }
  }, [activeFormIndex]);

  return (
    <WrapperBox stepperDirection={formDetails?.stepper?.stepperDirection} isRemovePadding={formDetails?.stepper?.isRemovePadding}>
      {
        formDetails?.form?.length > 1 && stepperHideHandler() && (
          <Stepper
            stepper={formDetails?.stepper}
            activeFormIndex={activeFormIndex}
            setValue={setValue}
            setActiveFormIndex={setActiveFormIndex}
            formDetails={formDetails}
            getValues={getValues}
            unregister={unregister}
          />
        )
      }
      <CustomToaster
        alertShow={alertMessage}
        setAlertShow={setAlertMessage}
      />
      <CustomForm
        onSubmit={handleSubmit(onSubmit)}
        stepperDirection={formDetails?.stepper?.stepperDirection}
      >
        {formData?.title && <CustomTitle>{formData?.title}</CustomTitle>}
        {showAddMore() && (
        <WraperAddButton>
          <ButtonPrimary onClick={handleClick}><AddIcon /></ButtonPrimary>
        </WraperAddButton>
        )}
        {(formData?.type === 'readonly') ? (
          <Grid container spacing={2}>
            {isFunction(formData?.input?.readonlyData)
              ? formData?.input?.readonlyData().map((item) => renderReadonly(item))
              : formData?.input?.readonlyData.map((item) => renderReadonly(item))}
          </Grid>
        )
          : (
            <Grid container spacing={2}>
              {isFunction(formData?.input) ? formData?.input()?.map((item, key) => showInput(item, key) && generaterForm(item))
                : formData?.input?.map((item, key) => showInput(item, key) && generaterForm(item))}
            </Grid>
          )}
        {
          formData?.optionAdd
          && formData?.optionDataInput?.map((item) => generaterForm(item))
        }
        {/* {formData?.addMoreCallAuto && autoRenderAddMore(formData?.addMoreCallAutoCount)} */}
        <CustonButtonWrapper active={activeFormIndex > 0} alignment={formData?.buttonDetails?.alignment}>
          {
            activeFormIndex > 0 && (
              <ButtonSecondary
                disabled={isDisabled || isLoading}
                onClick={() => stepperHandler('DECREMENT')}
              >
                {/* <ArrowBackIosIcon />
                {' '} */}
                {formData?.buttonDetails?.previous ?? 'Back'}
              </ButtonSecondary>
            )
          }
          {
            formData?.buttonDetails && (
            <ContainerButtonStyled margin='20px 0 0 0' rowReverse={formData?.buttonDetails?.rowReverse}>
              {
                formData?.buttonDetails?.resetDetails && (
                <ResetButton
                  disabled={isLoading}
                  onClick={() => reset(formData?.buttonDetails?.resetDetails)}
                >
                  {formData?.buttonDetails?.nameReset || 'Reset'}
                </ResetButton>
                )
              }
              <LoadingButtonSecondaryPrimary
                loading={isLoading}
                variant='contained'
                disabled={isDisabled || formData?.buttonDetails?.disableButton}
                type='submit'
              >
                {formData?.buttonDetails?.name}
                {/* {' '}
            <ArrowForwardIosIcon /> */}
              </LoadingButtonSecondaryPrimary>
              {
                formData?.buttonDetails?.isShowCustomButton && (
                <ButtonPrimary
                  disabled={isLoading}
                  onClick={formData?.buttonDetails?.isShowCustomButton?.customFunction}
                >
                  {formData?.buttonDetails?.isShowCustomButton?.name}
                </ButtonPrimary>
                )
              }
            </ContainerButtonStyled>
            )
          }

          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={alertShow?.open}
            autoHideDuration={3000}
            key='top center'
            onClose={() => setAlertShow({ ...alertShow, open: false })}
          >
            <Alert
              severity={alertShow?.alertType ?? 'success'}
              sx={{ width: '100%' }}
              onClose={() => setAlertShow({ ...alertShow, open: false })}
            >
              {alertShow?.msg}
            </Alert>
          </Snackbar>
        </CustonButtonWrapper>
      </CustomForm>
    </WrapperBox>
  );
};

const mapStateToProps = (state) => ({
  ...state,
});
const mapDispatchToProps = (dispatch) => ({
  saveFormValuesInRedux: (payload) => dispatch(saveFormValues(payload)),
});
export default React.memo(connect(mapStateToProps, mapDispatchToProps)(FormGenerator));
