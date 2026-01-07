'use client';

import { useAccount, useSignTypedData } from 'wagmi';
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
    return { address, isConnected };
}
