import * as bootstrap from 'bootstrap';

export function closeCanvas() {
    const myOffCanvas = document.getElementById('sideMenu');
    const openedCanvas = bootstrap.Offcanvas.getInstance(myOffCanvas);
    openedCanvas?.hide();
}
