
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CalculatorButton = ({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) => (
  <Button
    variant="ghost"
    className={cn(
      'h-16 w-16 text-2xl rounded-full text-white bg-zinc-700 hover:bg-zinc-600 focus-visible:bg-zinc-600 active:bg-zinc-500',
      className
    )}
    onClick={onClick}
  >
    {children}
  </Button>
);

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A hack to make scroll area scroll to bottom
        setTimeout(() => {
             if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
                if(viewport) viewport.scrollTop = viewport.scrollHeight;
             }
        }, 100);
    }
  }, [history]);

    useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const { key } = event;

        if (/\d/.test(key)) {
            inputDigit(key);
        } else if (key === '.') {
            inputDecimal();
        } else if (key === '+' || key === '-') {
            performOperation(key);
        } else if (key === '*') {
            performOperation('×');
        } else if (key === '/') {
            performOperation('÷');
        } else if (key === 'Enter' || key === '=') {
            handleEquals();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 'Escape') {
            clearDisplay();
        } else if (key === '%') {
            inputPercent();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, firstOperand, operator, waitingForSecondOperand]); // Add dependencies


  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
        setDisplay('0.');
        setWaitingForSecondOperand(false);
        return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (operator && firstOperand !== null && !waitingForSecondOperand) {
      const result = calculate(firstOperand, inputValue, operator);
      const resultString = String(parseFloat(result.toFixed(7)));
      setDisplay(resultString);
      setHistory([...history, `${formatOperand(firstOperand)} ${operator} ${formatOperand(inputValue)} = ${resultString}`]);
      setFirstOperand(result);
    } else {
      setFirstOperand(inputValue);
    }
    
    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };
  
  const formatOperand = (operand: number | null) => {
    if (operand === null) return '';
    return String(operand);
  }

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '×':
        return first * second;
      case '÷':
        return second === 0 ? Infinity : first / second;
      default:
        return second;
    }
  };

  const handleEquals = () => {
    if (operator && firstOperand !== null) {
      const inputValue = parseFloat(display);
      if (waitingForSecondOperand) return; // Don't do anything if we press = right after an operator
      
      const result = calculate(firstOperand, inputValue, operator);
      const resultString = String(parseFloat(result.toFixed(7)));
      
      setHistory([...history, `${formatOperand(firstOperand)} ${operator} ${formatOperand(inputValue)} = ${resultString}`]);
      setDisplay(resultString);
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecondOperand(true);
    }
  };
  
  const clearDisplay = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const backspace = () => {
      if (waitingForSecondOperand) return;
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  }

  const clearHistory = () => {
    setHistory([]);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const inputPercent = () => {
    setDisplay(String(parseFloat(display) / 100));
    setWaitingForSecondOperand(true);
  };


  const getFontSize = () => {
    const length = display.length;
    if (display === 'Infinity') return 'text-4xl';
    if (length > 10) return 'text-2xl';
    if (length > 8) return 'text-3xl';
    if (length > 6) return 'text-4xl';
    return 'text-5xl';
  };

  return (
    <div ref={calculatorRef} className="bg-black text-white p-4 space-y-4 rounded-lg outline-none" tabIndex={-1}>
       <AnimatePresence>
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ScrollArea className="h-24 w-full" ref={scrollAreaRef}>
              <div className="flex flex-col items-end justify-end p-2 space-y-1">
                {history.map((entry, index) => (
                  <div key={index} className="text-zinc-400 text-sm">
                    {entry}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
       <div className="h-20 flex items-end justify-end pr-2">
        <motion.div
          key={display}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className={cn('font-light', getFontSize())}
        >
          {display}
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <CalculatorButton onClick={clearDisplay} className="bg-zinc-400 text-black hover:bg-zinc-300">AC</CalculatorButton>
        <CalculatorButton onClick={toggleSign} className="bg-zinc-400 text-black hover:bg-zinc-300">+/-</CalculatorButton>
        <CalculatorButton onClick={inputPercent} className="bg-zinc-400 text-black hover:bg-zinc-300">%</CalculatorButton>
        <CalculatorButton onClick={() => performOperation('÷')} className="bg-orange-500 hover:bg-orange-400">÷</CalculatorButton>

        <CalculatorButton onClick={() => inputDigit('7')}>7</CalculatorButton>
        <CalculatorButton onClick={() => inputDigit('8')}>8</CalculatorButton>
        <CalculatorButton onClick={() => inputDigit('9')}>9</CalculatorButton>
        <CalculatorButton onClick={() => performOperation('×')} className="bg-orange-500 hover:bg-orange-400">×</CalculatorButton>

        <CalculatorButton onClick={() => inputDigit('4')}>4</CalculatorButton>
        <CalculatorButton onClick={() => inputDigit('5')}>5</CalculatorButton>
        <CalculatorButton onClick={() => inputDigit('6')}>6</CalculatorButton>
        <CalculatorButton onClick={() => performOperation('-')} className="bg-orange-500 hover:bg-orange-400">-</CalculatorButton>
        
        <CalculatorButton onClick={() => inputDigit('1')}>1</CalculatorButton>
        <CalculatorButton onClick={() => inputDigit('2')}>2</CalculatorButton>
        <CalculatorButton onClick={() => inputDigit('3')}>3</CalculatorButton>
        <CalculatorButton onClick={() => performOperation('+')} className="bg-orange-500 hover:bg-orange-400">+</CalculatorButton>
        
        <CalculatorButton onClick={() => inputDigit('0')} className="col-span-2 w-full">0</CalculatorButton>
        <CalculatorButton onClick={inputDecimal}>.</CalculatorButton>
        <CalculatorButton onClick={handleEquals} className="bg-orange-500 hover:bg-orange-40-500">=</CalculatorButton>
      </div>
       {history.length > 0 && (
          <Button variant="link" className="w-full text-zinc-400" onClick={clearHistory}>Clear History</Button>
      )}
    </div>
  );
}



