import Image from "next/image";

export default function Banner() {
  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
      <Image
        src="/banner.jpeg"    // place inside /public/banner.jpg
        alt="Banner"
        fill
        className="object-cover"
        priority
      />
    </section>
  );
}
