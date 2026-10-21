import Image from "next/image";
import HeroBanner from "@/components/HeroBanner";
import { getCategories, getPageContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RoboticsPage() {
  const [page, categories] = await Promise.all([
    getPageContent("robotics"),
    getCategories(),
  ]);

  const paragraphs = page?.paragraphs || [];

  return (
    <>
      <HeroBanner image={page?.heroImage || "/images/hero.png"}>
        <h1 className="text-[34px] font-extrabold leading-[30px] md:text-[48px] md:leading-[36px]">
          {page?.title || "ROBOTICS"}
        </h1>
        <span className="text-xl md:text-[30px]">
          {page?.subtitle || "ALSO A STORY OF LIFE"}
        </span>
        <p className="mt-2 text-sm italic md:text-lg">{page?.description}</p>
      </HeroBanner>

      <section className="px-4 py-10 md:py-20">
        <div className="mx-auto max-w-[1170px] text-center">
          {paragraphs.map((paragraph, i) => {
            const isHeading =
              i === 0 ||
              paragraph.startsWith("“") ||
              paragraph.startsWith('"');
            if (isHeading && (i === 0 || paragraph.startsWith("“") || paragraph.startsWith('"'))) {
              return (
                <h3
                  key={i}
                  className="mb-4 text-xl font-bold text-globo-gray md:text-2xl"
                >
                  {paragraph}
                </h3>
              );
            }
            return (
              <p
                key={i}
                className="mb-4 whitespace-pre-line text-base leading-relaxed text-globo-muted"
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-[1170px] gap-8 md:grid-cols-2">
          {categories.map((category) => (
            <div key={category._id} className="text-center md:text-left">
              <h2 className="mb-3 text-2xl font-bold uppercase text-globo-gray">
                {category.title}
              </h2>
              <Image
                src={category.image}
                alt={category.title}
                width={600}
                height={400}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
