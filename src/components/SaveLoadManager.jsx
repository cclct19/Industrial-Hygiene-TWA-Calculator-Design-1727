import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const SaveLoadManager = ({ 
  projectInfo, 
  oel, 
  unit, 
  customUnit, 
  exposures, 
  onLoadData,
  onShowSavedProjects 
}) => {
  const [saveFileName, setSaveFileName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const generateFileName = () => {
    const projectName = projectInfo.projectName || 'TWA_Project';
    const date = new Date().toISOString().split('T')[0];
    return `${projectName}_${date}`;
  };

  const saveToLocalStorage = (fileName) => {
    const projectData = {
      fileName,
      projectInfo,
      oel,
      unit,
      customUnit,
      exposures,
      savedAt: new Date().toISOString(),
      version: '1.0'
    };

    const savedProjects = JSON.parse(localStorage.getItem('twa_saved_projects') || '[]');
    const existingIndex = savedProjects.findIndex(p => p.fileName === fileName);
    
    if (existingIndex >= 0) {
      savedProjects[existingIndex] = projectData;
    } else {
      savedProjects.push(projectData);
    }
    
    localStorage.setItem('twa_saved_projects', JSON.stringify(savedProjects));
    return true;
  };

  const exportToFile = () => {
    const projectData = {
      projectInfo,
      oel,
      unit,
      customUnit,
      exposures,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      type: 'TWA_Calculator_Project'
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveFileName || generateFileName()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (data.type === 'TWA_Calculator_Project' && data.version) {
          onLoadData(data);
        } else {
          alert('Invalid file format. Please select a valid TWA Calculator project file.');
        }
      } catch (error) {
        alert('Error reading file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleSaveToLocal = () => {
    const fileName = saveFileName || generateFileName();
    if (saveToLocalStorage(fileName)) {
      setShowSaveDialog(false);
      setSaveFileName('');
      alert(`Project saved as "${fileName}"`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <SafeIcon icon={FiIcons.FiSave} className="mr-2 text-green-600" />
        Save & Load Project
      </h2>

      <div className="space-y-4">
        {/* Save Section */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-3 flex items-center">
            <SafeIcon icon={FiIcons.FiSave} className="mr-2" />
            Save Project
          </h3>
          
          <div className="space-y-3">
            {/* Save to Browser */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSaveDialog(true)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiIcons.FiHardDrive} className="w-4 h-4" />
                Save to Browser
              </motion.button>
              
              {/* Export to File */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportToFile}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiIcons.FiDownload} className="w-4 h-4" />
                Export to File
              </motion.button>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-green-200 rounded-lg p-4 shadow-lg"
              >
                <h4 className="font-medium text-gray-800 mb-2">Save Project</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={generateFileName()}
                    value={saveFileName}
                    onChange={(e) => setSaveFileName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveToLocal}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowSaveDialog(false);
                        setSaveFileName('');
                      }}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Load Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-3 flex items-center">
            <SafeIcon icon={FiIcons.FiUpload} className="mr-2" />
            Load Project
          </h3>
          
          <div className="space-y-3">
            {/* Load from Browser */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShowSavedProjects}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <SafeIcon icon={FiIcons.FiHardDrive} className="w-4 h-4" />
              Load from Browser
            </motion.button>

            {/* Import from File */}
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importFromFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiIcons.FiUpload} className="w-4 h-4" />
                Import from File
              </motion.button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-800 mb-2">Storage Options:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Browser Storage:</strong> Quick access, stays on this device</li>
            <li>• <strong>File Export:</strong> Portable, can be shared or backed up</li>
            <li>• <strong>File Import:</strong> Load projects from any device</li>
            <li>• Projects include all exposure data and calculations</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default SaveLoadManager;