import dynamic from 'next/dynamic';

/**
 * Wrapper component for setViewportHeightResponsively()
 * to allow usage in NextJS without SSR.
 */
const SetVhResponsivelyWithoutSSR = dynamic(
    () => import('./SetVhResponsively'),
    {ssr: false}
)

export default SetVhResponsivelyWithoutSSR;