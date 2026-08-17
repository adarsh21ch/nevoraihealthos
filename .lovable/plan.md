# Multi-Tenant Performance & Reliability Overhaul

Improve application speed, reliability of the BMI metabolic tool, and ensure seamless data flow between participant sign-ups and the admin dashboard.

## User Experience (Frontend)
- **Fast Tab Transitions**: Review and optimize TanStack Router's `beforeLoad` and `loader` logic to minimize blocking UI.
- **BMI Tool Enhancements**:
  - Add visual feedback for "AI Report Processing" so users know an official report is coming.
  - Optimize the multi-step wizard state management to prevent input lag.
- **Mobile Fluidity**: Ensure all layouts use hardware-accelerated animations (Framer Motion) and avoid layout shifts (CLS).

## Dashboard & Admin Reliability
- **Real-time Synchronization**: Ensure new sign-ups are immediately visible in the Admin Customer List.
- **Admin Dashboard Speed**: Optimize queries in `src/lib/dashboard.functions.ts` by selecting only required columns and ensuring proper indexing on `customers` and `user_roles`.
- **Data Integrity**: Verify that `platform_admins` and `is_app_admin` RPC calls have optimized execution paths.

## Technical Details
- **BMI Report Reliability**: Ensure the `processBmiReport` server function handles Gemini and Resend API failures gracefully with retries or background job logging.
- **Pagination & Egress**: Strict adherence to existing egress optimization rules (read-only columns, 25-item pages).
- **Auth Performance**: Optimize the `beforeLoad` check in `src/routes/dashboard.tsx` to use local storage hints where safe to avoid redundant RPC calls.

## Validation Plan
- **Performance Profiling**: Use browser DevTools to identify and resolve long-running tasks or redundant re-renders.
- **Sync Test**: Perform a test signup and verify instantaneous appearance in the admin list.
- **BMI Accuracy Test**: Verify that Asian-Pacific WHO cutoffs are applied correctly across all age ranges.
