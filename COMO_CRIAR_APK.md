# 📱 Como Gerar e Instalar o APK / App Mobile do Ka'Net Diversões

O **Ka'Net Diversões** agora foi totalmente adaptado com uma arquitetura **Mobile-First / PWA**, com suporte a telas Android, entalhes (notches), barras de navegação seguras (`safe-area`), vibração tátil nativa e som offline desbloqueado.

Existem **3 formas simples** de usar ou gerar o APK:

---

## 🚀 Método 1: Instalação Instantânea no Celular (Sem precisar compilar)
Graças ao suporte PWA/WebAPK oficial já configurado:
1. Abra o jogo no navegador do celular Android (ex: Google Chrome em `https://kanet-diversoe.onrender.com`).
2. Clique no botão **"📲 Instalar App no Celular"** que aparece no ecrã de entrada, ou toque nos **3 pontinhos do Chrome > Instalar Aplicativo / Adicionar ao ecrã principal**.
3. O Android cria o ícone do jogo diretamente na gaveta de aplicativos do telemóvel.
4. Quando aberto pelo ícone, ele roda em **ecrã completo imersivo (sem barra de URL, igual a um APK nativo)**!

---

## ⚡ Método 2: Gerar o APK Oficial via PWABuilder / Bubblewrap (2 minutos)
Se precisa enviar um ficheiro `.apk` para instalar diretamente nos telemóveis:
1. Acesse o [PWABuilder da Microsoft](https://www.pwabuilder.com/).
2. Insira o link do jogo: `https://kanet-diversoe.onrender.com`.
3. Clique em **Start**. O site detectará o manifesto e o service worker já configurados com nota máxima.
4. Clique em **Package for Stores** e selecione **Android**.
5. Clique em **Download Package**. Ele gera o ficheiro `.apk` pronto para instalar em qualquer Android!

---

## 🛠️ Método 3: Compilar no Android Studio (Projeto Pronto)
Deixamos um template de projeto nativo pronto na pasta:
`kanet_diversoes/android-apk-template`

1. Abra o **Android Studio**.
2. Clique em **File > Open** e selecione a pasta `kanet_diversoes/android-apk-template`.
3. Aguarde o Gradle sincronizar.
4. Vá a **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. O Android Studio gera o ficheiro `app-debug.apk` pronto para distribuir e instalar em qualquer dispositivo Android!

---

## 💎 Melhorias Mobile Implementadas:
- **Resolução e Viewport**: Sem cortes de ecrã em ecrãs pequenos ou compridos (18:9, 19.5:9, 20:9).
- **Safe Area Insets**: Proteção contra entalhes de câmara (punch-hole/notches) e linha de gestos do Android.
- **Vibração Tátil Nativa (Haptics)**: Vibra suavemente ao clicar, confirmar palavras e tocar o alarme final.
- **Sem seleção acidental de texto**: Toques rápidos durante os 30 segundos não abrem menus azuis de cópia do Android.
- **Buzina Clássica de Fim de Tempo**: Som mecânico analógico clássico e marcante.
