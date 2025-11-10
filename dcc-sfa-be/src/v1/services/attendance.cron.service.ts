import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AttendanceCronService {
  static startAutoPunchOut() {
    cron.schedule('0 * * * *', async () => {
      console.log('Running auto punch-out check...', new Date().toISOString());

      try {
        const twelveHoursAgo = new Date();
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

        const activeAttendances = await prisma.attendance.findMany({
          where: {
            punch_out_time: null,
            punch_in_time: {
              lte: twelveHoursAgo,
            },
            status: 'active',
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

        console.log(
          `Found ${activeAttendances.length} attendance records to auto punch-out`
        );

        for (const attendance of activeAttendances) {
          const punchInTime = new Date(attendance.punch_in_time);
          const autoPunchOutTime = new Date(punchInTime);
          autoPunchOutTime.setHours(autoPunchOutTime.getHours() + 12);

          const totalHours = 12;

          const oldData = {
            punch_out_time: attendance.punch_out_time,
            total_hours: attendance.total_hours,
            status: attendance.status,
            remarks: attendance.remarks,
          };

          const newData = {
            punch_out_time: autoPunchOutTime,
            total_hours: totalHours,
            status: 'auto_completed',
            remarks: attendance.remarks
              ? `${attendance.remarks} | Auto punched-out after 12 hours`
              : `Auto punched-out after 12 hours. Punch-in: ${punchInTime.toISOString()}`,
          };

          await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
              punch_out_time: autoPunchOutTime,
              total_hours: totalHours,
              status: 'auto_completed',
              remarks: newData.remarks,
              updatedby: attendance.user_id,
              updatedate: new Date(),
            },
          });

          try {
            await prisma.attendance_history.create({
              data: {
                attendance_id: attendance.id,
                action_type: 'auto_punch_out',
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
                remarks: 'Automatically punched out after 12 hours',
                is_active: 'Y',
                createdate: new Date(),
                createdby: 0,
                updatedby: null,
                updatedate: null,
                log_inst: null,
              },
            });
          } catch (historyError) {
            console.error('⚠️ History creation error:', historyError);
          }

          console.log(
            `✅ Auto punched-out: ${attendance.attendance_user?.name || 'User'} (ID: ${attendance.id})`
          );
        }

        console.log('✅ Auto punch-out check completed');
      } catch (error) {
        console.error('❌ Auto punch-out error:', error);
      }
    });

    console.log('✅ Auto punch-out cron job started (runs every hour)');
  }

  static startDailyCleanup() {
    cron.schedule('0 0 * * *', async () => {
      console.log(
        'Running daily attendance cleanup...',
        new Date().toISOString()
      );

      try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const oldActiveAttendances = await prisma.attendance.findMany({
          where: {
            punch_out_time: null,
            attendance_date: {
              lt: startOfToday,
            },
            status: 'active',
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

        console.log(
          `Found ${oldActiveAttendances.length} old active records to close`
        );

        for (const attendance of oldActiveAttendances) {
          const punchInTime = new Date(attendance.punch_in_time);
          const endOfDay = new Date(attendance.attendance_date);
          endOfDay.setHours(23, 59, 59, 999);

          const totalHours =
            (endOfDay.getTime() - punchInTime.getTime()) / (1000 * 60 * 60);

          const oldData = {
            punch_out_time: attendance.punch_out_time,
            total_hours: attendance.total_hours,
            status: attendance.status,
            remarks: attendance.remarks,
          };

          const newRemarks = attendance.remarks
            ? `${attendance.remarks} | Auto-closed by daily cleanup`
            : 'Auto-closed by daily cleanup - forgot to punch out';

          const newData = {
            punch_out_time: endOfDay,
            total_hours: totalHours,
            status: 'auto_completed',
            remarks: newRemarks,
          };

          await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
              punch_out_time: endOfDay,
              total_hours: totalHours,
              status: 'auto_completed',
              remarks: newRemarks,
              updatedby: attendance.user_id,
              updatedate: new Date(),
            },
          });

          try {
            await prisma.attendance_history.create({
              data: {
                attendance_id: attendance.id,
                action_type: 'daily_cleanup',
                action_time: new Date(),
                latitude: attendance.punch_in_latitude,
                longitude: attendance.punch_in_longitude,
                address: attendance.punch_in_address,
                device_info: null,
                photo_url: null,
                old_data: JSON.stringify(oldData),
                new_data: JSON.stringify(newData),
                ip_address: null,
                user_agent: 'System Daily Cleanup',
                app_version: null,
                battery_level: null,
                network_type: null,
                remarks: 'Auto-closed by daily cleanup - forgot to punch out',
                is_active: 'Y',
                createdate: new Date(),
                createdby: 0,
                updatedby: null,
                updatedate: null,
                log_inst: null,
              },
            });
          } catch (historyError) {
            console.error('History creation error:', historyError);
          }

          console.log(
            `Closed old attendance: ${attendance.attendance_user?.name || 'User'} (ID: ${attendance.id})`
          );
        }

        console.log('Daily cleanup completed');
      } catch (error) {
        console.error('Daily cleanup error:', error);
      }
    });

    console.log('Daily cleanup cron job started (runs at midnight)');
  }

  static stopAllCronJobs() {
    cron.getTasks().forEach(task => task.stop());
    console.log('All cron jobs stopped');
  }
}
