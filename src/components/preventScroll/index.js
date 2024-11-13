import React, { useEffect, useRef } from 'react';
import { TextFieldStyled } from '../styledComponents';

const PreventScroll = (props) => {
  const amountFieldRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => e.preventDefault();
    const amountField = amountFieldRef.current;
    amountField.addEventListener('wheel', handleWheel);
    return () => {
      amountField.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <TextFieldStyled
      {...props}
      ref={amountFieldRef}
    />
  );
};

export default PreventScroll;
