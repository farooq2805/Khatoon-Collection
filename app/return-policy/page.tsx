export default function ReturnPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-10">
        
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Return & Refund Policy
        </h1>

        <p className="text-gray-600 mb-6 text-sm md:text-base">
          At <span className="font-semibold">Khatoon Collection</span>, customer satisfaction is our priority.
          Please read our return and refund policy carefully before making a purchase.
        </p>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Eligibility for Returns
          </h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm md:text-base">
            <li>Products must be returned within <b>7 days</b> of delivery.</li>
            <li>Items must be unused, unopened, and in original packaging.</li>
            <li>Returns are accepted only for damaged, defective, or incorrect products.</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Non-Returnable Items
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Due to hygiene and safety reasons, certain healthcare and personal care products
            are non-returnable once opened or used.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Refund Process
          </h2>
          <p className="text-gray-600 text-sm md:text-base mb-2">
            Once your return is received and inspected, we will notify you about the approval status.
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm md:text-base">
            <li>Approved refunds will be processed within <b>7 working days</b>.</li>
            <li>Refunds will be credited to the original payment method.</li>
            <li>Shipping charges are non-refundable.</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Damaged or Incorrect Products
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            If you receive a damaged or incorrect product, please contact us within 24 hours
            of delivery with clear images of the product and packaging.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Contact Us
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            For any return or refund related queries, feel free to reach out to us:
          </p>
          <div className="mt-3 text-sm md:text-base text-gray-700">
            <p>Email: <span className="font-medium">sale@khatooncollection.in</span></p>
            <p>Customer Support: <span className="font-medium">Mon – Sat, 10 AM – 6 PM</span></p>
          </div>
        </section>

        {/* Footer Note */}
        <div className="border-t pt-4 text-xs md:text-sm text-gray-500">
          Khatoon Collection reserves the right to update or modify this policy at any time
          without prior notice.
        </div>
      </div>
    </div>
  );
}
