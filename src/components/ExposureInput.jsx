import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const ExposureInput = ({ exposure, index, unit, onUpdate, onRemove, canRemove }) => {
  const timeInputOptions = [
    { value: 'duration', label: 'Duration' },
    { value: 'startEnd', label: 'Start/End Times' }
  ];

  const durationUnits = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'hours:minutes', label: 'Hours:Minutes (H:MM)' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`border-2 rounded-lg p-4 transition-all duration-200 ${
        exposure.isValid ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">
          Exposure Period #{index + 1}
        </h3>
        {canRemove && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(exposure.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <SafeIcon icon={FiIcons.FiTrash2} className="w-4 h-4" />
          </motion.button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Concentration Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Concentration ({unit})
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={exposure.concentration}
            onChange={(e) => onUpdate(exposure.id, 'concentration', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              exposure.isValid ? 'border-gray-300' : 'border-red-300'
            }`}
            placeholder="0.0"
          />
        </div>

        {/* Time Input Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Time Input Method
          </label>
          <select
            value={exposure.timeInput}
            onChange={(e) => onUpdate(exposure.id, 'timeInput', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeInputOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Input Fields */}
        {exposure.timeInput === 'duration' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Duration
              </label>
              <input
                type={exposure.durationUnit === 'hours:minutes' ? 'text' : 'number'}
                step="any"
                min="0"
                value={exposure.duration}
                onChange={(e) => onUpdate(exposure.id, 'duration', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  exposure.isValid ? 'border-gray-300' : 'border-red-300'
                }`}
                placeholder={exposure.durationUnit === 'hours:minutes' ? '1:30' : '0.0'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Unit
              </label>
              <select
                value={exposure.durationUnit}
                onChange={(e) => onUpdate(exposure.id, 'durationUnit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {durationUnits.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={exposure.startTime}
                onChange={(e) => onUpdate(exposure.id, 'startTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  exposure.isValid ? 'border-gray-300' : 'border-red-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={exposure.endTime}
                onChange={(e) => onUpdate(exposure.id, 'endTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  exposure.isValid ? 'border-gray-300' : 'border-red-300'
                }`}
              />
            </div>
          </div>
        )}
      </div>
      
      {!exposure.isValid && (
        <p className="text-red-600 text-sm mt-2">
          Please enter valid positive numbers for concentration and time.
        </p>
      )}
    </motion.div>
  );
};

export default ExposureInput;