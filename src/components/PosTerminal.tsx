import React, { useEffect, useState } from 'react';
import { KernelLoader } from '../services/KernelLoader';
import './PosTerminal.css';
import { logger } from '../utils/logger';

type TerminalState = 'BOOTING' | 'REGISTERING' | 'INJECTING_KEYS' | 'READY' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export const PosTerminal: React.FC = () => {
    const [state, setState] = useState<TerminalState>('BOOTING');
    const [amount, setAmount] = useState('');
    const [kernelVersion, setKernelVersion] = useState('');
    const [statusMessage, setStatusMessage] = useState('Initializing Secure Kernel...');
    const [cryptogram, setCryptogram] = useState('');
    const [deviceId, setDeviceId] = useState<string>('');

    const initFlow = async () => {
        try {
            const loader = KernelLoader.getInstance();

            // 1. Load Kernel
            setState('BOOTING');
            setStatusMessage('Downloading Kernel...');
            const version = await loader.loadLatestKernel();
            setKernelVersion(version);

            // 2. Register Device
            setState('REGISTERING');
            setStatusMessage('Registering Device...');
            const id = await loader.registerDevice();
            setDeviceId(id);

            // 3. Inject Keys
            setState('INJECTING_KEYS');
            setStatusMessage('Injecting Keys...');
            await loader.injectKeys(id);

            // 4. Ready
            setState('READY');
            setStatusMessage('Ready for Transaction');
        } catch (e) {
            logger.error('Initialization failed:', e);
            setState('ERROR');
            setStatusMessage('Initialization Failed');
        }
    };

    useEffect(() => {
        // Start initialization flow on mount
        setTimeout(initFlow, 1000);
    }, []);

    const handleNumberClick = (num: string) => {
        if (state !== 'READY') return;
        if (amount.includes('.') && num === '.') return;
        if (amount.length > 8) return;
        setAmount(prev => prev + num);
    };

    const handleClear = () => {
        if (state !== 'READY') return;
        setAmount('');
    };

    const handlePay = async () => {
        if (!amount || parseFloat(amount) === 0) return;

        try {
            setState('PROCESSING');
            setStatusMessage('Processing Transaction...');

            const loader = KernelLoader.getInstance();
            const result = await loader.processTransaction(parseFloat(amount));

            if (result.success) {
                setStatusMessage('Processing with Backend...');

                // Send real transaction to backend
                try {
                    const backendResult = await loader.processTransactionWithBackend({
                        deviceId: deviceId || 'webkernel-demo-001',
                        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
                        currency: 'USD',
                        // Optional health check data
                        healthCheck: {
                            root_detection: false,
                            emulator_detection: false,
                            debugger_detection: false,
                            hook_detection: false,
                            tamper_detection: false,
                            security_score: 95
                        }
                    });

                    logger.log('✅ Backend transaction success:', backendResult);

                    // Use the cryptogram from backend response or local kernel
                    const finalCryptogram = backendResult.cryptogram || result.cryptogram;
                    setCryptogram(finalCryptogram);
                    setState('SUCCESS');
                    setStatusMessage('Transaction Approved');
                } catch (backendError) {
                    logger.error('❌ Backend transaction failed:', backendError);
                    // Fallback to local attestation
                    const attested = await loader.attestTransaction(result.cryptogram);
                    if (attested) {
                        setCryptogram(result.cryptogram);
                        setState('SUCCESS');
                        setStatusMessage('Transaction Approved (Local)');
                    } else {
                        throw new Error('Transaction Failed');
                    }
                }
            }
        } catch (e) {
            logger.error('Transaction error:', e);
            setState('ERROR');
            setStatusMessage('Transaction Failed');
        }
    };

    const reset = () => {
        setAmount('');
        setCryptogram('');
        // Reset to READY state for next transaction
        setState('READY');
        setStatusMessage('Ready for Transaction');
    };

    return (
        <div className={`pos-terminal ${state.toLowerCase()}`}>
            <div className="terminal-header">
                <div className="status-bar">
                    <span className="signal">📶 4G</span>
                    <span className="battery">🔋 98%</span>
                </div>
                <div className="brand">SUNBAY SoftPOS</div>
            </div>

            <div className="screen">
                <div className="status-indicator">
                    <div className={`led ${state === 'BOOTING' || state === 'REGISTERING' || state === 'INJECTING_KEYS' ? 'blink' : state === 'READY' ? 'green' : state === 'PROCESSING' ? 'blue' : state === 'SUCCESS' ? 'green' : 'red'}`}></div>
                    <span>{statusMessage}</span>
                </div>

                {(state === 'BOOTING' || state === 'REGISTERING' || state === 'INJECTING_KEYS') && (
                    <div className="boot-loader">
                        <div className="spinner"></div>
                        <p>{statusMessage}</p>
                    </div>
                )}

                {(state === 'READY' || state === 'PROCESSING') && (
                    <div className="amount-display">
                        <span className="currency">$</span>
                        <span className="value">{amount || '0.00'}</span>
                    </div>
                )}

                {state === 'SUCCESS' && (
                    <div className="success-screen">
                        <div className="checkmark">✓</div>
                        <h3>APPROVED</h3>
                        <p className="amount" style={{ fontSize: '24px', margin: '10px 0' }}>${amount}</p>
                        <p className="cryptogram">TC: {cryptogram.substring(0, 16)}...</p>
                    </div>
                )}

                {state === 'ERROR' && (
                    <div className="error-screen">
                        <div className="cross">✕</div>
                        <h3>DECLINED</h3>
                        <p style={{ fontSize: '12px', marginTop: '5px' }}>{statusMessage}</p>
                    </div>
                )}
            </div>

            <div className="keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(num => (
                    <button key={num} onClick={() => handleNumberClick(num.toString())} disabled={state !== 'READY'}>
                        {num}
                    </button>
                ))}
                <button className="clear-btn" onClick={handleClear} disabled={state !== 'READY'}>C</button>
            </div>

            <button 
                className="pay-btn" 
                onClick={state === 'SUCCESS' || state === 'ERROR' ? reset : handlePay} 
                disabled={state !== 'READY' && state !== 'SUCCESS' && state !== 'ERROR' || (state === 'READY' && !amount)}
            >
                {state === 'SUCCESS' || state === 'ERROR' ? 'NEW TRANSACTION' : 'PAY'}
            </button>

            <div className="terminal-footer">
                ID: {deviceId ? deviceId.substring(0, 12) + '...' : '---'} | Kernel: {kernelVersion || '---'} | Secure Enclave: Active
            </div>


        </div>
    );
};
