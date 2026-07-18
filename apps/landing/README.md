# Aurelis Landing V1

Landing narrativa independiente construida con Next.js, React, TypeScript, Tailwind CSS y Motion.

## Ejecutar

```bash
npm run landing
```

Abrir `http://localhost:3000`.

```bash
npm run build --workspace @aurelis/landing
```

## Decisiones

- La sala aparece antes que Aurelis; las voces son texto libre, nunca tarjetas.
- La narrativa recorre Home, Biblioteca, Programas, Organizaciones, filosofía, memoria y CTA.
- Mobile conserva ritmo vertical propio y no comprime las composiciones desktop.
- Todas las pantallas mostradas provienen del archivo real de Aurelis.
- Motion se limita a opacidad, desplazamientos de 8–18 px y respiración óptica.
- `prefers-reduced-motion` conserva toda la historia sin movimiento.

La CTA V1 conserva el interés en el navegador. Está aislada en `components/waitlist-cta.tsx` para conectar posteriormente un proveedor de lista de espera sin tocar la narrativa.
