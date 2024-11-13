/* eslint-disable no-unused-vars */
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { fieldHandler } from './hideFields';

export const inputChangeHandler = (
  inputValue,
  jsonForm,
  setValue,
  name,
  value,
  unregister
) => {
  try {
    const tempJson = jsonForm;
    if (inputValue?.onChange) {
      const onChangeDetails = inputValue?.onChange[value[name]];
      if (onChangeDetails) {
        tempJson?.input?.forEach((item, index) => {
          if (onChangeDetails?.resetFields?.includes(item.name)) {
            setValue(item.name, '');
          }
          if (inputValue?.onChange?.resetFields?.includes(item.name)) {
            setValue(item.name, '');
          }
          if (onChangeDetails?.dropdownOption
            && onChangeDetails?.dropdownOption?.hasOwnProperty(item.name)) {
            tempJson.input[index].option = onChangeDetails?.dropdownOption[item.name];
            // setValue(item.name, value);
            // console.log("----setValue(item.name, '');---");
          }
          if (onChangeDetails?.disable) {
            let disableArray = [];
            if (Array.isArray(onChangeDetails.disable)) {
              disableArray = onChangeDetails.disable;
            } else {
              disableArray = [onChangeDetails.disable];
            }
            disableArray.forEach((disableItem) => {
              if (disableItem.disableFields.includes(item.name)) {
                tempJson.input[index].disabled = disableItem.value;
                if (item.name === 'enter_pan_details') {
                  tempJson.input[index].validation.isRequired = false;
                }
              }
            });
            // if (onChangeDetails.disable.disableFields.includes(item.name)) {
            //   tempJson.input[index].disabled = onChangeDetails?.disable.value;
            //   if (item.name === 'enter_pan_details') {
            //     tempJson.input[index].validation.isRequired = false;
            //   }
            // }
          }

          if (onChangeDetails?.enable) {
            if (onChangeDetails.enable.disableFields.includes(item.name)) {
              tempJson.input[index].disabled = onChangeDetails?.enable.value;
            }
          }
          if (onChangeDetails.defaultValue && inputValue.name === item.name) {
            tempJson.input[index].defaultValue = onChangeDetails?.defaultValue;
          }
          if (onChangeDetails?.validation) {
            const tempValidation = cloneDeep(onChangeDetails?.validation[item.name]);
            // const tempValidation = onChangeDetails?.validation[item.name];
            if (tempValidation) {
              tempJson.input[index].validation = tempValidation.validation;
            }
          }
          if (onChangeDetails.status) {
            if (onChangeDetails.status.hasOwnProperty(item.name)) {
              tempJson.input[index].status = onChangeDetails.status[item.name];
            }
          }
        });
        if (onChangeDetails?.showField) {
          fieldHandler(onChangeDetails?.showField, jsonForm);
        }
        if (onChangeDetails?.unregisterFields) {
          unregister(onChangeDetails?.unregisterFields);
        }
      }
    }
    if (inputValue?.onDateChange) {
      const onDateChange = inputValue?.onDateChange;
      tempJson?.input?.forEach((item, index) => {
        if (onDateChange.hasOwnProperty(item.name)) {
          if (onDateChange?.[item.name]?.hasOwnProperty('disablePrevious')) {
            tempJson.input[index].lesserDateDisable = moment(value[name]);
          }
          if (onDateChange?.[item.name]?.hasOwnProperty('disableNextDays')) {
            tempJson.input[index].greaterDateDisable = moment(value[name]).add(onDateChange?.[item.name].disableNextDays, 'days');
          }
        }
      });
    }
    if (inputValue?.changeValidationOnChangeInput) {
      const nameArray = inputValue?.name.split('__');
      const index = nameArray.length > 1 ? `__${nameArray[nameArray.length - 1]}` : '';
      Object.keys(inputValue?.changeValidationOnChangeInput?.validation).forEach((ele) => {
        const indexToUpdate = tempJson?.input?.findIndex((item) => item?.name === `${ele}${index}`);
        if (indexToUpdate !== -1) {
          if (inputValue?.defaultValue && inputValue?.defaultValue.length) {
            // eslint-disable-next-line max-len
            tempJson.input[indexToUpdate].validation = inputValue?.changeValidationOnChangeInput?.validation[ele];
          } else {
            tempJson.input[indexToUpdate].validation = inputValue?.validation;
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};
