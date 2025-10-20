
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
  isPressed = false,
}: {
  onClick: (key: string) => void;
  className?: string;
  children: React.ReactNode;
  isPressed?: boolean;
}) => (
  <Button
    variant="ghost"
    data-pressed={isPressed}
    className={cn(
      'h-16 w-16 text-2xl rounded-full text-white bg-zinc-700 hover:bg-zinc-600 focus-visible:bg-zinc-600 active:bg-zinc-500 data-[pressed=true]:bg-zinc-500',
      className
    )}
    onClick={() => onClick(typeof children === 'string' ? children : '')}
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
  const [activeKey, setActiveKey] = useState<string | null>(null);
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
  
  const flashKey = (key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 100);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const { key } = event;
        
        flashKey(key.toUpperCase());
        
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
            event.preventDefault(); // Prevent form submission if inside one
            handleEquals();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 'Escape') {
            clearDisplay();
        } else if (key === '%') {
            inputPercent();
        }
    };

    const calculatorEl = calculatorRef.current;
    if (calculatorEl) {
        calculatorEl.focus();
        calculatorEl.addEventListener('keydown', handleKeyDown);
    }

    return () => {
        if(calculatorEl) {
            calculatorEl.removeEventListener('keydown', handleKeyDown);
        }
    };
  }, [display, firstOperand, operator, waitingForSecondOperand]);


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
      if (waitingForSecondOperand) return;
      
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
  
  const handleButtonClick = (key: string) => {
    if (/\d/.test(key)) inputDigit(key);
    else if (key === '.') inputDecimal();
    else if (['+', '-', '×', '÷'].includes(key)) performOperation(key);
    else if (key === '=') handleEquals();
    else if (key === 'AC') clearDisplay();
    else if (key === '+/-') toggleSign();
    else if (key === '%') inputPercent();
  }


  const getFontSize = () => {
    const length = display.length;
    if (display === 'Infinity') return 'text-4xl';
    if (length > 10) return 'text-2xl';
    if (length > 8) return 'text-3xl';
    if (length > 6) return 'text-4xl';
    return 'text-5xl';
  };
  
  const keyMap: {[key: string]: string} = {
      'ESCAPE': 'AC',
      'ENTER': '=',
      '=': '=',
      '.': '.',
      '%': '%',
      '0': '0',
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '+': '+',
      '-': '-',
      '*': '×',
      '/': '÷'
  }

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
       <div className="h-20 flex items-end justify-end pr-2 overflow-x-auto whitespace-nowrap dir-rtl">
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
        <CalculatorButton onClick={() => handleButtonClick('AC')} isPressed={activeKey === 'ESCAPE'} className="bg-zinc-400 text-black hover:bg-zinc-300 data-[pressed=true]:bg-zinc-200">AC</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('+/-')} className="bg-zinc-400 text-black hover:bg-zinc-300 data-[pressed=true]:bg-zinc-200">+/-</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('%')} isPressed={activeKey === '%'} className="bg-zinc-400 text-black hover:bg-zinc-300 data-[pressed=true]:bg-zinc-200">%</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('÷')} isPressed={activeKey === '/'} className="bg-orange-500 hover:bg-orange-400 data-[pressed=true]:bg-orange-300">÷</CalculatorButton>

        <CalculatorButton onClick={() => handleButtonClick('7')} isPressed={activeKey === '7'}>7</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('8')} isPressed={activeKey === '8'}>8</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('9')} isPressed={activeKey === '9'}>9</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('×')} isPressed={activeKey === '*'} className="bg-orange-500 hover:bg-orange-400 data-[pressed=true]:bg-orange-300">×</CalculatorButton>

        <CalculatorButton onClick={() => handleButtonClick('4')} isPressed={activeKey === '4'}>4</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('5')} isPressed={activeKey === '5'}>5</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('6')} isPressed={activeKey === '6'}>6</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('-')} isPressed={activeKey === '-'} className="bg-orange-500 hover:bg-orange-400 data-[pressed=true]:bg-orange-300">-</CalculatorButton>
        
        <CalculatorButton onClick={() => handleButtonClick('1')} isPressed={activeKey === '1'}>1</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('2')} isPressed={activeKey === '2'}>2</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('3')} isPressed={activeKey === '3'}>3</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('+')} isPressed={activeKey === '+'} className="bg-orange-500 hover:bg-orange-400 data-[pressed=true]:bg-orange-300">+</CalculatorButton>
        
        <CalculatorButton onClick={() => handleButtonClick('0')} isPressed={activeKey === '0'} className="col-span-2 w-full">0</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('.')} isPressed={activeKey === '.'}>.</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonClick('=')} isPressed={activeKey === 'ENTER' || activeKey === '='} className="bg-orange-500 hover:bg-orange-400 data-[pressed=true]:bg-orange-300">=</CalculatorButton>
      </div>
       {history.length > 0 && (
          <Button variant="link" className="w-full text-zinc-400" onClick={clearHistory}>Clear History</Button>
      )}
    </div>
  );
}
