import ExcelJS from 'exceljs';

export const exportToExcel = async (testCases, filename = 'TestCases.xlsx') => {
    if (!testCases || testCases.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Cases');

    // Define columns
    worksheet.columns = [
        { header: 'Test Case ID', key: 'id', width: 15 },
        { header: 'Summary', key: 'summary', width: 30 },
        { header: 'Test Case Description', key: 'description', width: 40 },
        { header: 'Precondition', key: 'preConditions', width: 30 },
        { header: 'Test Steps', key: 'stepNumber', width: 10 },
        { header: 'Step Description', key: 'stepDescription', width: 40 },
        { header: 'Step Input Data', key: 'stepInputData', width: 20 },
        { header: 'Step Expected Outcome', key: 'stepExpectedOutcome', width: 30 },
        { header: 'Label', key: 'label', width: 15 },
        { header: 'Priority', key: 'priority', width: 10 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Execution Minutes', key: 'executionMinutes', width: 15 },
        { header: 'Case Folder', key: 'caseFolder', width: 20 },
        { header: 'Test Category', key: 'testCategory', width: 20 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Apply fill only to the header cells (columns 1 to 14)
    for (let i = 1; i <= 14; i++) {
        const cell = headerRow.getCell(i);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' } // Blue header
        };
    }

    // Add data
    testCases.forEach((tc) => {
        const startRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 2;

        tc.steps.forEach((step, index) => {
            worksheet.addRow({
                id: index === 0 ? tc.id : '',
                summary: index === 0 ? tc.summary : '',
                description: index === 0 ? tc.description : '',
                preConditions: index === 0 ? tc.preConditions : '',
                stepNumber: step.stepNumber,
                stepDescription: step.description,
                stepInputData: step.inputData,
                stepExpectedOutcome: step.expectedOutcome,
                label: index === 0 ? tc.label : '',
                priority: index === 0 ? tc.priority : '',
                status: index === 0 ? tc.status : '',
                executionMinutes: index === 0 ? tc.executionMinutes : '',
                caseFolder: index === 0 ? tc.caseFolder : '',
                testCategory: index === 0 ? tc.testCategory : ''
            });
        });

        // Merge cells for the test case
        if (tc.steps.length > 1) {
            const endRow = startRow + tc.steps.length - 1;
            const columnsToMerge = ['A', 'B', 'C', 'D', 'I', 'J', 'K', 'L', 'M', 'N'];

            columnsToMerge.forEach(col => {
                worksheet.mergeCells(`${col}${startRow}:${col}${endRow}`);
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

    // Ensure filename has .xlsx extension
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

    // Clean up
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 100);
};
