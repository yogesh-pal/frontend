export const numberFormat = (value) => {
  value = value.toString();
  const amt = value.replace(/[,]/g, '');
  const lastThree = amt.substring(amt.length - 3);
  const otherNumbers = amt.substring(0, amt.length - 3);
  if (otherNumbers.length > 0) {
    return `${otherNumbers.toString().replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`;
  }
  return lastThree;
};
