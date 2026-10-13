# UI/UX Guidelines

## Brand Identity
Persona 3 Reload's key art and title cards: **bright cyan, royal blue and deep night navy,
with heavy white uppercase type**. Think "PRESS ANY BUTTON": stacked heavy words beside a
vertical royal-blue bar, giant outlined words in the background, diagonal light sweeps.
Selected items invert to white with navy text, like the in-game menus. No yellow.
Recreate the vibe with CSS and type only — never ship ATLUS artwork or game rips.

## Typography
- Display: Archivo, weight 900, uppercase, tight tracking (`.display` class).
- Body: Geist. Small labels: `font-heading` uppercase with wide tracking.
- Page titles use `<PageHeader>` (bar + stacked words + backdrop word).

## Color Palette
```css
:root {
  --p3r-cyan:  #2EC4FF;   /* Key-art cyan — accents, links, highlights */
  --p3r-sky:   #8FDCFF;   /* Soft cyan — kickers, hints */
  --p3r-blue:  #1550E0;   /* Royal blue — title bar, step numbers */
  --p3r-navy:  #0B1E5B;   /* Navy — text on white selections, surfaces */
  --p3r-deep:  #050E2E;   /* Night background */
  --p3r-white: #F2FAFF;   /* Text, active/selected background */
  --p3r-mist:  #8EA3C8;   /* Muted text */
  --p3r-red:   #FF3D63;   /* Rare accent: special fusion, DLC */

  /* Element colors */
  --elem-slash:     #C0C4CC;
  --elem-strike:    #A8A29E;
  --elem-pierce:    #D4D4D8;
  --elem-fire:      #FF5A3C;
  --elem-ice:       #5AC8FF;
  --elem-elec:      #FFD60A;   /* element colors may stay warm */
  --elem-wind:      #7CFF7C;
  --elem-light:     #FFF5B8;
  --elem-dark:      #8A5AC8;
  --elem-almighty:  #FFFFFF;
}
```