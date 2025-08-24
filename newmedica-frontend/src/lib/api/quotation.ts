// TODO: Replace this with a real API call to a backend endpoint
// that sends an email for the quotation request.

export interface QuotationRequestData {
  productName: string;
  productId: string;
  fullName: string;
  department: string;
  companyName: string;
  coRegNo?: string;
  tinNo?: string;
  email: string;
  telNo: string;
  address: string;
}

export async function sendQuotationRequest(data: QuotationRequestData): Promise<{ success: true }> {
  console.log('Simulating sending quotation request email with data:', data);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real implementation, you would make a POST request here.
  // For now, we'll just return a success response.
  return { success: true };
}
