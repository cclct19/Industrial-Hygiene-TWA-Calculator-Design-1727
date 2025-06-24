import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const RecommendationPanel = ({ results, unit, getRiskLevel }) => {
  const percentage = parseFloat(results.percentageOfOEL);
  const riskInfo = getRiskLevel(percentage);

  const getRecommendations = () => {
    if (percentage <= 50) {
      return {
        title: "Exposure Level: ACCEPTABLE",
        recommendations: [
          "Continue current control measures",
          "Maintain regular monitoring schedule",
          "Document exposure assessment results",
          "Review controls annually or when processes change"
        ],
        actions: [
          "No immediate action required",
          "Continue routine industrial hygiene practices"
        ]
      };
    } else if (percentage <= 100) {
      return {
        title: "Exposure Level: ACTION RECOMMENDED",
        recommendations: [
          "Implement additional control measures to reduce exposure",
          "Increase monitoring frequency",
          "Review and improve existing controls",
          "Consider engineering controls or work practice modifications",
          "Provide additional worker training"
        ],
        actions: [
          "Develop exposure reduction plan within 30 days",
          "Re-evaluate after implementing controls",
          "Consider respiratory protection as interim measure"
        ]
      };
    } else {
      return {
        title: "Exposure Level: IMMEDIATE ACTION REQUIRED",
        recommendations: [
          "STOP work activities immediately if feasible",
          "Implement immediate control measures",
          "Provide appropriate respiratory protection",
          "Increase monitoring to daily or continuous",
          "Conduct thorough hazard assessment",
          "Implement engineering controls as priority",
          "Provide medical surveillance if applicable"
        ],
        actions: [
          "Immediate implementation of controls required",
          "Daily monitoring until exposure is reduced",
          "Management review and approval of continued operations",
          "Consider temporary work restrictions"
        ]
      };
    }
  };

  const recommendations = getRecommendations();

  const getAIHAGuidance = () => {
    return {
      "≤50% OEL": "Acceptable exposure level - routine monitoring sufficient",
      "50-100% OEL": "Action level reached - enhanced controls recommended", 
      ">100% OEL": "Overexposure - immediate corrective action required"
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <SafeIcon icon={FiIcons.FiShield} className="mr-2 text-purple-600" />
        AIHA Recommendations
      </h2>

      {/* Risk Level Banner */}
      <div className={`${riskInfo.bgColor} border-l-4 ${riskInfo.color.replace('text-', 'border-')} p-4 rounded-lg mb-6`}>
        <h3 className={`font-bold text-lg ${riskInfo.color}`}>
          {recommendations.title}
        </h3>
        <p className="text-sm text-gray-700 mt-1">
          TWA: {results.twa} {unit} ({results.percentageOfOEL}% of OEL)
        </p>
      </div>

      {/* AIHA Guidelines Reference */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <SafeIcon icon={FiIcons.FiBook} className="mr-2" />
          AIHA Exposure Assessment Guidelines
        </h4>
        <div className="space-y-1 text-sm">
          {Object.entries(getAIHAGuidance()).map(([range, guidance]) => (
            <div key={range} className="flex justify-between">
              <span className="font-medium text-blue-700">{range}:</span>
              <span className="text-blue-600">{guidance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <SafeIcon icon={FiIcons.FiCheckCircle} className="mr-2 text-green-600" />
            Recommended Control Measures
          </h4>
          <ul className="space-y-2">
            {recommendations.recommendations.map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start"
              >
                <SafeIcon icon={FiIcons.FiArrowRight} className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">{rec}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <SafeIcon icon={FiIcons.FiClock} className="mr-2 text-orange-600" />
            Immediate Actions Required
          </h4>
          <ul className="space-y-2">
            {recommendations.actions.map((action, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-start"
              >
                <SafeIcon icon={FiIcons.FiAlertTriangle} className="mr-2 mt-1 text-orange-600 flex-shrink-0" />
                <span className="text-gray-700">{action}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Important Notes:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• TWA calculations assume 8-hour work shift unless otherwise specified</li>
          <li>• OEL values should be current and appropriate for the specific substance</li>
          <li>• Consider peak exposures and ceiling limits in addition to TWA</li>
          <li>• Consult with certified industrial hygienist for complex exposure scenarios</li>
          <li>• Document all calculations and decisions for regulatory compliance</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default RecommendationPanel;