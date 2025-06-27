import { ReactNode } from 'react';
import classNames from 'classnames';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={classNames('rounded-xl bg-white dark:bg-zinc-900 shadow-md', className)}>
            {children}
        </div>
    );
}
