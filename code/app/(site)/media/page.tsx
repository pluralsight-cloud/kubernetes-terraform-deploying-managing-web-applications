import Image from "next/image";
import HeroBanner from "@/components/HeroBanner";
import { getMediaItems, getPageContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const [page, items] = await Promise.all([
    getPageContent("media"),
    getMediaItems(),
  ]);

  return (
    <>
      <HeroBanner image={page?.heroImage || "/images/banner3.png"}>
        <h1 className="text-[34px] font-extrabold leading-[30px] md:text-[48px] md:leading-[36px]">
          {page?.title || "WATCH THIS VIDEO"}
        </h1>
        <span className="text-xl md:text-[30px]">
          {page?.subtitle || "WE DO THINGS IN IT"}
        </span>
        <p className="mt-2 text-sm italic md:text-lg">
          <span className="mr-2 inline-block">▶</span>
          {page?.description || "Click for inspiration at cosmic levels"}
        </p>
      </HeroBanner>

      {items.map((item) => {
        const imageLeft = item.layout === "image-left";
        return (
          <section key={item._id} className="px-4 py-10 md:py-16">
            <div className="mx-auto max-w-[1170px]">
              <div
                className={`grid items-start gap-8 md:grid-cols-12 ${
                  imageLeft ? "" : ""
                }`}
              >
                <div
                  className={`md:col-span-4 ${
                    imageLeft ? "order-1" : "order-2 max-md:hidden"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="w-full"
                  />
                </div>
                <div
                  className={`md:col-span-8 ${
                    imageLeft ? "order-2" : "order-1"
                  }`}
                >
                  <div className="mb-4 md:hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={300}
                      className="w-full"
                    />
                  </div>
                  <h3 className="mb-3 text-2xl font-extrabold text-globo-gray">
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed text-globo-muted">
                    {item.body}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
