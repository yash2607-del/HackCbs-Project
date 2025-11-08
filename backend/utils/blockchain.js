import dotenv from "dotenv";
dotenv.config();
import { ethers } from 'ethers';

// Load and validate required environment variables
const INFURA_URL = process.env.INFURA_URL; // e.g. https://sepolia.infura.io/v3/<KEY>
const PRIVATE_KEY = process.env.PRIVATE_KEY; // wallet private key with test ETH on Sepolia
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // deployed contract address on Sepolia
const CONTRACT_ABI_RAW = process.env.CONTRACT_ABI; // stringified JSON ABI

let CONTRACT_ABI = [];
try {
  CONTRACT_ABI = CONTRACT_ABI_RAW ? JSON.parse(CONTRACT_ABI_RAW) : [];
} catch (e) {
  console.error('Invalid CONTRACT_ABI JSON in environment:', e);
  CONTRACT_ABI = [];
}

let provider;
let signer;
let contract;

function ensureBlockchainSetup() {
  if (!INFURA_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS || !Array.isArray(CONTRACT_ABI) || CONTRACT_ABI.length === 0) {
    const missing = [];
    if (!INFURA_URL) missing.push('INFURA_URL');
    if (!PRIVATE_KEY) missing.push('PRIVATE_KEY');
    if (!CONTRACT_ADDRESS) missing.push('CONTRACT_ADDRESS');
    if (!CONTRACT_ABI || (Array.isArray(CONTRACT_ABI) && CONTRACT_ABI.length === 0)) missing.push('CONTRACT_ABI');
    throw new Error(`Blockchain env missing/invalid: ${missing.join(', ')}`);
  }
  if (!provider) {
    // ethers v6 provider
    provider = new ethers.JsonRpcProvider(INFURA_URL);
  }
  if (!signer) {
    signer = new ethers.Wallet(PRIVATE_KEY, provider);
  }
  if (!contract) {
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
}

export async function addHashToBlockchain(dataHash) {
  ensureBlockchainSetup();
  if (!dataHash || typeof dataHash !== 'string') {
    throw new Error('dataHash must be a non-empty string');
  }
  // Call storePrescription(bytes32 or string) depending on contract; assume string/bytes32 compatible
  const tx = await contract.storePrescription(dataHash);
  const receipt = await tx.wait(); // wait for confirmation
  return receipt?.transactionHash || tx.hash;
}

export async function verifyHashOnBlockchain(dataHash) {
  ensureBlockchainSetup();
  if (!dataHash || typeof dataHash !== 'string') {
    throw new Error('dataHash must be a non-empty string');
  }
  const result = await contract.verifyPrescription(dataHash);
  // result could be boolean or BigNumber; coerce to boolean
  return !!result;
}
