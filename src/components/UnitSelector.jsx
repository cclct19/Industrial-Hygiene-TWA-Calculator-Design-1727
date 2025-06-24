import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const UnitSelector = ({ unit, customUnit, predefinedUnits, onUnitChange, onCustomUnitChange }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleUnitChange = (selectedUnit) => {
    if (selectedUnit === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      onCustomUnitChange('');
      onUnitChange(selectedUnit);
    }
  };

  const handleCustomSubmit = () => {
    if (customUnit.trim()) {
      setShowCustomInput(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Unit
      </label>
      {!showCustomInput ? (
        <select
          value={customUnit ? 'custom' : unit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {predefinedUnits.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
          <option value="custom">Custom Unit...</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={customUnit}
            onChange={(e) => onCustomUnitChange(e.target.value)}
            placeholder="Enter custom unit"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCustomSubmit}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <SafeIcon icon={FiIcons.FiCheck} className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowCustomInput(false);
              onCustomUnitChange('');
            }}
            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            <SafeIcon icon={FiIcons.FiX} className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default UnitSelector;