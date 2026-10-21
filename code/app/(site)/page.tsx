import Image from "next/image";
import Link from "next/link";
import ConferenceSignup from "@/components/ConferenceSignup";
import HeroBanner from "@/components/HeroBanner";
import {
  getActiveEvent,
  getPageContent,
  getProducts,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [page, products, event] = await Promise.all([
    getPageContent("home"),
    getProducts("home"),
    getActiveEvent(),
  ]);

  return (
    <>
      <HeroBanner image={page?.heroImage || "/images/hero-image.png"}>
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="md:w-2/3">
            <h1 className="text-left text-[34px] font-extrabold leading-[30px] text-white md:text-[56px] md:leading-[45px]">
              {page?.title || "THE FUTURE"}
              <br />
              <span className="text-[20px] font-normal md:text-[36px]">
                {page?.subtitle || "WAS FIVE MINUTES AGO"}
              </span>
              .
            </h1>
            <p className="mt-2 text-sm italic md:text-lg">
              {page?.description || "We were there and it is going to be epic"}
            </p>
          </div>
          <div className="mt-4 w-full rounded bg-[#0b4970b3] p-3 md:mt-0 md:w-1/3 md:bg-transparent md:p-0">
            {event ? (
              <ConferenceSignup
                title={event.title}
                subtitle={event.subtitle}
                description={event.description}
                ctaLabel={event.ctaLabel}
                eventId={event._id}
              />
            ) : (
              <ConferenceSignup
                title="FUTURE"
                subtitle="CONFERENCE"
                description="Tickets are selling fast get yours today and be there in the future"
                ctaLabel="SIGN UP TODAY"
              />
            )}
          </div>
        </div>
      </HeroBanner>

      <section className="px-4 py-10 md:py-20">
        <div className="mx-auto max-w-[1170px]">
          <div className="grid gap-8 md:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="relative text-center md:text-left"
              >
                <h3 className="text-2xl font-extrabold text-globo-gray">
                  {product.title}
                </h3>
                <p className="pb-2.5 text-base text-globo-muted">
                  {product.tagline}
                </p>
                <div className="relative mb-14">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={400}
                    height={300}
                    className="w-full"
                  />
                  <div className="absolute bottom-7 left-0 right-0 text-center">
                    <Link href={product.link} className="btn-oval">
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
