
// Function to generate a random Bitcoin address (for simulation purposes only)
export const generateRandomBTCAddress = (): string => {
  const prefixes = ['1', '3', 'bc1'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Length of the address depends on the prefix
  let length = 34;
  if (prefix === '1') length = 34;
  else if (prefix === '3') length = 34;
  else if (prefix === 'bc1') length = 42;
  
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = prefix;
  
  // Generate random characters for the address
  for (let i = address.length; i < length; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
};
