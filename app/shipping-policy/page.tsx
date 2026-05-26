export default function ShippingPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-10">
        
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Shipping Policy
        </h1>

        <p className="text-gray-600 mb-6 text-sm md:text-base">
          At <span className="font-semibold">Khatoon Collection</span>, we are committed to delivering
          your healthcare products safely and on time. Please review our shipping policy below.
        </p>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Shipping Locations
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            We currently ship across India. International shipping is not available at this time.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Order Processing Time
          </h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm md:text-base">
            <li>Orders are processed within <b>1–2 business days</b> after payment confirmation.</li>
            <li>Orders placed on weekends or holidays will be processed the next business day.</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Shipping Delivery Time
          </h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm md:text-base">
            <li>Standard delivery time is <b>3–7 business days</b> depending on your location.</li>
            <li>Delivery times may vary due to weather, courier delays, or remote locations.</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Shipping Charges
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Shipping charges, if applicable, will be calculated and displayed at checkout before
            placing your order.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Order Tracking
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Once your order is shipped, tracking details will be shared via email or SMS
            to help you monitor your delivery status.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Delayed or Lost Shipments
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            In case of delayed or lost shipments, please contact our customer support team.
            We will assist you promptly to resolve the issue.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Contact Us
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            For any shipping-related queries, feel free to contact us:
          </p>
          <div className="mt-3 text-sm md:text-base text-gray-700">
            <p>Email: <span className="font-medium">sale@khatooncollection.in</span></p>
            <p>Customer Support: <span className="font-medium">Mon – Sat, 10 AM – 6 PM</span></p>
          </div>
        </section>

        {/* Footer Note */}
        <div className="border-t pt-4 text-xs md:text-sm text-gray-500">
          Khatoon Collection reserves the right to update or modify this shipping policy at any time
          without prior notice.
        </div>
      </div>
    </div>
  );
}
