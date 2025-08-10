# 🎙️ ChatVoz

**ChatVoz** es una aplicación web de chat en tiempo real que permite a los usuarios comunicarse exclusivamente a través de mensajes de voz. Desarrollada con Vue 3 y tecnologías web modernas, ofrece una experiencia de comunicación única y natural.

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Características Principales

- 🎤 **Grabación de voz en tiempo real** - Graba mensajes de hasta 30 segundos
- 🔊 **Reproducción con controles avanzados** - Velocidad de reproducción (1x, 1.5x, 2x)
- 🔇 **Detección de silencio** - Validación automática de contenido de audio
- 📡 **Comunicación en tiempo real** - Mensajes instantáneos usando BroadcastChannel API
- 🎨 **Interfaz moderna y responsiva** - Diseño limpio con Tailwind CSS
- 💾 **Persistencia local** - Almacenamiento de sesión en localStorage
- 🔒 **Gestión de permisos** - Solicitud automática de permisos de micrófono
- 📱 **Diseño responsive** - Optimizado para dispositivos móviles y desktop

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Vue 3** - Framework progresivo de JavaScript
- **TypeScript** - Tipado estático para JavaScript
- **Composition API** - API moderna de Vue para lógica reutilizable
- **Pinia** - Gestión de estado moderna para Vue
- **Vue Router** - Enrutamiento oficial de Vue

### Estilos y UI
- **Tailwind CSS** - Framework de CSS utilitario
- **Iconos SVG personalizados** - Iconos optimizados y centralizados

### Audio y Comunicación
- **Web Audio API** - Procesamiento y análisis de audio
- **MediaRecorder API** - Grabación de audio nativa del navegador
- **BroadcastChannel API** - Comunicación en tiempo real entre pestañas
- **AudioContext** - Análisis de contenido de audio y detección de silencio

### Herramientas de Desarrollo
- **Vite** - Herramienta de construcción rápida
- **PostCSS** - Procesamiento de CSS
- **ESLint** - Linting de código

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **pnpm** (recomendado) o **npm**
- Un navegador web moderno con soporte para:
  - Web Audio API
  - MediaRecorder API
  - BroadcastChannel API

## 🚀 Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd chatvoz
   ```

2. **Instala las dependencias**
   ```bash
   # Con pnpm (recomendado)
   pnpm install
   
   # O con npm
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   # Con pnpm
   pnpm dev
   
   # O con npm
   npm run dev
   ```

4. **Abre tu navegador**
   
   Visita `http://localhost:5173` para ver la aplicación.

## 📖 Uso

### Inicio de Sesión
1. Ingresa un nickname (mínimo 3 caracteres, máximo 20)
2. El nickname se guardará automáticamente para futuras sesiones

### Envío de Mensajes de Voz
1. **Concede permisos de micrófono** cuando se solicite
2. **Mantén presionado** el botón de grabación para grabar
3. **Suelta el botón** para enviar el mensaje
4. **Cancela** la grabación presionando el botón de cancelar

### Reproducción de Mensajes
1. **Haz clic en play** para reproducir un mensaje
2. **Ajusta la velocidad** usando los botones 1x, 1.5x, 2x
3. **Navega por el audio** haciendo clic en la barra de progreso

### Comunicación en Tiempo Real
- Los mensajes se sincronizan automáticamente entre pestañas abiertas
- No requiere servidor backend - funciona completamente en el navegador

### 🤖 Simulador de Mensajes
ChatVoz incluye un simulador que genera mensajes de voz entrantes para demostrar la funcionalidad en tiempo real:

#### Activación del Simulador
1. **Ubicación**: Busca el botón "Simular" en la barra superior del chat (ChatHeader)
2. **Activar**: Haz clic en el botón para iniciar la simulación
3. **Indicador visual**: El botón cambia a color verde cuando está activo
4. **Desactivar**: Haz clic nuevamente para detener la simulación

#### Características del Simulador
- **Mensajes automáticos**: Genera mensajes cada 5-15 segundos de forma aleatoria
- **Usuarios simulados**: 5 usuarios diferentes con nombres realistas
- **Variedad de mensajes**: 10 tipos diferentes de mensajes con duraciones de 2-10 segundos
- **Audio sintético**: Genera audio WAV válido que simula voz humana
- **Notificaciones**: Muestra notificaciones toast cuando llegan nuevos mensajes

#### Notificaciones
- **Ubicación**: Aparecen en la esquina superior derecha
- **Contenido**: Muestran el nombre del usuario y la duración del mensaje
- **Duración**: Se ocultan automáticamente después de 3 segundos
- **Tipos**: Notificaciones de mensajes entrantes y cambios de estado del simulador


## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia servidor de desarrollo

# Construcción
pnpm build        # Construye para producción
pnpm preview      # Vista previa de la construcción

      # Verifica tipos de TypeScript
```

## 🌟 Características Técnicas

### Gestión de Audio
- **Validación de contenido**: Detecta automáticamente grabaciones vacías o en silencio
- **Optimización de memoria**: Gestión adecuada de URLs de blob para evitar memory leaks
- **Calidad de audio**: Configuración optimizada para voz humana

### Comunicación en Tiempo Real
- **Sin servidor**: Utiliza BroadcastChannel API para comunicación local
- **Sincronización**: Mensajes sincronizados entre múltiples pestañas
- **Persistencia**: Los mensajes persisten durante la sesión

### Experiencia de Usuario
- **Feedback visual**: Indicadores de estado de grabación y reproducción
- **Validación en tiempo real**: Validación inmediata de entrada de usuario
- **Diseño responsivo**: Adaptado para todos los tamaños de pantalla



## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🐛 Problemas Conocidos

- La aplicación requiere HTTPS en producción para acceder al micrófono
- Algunos navegadores pueden requerir interacción del usuario antes de permitir audio
- La comunicación en tiempo real solo funciona entre pestañas del mismo origen


**Desarrollado con ❤️ usando Vue 3 y tecnologías web modernas**
