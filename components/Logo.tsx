import Image from 'next/image';
import Link from 'next/link';
import { APP_CONFIG } from '@/app/app.config';

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
    href?: string;
    showText?: boolean;
    textClassName?: string;
}

export default function Logo({
    width = 32,
    height = 32,
    className = "",
    href = "/",
    showText = true,
    textClassName = ""
}: LogoProps) {
    return (
        <Link href={href} className={`flex items-center gap-2 group ${className}`}>
            <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Image
                    src="/icon-192.png"
                    alt={`${APP_CONFIG.appName} Logo`}
                    width={width}
                    height={height}
                    className="object-contain"
                    priority
                />
            </div>
            {showText && (
                <span className={`font-bold tracking-tight text-lg sm:text-xl truncate ${textClassName}`}>
                    {APP_CONFIG.appName}
                </span>
            )}
        </Link>
    );
}
