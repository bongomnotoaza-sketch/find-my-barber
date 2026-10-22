# Find My Barber

**Discover your barber. Explore services. Book your next appointment.**

Find My Barber is a web-based barber discovery and appointment-booking platform designed to connect customers with barber businesses through a convenient digital experience.

The platform combines barber discovery, business profiles, service listings, appointment booking, and image-based business content in one application. It aims to simplify how customers find and book barbers while giving barber businesses a digital presence through which they can showcase their work and connect with potential customers.

The project is initially focused on the South African market, with particular relevance to independent barbers and businesses operating in the informal hairdressing industry.

**Live application:** [Find My Barber](https://find-my-barber.onrender.com/)

**Repository:** [GitHub — Find My Barber](https://github.com/bongomnotoaza-sketch/find-my-barber)

---

## 1. The Problem

Finding a suitable barber and arranging an appointment can involve searching through social media, contacting individual businesses, enquiring about prices, and coordinating availability through separate communication channels.

For independent barbers, particularly those operating in the informal sector, establishing a digital presence and managing customer interactions can also present challenges.

Find My Barber aims to bring these activities into a more accessible and organised digital environment.

The project focuses on three main objectives:

- **Simplifying discovery:** Making it easier for customers to discover barber businesses and explore their services.
- **Improving appointment booking:** Providing a structured booking experience that connects customers with their chosen barber.
- **Supporting barber businesses:** Giving barbers a platform to showcase their services, establish a digital presence, and manage customer relationships.

## 2. Product Overview

Find My Barber is designed around two primary user groups.

### Customers

Customers can discover barbers, explore business profiles and services, follow barbers they prefer, and access the appointment-booking experience.

The product prioritises convenience by bringing barber discovery and booking into the same application.

### Barber Businesses

Barbers can establish a business presence, display their services, publish visual content, and connect their profiles with the customer discovery experience.

The broader product direction includes providing barbers with better visibility into their customers, bookings, schedules, and business activity.

The platform is being developed as a Progressive Web App (PWA), allowing users to access it through a browser and install it on supported devices for an app-like experience.

---

## 3. Key Features

The following features are represented in the current application code. Their availability and completeness may vary as development continues.

### Authentication and User Profiles

The application integrates Supabase Authentication to support account registration, login, logout, and session management.

Profile functionality includes:

- User display names.
- Profile biographies.
- Avatar images and profile-image storage.
- Profile setup following registration.
- Password-reset email requests.
- Authentication-state monitoring.

The application also distinguishes between customer and barber profile setup flows.

### Barber Discovery

The discovery experience provides a way to explore barber-related content and access barber profiles.

Current functionality includes:

- A feed of barber posts.
- A feed filtered by followed barbers.
- Search and barber-result components.
- Barber profile navigation.
- Display names and profile images associated with published content.
- Feed pagination and loading states.

The objective is to help customers discover businesses through their services and visual presentation rather than requiring them to rely exclusively on external social media platforms.

### Barber Business Profiles

Barber profiles provide a business-facing presence within the application.

The application includes functionality for barber profile setup and the display of business information.

The broader profile design incorporates business details, contact information, services, and images associated with the barber's establishment.

### Services and Pricing

The application supports service selection as part of the booking process.

Service information includes:

- Service names.
- Service prices.
- Service identifiers.
- Service images in the application interface.

This provides the foundation for customers to explore available services and select the service they intend to book.

### Appointment Booking

Booking functionality connects the selected barber, service, customer, and appointment date.

The booking implementation includes:

- Selection of a barber.
- Selection of a service.
- Selection of a booking date.
- Validation of required booking information.
- Verification of the signed-in user.
- Submission of booking records to Supabase.
- Handling of database errors and unsuccessful booking requests.

Booking records include the customer identifier, barber identifier, service identifier, booking date, customer name, and creation timestamp.

The booking workflow is a central part of the product rather than an additional feature attached to a general social platform.

### Barber Content Publishing

The application supports image-based content associated with barber businesses.

Content functionality includes:

- Post descriptions.
- Post categories.
- Multiple images associated with a post.
- Image ordering within a post.
- Optional music associated with content.
- Retrieval of posts and their associated media.
- Display of the publishing barber's name and avatar.
- Loading and pagination of feed content.

Media is managed through Supabase Storage, while post information and media references are retrieved through the application’s data-access layer.

### Following Barbers

Customers can follow and unfollow barbers.

The application uses following relationships to support a more personalised discovery experience, including a feed that can prioritise content from followed barbers.

This functionality is intended to support customer retention by making preferred barber businesses easier to revisit.

### Progressive Web App

Find My Barber incorporates Progressive Web App functionality through Vite PWA.

The application includes:

- A web app manifest.
- Application icons in multiple sizes.
- Standalone display configuration.
- An installation landing page.
- Browser-supported installation prompts.
- Installation guidance for iOS and other devices.
- Automatic service-worker update configuration.

Users can continue using the application in a browser without installing it.

PWA installation availability and behaviour depend on the browser and device.

---

## 4. Technology Stack

Find My Barber uses a modern JavaScript and TypeScript-based frontend architecture.

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript 6 | Static typing and improved maintainability |
| Vite 8 | Development tooling and production builds |
| Supabase | Authentication, database access, and file storage |
| PostgreSQL | Relational database provided through Supabase |
| Tailwind CSS 4 | Utility-based styling |
| Motion | Interface animations and transitions |
| React Router | Client-side routing capability |
| Lucide React | Interface icons |
| React Icons | Additional icon components |
| Embla Carousel | Carousel functionality |
| vite-plugin-pwa | Progressive Web App configuration |
| ESLint | Code-quality and linting checks |

The dependencies listed above are drawn from the repository's `package.json` and application configuration.

---

## 5. System Architecture

The application uses a frontend-to-backend architecture.

### Frontend

The frontend is built with React and TypeScript.

The main application component coordinates the primary views, authentication state, feed state, profile setup, booking selection, and navigation between application experiences.

Separate components handle responsibilities such as:

- Login and registration.
- Profile setup.
- Barber profile setup.
- Barber discovery and search results.
- Booking interactions.
- Order summaries.
- Content cards.
- Sidebar navigation.
- Policy pages.
- PWA installation.

This component-based structure helps separate interface responsibilities and makes individual parts of the application easier to maintain.

### Application Logic

Database and application operations are separated into dedicated modules under `src/lib/`.

Examples include:

| Module | Responsibility |
|---|---|
| `auth.ts` | Authentication operations and session handling |
| `create_booking.ts` | Booking input validation and booking creation |
| `get_posts.ts` | Post retrieval, media resolution, and feed construction |
| `profiles.ts` | Profile-related operations |
| `barber_profiles.ts` | Barber profile operations |
| `follow.ts` | Following and unfollowing barbers |
| `songs.ts` | Music metadata used by content features |
| `usePwaInstall` | PWA installation-related functionality |

The Supabase client is configured separately and uses Vite environment variables for the project URL and public client key.

### Backend and Data Storage

Supabase provides the application's backend services.

The frontend communicates with Supabase through the official JavaScript client.

The code references data structures for profiles, barber profiles, bookings, posts, post media, and following relationships.

Supabase Storage is used for profile images and post media.

The application also relies on Supabase's authentication system to identify signed-in users.

Database access, authentication requirements, and row-level security policies must be configured appropriately in the Supabase project. The repository alone does not establish that every production database policy is correctly configured.

### High-Level Architecture

```text
                    FIND MY BARBER
                           |
                           v
                React + TypeScript
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        Discovery       Profiles      Booking
        and Feeds       and Media     Workflow
             |             |             |
             +-------------+-------------+
                           |
                           v
                  Supabase JavaScript
                        Client
                           |
              +------------+------------+
              |            |            |
              v            v            v
          Database    Authentication   Storage
          (Postgres)                   (Media)
```

This diagram represents the architectural responsibilities visible in the frontend and its configured backend integration. It is a conceptual overview rather than a complete deployment diagram.

---

## 6. Project Structure

The repository separates application components, reusable logic, static assets, and configuration.

```text
find-my-barber/
├── public/
│   ├── Static assets
│   ├── Application icons
│   └── Other public resources
├── src/
│   ├── components/
│   │   ├── mainarea/
│   │   │   ├── Authentication interfaces
│   │   │   ├── Discovery and search
│   │   │   ├── Booking interfaces
│   │   │   ├── Barber interfaces
│   │   │   └── Content components
│   │   ├── sidebar/
│   │   │   └── Navigation and profile setup
│   │   └── Other reusable components
│   ├── lib/
│   │   ├── Authentication
│   │   ├── Supabase client
│   │   ├── Profile operations
│   │   ├── Booking operations
│   │   ├── Feed and post retrieval
│   │   ├── Following operations
│   │   └── PWA utilities
│   └── App.tsx
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── vite.config.ts
└── README.md
```

This is a conceptual representation of the project structure. Some entries describe the responsibilities of files within a directory rather than literal filenames.

---

## 7. Security and Data Handling

Find My Barber integrates Supabase Authentication and uses a public client configuration in the frontend.

Security considerations include:

- Requiring authentication for operations that need an identified user.
- Validating booking inputs before submitting them.
- Handling unsuccessful authentication and database operations.
- Using environment variables for Supabase configuration.
- Applying appropriate database permissions and Row Level Security policies.
- Restricting access to private user and business information.
- Configuring storage permissions according to the intended visibility of uploaded media.

Client-side validation improves the user experience but does not replace server-side validation or database access controls.

Because browser-delivered environment variables are public, frontend configuration must never contain service-role keys, database passwords, or other privileged credentials.

Security depends on the complete configuration of the application and its backend, not just the frontend source code.

---

## 8. Design Principles

The product is being developed around several practical principles.

### Ease of Use

The main experience should make discovering a barber and booking a service straightforward.

### Business-Centred Design

Barber profiles and content exist to help customers understand and choose a business. The platform's primary purpose is not to reproduce a general-purpose social network.

### Integrated Functionality

Discovery, service information, and booking are intended to work together instead of forcing customers to navigate multiple unrelated systems.

### Maintainability

Reusable React components, TypeScript types, and separated application-logic modules provide a foundation for ongoing development.

### Accessibility Across Devices

The PWA approach is intended to make the application accessible through web browsers while supporting installation on compatible devices.

---

## 9. Current Development Status

Find My Barber is an actively developed product.

The repository contains implementations for authentication, profile setup, barber discovery, content feeds, following relationships, service selection, booking creation, and PWA installation.

The application is still evolving, and not every planned product capability should be considered complete.

The existence of a component or database operation does not by itself establish that the corresponding feature has been fully tested or is operating reliably in production.

The current implementation and the configured Supabase backend should therefore be evaluated together when assessing feature completeness.

---

## 10. Future Development

The product's broader direction includes improvements to the booking experience and tools for barber businesses.

Potential development areas include:

- More complete booking and appointment-management workflows.
- Improved customer and barber booking views.
- Better visibility into barber schedules and customer activity.
- Business-oriented statistics and reporting.
- Improved service presentation and management.
- Further refinement of the PWA experience.
- Additional reliability, validation, and security improvements.
- Future payment integration, subject to implementation and business requirements.

These are development directions rather than a claim that every capability is already available.

---

## 11. Project Ownership and Source Code

Find My Barber is an independently developed software product.

This repository is published to provide visibility into the project and its development.

**Unless a separate licence or written permission states otherwise, no permission is granted to reproduce, redistribute, modify, or commercially exploit this project's source code.**

The public availability of the repository should not be interpreted as a grant of rights to reuse the software.

---

## 12. Summary

Find My Barber is an effort to apply modern web technologies to a practical business problem: connecting customers with barber services through a more convenient discovery and booking experience.

The project brings together frontend engineering, typed application logic, backend integration, authentication, relational data, media storage, and Progressive Web App functionality.

Its long-term objective is to provide a useful digital platform for customers and barber businesses, with particular attention to accessibility, straightforward booking, and the needs of independent barbers.

**Find My Barber — making it easier to find your barber and book your next cut.**
