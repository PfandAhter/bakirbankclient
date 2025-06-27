import { ReactNode } from 'react';
import classNames from 'classnames';

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={classNames('p-4', className)}>
            {children}
        </div>
    );
}