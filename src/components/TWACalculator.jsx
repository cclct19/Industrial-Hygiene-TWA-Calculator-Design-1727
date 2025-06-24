import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ExposureInput from './ExposureInput';
import CalculationResults from './CalculationResults';
import RecommendationPanel from './RecommendationPanel';
import UnitSelector from './UnitSelector';
import ReportGenerator from './ReportGenerator';
import SaveLoadManager from './SaveLoadManager';
import SavedProjectsList from './SavedProjectsList';

const TWACalculator = () => {
  const [oel, setOel] = useState('');
  const [unit, setUnit] = useState('mg/m³');
  const [customUnit, setCustomUnit] = useState('');
  const [exposures, setExposures] = useState([
    {
      id: 1,
      concentration: '',
      timeInput: 'duration',
      duration: '',
      durationUnit: 'hours',
      startTime: '',
      endTime: '',
      isValid: true
    }
  ]);
  const [results, setResults] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);
  const [projectInfo, setProjectInfo] = useState({
    projectName: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    sampledBy: '',
    substance: '',
    notes: ''
  });
  const [showSavedProjects, setShowSavedProjects] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  const predefinedUnits = [
    'mg/m³', 'ppm', 'µg/m³', 'mg/L', 'ppm (v/v)', 
    'fibers/mL', 'particles/mL', 'µg/L', 'ng/m³', 'ppb'
  ];

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled) {
      const autoSaveData = {
        projectInfo,
        oel,
        unit,
        customUnit,
        exposures,
        lastAutoSave: new Date().toISOString()
      };
      localStorage.setItem('twa_auto_save', JSON.stringify(autoSaveData));
    }
  }, [projectInfo, oel, unit, customUnit, exposures, autoSaveEnabled]);

  // Load auto-save on component mount
  useEffect(() => {
    const autoSaveData = localStorage.getItem('twa_auto_save');
    if (autoSaveData) {
      try {
        const data = JSON.parse(autoSaveData);
        const autoSaveTime = new Date(data.lastAutoSave);
        const now = new Date();
        const timeDiff = now - autoSaveTime;
        
        // If auto-save is less than 1 hour old, offer to restore
        if (timeDiff < 3600000) { // 1 hour in milliseconds
          const shouldRestore = window.confirm(
            `Found auto-saved data from ${autoSaveTime.toLocaleString()}. Would you like to restore it?`
          );
          if (shouldRestore) {
            loadProjectData(data);
          }
        }
      } catch (error) {
        console.error('Error loading auto-save data:', error);
      }
    }
  }, []);

  const addExposure = () => {
    const newId = Math.max(...exposures.map(e => e.id)) + 1;
    setExposures([...exposures, {
      id: newId,
      concentration: '',
      timeInput: 'duration',
      duration: '',
      durationUnit: 'hours',
      startTime: '',
      endTime: '',
      isValid: true
    }]);
  };

  const removeExposure = (id) => {
    if (exposures.length > 1) {
      setExposures(exposures.filter(exp => exp.id !== id));
    }
  };

  const updateExposure = (id, field, value) => {
    setExposures(exposures.map(exp => 
      exp.id === id ? { ...exp, [field]: value, isValid: validateExposure({ ...exp, [field]: value }) } : exp
    ));
  };

  const parseTimeToHours = (exposure) => {
    if (exposure.timeInput === 'duration') {
      const duration = parseFloat(exposure.duration);
      if (isNaN(duration)) return 0;

      switch (exposure.durationUnit) {
        case 'minutes': return duration / 60;
        case 'hours': return duration;
        case 'hours:minutes':
          const parts = exposure.duration.split(':');
          if (parts.length === 2) {
            const hours = parseFloat(parts[0]) || 0;
            const minutes = parseFloat(parts[1]) || 0;
            return hours + (minutes / 60);
          }
          return 0;
        default: return duration;
      }
    } else {
      // startTime/endTime mode
      if (!exposure.startTime || !exposure.endTime) return 0;
      
      const start = new Date(`1970-01-01T${exposure.startTime}:00`);
      const end = new Date(`1970-01-01T${exposure.endTime}:00`);
      let diff = (end - start) / (1000 * 60 * 60); // Convert to hours
      
      // Handle overnight periods
      if (diff < 0) {
        diff += 24;
      }
      return diff;
    }
  };

  const validateExposure = (exposure) => {
    const concentration = parseFloat(exposure.concentration);
    const timeHours = parseTimeToHours(exposure);
    return !isNaN(concentration) && concentration >= 0 && timeHours > 0 && exposure.concentration !== '';
  };

  const calculateMultipleTWA = () => {
    const validExposures = exposures.filter(exp => validateExposure(exp));
    if (validExposures.length === 0 || oel === '' || isNaN(parseFloat(oel))) {
      return;
    }

    const exposureData = validExposures.map(exp => ({
      ...exp,
      timeHours: parseTimeToHours(exp),
      concentrationValue: parseFloat(exp.concentration)
    }));

    const totalTime = exposureData.reduce((sum, exp) => sum + exp.timeHours, 0);
    const weightedSum = exposureData.reduce((sum, exp) => sum + (exp.concentrationValue * exp.timeHours), 0);
    const actualTWA = weightedSum / totalTime;
    const oelValue = parseFloat(oel);

    // Calculate different TWA scenarios
    const twa8Hour = totalTime >= 8 ? weightedSum / 8 : (weightedSum + 0 * (8 - totalTime)) / 8;
    const twa10Hour = totalTime >= 10 ? weightedSum / 10 : (weightedSum + 0 * (10 - totalTime)) / 10;

    const actualPercentage = (actualTWA / oelValue) * 100;
    const twa8Percentage = (twa8Hour / oelValue) * 100;
    const twa10Percentage = (twa10Hour / oelValue) * 100;

    // Calculate individual exposure contributions
    const exposureDetails = exposureData.map(exp => ({
      ...exp,
      contribution: (exp.concentrationValue * exp.timeHours) / weightedSum * 100,
      timePercentage: (exp.timeHours / totalTime) * 100
    }));

    setResults({
      actualTWA: actualTWA.toFixed(4),
      twa8Hour: twa8Hour.toFixed(4),
      twa10Hour: twa10Hour.toFixed(4),
      totalTime: totalTime.toFixed(2),
      actualPercentage: actualPercentage.toFixed(2),
      twa8Percentage: twa8Percentage.toFixed(2),
      twa10Percentage: twa10Percentage.toFixed(2),
      exposureDetails,
      weightedSum: weightedSum.toFixed(4),
      oelValue: oelValue.toFixed(4),
      samplingNote: totalTime < 8 ? 'Sampling period less than 8 hours - results may not represent full shift exposure' : ''
    });

    setShowCalculations(true);
  };

  const getRiskLevel = (percentage) => {
    if (percentage <= 50) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage <= 100) return { level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getCurrentUnit = () => {
    return customUnit || unit;
  };

  const loadProjectData = (data) => {
    setProjectInfo(data.projectInfo || {
      projectName: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      sampledBy: '',
      substance: '',
      notes: ''
    });
    setOel(data.oel || '');
    setUnit(data.unit || 'mg/m³');
    setCustomUnit(data.customUnit || '');
    setExposures(data.exposures || [{
      id: 1,
      concentration: '',
      timeInput: 'duration',
      duration: '',
      durationUnit: 'hours',
      startTime: '',
      endTime: '',
      isValid: true
    }]);
    setResults(null);
    setShowCalculations(false);
  };

  const handleLoadProject = (project) => {
    loadProjectData(project);
    setShowSavedProjects(false);
  };

  const clearProject = () => {
    if (window.confirm('Are you sure you want to clear all data and start a new project?')) {
      setProjectInfo({
        projectName: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        sampledBy: '',
        substance: '',
        notes: ''
      });
      setOel('');
      setUnit('mg/m³');
      setCustomUnit('');
      setExposures([{
        id: 1,
        concentration: '',
        timeInput: 'duration',
        duration: '',
        durationUnit: 'hours',
        startTime: '',
        endTime: '',
        isValid: true
      }]);
      setResults(null);
      setShowCalculations(false);
      localStorage.removeItem('twa_auto_save');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Industrial Hygiene TWA Calculator
        </h1>
        <p className="text-gray-600 text-lg">
          Calculate Time-Weighted Average exposures according to AIHA guidelines
        </p>
        
        {/* Top Action Bar */}
        <div className="flex justify-center gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearProject}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiIcons.FiRefreshCw} className="w-4 h-4" />
            New Project
          </motion.button>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSave"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoSave" className="text-sm text-gray-600">
              Auto-save
            </label>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="xl:col-span-2 space-y-6">
          {/* Project Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <SafeIcon icon={FiIcons.FiFileText} className="mr-2 text-purple-600" />
              Project Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={projectInfo.projectName}
                onChange={(e) => setProjectInfo({ ...projectInfo, projectName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Location"
                value={projectInfo.location}
                onChange={(e) => setProjectInfo({ ...projectInfo, location: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="date"
                value={projectInfo.date}
                onChange={(e) => setProjectInfo({ ...projectInfo, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Sampled By"
                value={projectInfo.sampledBy}
                onChange={(e) => setProjectInfo({ ...projectInfo, sampledBy: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Substance/Chemical"
                value={projectInfo.substance}
                onChange={(e) => setProjectInfo({ ...projectInfo, substance: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <textarea
                placeholder="Notes"
                value={projectInfo.notes}
                onChange={(e) => setProjectInfo({ ...projectInfo, notes: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="2"
              />
            </div>
          </motion.div>

          {/* OEL Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <SafeIcon icon={FiIcons.FiTarget} className="mr-2 text-blue-600" />
              Occupational Exposure Limit (OEL)
            </h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OEL Value
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={oel}
                  onChange={(e) => setOel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter OEL value"
                />
              </div>
              <div className="w-64">
                <UnitSelector
                  unit={unit}
                  customUnit={customUnit}
                  predefinedUnits={predefinedUnits}
                  onUnitChange={setUnit}
                  onCustomUnitChange={setCustomUnit}
                />
              </div>
            </div>
          </motion.div>

          {/* Exposure Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <SafeIcon icon={FiIcons.FiClock} className="mr-2 text-blue-600" />
                Exposure Periods
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addExposure}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <SafeIcon icon={FiIcons.FiPlus} className="w-4 h-4" />
                Add Period
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {exposures.map((exposure, index) => (
                  <ExposureInput
                    key={exposure.id}
                    exposure={exposure}
                    index={index}
                    unit={getCurrentUnit()}
                    onUpdate={updateExposure}
                    onRemove={removeExposure}
                    canRemove={exposures.length > 1}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Calculate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculateMultipleTWA}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Calculate TWA
          </motion.button>
        </div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Save/Load Manager */}
          <SaveLoadManager
            projectInfo={projectInfo}
            oel={oel}
            unit={unit}
            customUnit={customUnit}
            exposures={exposures}
            onLoadData={loadProjectData}
            onShowSavedProjects={() => setShowSavedProjects(true)}
          />

          {results && (
            <>
              <CalculationResults
                results={results}
                unit={getCurrentUnit()}
                showCalculations={showCalculations}
                getRiskLevel={getRiskLevel}
              />
              <RecommendationPanel
                results={results}
                unit={getCurrentUnit()}
                getRiskLevel={getRiskLevel}
              />
              <ReportGenerator
                results={results}
                unit={getCurrentUnit()}
                projectInfo={projectInfo}
                exposures={exposures}
                oel={oel}
                getRiskLevel={getRiskLevel}
              />
            </>
          )}
        </motion.div>
      </div>

      {/* Saved Projects Modal */}
      <AnimatePresence>
        {showSavedProjects && (
          <SavedProjectsList
            onLoadProject={handleLoadProject}
            onClose={() => setShowSavedProjects(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TWACalculator;