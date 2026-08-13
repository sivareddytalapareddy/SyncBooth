import React, { useState, useEffect } from 'react';

export const CountdownOverlay = ({ active, onComplete }) => {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (!active) {
            setCount(3);
            return;
        }

        setCount(3);
        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeout(() => {
                        onComplete();
                    }, 200);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [active, onComplete]);

    if (!active || count === 0) return null;

    return (
        <div className="countdown-overlay">
            {count}
        </div>
    );
};
