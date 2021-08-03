/**
 * Sets and updates the viewport size.
 * This utility function is especially useful on mobile devices
 * where the actually available height of the viewport changes
 * depending on scrolling behavior, i.e. adress-bar and tool-bar
 * can disappear and provide extra space for content.
 *
 * usage in CSS:
 *  max-height: calc(var(--vh, 1vh) * 60);
 *  height: calc(var(--vh, 1vh) * 60);
 *
 * For best outcome used with boder-box:
 *  box-sizing: border-box;
 */

export function setViewportHeightResponsively() {
    if (window) {
        updateViewportHeight();
        window?.addEventListener('resize', () => {
            updateViewportHeight();
        });
    }

    function updateViewportHeight() {
        let vh = window?.innerHeight * 0.01;
        // Sets CSS var to the root of the document
        document?.documentElement.style.setProperty('--vh', `${vh}px`);
    }
}
