import Image from "next/image";

const Blogs = [
  {
    date: "Mon, Oct 13, 25",
    title: "Why Herbal Flavours Taste Different Than Tobacco Flavour?",
    desc: "Herbal hookah flavors offer a lighter, smoother, and more aromatic alternative to tobacco-based shisha...",
    image: "/blog-1.jpeg",
  },
  {
    date: "Wed, Sep 17, 25",
    title: "Can You Mix Different Hookah Flavours Together?",
    desc: "Mixing shisha flavors is not only fun — it lets you explore taste profiles, get artistic, and create new blends...",
    image: "/blog-2.jpeg",
  },
  {
    date: "Fri, Aug 10, 25",
    title: "Best Herbal Hookah Flavours for Beginners",
    desc: "If you're new to herbal smoking, these gentle and refreshing flavours will give the perfect start...",
    image: "/blog-3.jpeg",
  },
];

export default function Blog() {
  return (
    <section className="w-full py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Latest Articles & Blogs
        </h2>

        {/* Blog Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {Blogs.map((item, i) => (
            <div
              key={i}
              className="group bg-white rounded-xl shadow-md hover:shadow-2xl border overflow-hidden transition-all"
            >
              {/* Image */}
              <div className="relative w-full h-56">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-all duration-500"
                />

                <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-md">
                  {item.date}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition">
                  {item.title}
                </h3>

                <p className="text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {item.desc}
                </p>

                <button className="mt-4 inline-block px-6 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white font-semibold transition">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
