import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Target, Heart, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useOnboarding } from '../../contexts/OnboardingContext';

export function WelcomeModal() {
  const { state, startOnboarding, skipOnboarding } = useOnboarding();

  if (!state.isFirstTimeUser || state.skippedOnboarding || state.currentFlow) {
    return null;
  }

  const features = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Save 3+ hours per week',
      description: 'Automated lesson planning and report generation'
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: 'ETFO-aligned planning',
      description: 'Built specifically for Ontario teachers'
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: 'French Immersion ready',
      description: 'Bilingual templates and resources for Grade 1'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Teaching Engine 2.0
            </h1>
            <p className="text-lg text-blue-100">
              Your intelligent planning assistant for Grade 1 French Immersion
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Personal greeting */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-center"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bonjour! Let's get you started
            </h2>
            <p className="text-gray-600">
              Teaching Engine adapts to your Grade 1 French Immersion classroom, 
              saving you hours while ensuring comprehensive curriculum coverage.
            </p>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid gap-4 mb-8"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={() => startOnboarding('main-onboarding')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
              size="lg"
            >
              Take the 5-minute tour
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={skipOnboarding}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              I'll explore on my own
            </Button>
          </motion.div>

          {/* Trust indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center text-sm text-gray-500"
          >
            Trusted by 500+ PEI teachers • Built with Ontario curriculum standards
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}