# writter

Simulador de frases estilo "fundo colorido + texto condensado". Escreve, escolhe cor e formato, compartilha.

## Rodar

```bash
npm install
npm run dev
```

## Testar o compartilhar no celular

O menu nativo (WhatsApp, Instagram, etc.) só aparece em HTTPS.

- `npm run dev:https` e abrir `https://IP-DO-PC:3000` no celular (mesma rede, aceitar o certificado), ou
- deploy na Vercel, ou
- `npx cloudflared tunnel --url http://localhost:3000`
