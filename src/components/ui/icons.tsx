// Inline copies of the reference app's icons (Lucide house/shopping-bag/user/shield-check/
// circle-check/chevron-down/x/log-out/search/package-search, Ionicons pricetags/chevron-back), so
// the app doesn't pull in an icon library. All decorative.

type IconProps = React.ComponentProps<"svg">;

/** 24×24 outline icon in the Lucide style; build new Lucide copies on it. */
export function StrokeIcon({ strokeWidth = 2, children, ...props }: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function HouseIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={2.4} {...props}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </StrokeIcon>
  );
}

export function ShoppingBagIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M16 10a4 4 0 0 1-8 0" />
      <path d="M3.103 6.034h17.794" />
      <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
    </StrokeIcon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </StrokeIcon>
  );
}

export function PriceTagsIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M448 183.8v-123A44.66 44.66 0 0 0 403.29 16H280.36a30.62 30.62 0 0 0-21.51 8.89L13.09 270.58a44.86 44.86 0 0 0 0 63.34l117 117a44.84 44.84 0 0 0 63.33 0l245.69-245.61A30.6 30.6 0 0 0 448 183.8M352 144a32 32 0 1 1 32-32 32 32 0 0 1-32 32" />
      <path d="M496 64a16 16 0 0 0-16 16v127.37L218.69 468.69a16 16 0 1 0 22.62 22.62l262-262A29.84 29.84 0 0 0 512 208V80a16 16 0 0 0-16-16" />
    </svg>
  );
}

export function ChevronBackIcon(props: IconProps) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="48"
        d="M328 112 184 256l144 144"
      />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </StrokeIcon>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </StrokeIcon>
  );
}

export function CircleCheckIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </StrokeIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </StrokeIcon>
  );
}

export function PackageSearchIcon(props: IconProps) {
  return (
    <StrokeIcon strokeWidth={1.5} {...props}>
      <path d="M12 22V12" />
      <path d="M20.27 18.27 22 20" />
      <path d="M21 10.498V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l.98-.559" />
      <path d="M3.29 7 12 12l8.71-5" />
      <path d="m7.5 4.27 8.997 5.148" />
      <circle cx="18.5" cy="16.5" r="2.5" />
    </StrokeIcon>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </StrokeIcon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </StrokeIcon>
  );
}
