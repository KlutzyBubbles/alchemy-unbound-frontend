import './index.scss';
import './renderer/Main';

(async() => {
    if (await window.GenericAPI.isPackaged()) {
        var test = 'text-shadow: -1px -1px hsl(0,100%,50%),';
        var amplitude = 40;
        var frequency = 20;
        var colorChange = 3.4;
        var prefix = ''
        for (var y = 0; y <= 669; y++) {
            var x = amplitude * Math.sin(y / frequency)
            test += `${prefix} ${x}px ${y}px hsl(${y * colorChange}, 100%, 50%)`
            prefix = ','
        }
        test += '; font-size: 40px; padding: 0 64px 440px 20px;'
    
        console.log("%c %s", test, 'You shouln\'t be here');
    } else {
        console.log('Rendered')
    }
    
})()