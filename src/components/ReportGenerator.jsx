import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const ReportGenerator = ({ results, unit, projectInfo, exposures, oel, getRiskLevel }) => {
  const generateWordReport = async () => {
    const actualRisk = getRiskLevel(parseFloat(results.actualPercentage));
    const twa8Risk = getRiskLevel(parseFloat(results.twa8Percentage));
    const twa10Risk = getRiskLevel(parseFloat(results.twa10Percentage));

    // Build the children array dynamically
    const documentChildren = [
      // Header
      new Paragraph({
        children: [
          new TextRun({
            text: "INDUSTRIAL HYGIENE EXPOSURE ASSESSMENT REPORT",
            bold: true,
            size: 32,
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      
      new Paragraph({ text: "" }), // Space
      
      // Project Information
      new Paragraph({
        children: [
          new TextRun({
            text: "PROJECT INFORMATION",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      }),
      
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Project Name:")] }),
              new TableCell({ children: [new Paragraph(projectInfo.projectName || "N/A")] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Location:")] }),
              new TableCell({ children: [new Paragraph(projectInfo.location || "N/A")] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Date:")] }),
              new TableCell({ children: [new Paragraph(projectInfo.date || "N/A")] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Sampled By:")] }),
              new TableCell({ children: [new Paragraph(projectInfo.sampledBy || "N/A")] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Substance:")] }),
              new TableCell({ children: [new Paragraph(projectInfo.substance || "N/A")] }),
            ],
          }),
        ],
      }),
      
      new Paragraph({ text: "" }), // Space
      
      // Exposure Limit Information
      new Paragraph({
        children: [
          new TextRun({
            text: "EXPOSURE LIMIT INFORMATION",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      }),
      
      new Paragraph({
        children: [
          new TextRun("Occupational Exposure Limit (OEL): "),
          new TextRun({ text: `${oel} ${unit}`, bold: true }),
        ],
      }),
      
      new Paragraph({ text: "" }), // Space
      
      // Sampling Data
      new Paragraph({
        children: [
          new TextRun({
            text: "SAMPLING DATA",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      }),
      
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Period", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Concentration (${unit})`, bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Time (hours)", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Contribution", bold: true })] })] }),
            ],
          }),
          ...results.exposureDetails.map((exp, index) => 
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph((index + 1).toString())] }),
                new TableCell({ children: [new Paragraph(exp.concentrationValue.toString())] }),
                new TableCell({ children: [new Paragraph(exp.timeHours.toFixed(2))] }),
                new TableCell({ children: [new Paragraph(`${exp.contribution.toFixed(1)}%`)] }),
              ],
            })
          ),
        ],
      }),
      
      new Paragraph({ text: "" }), // Space
      
      // Calculation Results
      new Paragraph({
        children: [
          new TextRun({
            text: "CALCULATION RESULTS",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      }),
      
      new Paragraph({
        children: [
          new TextRun("Total Sampling Time: "),
          new TextRun({ text: `${results.totalTime} hours`, bold: true }),
        ],
      }),
      
      new Paragraph({
        children: [
          new TextRun("Actual TWA: "),
          new TextRun({ text: `${results.actualTWA} ${unit} (${results.actualPercentage}% of OEL)`, bold: true }),
          new TextRun({ text: ` - ${actualRisk.level} Risk`, color: actualRisk.level === 'High' ? "FF0000" : actualRisk.level === 'Moderate' ? "FFA500" : "008000" }),
        ],
      }),
      
      new Paragraph({
        children: [
          new TextRun("8-Hour TWA: "),
          new TextRun({ text: `${results.twa8Hour} ${unit} (${results.twa8Percentage}% of OEL)`, bold: true }),
          new TextRun({ text: ` - ${twa8Risk.level} Risk`, color: twa8Risk.level === 'High' ? "FF0000" : twa8Risk.level === 'Moderate' ? "FFA500" : "008000" }),
        ],
      }),
      
      new Paragraph({
        children: [
          new TextRun("10-Hour TWA: "),
          new TextRun({ text: `${results.twa10Hour} ${unit} (${results.twa10Percentage}% of OEL)`, bold: true }),
          new TextRun({ text: ` - ${twa10Risk.level} Risk`, color: twa10Risk.level === 'High' ? "FF0000" : twa10Risk.level === 'Moderate' ? "FFA500" : "008000" }),
        ],
      }),
      
      new Paragraph({ text: "" }), // Space
      
      // Calculation Method
      new Paragraph({
        children: [
          new TextRun({
            text: "CALCULATION METHOD",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      }),
      
      new Paragraph("The Time-Weighted Average (TWA) was calculated using the following formula:"),
      new Paragraph({
        children: [
          new TextRun({ text: "TWA = Σ(Ci × Ti) / Σ(Ti)", bold: true, font: "Courier New" }),
        ],
      }),
      new Paragraph("Where:"),
      new Paragraph("• Ci = concentration during period i"),
      new Paragraph("• Ti = time duration of period i"),
      
      new Paragraph({ text: "" }), // Space
      
      // Step-by-step calculation
      new Paragraph("Step-by-step calculation:"),
      new Paragraph(`1. Sum of weighted exposures: ${results.weightedSum} ${unit}·hours`),
      new Paragraph(`2. Total sampling time: ${results.totalTime} hours`),
      new Paragraph(`3. Actual TWA = ${results.weightedSum} ÷ ${results.totalTime} = ${results.actualTWA} ${unit}`),
      new Paragraph(`4. 8-Hour TWA = ${results.weightedSum} ÷ 8 = ${results.twa8Hour} ${unit}`),
      new Paragraph(`5. 10-Hour TWA = ${results.weightedSum} ÷ 10 = ${results.twa10Hour} ${unit}`),
      
      new Paragraph({ text: "" }), // Space
    ];

    // Add notes section if notes exist
    if (projectInfo.notes) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "NOTES",
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph(projectInfo.notes),
        new Paragraph({ text: "" })
      );
    }

    // Add footer
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "This report was generated using TWA Calculator in accordance with AIHA guidelines.",
            italics: true,
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on: ${new Date().toLocaleDateString()}`,
            italics: true,
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: documentChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `TWA_Report_${projectInfo.projectName || 'Assessment'}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <SafeIcon icon={FiIcons.FiDownload} className="mr-2 text-indigo-600" />
        Generate Report
      </h2>
      
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Generate a comprehensive Word document report containing all calculation details, 
          project information, and recommendations.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateWordReport}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <SafeIcon icon={FiIcons.FiFileText} className="w-5 h-5" />
          Download Word Report
        </motion.button>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-2">Report Contents:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Project information and sampling details</li>
            <li>• Complete exposure data table</li>
            <li>• TWA calculations (Actual, 8-hour, 10-hour)</li>
            <li>• Step-by-step calculation methodology</li>
            <li>• Risk assessment results</li>
            <li>• Professional formatting for regulatory compliance</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportGenerator;