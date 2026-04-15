# Accesosport Backoffice

Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
UI generada con v0.dev, conectada a un backend Spring Boot 3.4.4.

## Backend
- Base URL: http://localhost:8080 (configurada en .env.local → NEXT_PUBLIC_API_URL)
- Auth: JWT Bearer token — campo `token` en la respuesta de login
- Token se guarda en localStorage con la clave `accessToken`

## Archivos clave
- `lib/api.ts` — cliente HTTP, todas las llamadas al backend
- `lib/auth-context.tsx` — contexto de autenticación (login/logout/user)
- `lib/types.ts` — tipos TypeScript alineados con los DTOs del backend

## Endpoints del backend
```
POST /auth/login           → { id, email, roles, token }
POST /auth/signup          → { id, email, roles, token }

GET  /api/v1/user/me       → UserInformationDto

GET  /api/v1/events                              → EventSummaryResponse[]
GET  /api/v1/events/{id}                         → EventResponse
GET  /api/v1/events/my-events                    → EventSummaryResponse[]  (auth)
POST /api/v1/events                              → EventResponse           (ORGANIZER/ADMIN)
PUT  /api/v1/events/{id}/publish                 → EventResponse           (ORGANIZER/ADMIN)
PUT  /api/v1/events/{id}/open-registration       → EventResponse           (ORGANIZER/ADMIN)
DELETE /api/v1/events/{id}/cancel?reason=...     → EventResponse           (ORGANIZER/ADMIN)
PUT  /api/v1/events/{id}/cover-image             → EventResponse           (multipart, ORGANIZER/ADMIN)
POST /api/v1/events/{id}/images                  → EventImageResponse      (multipart, ORGANIZER/ADMIN)
GET  /api/v1/events/{id}/images                  → EventImageResponse[]
DELETE /api/v1/events/{id}/images/{imageId}      → 204                     (ORGANIZER/ADMIN)

GET  /api/v1/user/profile/organizer              → OrganizerProfileResponse
POST /api/v1/user/profile/organizer              → OrganizerProfileResponse
PUT  /api/v1/user/profile/organizer/logo         → OrganizerProfileResponse (multipart)

GET  /api/v1/user/profile/participant            → ParticipantProfileResponse
POST /api/v1/user/profile/participant            → ParticipantProfileResponse
```

## Estados de evento (EventStatus)
DRAFT → PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → IN_PROGRESS → COMPLETED
                                                             ↘ CANCELLED (desde cualquier estado activo)

## Roles
- ROLE_ADMIN
- ROLE_ORGANIZER
- ROLE_PARTICIPANT

## Errores del backend
Formato RFC 7807 ProblemDetail:
```json
{
  "status": 400,
  "title": "Invalid Image",
  "detail": "Invalid image type. Accepted formats: JPEG, PNG, WebP",
  "timestamp": "2026-03-20T..."
}
```

## Convenciones
- No usar `any` en TypeScript
- Errores del API se manejan con la clase `ApiError` de `lib/api.ts`
- Para multipart (imágenes) no pasar Content-Type header — el browser lo setea automáticamente

## Portal de participante

El mismo app sirve a organizadores y participantes mediante route groups separados:

- `(dashboard)` → organizadores y admins: `/dashboard/**`
- `(portal)` → participantes: `/eventos`, `/perfil`

**Acceso:** Cualquier usuario autenticado puede acceder al portal (no hay restricción de rol en las rutas). El link al portal en el sidebar del dashboard es visible para todos los roles.

**Redirección post-login:** Si el token contiene `ROLE_ORGANIZER` → `/dashboard`. En caso contrario → `/eventos`.

**Capa de datos del portal:**
- `lib/types.ts`: `ShirtSize`, `BloodType`, `ParticipantProfileResponse`, `CreateParticipantProfileRequest`
- `lib/api.ts`: `profile.getParticipant()`, `profile.createParticipant(data)`
