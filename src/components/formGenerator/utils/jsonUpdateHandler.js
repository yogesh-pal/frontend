import { disableFieldHandler, disableFieldIfHaveValue } from './disableFormFields';
import { resetHandler } from './resetFields';
import { SUCCESSHANDLER } from '../../../constants';
import { updateFieldDetailsHandler } from './filePreviewFields';

const showHandler = (showField, jsonForm) => {
  try {
    const tempJson = jsonForm;

    showField.forEach((item) => {
      const inputIndex = jsonForm?.input?.findIndex(
        (inputValue) => inputValue.name === item.name
      );
      if (inputIndex >= 0) {
        if (item.condition === 'isShow') {
          tempJson.input[inputIndex].condition.isShow = item.value;
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
};

const setFieldHandler = (setField, jsonForm, getValues, setValue, response) => {
  try {
    const tempJson = jsonForm;
    setField.forEach((item) => {
      const inputIndex = jsonForm?.input?.findIndex(
        (inputValue) => inputValue.name === item.name
      );
      if (inputIndex >= 0) {
        tempJson.input[inputIndex].defaultValue = item?.value ? item.value : response[item?.apiKey];
        setValue(item.name, item?.value ? item.value : response[item?.apiKey], {
          shouldValidate: true
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
};

const updateJsonOnSuccess = (
  element,
  input,
  tempjson,
  getValues,
  setValue,
  response,
  formJson,
  updateDetails
) => {
  try {
    if (element === 'showField') {
      showHandler(updateDetails.showField, tempjson);
    }
    if (element === 'setValueArr') {
      setFieldHandler(updateDetails.setValueArr, tempjson, getValues, setValue, response);
    }
    if (element === 'disable') {
      let disableArray = [];
      if (!Array.isArray(updateDetails[element])) {
        disableArray.push(updateDetails[element]);
      } else {
        disableArray = updateDetails[element];
      }

      disableArray.forEach((item) => {
        if (item?.disableOnValue) {
          disableFieldIfHaveValue(
            item.disableFields,
            item.value,
            tempjson,
            getValues
          );
        } else {
          disableFieldHandler(
            item.disableFields,
            item.value,
            tempjson
          );
        }
      });
    }

    if (element === 'enable') {
      disableFieldHandler(
        updateDetails.enable?.disableFields,
        updateDetails.enable?.value,
        tempjson
      );
    }
    if (element === 'updateFieldDetails') {
      updateFieldDetailsHandler(
        updateDetails.updateFieldDetails,
        tempjson
      );
    }

    if (element === 'resetFields') {
      resetHandler(updateDetails[element], setValue);
    }
    if (element === 'status') {
      const findIndex = formJson?.input?.findIndex((item) => item.name === input.name
        && input.identifier === item.identifier);
      tempjson.input[findIndex].status = updateDetails.status;
      tempjson.input[findIndex].error = false;
    }
    if (element === 'validation') {
      Object.keys(updateDetails.validation).forEach((item) => {
        const findIndex = formJson?.input?.findIndex((valid) => valid.name === item);
        if (findIndex >= 0) {
          formJson.input[findIndex].validation = updateDetails.validation[item];
        }
      });
    }
    if (element === 'disableOption') {
      updateDetails.disableOption.forEach((item) => {
        const findIndex = formJson?.input?.findIndex((valid) => valid.name === item?.name);
        if (findIndex >= 0) {
          const optionIndex = formJson?.input[findIndex].option.findIndex(
            (ele) => ele.value === item.value
          );
          if (optionIndex >= 0) {
            formJson.input[findIndex].option[optionIndex].disabled = item.disabled;
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const updateJsonOnFail = (
  element,
  input,
  tempjson,
  getValues,
  setValue,
  response,
  formJson,
  updateDetails
) => {
  try {
    if (element === 'showField') {
      showHandler(updateDetails.showField, tempjson);
    }
    if (element === 'setValueArr') {
      setFieldHandler(updateDetails.setValueArr, tempjson, getValues, setValue, response);
    }
    if (element === 'disable') {
      disableFieldHandler(
        updateDetails.disable?.disableFields,
        updateDetails.disable?.value,
        tempjson
      );
    }
    if (element === 'resetFields') {
      resetHandler(updateDetails.resetFields, setValue);
    }
    if (element === 'status') {
      const findIndex = formJson?.input?.findIndex((item) => item.name === input.name
        && input.identifier === item.identifier);
      tempjson.input[findIndex].status = input?.fail?.status;
      tempjson.input[findIndex].error = true;
    }
    if (element === 'validation') {
      Object.keys(updateDetails.validation).forEach((item) => {
        const findIndex = formJson?.input?.findIndex((valid) => valid.name === item);
        if (findIndex >= 0) {
          formJson.input[findIndex].validation = updateDetails.validation[item];
        }
      });
    }
    if (element === 'disableOption') {
      updateDetails.disableOption.forEach((item) => {
        const findIndex = formJson?.input?.findIndex((valid) => valid.name === item?.name);
        if (findIndex >= 0) {
          const optionIndex = formJson?.input[findIndex].option.findIndex(
            (ele) => ele.value === item.value
          );
          if (optionIndex >= 0) {
            formJson.input[findIndex].option[optionIndex].disabled = item.disabled;
          }
        }
      });
    }
  } catch (e) {
    console.log('Error', e);
  }
};

export const otpSuccessHandler = (input, formJson, response, getValues, setValue) => {
  try {
    const tempjson = formJson;
    if (response?.success) {
      if (input.success && Array.isArray(input.success)) {
        const successObj = input.success[response?.successResponse];
        Object.keys(successObj)?.forEach((element) => {
          if (element === 'showField') {
            showHandler(successObj?.showField, tempjson);
          }
          if (element === 'disable') {
            if (successObj?.disable?.disableOnValue) {
              disableFieldIfHaveValue(
                successObj.disable?.disableFields,
                successObj.disable?.value,
                tempjson,
                getValues
              );
            } else {
              disableFieldHandler(
                successObj.disable?.disableFields,
                successObj.disable?.value,
                tempjson
              );
            }
          }
          if (element === 'setValueArr') {
            setFieldHandler(successObj.setValueArr, tempjson, getValues, setValue, response);
          }
          if (element === 'resetFields') {
            resetHandler(input.fail.resetFields, setValue);
          }
          if (element === 'status') {
            const findIndex = formJson?.input?.findIndex((item) => item.name === input.name
              && input.identifier === item.identifier);
            tempjson.input[findIndex].status = successObj.status;
            tempjson.input[findIndex].error = false;
          }
          if (element === 'validation') {
            Object.keys(successObj.validation).forEach((item) => {
              const findIndex = formJson?.input?.findIndex((valid) => valid.name === item);
              if (findIndex >= 0) {
                formJson.input[findIndex].validation = successObj.validation[item];
              }
            });
          }
        });
      } else {
        const CONFIG = input?.success?.CONFIG;
        if (CONFIG?.IDENTIFIER && !response?.dynamicKey) {
          if (CONFIG.IDENTIFIER === SUCCESSHANDLER.BASEDONVAUE) {
            const { key } = CONFIG.KEYS;
            const formValues = getValues();
            if (formValues[key]) {
              Object.keys(input?.success[formValues[key]])?.forEach((element) => {
                updateJsonOnSuccess(
                  element,
                  input,
                  tempjson,
                  getValues,
                  setValue,
                  response,
                  formJson,
                  input.success[formValues[key]]
                );
              });
            }
          }
        } else {
          const jsonDetails = response?.dynamicKey ? input[response?.dynamicKey] : input?.success;
          Object.keys(jsonDetails)?.forEach((element) => {
            updateJsonOnSuccess(
              element,
              input,
              tempjson,
              getValues,
              setValue,
              response,
              formJson,
              jsonDetails
            );
          });
          if (jsonDetails?.hasOwnProperty('updateFormValues')) {
            jsonDetails?.updateFormValues.forEach(({ name, value }) => {
              setValue(name, value);
            });
          }
        }
      }
    } else if (input.fail && Array.isArray(input.fail)) {
      const failureObj = input.fail[response?.failureResponse];
      Object.keys(failureObj)?.forEach((element) => {
        if (element === 'showField') {
          showHandler(failureObj.showField, tempjson);
        }
        if (element === 'setValueArr') {
          setFieldHandler(failureObj.setValueArr, tempjson, getValues, setValue, response);
        }
        if (element === 'disable') {
          disableFieldHandler(
            failureObj.disable?.disableFields,
            failureObj.disable?.value,
            tempjson
          );
        }
        if (element === 'resetFields') {
          resetHandler(failureObj.resetFields, setValue);
        }
        if (element === 'status') {
          const findIndex = formJson?.input?.findIndex((item) => item.name === input.name
            && input.identifier === item.identifier);
          tempjson.input[findIndex].status = failureObj?.status;
          tempjson.input[findIndex].error = true;
        }
        if (element === 'validation') {
          Object.keys(failureObj.validation).forEach((item) => {
            const findIndex = formJson?.input?.findIndex((valid) => valid.name === item);
            if (findIndex >= 0) {
              formJson.input[findIndex].validation = failureObj.validation[item];
            }
          });
        }
      });
    } else if (input?.onClickUpdateJSON && response?.onClickUpdateJSON) {
      Object.keys(input?.onClickUpdateJSON)?.forEach((element) => {
        updateJsonOnSuccess(
          element,
          input,
          tempjson,
          getValues,
          setValue,
          response,
          formJson,
          input?.onClickUpdateJSON
        );
      });
    } else {
      Object.keys(input?.fail)?.forEach((element) => {
        updateJsonOnFail(
          element,
          input,
          tempjson,
          getValues,
          setValue,
          response,
          formJson,
          input.fail
        );
      });
    }

    return tempjson;
  } catch (e) {
    console.log(e);
  }
};
