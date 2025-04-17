# Services Directory

This directory contains centralized service modules that handle all database operations and external API calls. Each service module should follow the same pattern:

1. A class that encapsulates related functionality
2. Methods that handle specific operations
3. Proper error handling and type safety

## Service Modules

- `event-service.ts` - Handles all operations related to events (formerly rides)
- `registration-service.ts` - Handles all operations related to event registrations (formerly bookings)
- `user-service.ts` - Handles all operations related to users and authentication
- `payment-service.ts` - Handles all operations related to payments

## Guidelines

When implementing or modifying services:

1. Use proper TypeScript typing
2. Include comprehensive error handling
3. Document complex logic
4. Write reusable, testable code
5. Keep business logic separate from UI components

## Example Usage

```typescript
// In a component or page
import { EventService } from '@/lib/services/event-service';

// Create an instance with the supabase client
const eventService = new EventService(supabase);

// Use the service methods
const events = await eventService.getUpcomingEvents();
```
