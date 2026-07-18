import Image from "next/image";

type ProductFrameProps = {
  src: string;
  alt: string;
  label?: string;
  priority?: boolean;
  className?: string;
};

export function ProductFrame({
  src,
  alt,
  label,
  priority = false,
  className = "",
}: ProductFrameProps) {
  return (
    <figure className={`product-frame ${className}`}>
      <div className="product-frame__glow" aria-hidden="true" />
      <div className="product-frame__screen">
        <Image
          src={src}
          alt={alt}
          width={430}
          height={932}
          priority={priority}
          sizes="(max-width: 768px) 88vw, 430px"
        />
      </div>
      {label ? <figcaption>{label}</figcaption> : null}
    </figure>
  );
}
