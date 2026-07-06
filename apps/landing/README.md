# Aurelis Landing Test 01 — The Hook

## Ejecutar

```bash
npm run landing
```

Abrir `http://localhost:4173`.

## Decisiones

- La sala aparece antes que Aurelis; las voces son texto libre, nunca tarjetas.
- El silencio ocupa dos bloques completos y el scroll permanece bajo control del visitante.
- Mobile conserva la secuencia, pero apila el cierre y amplía las pausas.
- El Home usa `assets/archive/screens/20-real-home.png` sin modificaciones.
- Las animaciones se limitan a opacidad, desplazamientos de 8–18 px y una respiración óptica de 1.2%.
- `prefers-reduced-motion` conserva toda la historia sin movimiento.

## Dudas para Product

1. ¿“Comenzar con Aurelis” debe abrir modo invitado, registro o una tienda?
2. ¿“Ver cómo funciona” debe repetir Chapter 01 o avanzar a un futuro Chapter 02?
3. ¿La captura archivada sigue siendo la baseline oficial de Home para esta prueba?
4. ¿Las seis voces tienen la densidad correcta en móvil o conviene reducirlas a cuatro?
5. ¿El texto “Todo listo antes del primer acorde” aporta cierre o explica demasiado?
