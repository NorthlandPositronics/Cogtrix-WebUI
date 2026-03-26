interface SidebarLogoProps {
  className?: string;
}

export function SidebarLogo({ className }: SidebarLogoProps) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false" className={className}>
      <path
        className="fill-teal-600"
        fillRule="evenodd"
        d="M 20.495 10.250 L 24.836 12.090 L 24.836 15.910 L 20.495 17.750 L 21.071 22.426 L 17.762 24.335 L 14.000 21.500 L 10.238 24.335 L 6.929 22.426 L 7.505 17.750 L 3.164 15.910 L 3.164 12.090 L 7.505 10.250 L 6.929 5.574 L 10.238 3.665 L 14.000 6.500 L 17.762 3.665 L 21.071 5.574 Z M 16.750 18.763 A 5.5 5.5 0 1 1 16.750 9.237 L 15.250 11.835 A 2.5 2.5 0 1 0 15.250 16.165 Z"
      />
    </svg>
  );
}

export default SidebarLogo;
