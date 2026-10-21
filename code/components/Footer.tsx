import Image from "next/image";
import Link from "next/link";

const primaryLinks = [
  { href: "/our-story", label: "Our Story" },
  { href: "#", label: "Brands" },
  { href: "/robotics", label: "Robotics" },
  { href: "/media", label: "Media" },
  { href: "#", label: "Support" },
];

const secondaryLinks = [
  { href: "#", label: "Careers" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Media Inquiries" },
  { href: "#", label: "Help" },
];

export default function Footer() {
  return (
    <footer className="relative min-h-[320px] overflow-hidden bg-globo-footer md:min-h-[350px]">
      <div className="mx-auto w-full max-w-[1170px] px-4">
        <div className="flex flex-wrap items-start">
          <div className="w-1/6 py-[35px] md:w-1/4 md:py-[70px]">
            <Link href="/">
              <Image
                src="/images/Globo-Logo-white-footer.svg"
                alt="Globomantics"
                width={180}
                height={40}
                className="hidden max-w-[180px] lg:block"
              />
              <Image
                src="/images/G.png"
                alt="Globomantics"
                width={48}
                height={48}
                className="block lg:hidden"
              />
            </Link>
          </div>
          <div className="w-5/6 py-[35px] md:w-5/12 md:py-[66px]">
            <div className="flex flex-wrap">
              <ul className="w-1/2 list-none p-0 md:w-1/2">
                {primaryLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm leading-[34px] text-globo-gray"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="w-1/2 list-none p-0 md:w-1/2">
                {secondaryLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm leading-[34px] text-globo-gray"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-black px-5 pb-24 pt-5 text-white md:absolute md:right-0 md:top-0 md:w-1/3 md:max-w-[380px]">
        <div className="text-center">
          <Image
            src="/images/pluralsight-white.png"
            alt="Pluralsight"
            width={200}
            height={40}
            className="mx-auto w-[70%]"
          />
        </div>
        <span className="ps-gradient my-[30px] block h-px w-full" />
        <p className="text-base leading-[35px]">
          This site is created for demonstrative purposes only and does not
          offer any real products or services.
        </p>
      </div>
    </footer>
  );
}
