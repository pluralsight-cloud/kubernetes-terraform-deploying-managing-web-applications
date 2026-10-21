import Image from "next/image";
import HeroBanner from "@/components/HeroBanner";
import { getPageContent, getStorySections } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OurStoryPage() {
  const [page, sections] = await Promise.all([
    getPageContent("our-story"),
    getStorySections(),
  ]);

  return (
    <>
      <HeroBanner image={page?.heroImage || "/images/banner.png"}>
        <h1 className="text-[34px] font-extrabold leading-[30px] md:text-[48px] md:leading-[36px]">
          {page?.title || "HUMBLE BEGINNINGS"}
        </h1>
        <span className="text-xl md:text-[30px]">
          {page?.subtitle || "A STORY OF LIFE"}
        </span>
        <p className="mt-2 max-w-2xl text-sm italic md:text-lg">
          {page?.description}
        </p>
      </HeroBanner>

      {sections.map((section, index) => (
        <section
          key={section._id}
          className={`px-4 py-10 md:py-20 ${index % 2 === 1 ? "bg-white" : ""}`}
        >
          <div className="mx-auto max-w-[1170px]">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-8">
                <h3 className="mb-3 text-2xl font-extrabold text-globo-gray">
                  {section.title}
                </h3>
                {section.paragraphs.map((paragraph, i) => {
                  const [maybeTitle, ...rest] = paragraph.split("\n\n");
                  const hasSubheading = rest.length > 0;
                  return (
                    <div key={i} className={i > 0 ? "pt-5" : ""}>
                      {hasSubheading ? (
                        <>
                          <h3 className="mb-3 text-2xl font-extrabold text-globo-gray">
                            {maybeTitle}
                          </h3>
                          <p className="text-base leading-relaxed text-globo-muted">
                            {rest.join("\n\n")}
                          </p>
                        </>
                      ) : (
                        <p className="text-base leading-relaxed text-globo-muted">
                          {paragraph}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-center md:col-span-4 md:text-left">
                <Image
                  src={section.sidebarImage}
                  alt={section.sidebarTitle}
                  width={400}
                  height={300}
                  className="mb-3 w-full"
                />
                <div>
                  <h3 className="text-2xl font-extrabold text-globo-gray">
                    {section.sidebarTitle}
                  </h3>
                  <p className="text-base text-globo-muted">
                    {section.sidebarBody}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
