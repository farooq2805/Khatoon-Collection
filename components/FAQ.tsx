"use client";
import { useState } from "react";

export default function FAQ() {
const [active, setActive] = useState<number | null>(null);

  const faqs = [
    {
      q: "Are herbal smokes safe?",
      a: "Herbal smokes are tobacco-free and nicotine-free. They are made from natural herbs. While safer than tobacco, any smoke may irritate lungs. Always consume responsibly.",
    },
    {
      q: "Do herbal smokes contain nicotine?",
      a: "No. Herbal smokes contain 0% nicotine and 0% tobacco. They are made from herbs like mint, lavender, rose petals, chamomile and clove.",
    },
    {
      q: "Can herbal smokes help quit smoking?",
      a: "Yes. Many people use them as a transition to quit smoking since they offer the same smoking ritual without nicotine addiction.",
    },
    {
      q: "Do herbal smokes get you high?",
      a: "No. There is no THC or psychoactive substance. They are only for aroma and relaxation.",
    },
    {
      q: "Are herbal smokes legal?",
      a: "Yes. They are legal in most countries because they do not contain tobacco, nicotine, or illegal substances.",
    },
  ];

  return (
    <section className="w-full py-16 bg-white text-black">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-10">
          Herbal Smokes – FAQ
        </h2>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="border border-gray-700 rounded-lg"
            >
              <button
                onClick={() => setActive(active === i ? null : i)}
                className="w-full flex justify-between items-center text-left px-4 py-3 font-semibold"
              >
                <span>{item.q}</span>
                <i
                  className={`ri-arrow-down-s-line transition-transform ${
                    active === i ? "rotate-180" : ""
                  }`}
                ></i>
              </button>

              {active === i && (
                <div className="px-4 pb-4 text-gray-900">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
