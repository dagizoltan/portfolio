/**
 * Copy-to-clipboard for the email and phone actions.
 *
 * Restores the original label after two seconds, and clears any pending timer
 * first so repeated clicks cannot leave the button stuck on "Copied".
 */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.copy-email-trigger').forEach((trigger) => {
        const textSpan = trigger.querySelector('.copy-trigger-text');
        if (!textSpan) return;

        if (!textSpan.hasAttribute('data-original-text')) {
            textSpan.setAttribute('data-original-text', textSpan.innerText);
        }

        trigger.addEventListener('click', async () => {
            const value = trigger.getAttribute('data-copy');
            if (!value) return;

            const copiedText = trigger.getAttribute('data-copied-text') || 'Copied';

            try {
                await navigator.clipboard.writeText(value);
                textSpan.innerText = copiedText;

                if (trigger._timeout) clearTimeout(trigger._timeout);
                trigger._timeout = setTimeout(() => {
                    textSpan.innerText = textSpan.getAttribute('data-original-text');
                }, 2000);
            } catch (err) {
                console.error('Clipboard write failed:', err);
            }
        });
    });
});
