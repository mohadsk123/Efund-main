import { ethers } from "ethers";
import { getBrowserProvider } from "./blockchain";

const ERC721_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenURI(uint256) view returns (string)",
];

export const getNftBalance = async (contractAddress: string, owner: string) => {
  const provider = getBrowserProvider();
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
  const bal = await contract.balanceOf(owner);
  return Number(bal);
};

export const getTokenURI = async (contractAddress: string, tokenId: number | bigint) => {
  const provider = getBrowserProvider();
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
  const uri = await contract.tokenURI(BigInt(tokenId));
  return String(uri);
};
