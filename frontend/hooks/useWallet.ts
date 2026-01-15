'use client';

import { useAccount, useSignTypedData, useSwitchChain, useChainId } from 'wagmi';
import { mantleSepolia } from '../config/chains';
import {
    EIP712_DOMAIN,
    TRANSACTION_TYPES,
    PROOF_TYPES,
    type TransactionMessage,
    type ProofMessage
} from '../lib/signatures';

export function useTransactionSignature() {
    const { signTypedDataAsync } = useSignTypedData();

    const signTransaction = async (message: TransactionMessage) => {
        const signature = await signTypedDataAsync({
            domain: EIP712_DOMAIN,
            types: TRANSACTION_TYPES,
            primaryType: 'TransactionRegistration',
            message,
        });
        return signature;
    };

    return { signTransaction };
}

export function useProofSignature() {
    const { signTypedDataAsync } = useSignTypedData();

    const signProof = async (message: ProofMessage) => {
        const signature = await signTypedDataAsync({
            domain: EIP712_DOMAIN,
            types: PROOF_TYPES,
            primaryType: 'ProofAuthorization',
            message,
        });
        return signature;
    };

    return { signProof };
}

export function useWalletStatus() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    const isCorrectNetwork = chainId === mantleSepolia.id;

    const switchToMantleSepolia = async () => {
        if (!isCorrectNetwork && switchChain) {
            try {
                await switchChain({ chainId: mantleSepolia.id });
            } catch (error) {
                console.error('Failed to switch network:', error);
                throw error;
            }
        }
    };

    return {
        address,
        isConnected,
        chainId,
        isCorrectNetwork,
        switchToMantleSepolia
    };
}
