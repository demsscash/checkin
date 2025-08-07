// hooks/useCodeInput.ts
import { useState } from 'react';
import { DEFAULT_CODE_LENGTH, VALID_CODES } from '../constants/mockData';

export const useCodeInput = (length: number = DEFAULT_CODE_LENGTH) => {
    const [code, setCode] = useState<string[]>(Array(length).fill(''));
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isComplete, setIsComplete] = useState<boolean>(false);

    const handleCodeChange = (newCode: string[]) => {
        setCode(newCode);

        // Calculate isComplete first and then set it
        const completed = newCode.every(digit => digit !== '');
        console.log('Code completion status:', completed, newCode);
        setIsComplete(completed);

        // Reset validity state when code changes
        setIsValid(null);
    };

    const validateCode = (): boolean => {
        const fullCode = code.join('');
        const valid = VALID_CODES.includes(fullCode);
        setIsValid(valid);
        return valid;
    };

    const resetCode = () => {
        setCode(Array(length).fill(''));
        setIsValid(null);
        setIsComplete(false);
    };

    const getFullCode = (): string => {
        return code.join('');
    };

    return {
        code,
        isValid,
        isComplete,
        handleCodeChange,
        validateCode,
        resetCode,
        getFullCode
    };
};

export default useCodeInput;