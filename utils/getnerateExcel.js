export const generateExcel = async (forms, fileAccess) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Forms Data");

  worksheet.columns = [
    { header: "Lead Id", key: "leadId", width: 10 },
    { header: "Form Id", key: "formId", width: 10 },
    { header: "Ad Name", key: "adName", width: 10 },
    { header: "Adset Name", key: "adsetName", width: 10 },
    { header: "Campaign Name", key: "campaignName", width: 10 },
    { header: "Form Name", key: "formName", width: 10 },
    { header: "Platform", key: "platform", width: 10 },
    { header: "Created Time", key: "createdTime", width: 10 },
    { header: "Sl No", key: "slNo", width: 10 },
    { header: "Sl No", key: "slNo", width: 10 },
    { header: "Sl No", key: "slNo", width: 10 },

   
  ];

  forms.forEach((form) => {
    const row = {
      leadId: form.leadId,
      formId: form.formId,
      adName: form.adName,
      adsetName: form.adsetName,
      campaignName: form.campaignName,
      formName: form.formName,
      platform: form.platform
    };
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};