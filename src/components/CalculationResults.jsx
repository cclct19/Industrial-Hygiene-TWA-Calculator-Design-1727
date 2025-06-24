import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const CalculationResults = ({ results, unit, showCalculations, getRiskLevel }) => {
  const actualRisk = getRiskLevel(parseFloat(results.actualPercentage));
  const twa8Risk = getRiskLevel(parseFloat(results.twa8Percentage));
  const twa10Risk = getRiskLevel(parseFloat(results.twa10Percentage));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-2 text-green-600" />
        Calculation Results
      </h2>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Actual TWA */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Actual TWA ({results.totalTime}h sampled)
              </h3>
              <p className="text-2xl font-bold text-blue-900">
                {results.actualTWA} {unit}
              </p>
            </div>
            <div className={`${actualRisk.bgColor} px-3 py-1 rounded-full`}>
              <span className={`text-sm font-medium ${actualRisk.color}`}>
                {results.actualPercentage}% of OEL
              </span>
            </div>
          </div>
        </div>

        {/* 8-Hour TWA */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">8-Hour TWA</h3>
              <p className="text-2xl font-bold text-green-900">
                {results.twa8Hour} {unit}
              </p>
            </div>
            <div className={`${twa8Risk.bgColor} px-3 py-1 rounded-full`}>
              <span className={`text-sm font-medium ${twa8Risk.color}`}>
                {results.twa8Percentage}% of OEL
              </span>
            </div>
          </div>
        </div>

        {/* 10-Hour TWA */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-purple-800 mb-1">10-Hour TWA</h3>
              <p className="text-2xl font-bold text-purple-900">
                {results.twa10Hour} {unit}
              </p>
            </div>
            <div className={`${twa10Risk.bgColor} px-3 py-1 rounded-full`}>
              <span className={`text-sm font-medium ${twa10Risk.color}`}>
                {results.twa10Percentage}% of OEL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sampling Note */}
      {results.samplingNote && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <SafeIcon icon={FiIcons.FiAlertTriangle} className="text-yellow-400 mr-2 mt-0.5" />
            <p className="text-yellow-800 text-sm">{results.samplingNote}</p>
          </div>
        </div>
      )}

      {/* Detailed Calculations */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Formula Used:</h4>
          <div className="bg-white p-3 rounded border font-mono text-sm">
            TWA = Σ(Ci × Ti) / Σ(Ti)
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Where Ci = concentration during period i, Ti = time duration of period i
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Step-by-Step Calculation:</h4>
          
          <div className="space-y-2 text-sm">
            <p><strong>1. Individual Exposure Contributions:</strong></p>
            {results.exposureDetails.map((exp, index) => (
              <div key={exp.id} className="ml-4 text-gray-700">
                Period {index + 1}: {exp.concentrationValue} {unit} × {exp.timeHours.toFixed(2)} hours = {(exp.concentrationValue * exp.timeHours).toFixed(4)} {unit}·hours
              </div>
            ))}
            
            <p className="mt-3"><strong>2. Sum of weighted exposures:</strong></p>
            <div className="ml-4 text-gray-700">
              Σ(Ci × Ti) = {results.weightedSum} {unit}·hours
            </div>
            
            <p className="mt-3"><strong>3. Total sampling time:</strong></p>
            <div className="ml-4 text-gray-700">
              Σ(Ti) = {results.totalTime} hours
            </div>
            
            <p className="mt-3"><strong>4. Actual TWA:</strong></p>
            <div className="ml-4 text-gray-700">
              TWA = {results.weightedSum} ÷ {results.totalTime} = {results.actualTWA} {unit}
            </div>
            
            <p className="mt-3"><strong>5. 8-Hour TWA:</strong></p>
            <div className="ml-4 text-gray-700">
              8h-TWA = {results.weightedSum} ÷ 8 = {results.twa8Hour} {unit}
            </div>
            
            <p className="mt-3"><strong>6. 10-Hour TWA:</strong></p>
            <div className="ml-4 text-gray-700">
              10h-TWA = {results.weightedSum} ÷ 10 = {results.twa10Hour} {unit}
            </div>
          </div>
        </div>

        {/* Exposure Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Exposure Period Breakdown:</h4>
          <div className="space-y-2">
            {results.exposureDetails.map((exp, index) => (
              <div key={exp.id} className="flex justify-between items-center bg-white p-3 rounded">
                <span className="font-medium">Period {index + 1}</span>
                <div className="text-right text-sm">
                  <div>{exp.timeHours.toFixed(2)} hours ({exp.timePercentage.toFixed(1)}% of total time)</div>
                  <div className="text-gray-600">{exp.contribution.toFixed(1)}% of total exposure</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CalculationResults;