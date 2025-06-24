import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const SavedProjectsList = ({ onLoadProject, onClose }) => {
  const [savedProjects, setSavedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadSavedProjects();
  }, []);

  const loadSavedProjects = () => {
    const projects = JSON.parse(localStorage.getItem('twa_saved_projects') || '[]');
    setSavedProjects(projects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
  };

  const deleteProject = (fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      const projects = savedProjects.filter(p => p.fileName !== fileName);
      localStorage.setItem('twa_saved_projects', JSON.stringify(projects));
      setSavedProjects(projects);
    }
  };

  const duplicateProject = (project) => {
    const newFileName = `${project.fileName}_copy_${Date.now()}`;
    const duplicatedProject = {
      ...project,
      fileName: newFileName,
      savedAt: new Date().toISOString()
    };
    
    const projects = [...savedProjects, duplicatedProject];
    localStorage.setItem('twa_saved_projects', JSON.stringify(projects));
    setSavedProjects(projects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectSummary = (project) => {
    const exposureCount = project.exposures?.length || 0;
    const substance = project.projectInfo?.substance || 'Unspecified';
    const location = project.projectInfo?.location || 'No location';
    return `${exposureCount} exposure periods • ${substance} • ${location}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <SafeIcon icon={FiIcons.FiFolder} className="mr-2 text-blue-600" />
              Saved Projects
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <SafeIcon icon={FiIcons.FiX} className="w-6 h-6" />
            </motion.button>
          </div>
          <p className="text-gray-600 mt-2">
            {savedProjects.length} saved project{savedProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          {savedProjects.length === 0 ? (
            <div className="text-center py-12">
              <SafeIcon icon={FiIcons.FiInbox} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No saved projects</h3>
              <p className="text-gray-400">Save your first project to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {savedProjects.map((project, index) => (
                  <motion.div
                    key={project.fileName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                      selectedProject?.fileName === project.fileName
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {project.fileName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {getProjectSummary(project)}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <SafeIcon icon={FiIcons.FiClock} className="w-3 h-3 mr-1" />
                          Saved: {formatDate(project.savedAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadProject(project);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <SafeIcon icon={FiIcons.FiPlay} className="w-3 h-3" />
                          Load
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateProject(project);
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <SafeIcon icon={FiIcons.FiCopy} className="w-3 h-3" />
                          Duplicate
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.fileName);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <SafeIcon icon={FiIcons.FiTrash2} className="w-3 h-3" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {selectedProject && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-3">Project Preview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Project:</span>
                <span className="ml-2 text-gray-800">{selectedProject.projectInfo?.projectName || 'Untitled'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Substance:</span>
                <span className="ml-2 text-gray-800">{selectedProject.projectInfo?.substance || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">OEL:</span>
                <span className="ml-2 text-gray-800">{selectedProject.oel} {selectedProject.customUnit || selectedProject.unit}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Exposures:</span>
                <span className="ml-2 text-gray-800">{selectedProject.exposures?.length || 0} periods</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SavedProjectsList;