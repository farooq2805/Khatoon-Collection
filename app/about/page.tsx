export default function AboutUs() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            About Khatoon Collection
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
           Celebrating modest fashion with elegance, comfort, and timeless style for modern women.


          </p>
        </div>

        {/* Our Story */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Our Story
          </h2>
          <p className="text-gray-600 leading-relaxed">
           Khatoon Collection was founded with a passion for creating modest wear that blends tradition with contemporary fashion. Our aim is to provide beautifully crafted clothing that empowers women to express their style with confidence and grace.


          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-2">Our Mission</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To design and deliver elegant, comfortable, and high-quality modest fashion that reflects individuality and cultural values.


            </p>
          </div>

          <div className="border rounded-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-2">Our Vision</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
             To become a trusted and loved modest fashion brand, known for style, quality craftsmanship, and customer satisfaction across India.


            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Why Choose Khatoon Collection?
          </h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Premium fabrics with comfortable fits</li>
            <li>Thoughtfully designed modest fashion</li>
            <li>Made in India with attention to detail</li>
            <li>Affordable elegance for everyday and special occasions</li>
          </ul>
        </section>

        {/* Values */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-1">Elegance</h4>
              <p className="text-sm text-gray-600">
                Designs that reflect grace, simplicity, and timeless beauty.


              </p>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-1">Quality</h4>
              <p className="text-sm text-gray-600">
                Carefully selected fabrics and finishing for lasting comfort.


              </p>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-1">Respect</h4>
              <p className="text-sm text-gray-600">
                Honoring cultural values and personal style choices.


              </p>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-1">Creativity</h4>
              <p className="text-sm text-gray-600">
                Constantly evolving designs to match modern fashion trends.


              </p>
            </div>
          </div>
        </section>

        {/* Closing */}
        <div className="border-t pt-6 text-sm text-gray-600 text-center">
          Khatoon Collection is dedicated to empowering women through modest fashion that feels confident, comfortable, and beautifully you.

        </div>

      </div>
    </div>
  );
}
