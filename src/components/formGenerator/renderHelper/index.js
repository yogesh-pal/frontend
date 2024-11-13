/* eslint-disable no-nested-ternary */
import {
  FormFields
} from '../formLayout';

export const generateFields = (
  id,
  input,
  register,
  errors,
  alignment,
  defaultValue,
  setValue,
  getValues,
  variant,
  updateJsonHandler,
  setError,
  clearErrors,
  unregister,
  trigger,
  activeFormIndex,
  setActiveFormIndex
) => {
  const FormFieldComponent = FormFields[input.identifier];
  const formALignement = {
    xs: input?.alignment ? input.alignment?.xs : alignment?.xs ? alignment.xs : 12,
    sm: input?.alignment ? input.alignment?.sm : alignment?.sm ? alignment.sm : 12,
    md: input?.alignment ? input.alignment?.md : alignment?.md ? alignment.md : 12,
    lg: input?.alignment ? input.alignment?.lg : alignment?.lg ? alignment.lg : 12,
    xl: input?.alignment ? input.alignment?.xl : alignment?.xl ? alignment.xl : 12
  };
  const variantValue = variant ?? 'standard';
  return (
    <FormFieldComponent
      key={`${input.name}-${id}`}
      register={register}
      errors={errors}
      input={input}
      alignment={formALignement}
      defaultValue={defaultValue}
      setValue={setValue}
      getValues={getValues}
      variant={variantValue}
      updateJsonHandler={updateJsonHandler}
      setError={setError}
      clearErrors={clearErrors}
      unregister={unregister}
      trigger={trigger}
      activeFormIndex={activeFormIndex}
      setActiveFormIndex={setActiveFormIndex}
    />
  );
};
