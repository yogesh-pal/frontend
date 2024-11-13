import { IDENTIFIER } from '../../../constants';

const validateMultiUpload = (data, item, setError) => {
  console.log(data);

  const documents = [];
  const { validation, name } = item;
  console.log(data, item);

  if (validation?.min) {
    const filterKeys = Object.keys(data).filter((ele) => ele.includes(name) && ele !== 'current_address_proof_url');
    for (let i = 0; i < filterKeys.length; i += 1) {
      if (data[filterKeys[i]]) {
        documents.push(data[filterKeys[i]]);
      }
    }

    if (documents.length < validation?.min) {
      console.log(documents, validation);
      setError(item.name, { type: 'custom', customMsg: validation?.minMsg });
      return true;
    }
  }
  return false;
};

export const validateDetails = (data, item, setError) => {
  console.log(item, data);
  if ([IDENTIFIER.MULTIPLELIVEPHOTO].includes(item.identifier)) {
    return validateMultiUpload(data, item, setError);
  }
};
