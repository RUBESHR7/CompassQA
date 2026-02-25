import ExcelJS from 'exceljs';

export const exportToExcel = async (testCases, filename = 'TestCases.xlsx') => {
    if (!testCases || testCases.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Cases');

    // Define columns to match the "Perfect" image structure
    // Order: ID | Summary | TC Description | Precondition | Step # | Step Desc | Input | Expected | Label | Priority | Status | Time | Folder | Category
    worksheet.columns = [
        { header: 'Test Case ID', key: 'id', width: 15 },
        { header: 'Summary', key: 'summary', width: 30 },
        { header: 'Test Case Description', key: 'description', width: 40 },
        { header: 'Precondition', key: 'preConditions', width: 30 },
        { header: 'Test Steps', key: 'stepNumber', width: 10 },
        { header: 'Step Description', key: 'stepDescription', width: 40 },
        { header: 'Step Input Data', key: 'stepInputData', width: 25 },
        { header: 'Step Expected Outcome', key: 'stepExpectedOutcome', width: 30 },
        { header: 'Label', key: 'label', width: 15 },
        { header: 'Priority', key: 'priority', width: 10 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Execution Minutes', key: 'executionMinutes', width: 15 },
        { header: 'Case Folder', key: 'caseFolder', width: 25 },
        { header: 'Test Category', key: 'testCategory', width: 20 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Header Fill (Blue)
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
    });

    // Start adding data from row 2
    let currentRowIndex = 2;

    testCases.forEach((tc) => {
        const startRow = currentRowIndex;
        const steps = tc.steps && tc.steps.length > 0 ? tc.steps : [{
            stepNumber: 1,
            description: "No steps generated",
            inputData: "",
            expectedOutcome: ""
        }];

        // Add each step as a row
        steps.forEach((step) => {
            worksheet.addRow({
                id: tc.id,
                summary: tc.summary,
                description: tc.description,
                preConditions: tc.preConditions,
                stepNumber: step.stepNumber,
                stepDescription: step.description,
                stepInputData: step.inputData,
                stepExpectedOutcome: step.expectedOutcome,
                label: tc.label,
                priority: tc.priority,
                status: tc.status,
                executionMinutes: tc.executionMinutes,
                caseFolder: tc.caseFolder,
                testCategory: tc.testCategory
            });
            currentRowIndex++; // Increment for next step
        });

        const endRow = currentRowIndex - 1;

        // MERGE CELLS for Parent Columns if there are multiple steps
        if (endRow > startRow) {
            // Columns to merge: id, summary, description, preConditions, label, priority, status, minutes, folder, category
            // Indices (1-based): 1, 2, 3, 4, 9, 10, 11, 12, 13, 14
            const mergeColIndices = [1, 2, 3, 4, 9, 10, 11, 12, 13, 14];

            mergeColIndices.forEach((colIndex) => {
                try {
                    // mergeCells(top, left, bottom, right) or (startRow, col, endRow, col)
                    worksheet.mergeCells(startRow, colIndex, endRow, colIndex);
                } catch (e) {
                    console.warn(`Failed to merge column ${colIndex} rows ${startRow}-${endRow}`, e);
                }
            });
        }
    });

    // Apply global styling (borders, alignment)
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true
            };
        });
    });

    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
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
