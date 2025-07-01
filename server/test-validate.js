import { validatePhoneNumber } from './dist/utils/contactValidation.js';

const testPhones = ['555-234-5678', '(555) 234-5678', '555.234.5678', '555 234 5678', '5552345678'];

testPhones.forEach((phone) => {
  const result = validatePhoneNumber(phone);
  console.log(
    `${phone}: isValid=${result.isValid}, formatted=${result.formatted}, errors=${JSON.stringify(result.errors)}`,
  );
});
