console.log('Simple test running');

function simpleTest() {
  console.log('Test function called');
  return 1 + 1;
}

const result = simpleTest();
console.log('Test result:', result);

if (result === 2) {
  console.log('Test passed!');
  process.exit(0);
} else {
  console.error('Test failed!');
  process.exit(1);
}
