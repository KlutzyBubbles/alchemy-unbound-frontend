import './scss/index.scss';
import './renderer/Main';
import logger from 'electron-log/renderer';

window.onerror = (error, url, line) => {
    logger.error('window onerror', error, url, line);
};

try {
    if (process.type === 'browser') {
        process.on('uncaughtException', (error) => {
            logger.error('uncaught exception', error);
        });
    } else {
        window.addEventListener('error', (error) => {
            logger.error('uncaught exception', error);
        });
    }
} catch (error) {
    logger.error('Failed creating extra error catchers', error);
}

(async() => {
    if (await window.GenericAPI.isPackaged()) {
        let test = 'text-shadow: -1px -1px hsl(0,100%,50%),';
        const amplitude = 40;
        const frequency = 20;
        const colorChange = 3.4;
        let prefix = '';
        for (let y = 0; y <= 669; y++) {
            const x = amplitude * Math.sin(y / frequency);
            test += `${prefix} ${x}px ${y}px hsl(${y * colorChange}, 100%, 50%)`;
            prefix = ',';
        }
        test += '; font-size: 40px; padding: 0 64px 440px 20px;';
    
        // console.log('%c %s', test, 'You shouln\'t be here');
        console.log('%c %s', test, 'You have been VAC banned');
    } else {
        console.log('Rendered');
    }
})();
