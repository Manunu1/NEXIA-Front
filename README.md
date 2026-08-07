[Nexia.md](https://github.com/user-attachments/files/30828447/Nexia.md)

# Nexia

> **Plataforma educativa virtual para centralizar la gestión académica, la comunicación y el acompañamiento del aprendizaje.**

Nexia es una plataforma educativa virtual pensada para instituciones educativas. Su objetivo es unificar en un solo entorno las herramientas que alumnos, profesores y gestores necesitan para organizar la vida académica, comunicarse y realizar un seguimiento del proceso de aprendizaje.

El proyecto fue desarrollado como trabajo final por un equipo de cinco estudiantes de la especialidad Informática de **ORT Argentina**, integrando desarrollo de software, diseño UX/UI, arquitectura, bases de datos, testing, seguridad y planificación de producto.

---

## Índice

- [Problema que resuelve](#problema-que-resuelve)
- [¿Qué es Nexia?](#qué-es-nexia)
- [Roles](#roles)
  - [Alumno](#alumno)
  - [Profesor](#profesor)
  - [Gestor](#gestor)
- [Nexia IA](#nexia-ia)
- [Personalización por institución](#personalización-por-institución)
- [Arquitectura del Frontend](#arquitectura-del-frontend)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Autenticación y rutas protegidas](#autenticación-y-rutas-protegidas)
- [Sistema de diseño](#sistema-de-diseño)
- [Tecnologías](#tecnologías)
- [Comunicación con Backend](#comunicación-con-backend)
- [Funcionalidades principales](#funcionalidades-principales)
- [Equipo](#equipo)
- [Metodología de trabajo](#metodología-de-trabajo)
- [GitHub](#github)
- [Uso de inteligencia artificial](#uso-de-inteligencia-artificial)
- [Estado del proyecto](#estado-del-proyecto)
- [Próximos pasos](#próximos-pasos)
- [Proyecto Final ORT Argentina](#proyecto-final-ort-argentina)

---

## Problema que resuelve

En muchas instituciones educativas, la información académica suele estar distribuida en múltiples herramientas: plataformas de contenidos, sistemas de calificaciones, canales de comunicación y herramientas de gestión administrativa independientes.

Esto puede generar desorganización, pérdida de contexto y dificultades para realizar un seguimiento integral del progreso de los estudiantes.

**Nexia surge para resolver este problema**, centralizando en una única plataforma las principales herramientas necesarias para la gestión educativa, la comunicación y el acompañamiento del aprendizaje.

---

## ¿Qué es Nexia?

Nexia funciona como un **campus virtual integral** para instituciones educativas.

La plataforma adapta sus funcionalidades según el rol del usuario, permitiendo que alumnos, profesores y gestores accedan a las herramientas correspondientes a sus necesidades.

El objetivo es que cada integrante de la comunidad educativa pueda encontrar en un mismo lugar las herramientas necesarias para desarrollar sus actividades, sin depender de múltiples plataformas independientes.

---

# Roles

## Alumno

Los alumnos pueden acceder a sus materias, contenidos y actividades desde un único lugar.

### Funcionalidades principales

- Visualización de materias.
- Acceso a contenidos educativos.
- Trabajos prácticos.
- Entrega y consulta de trabajos.
- Boletín y calificaciones.
- Apuntes personales.
- Calendario académico.
- Comunicados institucionales.
- Mensajería.
- Acceso a Nexia IA.

---

## Profesor

Los profesores cuentan con herramientas para gestionar sus materias y acompañar el aprendizaje de sus alumnos.

### Funcionalidades principales

- Gestión de materias asignadas.
- Creación y publicación de contenidos.
- Creación y edición de trabajos prácticos.
- Corrección de entregas.
- Carga de notas.
- Seguimiento de actividades.
- Comunicación con alumnos.
- Organización mediante calendario.

---

## Gestor

El gestor administra diferentes aspectos de la institución desde la plataforma.

### Funcionalidades principales

- Creación de cuentas de alumnos.
- Creación de profesores.
- Asignación de materias.
- Gestión de comunicados institucionales.
- Administración general del campus.

---

# Nexia IA

Una de las características principales de Nexia es **Nexia IA**, un asistente diseñado específicamente para acompañar el aprendizaje.

A diferencia de un chatbot tradicional, su objetivo no es únicamente proporcionar respuestas, sino **guiar el proceso de razonamiento del estudiante**.

La propuesta busca que el alumno pueda comprender el contenido y desarrollar su propia respuesta, en lugar de utilizar la inteligencia artificial simplemente para resolver una consigna.

Además, Nexia IA puede trabajar con contenido propio de las materias, acercando la asistencia al contexto educativo real de la institución.

### Objetivo

> **Utilizar la inteligencia artificial como una herramienta de acompañamiento educativo y no simplemente como un generador de respuestas.**

---

# Personalización por institución

Nexia está pensada como una plataforma adaptable a distintas instituciones educativas.

Cada institución puede personalizar su identidad visual mediante:

| Elemento | Personalización |
|---|---|
| Logo | Logo institucional |
| Color principal | Color principal de la institución |
| Color secundario | Color complementario |
| Color de acento | Elementos destacados de la interfaz |

El sistema de temas permite aplicar esta identidad de manera consistente en diferentes partes de la plataforma.

Esto permite que una misma plataforma pueda adaptarse a diferentes instituciones manteniendo su propia identidad visual.

> Nexia está concebida con una lógica tipo SaaS, donde diferentes instituciones pueden utilizar la plataforma como su propio campus virtual.

---

# Arquitectura del Frontend

El frontend está desarrollado como una **Single Page Application (SPA)** utilizando React, TypeScript y Vite.

La estructura del proyecto está organizada principalmente por dominios y roles, separando las vistas específicas de alumnos, profesores y gestores de los componentes e infraestructura compartidos.

```text
src/
├── Paginas/
│   ├── Alumnos/
│   ├── Profesores/
│   ├── Gestor/
│   └── ...
│
├── Componentes/
│   ├── Sidebar/
│   ├── ProtectedRoute/
│   ├── Modal/
│   ├── ConfirmDialog/
│   ├── EmptyState/
│   ├── Markdown/
│   └── ...
│
├── Types/
├── hooks/
├── utils/
├── assets/
└── api.ts
```

Esta organización permite mantener separadas las responsabilidades de cada parte del sistema y facilita la incorporación de nuevas funcionalidades.

---

# Estructura del proyecto

## `Paginas`

Contiene las vistas principales de la aplicación.

Las funcionalidades específicas están organizadas principalmente según el rol:

```text
Paginas/
├── Alumnos/
├── Profesores/
├── Gestor/
└── ...
```

También existen páginas correspondientes a funcionalidades transversales como:

- Login.
- Landing Page.
- Calendario.
- Mensajes.
- Comunicados.
- Nexia IA.
- Acceso denegado.

---

## `Componentes`

Contiene los componentes reutilizables de la interfaz.

Entre ellos se encuentran:

- `Sidebar`
- `Footer`
- `Modal`
- `ConfirmDialog`
- `EmptyState`
- `Markdown`
- `ProtectedRoute`
- Componentes relacionados con materias.
- Componentes específicos de cada rol.

La reutilización de componentes permite mantener una interfaz consistente y evitar duplicación de lógica y estilos.

---

## `Types`

Contiene las definiciones de tipos e interfaces utilizadas por la aplicación.

```text
src/Types/
```

---

## `hooks`

Contiene hooks personalizados utilizados para encapsular lógica reutilizable.

```text
src/hooks/
```

---

## `utils`

Contiene utilidades generales de la aplicación.

Entre ellas se encuentran herramientas relacionadas con:

- Sesión.
- Temas.
- Identidad visual de materias.

```text
src/utils/
```

---

## `api.ts`

La comunicación con el backend se centraliza mediante:

```text
src/api.ts
```

Este archivo funciona como una capa de abstracción para las llamadas al servidor y permite mantener la lógica de comunicación separada de las vistas y componentes.

---

# Autenticación y rutas protegidas

Nexia cuenta con un sistema de autenticación, manejo de sesión y protección de rutas.

Algunos de los elementos principales son:

```text
src/Paginas/Login/
src/Componentes/Logout/
src/utils/session.ts
src/Componentes/ProtectedRoute/
src/Paginas/AccesoDenegado/
```

Las rutas protegidas permiten controlar el acceso a diferentes partes de la plataforma.

La navegación se configura de forma centralizada mediante:

```text
src/Componentes/Sidebar/navConfig.tsx
```

Esto permite definir las opciones de navegación correspondientes a cada contexto de usuario.

---

# Sistema de diseño

Nexia utiliza un sistema de temas para mantener la consistencia visual de la plataforma y permitir la personalización institucional.

Los principales elementos relacionados con este sistema son:

```text
src/utils/theme.ts
src/utils/materiaTheme.ts
src/Componentes/MateriaIdentity/
```

El sistema permite adaptar colores y estilos según la institución o la materia correspondiente.

El frontend busca mantener:

- Jerarquía visual clara.
- Componentes reutilizables.
- Consistencia visual.
- Espaciado y organización.
- Adaptabilidad a diferentes tamaños de pantalla.
- Una experiencia visual moderna y profesional.

---

# Tecnologías

| Tecnología | Uso |
|---|---|
| **React** | Construcción de la interfaz y componentes |
| **TypeScript** | Tipado y desarrollo del frontend |
| **Vite** | Desarrollo y build de la aplicación |
| **NPM** | Gestión de dependencias |
| **CSS** | Estilos e interfaz |
| **ESLint** | Análisis y calidad del código |

> Las tecnologías y librerías indicadas aquí corresponden a las que pudieron verificarse en la estructura disponible del repositorio.

---

# Comunicación con Backend

El frontend se comunica con el backend mediante una capa centralizada:

```text
src/api.ts
```

Esta separación permite aislar la lógica de comunicación con el servidor del resto de la aplicación y facilita el mantenimiento de las llamadas al backend.

---

# Funcionalidades principales

Nexia integra diferentes áreas de la experiencia educativa:

| Área | Funcionalidades |
|---|---|
| **Gestión académica** | Materias y contenidos |
| **Actividades** | Trabajos prácticos y formularios |
| **Evaluación** | Notas y boletín |
| **Seguimiento** | Información académica del alumno |
| **Comunicación** | Mensajes y comunicados |
| **Organización** | Calendario |
| **Personal** | Apuntes personales |
| **Administración** | Alumnos, profesores y asignaciones |
| **Inteligencia artificial** | Nexia IA |
| **Personalización** | Identidad visual institucional |

---

# Equipo

El proyecto fue desarrollado por un equipo de cinco estudiantes de la especialidad Informática de **ORT Argentina**.

| Integrante | Áreas principales |
|---|---|
| **Uriel Galanti** | Frontend, diseño y plan de negocio |
| **Manuel Mandel** | Backend y frontend |
| **Zoe Acquistapace** | Backend, frontend, diseño y seguridad |
| **Felipe Andracca** | Base de datos, backend y testing |
| **Matías Naddeo** | Testing |

Los roles representan las principales áreas de especialización de cada integrante, pero **no fueron responsabilidades exclusivas**.

Todo el equipo participó en la definición de funcionalidades, estructura, ideas de producto y decisiones relacionadas con la evolución de Nexia.

---

# Metodología de trabajo

El desarrollo se realizó de forma iterativa, utilizando ciclos de planificación, desarrollo, demostración y revisión.

```text
Análisis del estado actual
          ↓
      Planificación
          ↓
        Desarrollo
          ↓
           Demo
          ↓
         Revisión
          ↓
        Mejoras
          ↓
      Nuevo ciclo
```

El equipo cuenta con tutores dentro del colegio y realiza **Demos periódicas**.

Antes de cada Demo se analiza el estado del proyecto y se definen los objetivos y funcionalidades que se buscarán desarrollar durante el siguiente período.

Durante la Demo se presentan los resultados obtenidos, se revisa qué objetivos fueron cumplidos y se identifican oportunidades de mejora.

El trabajo diario se organizó de manera flexible. Dependiendo de la complejidad, las tareas podían realizarse individualmente o en duplas, incluyendo trabajo fuera del horario escolar cuando era necesario.

---

# GitHub

GitHub se utilizó como repositorio central para almacenar y mantener actualizado el código del proyecto.

Todos los integrantes participaron activamente en el repositorio.

El flujo de trabajo utilizado se basó principalmente en:

```text
Desarrollo
    ↓
Commit
    ↓
Pull Request
    ↓
Integración
```

El equipo no utilizó branches como parte de su flujo habitual, pero sí utilizó **Pull Requests** para integrar cambios.

---

# Uso de inteligencia artificial

Durante el desarrollo se utilizaron herramientas de inteligencia artificial como apoyo al trabajo del equipo.

### Herramientas utilizadas

- [Claude](https://claude.ai/)
- [ChatGPT](https://chatgpt.com/)
- [Gemini](https://gemini.google.com/)

### Principales usos

- Investigación.
- Resolución de errores.
- Aprendizaje de tecnologías y procedimientos.
- Generación de recursos gráficos.
- Asistencia en desarrollo.
- Exploración de soluciones.

En determinados momentos también se utilizaron agentes de Claude para asistir directamente en el desarrollo de funcionalidades y acelerar el trabajo.

La inteligencia artificial fue utilizada como **herramienta de apoyo**, mientras que las decisiones relacionadas con el producto, las funcionalidades, la estructura y la dirección general de Nexia fueron tomadas colaborativamente por el equipo.

---

# Estado del proyecto

El frontend cuenta con una base funcional y organizada, con una separación clara entre dominios y roles.

Actualmente incluye diferentes flujos para alumnos, profesores y gestores, además de funcionalidades transversales como:

- Calendario.
- Mensajería.
- Comunicados.
- Nexia IA.
- Personalización visual.
- Autenticación y rutas protegidas.

La arquitectura está preparada para continuar incorporando funcionalidades y mejoras a medida que evoluciona el proyecto.

---

# Próximos pasos

El proyecto continúa en evolución.

Entre las principales líneas de desarrollo se encuentran:

- Ampliación de funcionalidades académicas.
- Mejora de la experiencia de usuario.
- Evolución de Nexia IA.
- Ampliación de las herramientas de seguimiento.
- Fortalecimiento de la administración institucional.
- Evolución de la integración con el backend.
- Incorporación de nuevas herramientas para la comunidad educativa.

---

# Proyecto Final ORT Argentina

Nexia fue desarrollado como **proyecto final por estudiantes de la especialidad Informática de ORT Argentina**.

El proyecto combina:

```text
Software Development
        +
UX/UI Design
        +
Backend
        +
Database
        +
Testing
        +
Security
        +
Product Strategy
        +
Artificial Intelligence
```

Más allá de la aplicación desarrollada, Nexia busca explorar cómo la tecnología puede ayudar a las instituciones educativas a centralizar sus procesos y acompañar de manera más efectiva el aprendizaje.

---

## Equipo

**Uriel Galanti**  
Frontend · Diseño · Plan de negocio

**Manuel Mandel**  
Backend · Frontend

**Zoe Acquistapace**  
Backend · Frontend · Diseño · Seguridad

**Felipe Andracca**  
Base de datos · Backend · Testing

**Matías Naddeo**  
Testing

---

<p align="center">
  <strong>Nexia</strong><br>
  <em>Una plataforma para conectar la comunidad educativa.</em>
</p>
