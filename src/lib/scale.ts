/** On desktop the app sits in a fixed-size phone frame that is scaled to fit the window. Pointer movement is measured in screen pixels, so drag maths divides by this. */
export const phoneScale = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--phone-scale')) || 1
