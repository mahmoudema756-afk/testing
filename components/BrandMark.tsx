import Image from "next/image";

export function BrandMark() {
  return <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white p-0.5 shadow-sm ring-1 ring-[var(--must-navy)]/15">
    <Image src="/must-logo.png.webp" alt="Misr University for Science and Technology logo" width={48} height={48} priority className="h-full w-full object-contain" />
  </span>;
}
