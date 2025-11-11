// src/config/prisma.middleware.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to extract device info details
const extractDeviceInfo = (deviceInfoString: string | null) => {
  if (!deviceInfoString)
    return { batteryLevel: null, networkType: null, appVersion: null };

  try {
    const deviceInfo = JSON.parse(deviceInfoString);
    return {
      batteryLevel: deviceInfo.batteryLevel || null,
      networkType: deviceInfo.networkType || null,
      appVersion: deviceInfo.appVersion || null,
    };
  } catch {
    return { batteryLevel: null, networkType: null, appVersion: null };
  }
};

// Middleware to auto-create attendance history
prisma.$use(async (params, next) => {
  // Only intercept attendance table operations
  if (params.model === 'attendance') {
    // ✅ Handle CREATE (Punch In)
    if (params.action === 'create') {
      const result = await next(params);

      const deviceDetails = extractDeviceInfo(result.punch_in_device_info);

      // Create history for punch in
      try {
        await prisma.attendance_history.create({
          data: {
            attendance_id: result.id,
            action_type: 'punch_in',
            action_time: new Date(),
            latitude: result.punch_in_latitude,
            longitude: result.punch_in_longitude,
            address: result.punch_in_address,
            device_info: result.punch_in_device_info,
            photo_url: null,
            old_data: null,
            new_data: JSON.stringify({
              punch_in_time: result.punch_in_time,
              punch_in_latitude: result.punch_in_latitude?.toString(),
              punch_in_longitude: result.punch_in_longitude?.toString(),
              punch_in_address: result.punch_in_address,
              work_type: result.work_type,
              status: result.status,
              attendance_date: result.attendance_date,
            }),
            ip_address: null,
            user_agent: null,
            app_version: deviceDetails.appVersion,
            battery_level: deviceDetails.batteryLevel,
            network_type: deviceDetails.networkType,
            remarks: `User punched in at ${result.punch_in_address || 'unknown location'}`,
            is_active: 'Y',
            createdate: new Date(),
            createdby: result.createdby,
            updatedby: null,
            updatedate: null,
            log_inst: null,
          },
        });
        console.log(
          `✅ Punch-in history created for attendance ID: ${result.id}`
        );
      } catch (err) {
        console.error('❌ Punch-in history creation failed:', err);
      }

      return result;
    }

    // ✅ Handle UPDATE (Punch Out, Auto Punch Out, or Manual Edit)
    if (params.action === 'update') {
      // Get old data before update
      const oldData = await prisma.attendance.findUnique({
        where: params.args.where,
      });

      // Perform the update
      const result = await next(params);

      if (!oldData) return result;

      // ✅ Check if punch_out_time was added (Punch Out Event)
      if (!oldData.punch_out_time && result.punch_out_time) {
        const deviceDetails = extractDeviceInfo(result.punch_out_device_info);

        try {
          await prisma.attendance_history.create({
            data: {
              attendance_id: result.id,
              action_type:
                result.status === 'auto_completed'
                  ? 'auto_punch_out'
                  : 'punch_out',
              action_time: new Date(),
              latitude: result.punch_out_latitude,
              longitude: result.punch_out_longitude,
              address: result.punch_out_address,
              device_info: result.punch_out_device_info,
              photo_url: null,
              old_data: JSON.stringify({
                punch_out_time: oldData.punch_out_time,
                total_hours: oldData.total_hours?.toString(),
                status: oldData.status,
                remarks: oldData.remarks,
              }),
              new_data: JSON.stringify({
                punch_out_time: result.punch_out_time,
                punch_out_latitude: result.punch_out_latitude?.toString(),
                punch_out_longitude: result.punch_out_longitude?.toString(),
                punch_out_address: result.punch_out_address,
                total_hours: result.total_hours?.toString(),
                status: result.status,
                remarks: result.remarks,
              }),
              ip_address: null,
              user_agent:
                result.status === 'auto_completed'
                  ? 'System Auto Punch-Out'
                  : null,
              app_version: deviceDetails.appVersion,
              battery_level: deviceDetails.batteryLevel,
              network_type: deviceDetails.networkType,
              remarks:
                result.status === 'auto_completed'
                  ? `Auto punched-out after 12 hours. Total: ${result.total_hours || 0} hours`
                  : `User punched out. Total hours: ${result.total_hours || 0}`,
              is_active: 'Y',
              createdate: new Date(),
              createdby: result.updatedby || result.createdby,
              updatedby: null,
              updatedate: null,
              log_inst: null,
            },
          });
          console.log(
            `✅ Punch-out history created for attendance ID: ${result.id}`
          );
        } catch (err) {
          console.error('❌ Punch-out history creation failed:', err);
        }
      }

      // ✅ Check if record was soft-deleted (is_active changed to 'N')
      else if (oldData.is_active === 'Y' && result.is_active === 'N') {
        try {
          await prisma.attendance_history.create({
            data: {
              attendance_id: result.id,
              action_type: 'delete',
              action_time: new Date(),
              latitude: null,
              longitude: null,
              address: null,
              device_info: null,
              photo_url: null,
              old_data: JSON.stringify({
                id: oldData.id,
                user_id: oldData.user_id,
                attendance_date: oldData.attendance_date,
                punch_in_time: oldData.punch_in_time,
                punch_out_time: oldData.punch_out_time,
                total_hours: oldData.total_hours?.toString(),
                status: oldData.status,
                is_active: oldData.is_active,
              }),
              new_data: JSON.stringify({
                is_active: 'N',
                updatedate: result.updatedate,
                updatedby: result.updatedby,
              }),
              ip_address: null,
              user_agent: 'Admin/System Delete',
              app_version: null,
              battery_level: null,
              network_type: null,
              remarks: 'Attendance record soft deleted',
              is_active: 'Y',
              createdate: new Date(),
              createdby: result.updatedby || result.createdby,
              updatedby: null,
              updatedate: null,
              log_inst: null,
            },
          });
          console.log(
            `✅ Delete history created for attendance ID: ${result.id}`
          );
        } catch (err) {
          console.error('❌ Delete history creation failed:', err);
        }
      }

      // ✅ Check for manual updates (admin editing attendance)
      else if (
        oldData.punch_in_time !== result.punch_in_time ||
        (oldData.punch_out_time !== result.punch_out_time &&
          oldData.punch_out_time !== null) ||
        oldData.total_hours !== result.total_hours ||
        (oldData.status !== result.status && result.status !== 'auto_completed')
      ) {
        try {
          await prisma.attendance_history.create({
            data: {
              attendance_id: result.id,
              action_type: 'manual_update',
              action_time: new Date(),
              latitude: null,
              longitude: null,
              address: null,
              device_info: null,
              photo_url: null,
              old_data: JSON.stringify({
                punch_in_time: oldData.punch_in_time,
                punch_out_time: oldData.punch_out_time,
                total_hours: oldData.total_hours?.toString(),
                status: oldData.status,
                work_type: oldData.work_type,
                remarks: oldData.remarks,
              }),
              new_data: JSON.stringify({
                punch_in_time: result.punch_in_time,
                punch_out_time: result.punch_out_time,
                total_hours: result.total_hours?.toString(),
                status: result.status,
                work_type: result.work_type,
                remarks: result.remarks,
              }),
              ip_address: null,
              user_agent: 'Admin Manual Update',
              app_version: null,
              battery_level: null,
              network_type: null,
              remarks: 'Attendance record manually updated by admin/manager',
              is_active: 'Y',
              createdate: new Date(),
              createdby: result.updatedby || result.createdby,
              updatedby: null,
              updatedate: null,
              log_inst: null,
            },
          });
          console.log(
            `✅ Manual update history created for attendance ID: ${result.id}`
          );
        } catch (err) {
          console.error('❌ Manual update history creation failed:', err);
        }
      }

      return result;
    }
  }

  // Continue with other operations
  return next(params);
});

export default prisma;
