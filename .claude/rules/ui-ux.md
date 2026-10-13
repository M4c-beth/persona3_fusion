# UI/UX Guidelines

## Brand Identity
Persona 3 Reload has a distinct aesthetic: **midnight blue, electric yellow, and sharp
geometric shapes**. The UI should evoke the Velvet Room and Tartarus — stylish,
mysterious, and bold.

## Color Palette
```css
:root {
  --p3r-blue:       #0A2472;   /* Primary — deep Velvet Room blue */
  --p3r-blue-light: #3A6CF0;   /* Accent blue */
  --p3r-yellow:     #FFD60A;   /* CTA, highlights, Persona energy */
  --p3r-gold:       #C9A227;   /* Secondary accent */
  --p3r-black:      #0A0A0F;   /* Background */
  --p3r-dark:       #14141F;   /* Surface */
  --p3r-white:      #F5F5F7;   /* Text */
  --p3r-gray:       #8A8A9A;   /* Muted text */

  /* Element colors */
  --elem-fire:      #FF5A3C;
  --elem-ice:       #5AC8FF;
  --elem-elec:      #FFD60A;
  --elem-wind:      #7CFF7C;
  --elem-psy:       #FF7CE8;
  --elem-nuke:      #FF9A3C;
  --elem-light:     #FFF5B8;
  --elem-dark:      #8A5AC8;
  --elem-almighty:  #FFFFFF;
}