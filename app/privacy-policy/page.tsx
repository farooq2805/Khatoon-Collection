export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-10">
        
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>

        <p className="text-gray-600 mb-6 text-sm md:text-base">
          At <span className="font-semibold">Khatoon Collection</span>, we value your privacy and are
          committed to protecting your personal information. This policy explains how we collect,
          use, and safeguard your data.
        </p>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Information We Collect
          </h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm md:text-base">
            <li>Personal details such as name, phone number, email address, and shipping address.</li>
            <li>Payment-related information processed securely through trusted payment gateways.</li>
            <li>Browsing data including IP address, device information, and website usage patterns.</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm md:text-base">
            <li>To process and deliver your orders efficiently.</li>
            <li>To communicate order updates, offers, and important service information.</li>
            <li>To improve our website, services, and customer experience.</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Data Security
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            We implement industry-standard security measures to protect your personal data against
            unauthorized access, disclosure, alteration, or misuse.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Sharing of Information
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            We do not sell, trade, or rent your personal information to third parties. Information
            may be shared only with trusted service providers for order fulfillment and support.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Cookies & Tracking Technologies
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Our website may use cookies to enhance user experience, analyze website traffic, and
            personalize content. You can manage cookie preferences through your browser settings.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Your Rights
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            You have the right to access, update, or request deletion of your personal information
            by contacting our support team.
          </p>
        </section>

        {/* Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Contact Us
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            If you have any questions or concerns regarding this Privacy Policy, please contact us:
          </p>
          <div className="mt-3 text-sm md:text-base text-gray-700">
            <p>Email: <span className="font-medium">sale@khatooncollection.in</span></p>
            <p>Customer Support: <span className="font-medium">Mon – Sat, 10 AM – 6 PM</span></p>
          </div>
        </section>

        {/* Footer Note */}
        <div className="border-t pt-4 text-xs md:text-sm text-gray-500">
          Khatoon Collection reserves the right to update or modify this privacy policy at any time
          without prior notice.
        </div>
      </div>
    </div>
  );
}
