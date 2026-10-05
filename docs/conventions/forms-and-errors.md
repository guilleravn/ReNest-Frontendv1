# Forms, validation, errors and UI states

## Forms and validation

- ✅ Native HTML + Server Action + `useActionState`. The action state is a discriminated union
  (see `SubmitState` in [typescript.md](typescript.md)). Put the submit button in a child using
  `useFormStatus`, or use the `isPending` from `useActionState`, to set `disabled` and prevent
  double submits.
- ✅ Validate with zod **on the server, always** (`safeParse` over `FormData`); on the client
  only as a UX enhancement. Schemas live in `schemas.ts` and are reused on both sides.
- ✅ Return `fieldErrors` (`z.flattenError(result.error).fieldErrors`) and keep the entered
  values when re-rendering (`defaultValue`).
- ✅ Uncontrolled inputs (`name` + `defaultValue`) by default; controlled (`value` + `onChange`)
  only if the UI reacts to every keystroke. ❌ mixing `value` and `defaultValue`.
- ✅ Every field has a `<label htmlFor>` (or a wrapping label); errors linked with
  `aria-describedby` and `aria-invalid`; radio groups in `fieldset` + `legend`; explicit
  `<button type="submit">`.
- ❌ Relying on `hidden` inputs or client-side validation for anything security-related.
- ❌ `redirect()`/`notFound()` inside `try/catch` (they throw on purpose): call them outside, or
  re-throw with `unstable_rethrow`.

```tsx
// actions.ts
"use server";
export async function createListingAction(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const result = createListingSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }
  await createListing(result.data);
  revalidatePath("/listings");
  redirect("/listings");
}
```

## Error handling and UI states

Every data view covers **loading, empty, error and success** (at minimum, the ones the
acceptance criteria name).

- ✅ Loading: the segment's `loading.tsx` or `<Suspense fallback={<XSkeleton />}>` as close as
  possible to the slow data. Skeletons match the final content's dimensions (no layout shift).
- ✅ Render errors: `error.tsx` per segment (it is a Client Component: needs `"use client"`),
  with the message in `role="alert"` and a retry button. Check the Next 16 docs for its exact
  props.
- ✅ Missing resource: `notFound()` + `not-found.tsx`, not a generic error.
- ✅ Expected errors (validation, business 4xx) are **returned** as state (`{ status: "error" }`);
  unexpected ones are **thrown** and caught by the boundary.
- ✅ `ApiError` (from `lib/api/errors.ts`) is translated into a user message at the edge (action
  or page); ❌ showing raw `error.message`, stacks or backend bodies.
- ✅ Empty: an explicit message and, if there is one, the next action ("No listings yet" + CTA).
- ❌ Empty `catch {}` or one that only does `console.log`; ❌ wrapping everything in `try` "just
  in case".
- Boundary order when composing by hand: error boundary **outside**, `<Suspense>` inside.
