"use strict";
/**
 * @fileoverview Customer Channel (Outlet Channel) Seeder
 * @description Creates customer channels for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCustomerChannels = void 0;
exports.seedCustomerChannel = seedCustomerChannel;
exports.clearCustomerChannel = clearCustomerChannel;
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const mockCustomerChannels = [
    {
        channel_name: 'GROCERY',
        channel_code: 'CH-GROCERY',
        is_active: 'Y',
    },
    {
        channel_name: 'HOTEL',
        channel_code: 'CH-HOTEL',
        is_active: 'Y',
    },
    {
        channel_name: 'SHOP',
        channel_code: 'CH-SHOP',
        is_active: 'Y',
    },
    {
        channel_name: 'KIOSK',
        channel_code: 'CH-KIOSK',
        is_active: 'Y',
    },
    {
        channel_name: 'BAR & RESTAURANT',
        channel_code: 'CH-BAR-RESTAURANT',
        is_active: 'Y',
    },
    {
        channel_name: 'SUPERMARKET',
        channel_code: 'CH-SUPERMARKET',
        is_active: 'Y',
    },
    {
        channel_name: 'SCHOOL',
        channel_code: 'CH-SCHOOL',
        is_active: 'Y',
    },
    {
        channel_name: 'AT WORK',
        channel_code: 'CH-AT-WORK',
        is_active: 'Y',
    },
    {
        channel_name: 'HOSTEL',
        channel_code: 'CH-HOSTEL',
        is_active: 'Y',
    },
    {
        channel_name: 'RESTAURANT',
        channel_code: 'CH-RESTAURANT',
        is_active: 'Y',
    },
    {
        channel_name: 'CAFE',
        channel_code: 'CH-CAFE',
        is_active: 'Y',
    },
    {
        channel_name: 'CLUB',
        channel_code: 'CH-CLUB',
        is_active: 'Y',
    },
    {
        channel_name: 'STORE',
        channel_code: 'CH-STORE',
        is_active: 'Y',
    },
    {
        channel_name: 'CANTEEN',
        channel_code: 'CH-CANTEEN',
        is_active: 'Y',
    },
    {
        channel_name: 'GUEST HOUSE',
        channel_code: 'CH-GUEST-HOUSE',
        is_active: 'Y',
    },
    {
        channel_name: 'BAR & GUEST HOUSE',
        channel_code: 'CH-BAR-GUEST-HOUSE',
        is_active: 'Y',
    },
    {
        channel_name: 'OFFICE',
        channel_code: 'CH-OFFICE',
        is_active: 'Y',
    },
    {
        channel_name: 'AGENT',
        channel_code: 'CH-AGENT',
        is_active: 'Y',
    },
    {
        channel_name: 'SALOON',
        channel_code: 'CH-SALOON',
        is_active: 'Y',
    },
    {
        channel_name: 'HALL',
        channel_code: 'CH-HALL',
        is_active: 'Y',
    },
    {
        channel_name: 'PHARMACY',
        channel_code: 'CH-PHARMACY',
        is_active: 'Y',
    },
    {
        channel_name: 'LOUNGE',
        channel_code: 'CH-LOUNGE',
        is_active: 'Y',
    },
];
exports.mockCustomerChannels = mockCustomerChannels;
async function seedCustomerChannel() {
    try {
        for (const customerChannel of mockCustomerChannels) {
            const existingChannel = await prisma_client_1.default.customer_channel.findFirst({
                where: { channel_name: customerChannel.channel_name },
            });
            if (!existingChannel) {
                await prisma_client_1.default.customer_channel.create({
                    data: {
                        channel_name: customerChannel.channel_name,
                        channel_code: customerChannel.channel_code,
                        is_active: customerChannel.is_active,
                        createdate: new Date(),
                        createdby: 1,
                        log_inst: 1,
                    },
                });
            }
        }
    }
    catch (error) {
        throw error;
    }
}
async function clearCustomerChannel() {
    try {
        await prisma_client_1.default.customer_channel.deleteMany({});
    }
    catch (error) {
        if (error?.code === 'P2003' ||
            error?.message?.includes('Foreign key constraint')) {
            console.warn('⚠️  Could not clear all customer channels due to foreign key constraints. Some records may be in use by customers.');
        }
        else {
            throw error;
        }
    }
}
//# sourceMappingURL=customerChannel.seeder.js.map