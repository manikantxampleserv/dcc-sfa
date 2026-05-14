import prisma from '../src/configs/prisma.client';

async function main() {
  try {
    console.log('Starting to clear all transactional and customer data...');

    // 1. Survey Data
    await prisma.survey_answers.deleteMany({});
    await prisma.survey_responses.deleteMany({});
    console.log('Cleared survey data.');

    // 2. Visit Related Data
    await prisma.visit_tasks.deleteMany({});
    await prisma.visit_attachments.deleteMany({});
    await prisma.competitor_activity.deleteMany({});
    await prisma.cooler_inspections.deleteMany({});
    await prisma.product_facing.deleteMany({});
    await prisma.route_exceptions.deleteMany({});
    await prisma.visits.deleteMany({});
    console.log('Cleared visits and related data.');

    // 3. Payment and Refund Data
    await prisma.refund_lines.deleteMany({});
    await prisma.payment_refunds.deleteMany({});
    await prisma.payment_lines.deleteMany({});
    await prisma.payments.deleteMany({});
    console.log('Cleared payment data.');

    // 4. Invoices
    await prisma.invoice_items.deleteMany({});
    await prisma.invoices.deleteMany({});
    console.log('Cleared invoice data.');

    // 5. Orders and Related
    await prisma.order_items.deleteMany({});
    await prisma.digital_signatures.deleteMany({});
    await prisma.delivery_schedules.deleteMany({});
    await prisma.orders.deleteMany({});
    console.log('Cleared order data.');

    // 6. Credit Notes and Returns
    await prisma.credit_note_items.deleteMany({});
    await prisma.credit_notes.deleteMany({});
    await prisma.return_requests.deleteMany({});
    console.log('Cleared credit notes and return requests.');

    // 7. Customer Related Information
    await prisma.customer_assets_history.deleteMany({});
    await prisma.customer_assets.deleteMany({});
    await prisma.customer_documents.deleteMany({});
    await prisma.customer_image.deleteMany({});
    await prisma.customer_complaints.deleteMany({});
    await prisma.customer_purchase_history.deleteMany({});
    await prisma.customer_category_grading.deleteMany({});
    await prisma.customer_group_members.deleteMany({});
    await prisma.route_plan_details.deleteMany({});
    await prisma.promotion_customer_exclusion.deleteMany({});
    await prisma.pricelist_item_special_prices.deleteMany({});
    console.log('Cleared customer auxiliary data.');

    // 8. Asset Master Related
    await prisma.asset_maintenance.deleteMany({});
    await prisma.asset_movement_assets.deleteMany({});
    await prisma.asset_movement_contracts.deleteMany({});
    await prisma.asset_movements.deleteMany({});
    await prisma.asset_warranty_claims.deleteMany({});
    await prisma.asset_images.deleteMany({});
    await prisma.coolers.deleteMany({});
    console.log('Cleared asset transaction data.');

    // 9. Asset Master itself
    await prisma.asset_master.deleteMany({});
    console.log('Cleared asset master records.');

    // 10. Customers/Outlets
    const customerCount = await prisma.customers.deleteMany({});
    console.log(`Deleted ${customerCount.count} customers/outlets.`);

    console.log('FULL RESET: All transactional, asset, and customer data has been cleared successfully.');
  } catch (error) {
    console.error('Error during data clearing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
