import ExcelJS from 'exceljs';

export const exportToExcel = async (testCases, filename = 'TestCases.xlsx') => {
    if (!testCases || testCases.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Cases');

    // Define columns based on User's requested format
    // Issue Key | Summary | Step Summary | Expected Result | Folder | (Test Data)
    worksheet.columns = [
        { header: 'Issue Key', key: 'id', width: 15 },
        { header: 'Summary', key: 'summary', width: 30 },
        { header: 'Step Summary', key: 'stepDescription', width: 40 },
        { header: 'Test Data', key: 'stepInputData', width: 20 },
        { header: 'Expected Result', key: 'stepExpectedOutcome', width: 30 },
        { header: 'Folder', key: 'caseFolder', width: 30 },
        // Keep other useful metadata at the end just in case
        { header: 'Precondition', key: 'preConditions', width: 20 },
        { header: 'Label', key: 'label', width: 15 },
        { header: 'Priority', key: 'priority', width: 10 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Execution Minutes', key: 'executionMinutes', width: 15 },
        { header: 'Test Category', key: 'testCategory', width: 20 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Apply fill to the header cells
    worksheet.columns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' } // Blue header
        };
    });

    // Add data
    // Add data
    testCases.forEach((tc) => {
        // Populate ALL fields for EVERY row to support Filtering and CSV format
        if (tc.steps && tc.steps.length > 0) {
            tc.steps.forEach((step) => {
                worksheet.addRow({
                    id: tc.id,
                    summary: tc.summary,
                    stepDescription: step.description,
                    stepInputData: step.inputData,
                    stepExpectedOutcome: step.expectedOutcome,
                    caseFolder: tc.caseFolder,
                    preConditions: tc.preConditions,
                    label: tc.label,
                    priority: tc.priority,
                    status: tc.status,
                    executionMinutes: tc.executionMinutes,
                    testCategory: tc.testCategory
                });
            });
            // Merging logic REMOVED to enable filtering
        } else {
            // Fallback if no steps
            worksheet.addRow({
                id: tc.id,
                summary: tc.summary,
                stepDescription: "No steps generated",
                stepInputData: "",
                stepExpectedOutcome: "",
                caseFolder: tc.caseFolder,
                preConditions: tc.preConditions,
                label: tc.label,
                priority: tc.priority,
                status: tc.status,
                executionMinutes: tc.executionMinutes,
                testCategory: tc.testCategory
            });
        }
    });

    // Apply styling to all cells
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            // Borders
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Alignment
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true
            };
        });
    });

    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer();

    // Default to xlsx, but user mentioned csv. ExcelJS writes xlsx buffer. 
    // If we really wanted CSV, we'd use workbook.csv.writeBuffer(), but metadata/merge would be lost.
    // For now, keep as xlsx as it supports the requested "image 2" structure best.
    const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;

    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFilename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 100);
};
