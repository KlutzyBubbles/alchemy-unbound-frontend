import './scss/index.scss';
import './renderer/Main';

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
    
        console.log('%c %s', test, 'You shouln\'t be here');
    } else {
        console.log('Rendered');
    }
})();
