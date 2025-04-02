
// Function to generate a random BTC Taproot address (bc1p prefix)
export function generateRandomTaprootAddress(): string {
  const chars = '0123456789abcdefghijklmnopqrstuv';
  const addressLength = 62; // Standard bc1p... address length
  let address = 'bc1p'; // Taproot address prefix
  
  // Generate random characters for the address
  for (let i = 0; i < addressLength - 4; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
}
