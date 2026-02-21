import { ethers } from "ethers";
import { getBrowserProvider } from "./blockchain";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export const getTokenBalance = async (contractAddress: string, owner: string) => {
  const provider = getBrowserProvider();
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
  const bal = await contract.balanceOf(owner);
  const decimals = await contract.decimals();
  return { raw: bal as bigint, formatted: Number(ethers.formatUnits(bal, Number(decimals))) };
};

export const getAllowance = async (contractAddress: string, owner: string, spender: string) => {
  const provider = getBrowserProvider();
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
  const allowance = await contract.allowance(owner, spender);
  return allowance as bigint;
};

export const approveSpender = async (contractAddress: string, spender: string, amount: bigint) => {
  const provider = getBrowserProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
  const tx = await contract.approve(spender, amount);
  const receipt = await tx.wait();
  return { hash: tx.hash, status: receipt?.status === 1 };
};
