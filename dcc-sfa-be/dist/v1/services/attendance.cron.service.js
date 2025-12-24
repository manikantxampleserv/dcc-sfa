"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceCronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
class AttendanceCronService {
    static startAutoPunchOut() {
        node_cron_1.default.schedule('0 0 * * *', async () => {
            console.log('Running auto punch-out check...', new Date().toISOString());
            try {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                const endOfYesterday = new Date(yesterday);
                endOfYesterday.setHours(23, 59, 59, 999);
                const activeAttendances = await prisma_client_1.default.attendance.findMany({
                    where: {
                        punch_out_time: null,
                        attendance_date: {
                            gte: yesterday,
                            lte: endOfYesterday,
                        },
                        status: 'punch_in',
                        is_active: 'Y',
                    },
                    include: {
                        attendance_user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                });
                for (const attendance of activeAttendances) {
                    const punchInTime = new Date(attendance.punch_in_time);
                    const autoPunchOutTime = new Date(attendance.attendance_date);
                    autoPunchOutTime.setHours(23, 59, 59, 999);
                    const totalHours = Math.round(((autoPunchOutTime.getTime() - punchInTime.getTime()) /
                        (1000 * 60 * 60)) *
                        100) / 100;
                    const oldData = {
                        punch_out_time: attendance.punch_out_time,
                        total_hours: attendance.total_hours,
                        status: attendance.status,
                        remarks: attendance.remarks,
                    };
                    const newData = {
                        punch_out_time: autoPunchOutTime,
                        total_hours: totalHours,
                        status: 'punch_out',
                        remarks: attendance.remarks
                            ? `${attendance.remarks} | Auto punched-out at midnight`
                            : `Auto punched-out at midnight. Punch-in: ${punchInTime.toISOString()}`,
                    };
                    await prisma_client_1.default.attendance.update({
                        where: { id: attendance.id },
                        data: {
                            punch_out_time: autoPunchOutTime,
                            total_hours: totalHours,
                            status: 'punch_out',
                            remarks: newData.remarks,
                            updatedby: attendance.user_id,
                            updatedate: new Date(),
                        },
                    });
                    try {
                        await prisma_client_1.default.attendance_history.create({
                            data: {
                                attendance_id: attendance.id,
                                action_type: 'punch_out',
                                action_time: new Date(),
                                latitude: attendance.punch_in_latitude,
                                longitude: attendance.punch_in_longitude,
                                address: attendance.punch_in_address,
                                device_info: null,
                                photo_url: null,
                                old_data: JSON.stringify(oldData),
                                new_data: JSON.stringify(newData),
                                ip_address: null,
                                user_agent: 'System Auto Punch-Out',
                                app_version: null,
                                battery_level: null,
                                network_type: null,
                                remarks: 'Automatically punched out at midnight',
                                is_active: 'Y',
                                createdate: new Date(),
                                createdby: 0,
                                updatedby: null,
                                updatedate: null,
                                log_inst: null,
                            },
                        });
                    }
                    catch (historyError) {
                        console.error('History creation error:', historyError);
                    }
                }
            }
            catch (error) {
                console.error('Auto punch-out error:', error);
            }
        });
    }
    static startMidnightStatusReset() {
        node_cron_1.default.schedule('0 0 * * *', async () => {
            console.log('Running midnight status reset to not_punch...', new Date().toISOString());
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const result = await prisma_client_1.default.attendance.updateMany({
                    where: {
                        is_active: 'Y',
                        attendance_date: {
                            lt: today,
                        },
                        status: {
                            not: 'punch_out',
                        },
                    },
                    data: {
                        status: 'not_punch',
                        updatedate: new Date(),
                    },
                });
                console.log(`Status reset completed. Updated ${result.count} attendance records.`);
            }
            catch (error) {
                console.error('Midnight status reset error:', error);
            }
        });
    }
    static stopAllCronJobs() {
        node_cron_1.default.getTasks().forEach(task => task.stop());
    }
}
exports.AttendanceCronService = AttendanceCronService;
//# sourceMappingURL=attendance.cron.service.js.map