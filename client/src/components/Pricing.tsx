
import React from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "₹50",
      features: [
        "2 Image transformations",
        "High-quality output",
        "Download your creations",
        "Valid for 7 days"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Standard",
      price: "₹100",
      features: [
        "5 Image transformations",
        "High-quality output",
        "Download your creations",
        "Priority processing",
        "Valid for 30 days"
      ],
      buttonText: "Best Value",
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-16 bg-ghibli-clouds bg-contain bg-no-repeat bg-top">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="bg-clip-text text-transparent bg-ghibli-gradient">
            Simple Pricing
          </span>
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Choose a plan that works for you. No hidden fees or complicated pricing structures.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`ghibli-card relative overflow-hidden ${plan.popular ? 'border-ghibli-pink border-2' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-ghibli-pink text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className="h-5 w-5 text-ghibli-green mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full ${plan.popular ? 'ghibli-btn-primary' : 'ghibli-btn-secondary'}`}>
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
